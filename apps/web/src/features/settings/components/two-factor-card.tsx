import { Trans, useLingui } from "@lingui/react/macro";
import { Badge } from "@saas-starter/ui/components/badge";
import { Button } from "@saas-starter/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
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
import { toast } from "sonner";
import { refreshSession, useSession } from "@/features/auth/queries";
import { BackupCodes } from "@/features/settings/components/backup-codes";
import {
	PasswordDialog,
	PasswordForm,
} from "@/features/settings/components/password-dialog";
import { TwoFactorSetupDialog } from "@/features/settings/components/two-factor-setup-dialog";
import { authClient, unwrap } from "@/lib/auth-client";

type DialogName = "backup-codes" | "disable" | "enable";

function RegenerateBackupCodesDialog({
	onOpenChange,
	open,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}) {
	const [codes, setCodes] = useState<string[] | null>(null);

	const generate = useMutation({
		mutationFn: (password: string) =>
			unwrap(authClient.twoFactor.generateBackupCodes({ password })),
		onSuccess: (data) => setCodes(data.backupCodes),
	});

	function changeOpen(next: boolean) {
		onOpenChange(next);
		if (!next) {
			setCodes(null);
		}
	}

	return (
		<Dialog onOpenChange={changeOpen} open={open}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						<Trans>New backup codes</Trans>
					</DialogTitle>
					<DialogDescription>
						{codes ? (
							<Trans>
								Your old codes no longer work. Store these somewhere safe.
							</Trans>
						) : (
							<Trans>
								Confirm your password. Your current backup codes will stop
								working.
							</Trans>
						)}
					</DialogDescription>
				</DialogHeader>
				{codes ? (
					<>
						<BackupCodes codes={codes} />
						<DialogFooter>
							<Button onClick={() => changeOpen(false)}>
								<Trans>Done</Trans>
							</Button>
						</DialogFooter>
					</>
				) : (
					<PasswordForm
						onSubmit={(password) => generate.mutateAsync(password)}
						submitLabel={<Trans>Generate codes</Trans>}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

export function TwoFactorCard() {
	const { t } = useLingui();
	const { user } = useSession();
	const queryClient = useQueryClient();
	const [dialog, setDialog] = useState<DialogName>();
	const enabled = user.twoFactorEnabled === true;

	const disable = useMutation({
		mutationFn: (password: string) =>
			unwrap(authClient.twoFactor.disable({ password })),
		onSuccess: async () => {
			await refreshSession(queryClient);
			setDialog(undefined);
			toast.success(t`Two-factor authentication is off.`);
		},
	});

	const dialogProps = (name: DialogName) => ({
		onOpenChange: (open: boolean) => setDialog(open ? name : undefined),
		open: dialog === name,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Two-factor authentication</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>
						Require a code from an authenticator app when you sign in.
					</Trans>
				</CardDescription>
				<CardAction>
					{enabled ? (
						<Badge>
							<Trans>On</Trans>
						</Badge>
					) : (
						<Badge variant="outline">
							<Trans>Off</Trans>
						</Badge>
					)}
				</CardAction>
			</CardHeader>
			<CardFooter className="flex-wrap gap-2">
				{enabled ? (
					<>
						<Button onClick={() => setDialog("backup-codes")} variant="outline">
							<Trans>Regenerate backup codes</Trans>
						</Button>
						<Button onClick={() => setDialog("disable")} variant="outline">
							<Trans>Disable</Trans>
						</Button>
					</>
				) : (
					<Button onClick={() => setDialog("enable")}>
						<Trans>Enable two-factor authentication</Trans>
					</Button>
				)}
			</CardFooter>
			<TwoFactorSetupDialog {...dialogProps("enable")} />
			<RegenerateBackupCodesDialog {...dialogProps("backup-codes")} />
			<PasswordDialog
				{...dialogProps("disable")}
				description={
					<Trans>
						Confirm your password. You will only need your password to sign in.
					</Trans>
				}
				destructive
				onSubmit={(password) => disable.mutateAsync(password)}
				submitLabel={<Trans>Disable two-factor authentication</Trans>}
				title={<Trans>Disable two-factor authentication?</Trans>}
			/>
		</Card>
	);
}
