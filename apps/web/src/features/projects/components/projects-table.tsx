import { Trans, useLingui } from "@lingui/react/macro";
import { hasPermission } from "@saas-starter/auth/permissions";
import { Button } from "@saas-starter/ui/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@saas-starter/ui/components/table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useActiveRole } from "@/features/organization/queries";
import { type Project, useDeleteProject } from "@/features/projects/queries";

interface ProjectsTableProps {
	onEdit: (project: Project) => void;
	projects: Project[];
}

export function ProjectsTable({ onEdit, projects }: ProjectsTableProps) {
	const { i18n, t } = useLingui();
	const canDelete = hasPermission(useActiveRole(), { project: ["delete"] });
	const deleteProject = useDeleteProject();

	return (
		<div className="overflow-hidden rounded-xl border">
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow>
						<TableHead className="pl-4">
							<Trans>Name</Trans>
						</TableHead>
						<TableHead className="hidden w-40 sm:table-cell">
							<Trans>Created</Trans>
						</TableHead>
						<TableHead className="w-24 pr-4 text-right">
							<span className="sr-only">
								<Trans>Actions</Trans>
							</span>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{projects.map((project) => (
						<TableRow key={project.id}>
							<TableCell className="max-w-0 whitespace-normal py-3 pl-4">
								<div className="truncate font-medium">{project.name}</div>
								{project.description && (
									<div className="truncate text-muted-foreground">
										{project.description}
									</div>
								)}
							</TableCell>
							<TableCell className="hidden text-muted-foreground sm:table-cell">
								{i18n.date(project.createdAt, { dateStyle: "medium" })}
							</TableCell>
							<TableCell className="pr-4">
								<div className="flex justify-end gap-1">
									<Button
										aria-label={t`Edit ${project.name}`}
										onClick={() => onEdit(project)}
										size="icon"
										variant="ghost"
									>
										<Pencil />
									</Button>
									{canDelete && (
										<ConfirmDialog
											confirmLabel={<Trans>Delete project</Trans>}
											description={
												<Trans>
													"{project.name}" will be permanently deleted. This
													cannot be undone.
												</Trans>
											}
											onConfirm={async () => {
												await deleteProject.mutateAsync({ id: project.id });
												toast.success(t`Project deleted.`);
											}}
											title={<Trans>Delete this project?</Trans>}
										>
											<Button
												aria-label={t`Delete ${project.name}`}
												className="text-muted-foreground hover:text-destructive"
												size="icon"
												variant="ghost"
											>
												<Trash2 />
											</Button>
										</ConfirmDialog>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
