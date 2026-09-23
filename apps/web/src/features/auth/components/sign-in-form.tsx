import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import {
	AuthFooter,
	AuthHeader,
	TextLink,
} from "@/features/auth/components/auth-layout";
import { refreshSession } from "@/features/auth/queries";
import { authClient, unwrap } from "@/lib/auth-client";
import { safeRedirect } from "@/lib/redirect";

export function SignInForm({ redirect }: { redirect?: string }) {
	const { t } = useLingui();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const schema = z.object({
		email: z.email(t`Enter a valid email address.`),
		password: z.string().min(1, t`Enter your password.`),
	});

	const defaultValues = { email: "", password: "" };
	const submit = useMutation({
		mutationFn: async (value: typeof defaultValues) => {
			const result = await unwrap(authClient.signIn.email(value));
			if ("twoFactorRedirect" in result && result.twoFactorRedirect) {
				await navigate({ search: { redirect }, to: "/two-factor" });
				return;
			}
			await refreshSession(queryClient);
			await navigate({ href: safeRedirect(redirect) });
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: ({ value }) => submit.mutateAsync(value),
		validators: { onSubmit: schema },
	});

	return (
		<>
			<AuthHeader
				description={<Trans>Sign in to your account to continue.</Trans>}
				title={<Trans>Welcome back</Trans>}
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
					<form.AppField name="password">
						{(field) => (
							<field.TextField
								action={
									<TextLink
										className="text-muted-foreground text-sm hover:text-foreground"
										to="/forgot-password"
									>
										<Trans>Forgot password?</Trans>
									</TextLink>
								}
								autoComplete="current-password"
								label={<Trans>Password</Trans>}
								type="password"
							/>
						)}
					</form.AppField>
					<form.SubmitButton className="w-full">
						<Trans>Sign in</Trans>
					</form.SubmitButton>
				</form.Form>
			</form.AppForm>
			<AuthFooter>
				<Trans>
					Don't have an account?{" "}
					<TextLink search={{ redirect }} to="/sign-up">
						Sign up
					</TextLink>
				</Trans>
			</AuthFooter>
		</>
	);
}
