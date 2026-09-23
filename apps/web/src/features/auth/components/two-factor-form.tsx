import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

const TOTP_CODE = /^\d{6}$/;

type Method = "backup" | "totp";

export function TwoFactorForm({ redirect }: { redirect?: string }) {
	const { t } = useLingui();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [method, setMethod] = useState<Method>("totp");

	const schema = z.object({
		code:
			method === "totp"
				? z.string().regex(TOTP_CODE, t`Enter the 6-digit code.`)
				: z.string().trim().min(1, t`Enter a backup code.`),
		trustDevice: z.boolean(),
	});

	const defaultValues = { code: "", trustDevice: false };
	const submit = useMutation({
		mutationFn: async (value: typeof defaultValues) => {
			const verify =
				method === "totp"
					? authClient.twoFactor.verifyTotp
					: authClient.twoFactor.verifyBackupCode;
			await unwrap(
				verify({ code: value.code.trim(), trustDevice: value.trustDevice })
			);
			await refreshSession(queryClient);
			await navigate({ href: safeRedirect(redirect) });
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: ({ value }) => submit.mutateAsync(value),
		validators: { onSubmit: schema },
	});

	const toggleMethod = () => {
		setMethod(method === "totp" ? "backup" : "totp");
		form.reset();
	};

	return (
		<>
			<AuthHeader
				description={
					method === "totp" ? (
						<Trans>Enter the 6-digit code from your authenticator app.</Trans>
					) : (
						<Trans>Enter one of the backup codes you saved.</Trans>
					)
				}
				title={<Trans>Two-factor authentication</Trans>}
			/>
			<form.AppForm>
				<form.Form className="grid gap-5">
					<form.AppField name="code">
						{(field) =>
							method === "totp" ? (
								<field.OtpField label={<Trans>Authentication code</Trans>} />
							) : (
								<field.TextField
									autoComplete="one-time-code"
									autoFocus
									label={<Trans>Backup code</Trans>}
								/>
							)
						}
					</form.AppField>
					<form.AppField name="trustDevice">
						{(field) => (
							<field.CheckboxField
								label={<Trans>Trust this device for 30 days</Trans>}
							/>
						)}
					</form.AppField>
					<form.SubmitButton className="w-full">
						<Trans>Verify</Trans>
					</form.SubmitButton>
				</form.Form>
			</form.AppForm>
			<Button
				className="mt-2 w-full"
				onClick={toggleMethod}
				type="button"
				variant="ghost"
			>
				{method === "totp" ? (
					<Trans>Use a backup code instead</Trans>
				) : (
					<Trans>Use your authenticator app</Trans>
				)}
			</Button>
			<AuthFooter>
				<TextLink to="/sign-in">
					<Trans>Back to sign in</Trans>
				</TextLink>
			</AuthFooter>
		</>
	);
}
