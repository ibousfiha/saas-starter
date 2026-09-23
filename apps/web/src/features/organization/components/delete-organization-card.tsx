import { Trans } from "@lingui/react/macro";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@saas-starter/ui/components/alert-dialog";
import { Button } from "@saas-starter/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import { Field, FieldLabel } from "@saas-starter/ui/components/field";
import { Input } from "@saas-starter/ui/components/input";
import { Spinner } from "@saas-starter/ui/components/spinner";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteOrganization } from "@/features/organization/queries";

interface DeleteOrganizationCardProps {
	organization: { id: string; name: string };
}

export function DeleteOrganizationCard({
	organization,
}: DeleteOrganizationCardProps) {
	const deleteOrganization = useDeleteOrganization();
	const [confirmation, setConfirmation] = useState("");
	const confirmed = confirmation.trim() === organization.name;
	const { name } = organization;

	return (
		<Card className="border-destructive/40">
			<CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
				<div className="grid gap-2">
					<CardTitle>
						<Trans>Delete organization</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>
							Permanently delete this organization, its projects, members and
							invitations. This cannot be undone.
						</Trans>
					</CardDescription>
				</div>
				<AlertDialog
					onOpenChange={(open) => {
						if (!open) {
							setConfirmation("");
						}
					}}
				>
					<AlertDialogTrigger asChild>
						<Button className="w-full sm:w-auto" variant="destructive">
							<Trash2 />
							<Trans>Delete organization</Trans>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<form
							className="grid gap-4"
							onSubmit={(event) => {
								event.preventDefault();
								if (confirmed) {
									deleteOrganization.mutate(organization.id);
								}
							}}
						>
							<AlertDialogHeader>
								<AlertDialogTitle>
									<Trans>Delete {name}?</Trans>
								</AlertDialogTitle>
								<AlertDialogDescription>
									<Trans>
										All projects, members and pending invitations will be
										removed. This cannot be undone.
									</Trans>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<Field>
								<FieldLabel htmlFor="confirm-organization-name">
									<Trans>
										Type <span className="font-semibold">{name}</span> to
										confirm
									</Trans>
								</FieldLabel>
								<Input
									autoComplete="off"
									id="confirm-organization-name"
									onChange={(event) => setConfirmation(event.target.value)}
									value={confirmation}
								/>
							</Field>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={deleteOrganization.isPending}>
									<Trans>Cancel</Trans>
								</AlertDialogCancel>
								<Button
									disabled={!confirmed || deleteOrganization.isPending}
									type="submit"
									variant="destructive"
								>
									{deleteOrganization.isPending && <Spinner />}
									<Trans>Delete organization</Trans>
								</Button>
							</AlertDialogFooter>
						</form>
					</AlertDialogContent>
				</AlertDialog>
			</CardHeader>
		</Card>
	);
}
