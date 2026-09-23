import { Trans } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, Link } from "@tanstack/react-router";
import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProjectDialog } from "@/features/projects/components/project-dialog";
import { ProjectsTable } from "@/features/projects/components/projects-table";
import { type Project, projectQueries } from "@/features/projects/queries";

const route = getRouteApi("/_app/projects");

function NewProjectButton() {
	return (
		<Button asChild>
			<Link search={{ new: true }} to="/projects">
				<Plus />
				<Trans>New project</Trans>
			</Link>
		</Button>
	);
}

export function ProjectsPage() {
	const { data: projects } = useSuspenseQuery(projectQueries.list());
	const search = route.useSearch();
	const navigate = route.useNavigate();
	const [editing, setEditing] = useState<Project>();
	const [editOpen, setEditOpen] = useState(false);

	return (
		<>
			<PageHeader
				actions={projects.length > 0 && <NewProjectButton />}
				description={
					<Trans>Create and manage the projects in this organization.</Trans>
				}
				title={<Trans>Projects</Trans>}
			/>
			{projects.length > 0 ? (
				<ProjectsTable
					onEdit={(project) => {
						setEditing(project);
						setEditOpen(true);
					}}
					projects={projects}
				/>
			) : (
				<EmptyState
					action={<NewProjectButton />}
					description={<Trans>Create your first project to get started.</Trans>}
					icon={FolderKanban}
					title={<Trans>No projects yet</Trans>}
				/>
			)}
			<ProjectDialog
				onOpenChange={(open) =>
					navigate({ replace: true, search: open ? { new: true } : {} })
				}
				open={search.new === true}
			/>
			<ProjectDialog
				onOpenChange={setEditOpen}
				open={editOpen}
				project={editing}
			/>
		</>
	);
}
