import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell/app-shell";
import { requireSession } from "@/features/auth/guards";
import {
	organizationQueries,
	requireActiveOrganization,
} from "@/features/organization/queries";

export const Route = createFileRoute("/_app")({
	beforeLoad: async (options) => {
		const session = await requireSession(options);
		const organizationId = await requireActiveOrganization(
			options.context.queryClient,
			session
		);
		return { organizationId };
	},
	component: () => (
		<AppShell>
			<Outlet />
		</AppShell>
	),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(organizationQueries.list()),
});
