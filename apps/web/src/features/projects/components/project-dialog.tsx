import { Trans, useLingui } from "@lingui/react/macro";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@saas-starter/ui/components/dialog";
import { toast } from "sonner";
import {
	ProjectForm,
	type ProjectFormValues,
} from "@/features/projects/components/project-form";
import {
	type Project,
	useCreateProject,
	useUpdateProject,
} from "@/features/projects/queries";

interface ProjectDialogProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	project?: Project;
}

export function ProjectDialog({
	onOpenChange,
	open,
	project,
}: ProjectDialogProps) {
	const { t } = useLingui();
	const createProject = useCreateProject();
	const updateProject = useUpdateProject();

	async function save(values: ProjectFormValues) {
		if (project) {
			await updateProject.mutateAsync({ id: project.id, ...values });
			toast.success(t`Project updated.`);
		} else {
			await createProject.mutateAsync(values);
			toast.success(t`Project created.`);
		}
		onOpenChange(false);
	}

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{project ? <Trans>Edit project</Trans> : <Trans>New project</Trans>}
					</DialogTitle>
					<DialogDescription>
						{project ? (
							<Trans>Update the name and description of this project.</Trans>
						) : (
							<Trans>
								Projects are shared with everyone in this organization.
							</Trans>
						)}
					</DialogDescription>
				</DialogHeader>
				<ProjectForm
					defaultValues={
						project && {
							description: project.description ?? "",
							name: project.name,
						}
					}
					onSubmit={save}
					submitLabel={
						project ? (
							<Trans>Save changes</Trans>
						) : (
							<Trans>Create project</Trans>
						)
					}
				/>
			</DialogContent>
		</Dialog>
	);
}
