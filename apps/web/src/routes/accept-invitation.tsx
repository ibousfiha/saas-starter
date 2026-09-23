import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { sessionQueryOptions } from "@/features/auth/queries";
import { AcceptInvitation } from "@/features/organization/components/accept-invitation";
import { organizationQueries } from "@/features/organization/queries";

export const Route = createFileRoute("/accept-invitation")({
	beforeLoad: async ({ context: { queryClient }, search: { id } }) => {
		await Promise.all([
			queryClient.ensureQueryData(sessionQueryOptions()),
			id && queryClient.prefetchQuery(organizationQueries.publicInvitation(id)),
		]);
	},
	component: AcceptInvitationPage,
	staticData: { title: msg`Accept invitation` },
	validateSearch: z.object({ id: z.string().optional() }),
});

function AcceptInvitationPage() {
	const { id } = Route.useSearch();
	return (
		<AuthLayout>
			<AcceptInvitation id={id} />
		</AuthLayout>
	);
}
