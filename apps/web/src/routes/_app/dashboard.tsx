import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { organizationQueries } from "@/features/organization/queries";
import { projectQueries } from "@/features/projects/queries";

export const Route = createFileRoute("/_app/dashboard")({
	component: DashboardPage,
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(projectQueries.list()),
			context.queryClient.ensureQueryData(organizationQueries.active()),
		]),
	pendingComponent: DashboardSkeleton,
	staticData: { title: msg`Dashboard` },
});
