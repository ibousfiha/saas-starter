import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import {
	AuthFooter,
	AuthHeader,
	TextLink,
} from "@/features/auth/components/auth-layout";
import { authClient, unwrap } from "@/lib/auth-client";

export function ForgotPasswordForm() {
	const { t } = useLingui();
	const [sent, setSent] = useState(false);

	const schema = z.object({
		email: z.email(t`Enter a valid email address.`),
	});

	const defaultValues = { email: "" };
	const submit = useMutation({
		mutationFn: async (value: typeof defaultValues) => {
			await unwrap(
				authClient.requestPasswordReset({
					email: value.email,
					redirectTo: "/reset-password",
				})
			);
			setSent(true);
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: ({ value }) => submit.mutateAsync(value),
		validators: { onSubmit: schema },
	});

	if (sent) {
		return (
			<div className="grid gap-6 text-center">
				<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
					<MailCheck className="size-6" />
				</div>
				<AuthHeader
					description={
						<Trans>
							If an account exists for that address, we sent a link to reset
							your password.
						</Trans>
					}
					title={<Trans>Check your inbox</Trans>}
				/>
				<AuthFooter>
					<TextLink to="/sign-in">
						<Trans>Back to sign in</Trans>
					</TextLink>
				</AuthFooter>
			</div>
		);
	}

	return (
		<>
			<AuthHeader
				description={
					<Trans>Enter your email and we will send you a reset link.</Trans>
				}
				title={<Trans>Forgot your password?</Trans>}
			/>
			<form.AppForm>
				<form.Form className="grid gap-5">
					<form.AppField name="email">
						{(field) => (
							<field.TextField
								autoComplete="email"
								label={<Trans>Email</Trans>}
								placeholder="you@example.com"
								type="email"
							/>
						)}
					</form.AppField>
					<form.SubmitButton className="w-full">
						<Trans>Send reset link</Trans>
					</form.SubmitButton>
				</form.Form>
			</form.AppForm>
			<AuthFooter>
				<Trans>
					Remembered it? <TextLink to="/sign-in">Sign in</TextLink>
				</Trans>
			</AuthFooter>
		</>
	);
}
