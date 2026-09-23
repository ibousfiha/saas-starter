import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import {
	AuthFooter,
	AuthHeader,
	TextLink,
} from "@/features/auth/components/auth-layout";
import { authClient, unwrap } from "@/lib/auth-client";
import { safeRedirect } from "@/lib/redirect";

function CheckInbox({
	callbackURL,
	email,
}: {
	callbackURL: string;
	email: string;
}) {
	const { t } = useLingui();
	const resend = useMutation({
		mutationFn: () =>
			unwrap(authClient.sendVerificationEmail({ callbackURL, email })),
		onSuccess: () => toast.success(t`Verification email sent.`),
	});

	return (
		<div className="grid gap-6 text-center">
			<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
				<MailCheck className="size-6" />
			</div>
			<AuthHeader
				description={
					<Trans>
						We sent a verification link to{" "}
						<span className="font-medium text-foreground">{email}</span>. Open
						it to activate your account.
					</Trans>
				}
				title={<Trans>Check your inbox</Trans>}
			/>
			<Button
				disabled={resend.isPending}
				onClick={() => resend.mutate()}
				variant="outline"
			>
				<Trans>Resend email</Trans>
			</Button>
			<AuthFooter>
				<TextLink to="/sign-in">
					<Trans>Back to sign in</Trans>
				</TextLink>
			</AuthFooter>
		</div>
	);
}

// Carries the post-sign-up destination (e.g. an invitation) through email verification.
function verifyEmailURL(redirect?: string) {
	return redirect
		? `/verify-email?redirect=${encodeURIComponent(safeRedirect(redirect))}`
		: "/verify-email";
}

export function SignUpForm({ redirect }: { redirect?: string }) {
	const callbackURL = verifyEmailURL(redirect);
	const { t } = useLingui();
	const [submittedEmail, setSubmittedEmail] = useState<string>();

	const schema = z.object({
		email: z.email(t`Enter a valid email address.`),
		name: z.string().trim().min(1, t`Enter your name.`),
		password: z
			.string()
			.min(8, t`Use at least 8 characters.`)
			.max(128, t`Use at most 128 characters.`),
	});

	const defaultValues = { email: "", name: "", password: "" };
	const submit = useMutation({
		mutationFn: async (value: typeof defaultValues) => {
			await unwrap(authClient.signUp.email({ ...value, callbackURL }));
			setSubmittedEmail(value.email);
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: ({ value }) => submit.mutateAsync(value),
		validators: { onSubmit: schema },
	});

	if (submittedEmail) {
		return <CheckInbox callbackURL={callbackURL} email={submittedEmail} />;
	}

	return (
		<>
			<AuthHeader
				description={<Trans>Get started in less than a minute.</Trans>}
				title={<Trans>Create your account</Trans>}
			/>
			<form.AppForm>
				<form.Form className="grid gap-5">
					<form.AppField name="name">
						{(field) => (
							<field.TextField
								autoComplete="name"
								label={<Trans>Name</Trans>}
							/>
						)}
					</form.AppField>
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
								autoComplete="new-password"
								description={<Trans>At least 8 characters.</Trans>}
								label={<Trans>Password</Trans>}
								type="password"
							/>
						)}
					</form.AppField>
					<form.SubmitButton className="w-full">
						<Trans>Create account</Trans>
					</form.SubmitButton>
				</form.Form>
			</form.AppForm>
			<AuthFooter>
				<Trans>
					Already have an account?{" "}
					<TextLink search={{ redirect }} to="/sign-in">
						Sign in
					</TextLink>
				</Trans>
			</AuthFooter>
		</>
	);
}
