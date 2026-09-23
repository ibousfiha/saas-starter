import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { MembersPage } from "@/features/organization/components/members-page";
import { organizationQueries } from "@/features/organization/queries";

export const Route = createFileRoute("/_app/members")({
	component: MembersPage,
	loader: ({ context: { queryClient } }) =>
		Promise.all([
			queryClient.ensureQueryData(organizationQueries.members()),
			queryClient.ensureQueryData(organizationQueries.invitations()),
		]),
	staticData: { title: msg`Members` },
});
