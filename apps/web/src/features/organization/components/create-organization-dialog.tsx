import { Trans } from "@lingui/react/macro";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@saas-starter/ui/components/dialog";
import { CreateOrganizationForm } from "@/features/organization/components/create-organization-form";

interface CreateOrganizationDialogProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function CreateOrganizationDialog({
	onOpenChange,
	open,
}: CreateOrganizationDialogProps) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						<Trans>Create organization</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>
							Organizations keep projects and members separate. You will switch
							to the new one right away.
						</Trans>
					</DialogDescription>
				</DialogHeader>
				<CreateOrganizationForm onCreated={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}
