import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@saas-starter/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldLabel,
} from "@saas-starter/ui/components/field";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import { RoleSelect } from "@/features/organization/components/role-select";
import { useInviteMember } from "@/features/organization/queries";
import {
	getAssignableRoles,
	type OrganizationRole,
	organizationRoles,
} from "@/features/organization/roles";

export function InviteMemberDialog({ actorRole }: { actorRole: string }) {
	const { t } = useLingui();
	const [open, setOpen] = useState(false);
	const inviteMember = useInviteMember();

	const schema = z.object({
		email: z.email(t`Enter a valid email address.`),
		message: z.string().trim().max(500, t`Use at most 500 characters.`),
		role: z.enum(organizationRoles),
	});

	const form = useAppForm({
		defaultValues: {
			email: "",
			message: "",
			role: "member" as OrganizationRole,
		},
		onSubmit: async ({ value }) => {
			await inviteMember.mutateAsync({
				email: value.email.trim(),
				message: value.message.trim() || undefined,
				role: value.role,
			});
			toast.success(t`Invitation sent to ${value.email}.`);
			setOpen(false);
			form.reset();
		},
		validators: { onSubmit: schema },
	});

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus />
					<Trans>Invite member</Trans>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						<Trans>Invite member</Trans>
					</DialogTitle>
					<DialogDescription>
						<Trans>
							We will email them a link to join this organization. The link
							expires after 48 hours.
						</Trans>
					</DialogDescription>
				</DialogHeader>
				<form.AppForm>
					<form.Form className="grid gap-5">
						<form.AppField name="email">
							{(field) => (
								<field.TextField
									autoComplete="off"
									autoFocus
									label={<Trans>Email</Trans>}
									placeholder="teammate@example.com"
									type="email"
								/>
							)}
						</form.AppField>
						<form.AppField name="role">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										<Trans>Role</Trans>
									</FieldLabel>
									<RoleSelect
										className="w-full"
										id={field.name}
										onValueChange={field.handleChange}
										roles={getAssignableRoles(actorRole)}
										value={field.state.value}
									/>
									<FieldDescription>
										<Trans>
											Admins can manage members and invitations. Members can
											work on projects.
										</Trans>
									</FieldDescription>
								</Field>
							)}
						</form.AppField>
						<form.AppField name="message">
							{(field) => (
								<field.TextareaField
									label={<Trans>Personal message (optional)</Trans>}
									maxLength={500}
									placeholder={t`Looking forward to working with you!`}
									rows={3}
								/>
							)}
						</form.AppField>
						<DialogFooter>
							<form.SubmitButton>
								<Trans>Send invitation</Trans>
							</form.SubmitButton>
						</DialogFooter>
					</form.Form>
				</form.AppForm>
			</DialogContent>
		</Dialog>
	);
}
