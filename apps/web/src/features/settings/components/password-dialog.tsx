import { Trans, useLingui } from "@lingui/react/macro";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@saas-starter/ui/components/dialog";
import type { ReactNode } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form";

interface PasswordFormProps {
	destructive?: boolean;
	onSubmit: (password: string) => Promise<unknown>;
	submitLabel: ReactNode;
}

export function PasswordForm({
	destructive,
	onSubmit,
	submitLabel,
}: PasswordFormProps) {
	const { t } = useLingui();

	const schema = z.object({
		password: z.string().min(1, t`Enter your password.`),
	});

	const form = useAppForm({
		defaultValues: { password: "" },
		onSubmit: ({ value }) => onSubmit(value.password),
		validators: { onSubmit: schema },
	});

	return (
		<form.AppForm>
			<form.Form className="grid gap-5">
				<form.AppField name="password">
					{(field) => (
						<field.TextField
							autoComplete="current-password"
							autoFocus
							label={<Trans>Password</Trans>}
							type="password"
						/>
					)}
				</form.AppField>
				<form.SubmitButton
					className="w-full sm:ml-auto sm:w-auto"
					variant={destructive ? "destructive" : "default"}
				>
					{submitLabel}
				</form.SubmitButton>
			</form.Form>
		</form.AppForm>
	);
}

interface PasswordDialogProps extends PasswordFormProps {
	description: ReactNode;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	title: ReactNode;
}

export function PasswordDialog({
	description,
	onOpenChange,
	open,
	title,
	...form
}: PasswordDialogProps) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<PasswordForm {...form} />
			</DialogContent>
		</Dialog>
	);
}
