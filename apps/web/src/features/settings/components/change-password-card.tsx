import { Trans, useLingui } from "@lingui/react/macro";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import { refreshSession } from "@/features/auth/queries";
import { authClient, unwrap } from "@/lib/auth-client";

interface ChangePasswordValues {
	currentPassword: string;
	newPassword: string;
	revokeOtherSessions: boolean;
}

export function ChangePasswordCard() {
	const { t } = useLingui();
	const queryClient = useQueryClient();

	const changePassword = useMutation({
		mutationFn: (values: ChangePasswordValues) =>
			unwrap(authClient.changePassword(values)),
		onSuccess: async () => {
			await refreshSession(queryClient);
			toast.success(t`Password changed.`);
		},
	});

	const schema = z
		.object({
			confirmPassword: z.string(),
			currentPassword: z.string().min(1, t`Enter your current password.`),
			newPassword: z
				.string()
				.min(8, t`Use at least 8 characters.`)
				.max(128, t`Use at most 128 characters.`),
			revokeOtherSessions: z.boolean(),
		})
		.refine((value) => value.newPassword === value.confirmPassword, {
			message: t`Passwords do not match.`,
			path: ["confirmPassword"],
		});

	const form = useAppForm({
		defaultValues: {
			confirmPassword: "",
			currentPassword: "",
			newPassword: "",
			revokeOtherSessions: true,
		},
		onSubmit: async ({ value, formApi }) => {
			await changePassword.mutateAsync({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: value.revokeOtherSessions,
			});
			formApi.reset();
		},
		validators: { onSubmit: schema },
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Password</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Use a long password you do not use anywhere else.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className="grid gap-5">
						<form.AppField name="currentPassword">
							{(field) => (
								<field.TextField
									autoComplete="current-password"
									label={<Trans>Current password</Trans>}
									type="password"
								/>
							)}
						</form.AppField>
						<div className="grid gap-5 sm:grid-cols-2">
							<form.AppField name="newPassword">
								{(field) => (
									<field.TextField
										autoComplete="new-password"
										label={<Trans>New password</Trans>}
										type="password"
									/>
								)}
							</form.AppField>
							<form.AppField name="confirmPassword">
								{(field) => (
									<field.TextField
										autoComplete="new-password"
										label={<Trans>Confirm new password</Trans>}
										type="password"
									/>
								)}
							</form.AppField>
						</div>
						<form.AppField name="revokeOtherSessions">
							{(field) => (
								<field.CheckboxField
									label={<Trans>Sign out of all other devices</Trans>}
								/>
							)}
						</form.AppField>
						<form.SubmitButton className="w-full sm:ml-auto sm:w-auto">
							<Trans>Change password</Trans>
						</form.SubmitButton>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
