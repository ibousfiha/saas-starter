import { Trans } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { Skeleton } from "@saas-starter/ui/components/skeleton";
import { Spinner } from "@saas-starter/ui/components/spinner";
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import {
	AuthFooter,
	AuthHeader,
	TextLink,
} from "@/features/auth/components/auth-layout";
import { sessionQueryOptions } from "@/features/auth/queries";
import {
	organizationQueries,
	useAcceptInvitation,
	useRejectInvitation,
} from "@/features/organization/queries";
import { authClient, unwrap } from "@/lib/auth-client";

function InvitationUnavailable({ signedIn }: { signedIn: boolean }) {
	return (
		<div className="grid gap-6 text-center">
			<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
				<CircleAlert className="size-6" />
			</div>
			<AuthHeader
				description={
					<Trans>
						This invitation is invalid, has expired or was already used. Ask the
						person who invited you for a new one.
					</Trans>
				}
				title={<Trans>Invitation unavailable</Trans>}
			/>
			<Button asChild>
				{signedIn ? (
					<Link to="/dashboard">
						<Trans>Go to dashboard</Trans>
					</Link>
				) : (
					<Link to="/sign-in">
						<Trans>Go to sign in</Trans>
					</Link>
				)}
			</Button>
		</div>
	);
}

function SwitchAccountButton({ redirect }: { redirect: string }) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const signOut = useMutation({
		mutationFn: () => unwrap(authClient.signOut()),
		onSuccess: async () => {
			queryClient.clear();
			await navigate({ search: { redirect }, to: "/sign-in" });
		},
	});

	return (
		<Button
			disabled={signOut.isPending}
			onClick={() => signOut.mutate()}
			variant="outline"
		>
			{signOut.isPending && <Spinner />}
			<Trans>Sign in with another account</Trans>
		</Button>
	);
}

function InvitationResponse({ id }: { id: string }) {
	const accept = useAcceptInvitation();
	const reject = useRejectInvitation();
	const pending = accept.isPending || reject.isPending;

	return (
		<div className="grid gap-3">
			<Button disabled={pending} onClick={() => accept.mutate(id)}>
				{accept.isPending && <Spinner />}
				<Trans>Accept invitation</Trans>
			</Button>
			<Button
				disabled={pending}
				onClick={() => reject.mutate(id)}
				variant="outline"
			>
				{reject.isPending && <Spinner />}
				<Trans>Decline</Trans>
			</Button>
		</div>
	);
}

function InvitationDetails({ id }: { id: string }) {
	const { data: session } = useSuspenseQuery(sessionQueryOptions());
	const invitation = useQuery(organizationQueries.publicInvitation(id));
	const redirect = `/accept-invitation?id=${encodeURIComponent(id)}`;

	if (invitation.isPending) {
		return (
			<div className="grid justify-items-center gap-4">
				<Skeleton className="size-12 rounded-xl" />
				<Skeleton className="h-7 w-56" />
				<Skeleton className="h-4 w-64" />
				<Skeleton className="mt-4 h-9 w-full" />
			</div>
		);
	}

	if (!invitation.data) {
		return <InvitationUnavailable signedIn={Boolean(session)} />;
	}

	const { email, inviterName, organizationName } = invitation.data;
	const isRecipient = session?.user.email.toLowerCase() === email.toLowerCase();

	return (
		<div className="grid gap-6">
			<div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary font-semibold text-lg text-primary-foreground">
				{organizationName.slice(0, 1).toUpperCase()}
			</div>
			<AuthHeader
				description={
					<Trans>
						<span className="font-medium text-foreground">{inviterName}</span>{" "}
						invited <span className="font-medium text-foreground">{email}</span>{" "}
						to collaborate in {organizationName}.
					</Trans>
				}
				title={<Trans>Join {organizationName}</Trans>}
			/>
			{!session && (
				<>
					<div className="grid gap-3">
						<Button asChild>
							<Link search={{ redirect }} to="/sign-in">
								<Trans>Sign in to accept</Trans>
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link search={{ redirect }} to="/sign-up">
								<Trans>Create an account</Trans>
							</Link>
						</Button>
					</div>
					<AuthFooter>
						<Trans>
							Use <span className="font-medium text-foreground">{email}</span>{" "}
							so we can match your invitation.
						</Trans>
					</AuthFooter>
				</>
			)}
			{session && isRecipient && <InvitationResponse id={id} />}
			{session && !isRecipient && (
				<>
					<p
						className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
						role="alert"
					>
						<Trans>
							You are signed in as{" "}
							<span className="font-medium">{session.user.email}</span>. Sign in
							with <span className="font-medium">{email}</span> to accept this
							invitation.
						</Trans>
					</p>
					<SwitchAccountButton redirect={redirect} />
					<AuthFooter>
						<TextLink to="/dashboard">
							<Trans>Go to dashboard</Trans>
						</TextLink>
					</AuthFooter>
				</>
			)}
		</div>
	);
}

export function AcceptInvitation({ id }: { id?: string }) {
	const { data: session } = useSuspenseQuery(sessionQueryOptions());

	return id ? (
		<InvitationDetails id={id} />
	) : (
		<InvitationUnavailable signedIn={Boolean(session)} />
	);
}
