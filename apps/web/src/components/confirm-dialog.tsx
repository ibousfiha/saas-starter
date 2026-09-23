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
import { Spinner } from "@saas-starter/ui/components/spinner";
import { type ReactNode, useState } from "react";

interface ConfirmDialogProps {
	children: ReactNode;
	confirmLabel: ReactNode;
	description: ReactNode;
	destructive?: boolean;
	onConfirm: () => Promise<unknown>;
	title: ReactNode;
}

export function ConfirmDialog({
	children,
	confirmLabel,
	description,
	destructive = true,
	onConfirm,
	title,
}: ConfirmDialogProps) {
	const [open, setOpen] = useState(false);
	const [pending, setPending] = useState(false);

	async function confirm() {
		setPending(true);
		try {
			await onConfirm();
			setOpen(false);
		} finally {
			setPending(false);
		}
	}

	return (
		<AlertDialog onOpenChange={setOpen} open={open}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>
						<Trans>Cancel</Trans>
					</AlertDialogCancel>
					<Button
						disabled={pending}
						onClick={() => confirm().catch(() => undefined)}
						variant={destructive ? "destructive" : "default"}
					>
						{pending && <Spinner />}
						{confirmLabel}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
