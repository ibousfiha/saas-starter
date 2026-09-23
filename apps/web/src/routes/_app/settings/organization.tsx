import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { OrganizationSettings } from "@/features/organization/components/organization-settings";
import { organizationQueries } from "@/features/organization/queries";

export const Route = createFileRoute("/_app/settings/organization")({
	component: OrganizationSettings,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(organizationQueries.active()),
	staticData: { title: msg`Organization` },
});
