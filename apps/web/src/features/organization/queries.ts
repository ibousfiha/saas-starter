import type { QueryClient } from "@tanstack/react-query";
import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { redirect, useNavigate } from "@tanstack/react-router";
import { refreshSession, useSession } from "@/features/auth/queries";
import type { OrganizationRole } from "@/features/organization/roles";
import { createOrganizationSlug } from "@/features/organization/slug";
import { authClient, type Session, unwrap } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";

const organizationKey = ["organization"] as const;

function isPending(invitation: { expiresAt: Date; status: string }) {
	return (
		invitation.status === "pending" &&
		new Date(invitation.expiresAt).getTime() > Date.now()
	);
}

export const organizationQueries = {
	active: () =>
		queryOptions({
			queryFn: () => unwrap(authClient.organization.getFullOrganization()),
			queryKey: [...organizationKey, "active"],
		}),
	all: () => organizationKey,
	invitations: () =>
		queryOptions({
			queryFn: async () => {
				const invitations = await unwrap(
					authClient.organization.listInvitations()
				);
				return invitations.filter(isPending);
			},
			queryKey: [...organizationKey, "invitations"],
		}),
	list: () =>
		queryOptions({
			queryFn: () => unwrap(authClient.organization.list()),
			queryKey: [...organizationKey, "list"],
		}),
	members: () =>
		queryOptions({
			queryFn: async () => {
				const { members } = await unwrap(authClient.organization.listMembers());
				return members;
			},
			queryKey: [...organizationKey, "members"],
		}),
	publicInvitation: (id: string) =>
		orpc.invitation.getPublic.queryOptions({ input: { id }, retry: false }),
	userInvitations: () =>
		queryOptions({
			queryFn: async () => {
				const invitations = await unwrap(
					authClient.organization.listUserInvitations()
				);
				return invitations.filter(isPending);
			},
			queryKey: [...organizationKey, "user-invitations"],
		}),
};

/** The signed-in user's role in the active organization ("" until it loads). */
export function useActiveRole() {
	const { user } = useSession();
	const { data: organization } = useQuery(organizationQueries.active());
	return (
		organization?.members.find((member) => member.userId === user.id)?.role ??
		""
	);
}

export type OrganizationMember =
	(typeof authClient.$Infer.ActiveOrganization)["members"][number];

export async function requireActiveOrganization(
	queryClient: QueryClient,
	session: Session
) {
	if (session.session.activeOrganizationId) {
		return session.session.activeOrganizationId;
	}
	const organizations = await queryClient.ensureQueryData(
		organizationQueries.list()
	);
	const [fallback] = organizations;
	if (!fallback) {
		throw redirect({ to: "/onboarding" });
	}
	await unwrap(
		authClient.organization.setActive({ organizationId: fallback.id })
	);
	await refreshSession(queryClient);
	return fallback.id;
}

export async function isOrganizationSlugAvailable(slug: string) {
	const { error } = await authClient.organization.checkSlug({ slug });
	return error?.code !== "ORGANIZATION_SLUG_ALREADY_TAKEN";
}

function useActivateOrganization() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return async (organizationId: string) => {
		await unwrap(authClient.organization.setActive({ organizationId }));
		// Reset, not invalidate: cached data belongs to the previous organization.
		await queryClient.resetQueries();
		await navigate({ to: "/dashboard" });
	};
}

function useExitOrganization() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const activate = useActivateOrganization();

	return async () => {
		const [next] = await unwrap(authClient.organization.list());
		if (next) {
			await activate(next.id);
			return;
		}
		await unwrap(authClient.organization.setActive({ organizationId: null }));
		await refreshSession(queryClient);
		await navigate({ to: "/onboarding" });
		queryClient.removeQueries({ queryKey: organizationQueries.all() });
	};
}

export function useCreateOrganization() {
	const activate = useActivateOrganization();

	return useMutation({
		mutationFn: async ({ name }: { name: string }) => {
			const organization = await unwrap(
				authClient.organization.create({
					name,
					slug: createOrganizationSlug(name),
				})
			);
			await activate(organization.id);
			return organization;
		},
	});
}

export function useSwitchOrganization() {
	const activate = useActivateOrganization();

	return useMutation({
		mutationFn: (organizationId: string) => activate(organizationId),
	});
}

export function useUpdateOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { name: string; slug: string }) =>
			unwrap(authClient.organization.update({ data })),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: organizationQueries.all() }),
	});
}

export function useDeleteOrganization() {
	const exit = useExitOrganization();

	return useMutation({
		mutationFn: async (organizationId: string) => {
			await unwrap(authClient.organization.delete({ organizationId }));
			await exit();
		},
	});
}

export function useLeaveOrganization() {
	const exit = useExitOrganization();

	return useMutation({
		mutationFn: async (organizationId: string) => {
			await unwrap(authClient.organization.leave({ organizationId }));
			await exit();
		},
	});
}

export function useInviteMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			email: string;
			message?: string;
			role: OrganizationRole;
		}) => unwrap(authClient.organization.inviteMember(input)),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: organizationQueries.invitations().queryKey,
			}),
	});
}

export function useCancelInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: string) =>
			unwrap(authClient.organization.cancelInvitation({ invitationId })),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: organizationQueries.invitations().queryKey,
			}),
	});
}

export function useUpdateMemberRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { memberId: string; role: OrganizationRole }) =>
			unwrap(authClient.organization.updateMemberRole(input)),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: organizationQueries.members().queryKey,
			}),
	});
}

export function useRemoveMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (memberIdOrEmail: string) =>
			unwrap(authClient.organization.removeMember({ memberIdOrEmail })),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: organizationQueries.members().queryKey,
			}),
	});
}

export function useAcceptInvitation() {
	const activate = useActivateOrganization();

	return useMutation({
		mutationFn: async (invitationId: string) => {
			const { member } = await unwrap(
				authClient.organization.acceptInvitation({ invitationId })
			);
			await activate(member.organizationId);
		},
	});
}

export function useRejectInvitation() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (invitationId: string) =>
			unwrap(authClient.organization.rejectInvitation({ invitationId })),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: organizationQueries.userInvitations().queryKey,
			});
			await navigate({ to: "/dashboard" });
		},
	});
}
