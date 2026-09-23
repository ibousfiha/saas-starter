import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { organizationQueries } from "@/features/organization/queries";
import { ProjectsPage } from "@/features/projects/components/projects-page";
import { ProjectsSkeleton } from "@/features/projects/components/projects-skeleton";
import { projectQueries } from "@/features/projects/queries";

export const Route = createFileRoute("/_app/projects")({
	component: ProjectsPage,
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(projectQueries.list()),
			context.queryClient.ensureQueryData(organizationQueries.active()),
		]),
	pendingComponent: ProjectsSkeleton,
	staticData: { title: msg`Projects` },
	validateSearch: z.object({ new: z.boolean().optional() }),
});
