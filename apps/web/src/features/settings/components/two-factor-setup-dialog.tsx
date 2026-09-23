import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@saas-starter/ui/components/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import { refreshSession } from "@/features/auth/queries";
import { BackupCodes } from "@/features/settings/components/backup-codes";
import { PasswordForm } from "@/features/settings/components/password-dialog";
import { authClient, unwrap } from "@/lib/auth-client";

const TOTP_CODE = /^\d{6}$/;

interface Enrollment {
	backupCodes: string[];
	totpURI: string;
}

function VerifyStep({
	enrollment,
	onVerified,
}: {
	enrollment: Enrollment;
	onVerified: () => void;
}) {
	const { t } = useLingui();
	const queryClient = useQueryClient();
	const secret = new URL(enrollment.totpURI).searchParams.get("secret");

	const verify = useMutation({
		mutationFn: (code: string) =>
			unwrap(authClient.twoFactor.verifyTotp({ code })),
		onSuccess: async () => {
			await refreshSession(queryClient);
			toast.success(t`Two-factor authentication is on.`);
			onVerified();
		},
	});

	const schema = z.object({
		code: z.string().regex(TOTP_CODE, t`Enter the 6-digit code.`),
	});

	const form = useAppForm({
		defaultValues: { code: "" },
		onSubmit: ({ value }) => verify.mutateAsync(value.code),
		validators: { onSubmit: schema },
	});

	return (
		<div className="grid gap-5">
			<div className="grid gap-2 text-sm">
				<div className="justify-self-center rounded-lg border bg-white p-3">
					<QRCode size={160} value={enrollment.totpURI} />
				</div>
				<code className="select-all break-all rounded-lg border bg-muted/50 p-3 text-center font-mono tracking-wider">
					{secret}
				</code>
				<Button asChild className="justify-self-start px-0" variant="link">
					<a href={enrollment.totpURI}>
						<Trans>Open in authenticator app</Trans>
					</a>
				</Button>
			</div>
			<form.AppForm>
				<form.Form className="grid gap-5">
					<form.AppField name="code">
						{(field) => (
							<field.OtpField label={<Trans>Verification code</Trans>} />
						)}
					</form.AppField>
					<form.SubmitButton className="w-full sm:ml-auto sm:w-auto">
						<Trans>Verify and enable</Trans>
					</form.SubmitButton>
				</form.Form>
			</form.AppForm>
		</div>
	);
}

interface TwoFactorSetupDialogProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function TwoFactorSetupDialog({
	onOpenChange,
	open,
}: TwoFactorSetupDialogProps) {
	const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
	const [verified, setVerified] = useState(false);

	const enable = useMutation({
		mutationFn: (password: string) =>
			unwrap(authClient.twoFactor.enable({ password })),
		onSuccess: setEnrollment,
	});

	function changeOpen(next: boolean) {
		onOpenChange(next);
		if (!next) {
			setEnrollment(null);
			setVerified(false);
		}
	}

	return (
		<Dialog onOpenChange={changeOpen} open={open}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{verified ? (
							<Trans>Save your backup codes</Trans>
						) : (
							<Trans>Enable two-factor authentication</Trans>
						)}
					</DialogTitle>
					<DialogDescription>
						{!enrollment && (
							<Trans>Confirm your password to start the setup.</Trans>
						)}
						{enrollment && !verified && (
							<Trans>
								Scan the QR code with your authenticator app or enter the key
								manually, then enter the code it shows.
							</Trans>
						)}
						{verified && (
							<Trans>
								Each code works once. Store them somewhere safe — you will not
								see them again.
							</Trans>
						)}
					</DialogDescription>
				</DialogHeader>
				{!enrollment && (
					<PasswordForm
						onSubmit={(password) => enable.mutateAsync(password)}
						submitLabel={<Trans>Continue</Trans>}
					/>
				)}
				{enrollment && !verified && (
					<VerifyStep
						enrollment={enrollment}
						onVerified={() => setVerified(true)}
					/>
				)}
				{enrollment && verified && (
					<>
						<BackupCodes codes={enrollment.backupCodes} />
						<DialogFooter>
							<Button onClick={() => changeOpen(false)}>
								<Trans>Done</Trans>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
