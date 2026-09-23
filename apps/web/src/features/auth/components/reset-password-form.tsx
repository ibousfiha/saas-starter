import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import {
	AuthFooter,
	AuthHeader,
	TextLink,
} from "@/features/auth/components/auth-layout";
import { authClient, unwrap } from "@/lib/auth-client";

function InvalidLink() {
	return (
		<div className="grid gap-6">
			<AuthHeader
				description={
					<Trans>
						This reset link is invalid or has expired. Request a new one.
					</Trans>
				}
				title={<Trans>Link expired</Trans>}
			/>
			<Button asChild>
				<Link to="/forgot-password">
					<Trans>Request a new link</Trans>
				</Link>
			</Button>
		</div>
	);
}

export function ResetPasswordForm({ token }: { token?: string }) {
	const { t } = useLingui();
	const navigate = useNavigate();

	const schema = z
		.object({
			confirmPassword: z.string(),
			password: z
				.string()
				.min(8, t`Use at least 8 characters.`)
				.max(128, t`Use at most 128 characters.`),
		})
		.refine((value) => value.password === value.confirmPassword, {
			message: t`Passwords do not match.`,
			path: ["confirmPassword"],
		});

	const defaultValues = { confirmPassword: "", password: "" };
	const submit = useMutation({
		mutationFn: async (value: typeof defaultValues) => {
			await unwrap(
				authClient.resetPassword({ newPassword: value.password, token })
			);
			toast.success(t`Password updated. Sign in with your new password.`);
			await navigate({ to: "/sign-in" });
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: ({ value }) => submit.mutateAsync(value),
		validators: { onSubmit: schema },
	});

	if (!token) {
		return <InvalidLink />;
	}

	return (
		<>
			<AuthHeader
				description={<Trans>Choose a new password for your account.</Trans>}
				title={<Trans>Set a new password</Trans>}
			/>
			<form.AppForm>
				<form.Form className="grid gap-5">
					<form.AppField name="password">
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
								label={<Trans>Confirm password</Trans>}
								type="password"
							/>
						)}
					</form.AppField>
					<form.SubmitButton className="w-full">
						<Trans>Update password</Trans>
					</form.SubmitButton>
				</form.Form>
			</form.AppForm>
			<AuthFooter>
				<TextLink to="/sign-in">
					<Trans>Back to sign in</Trans>
				</TextLink>
			</AuthFooter>
		</>
	);
}
