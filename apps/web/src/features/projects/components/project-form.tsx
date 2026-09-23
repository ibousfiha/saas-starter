import { Trans, useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form";

export interface ProjectFormValues {
	description: string;
	name: string;
}

interface ProjectFormProps {
	defaultValues?: ProjectFormValues;
	onSubmit: (values: ProjectFormValues) => Promise<unknown>;
	submitLabel: ReactNode;
}

export function ProjectForm({
	defaultValues = { description: "", name: "" },
	onSubmit,
	submitLabel,
}: ProjectFormProps) {
	const { t } = useLingui();

	const schema = z.object({
		description: z.string().trim().max(500, t`Use at most 500 characters.`),
		name: z
			.string()
			.trim()
			.min(1, t`Enter a project name.`)
			.max(100, t`Use at most 100 characters.`),
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: ({ value }) =>
			onSubmit({
				description: value.description.trim(),
				name: value.name.trim(),
			}),
		validators: { onSubmit: schema },
	});

	return (
		<form.AppForm>
			<form.Form className="grid gap-5">
				<form.AppField name="name">
					{(field) => (
						<field.TextField
							autoComplete="off"
							autoFocus
							label={<Trans>Name</Trans>}
							maxLength={100}
							placeholder={t`Website redesign`}
						/>
					)}
				</form.AppField>
				<form.AppField name="description">
					{(field) => (
						<field.TextareaField
							description={<Trans>Optional. Up to 500 characters.</Trans>}
							label={<Trans>Description</Trans>}
							maxLength={500}
							placeholder={t`What is this project about?`}
							rows={4}
						/>
					)}
				</form.AppField>
				<form.SubmitButton className="w-full sm:ml-auto sm:w-auto">
					{submitLabel}
				</form.SubmitButton>
			</form.Form>
		</form.AppForm>
	);
}
