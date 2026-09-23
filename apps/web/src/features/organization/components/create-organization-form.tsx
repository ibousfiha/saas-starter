import { Trans, useLingui } from "@lingui/react/macro";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import { useCreateOrganization } from "@/features/organization/queries";

interface CreateOrganizationFormProps {
	onCreated?: () => void;
}

export function CreateOrganizationForm({
	onCreated,
}: CreateOrganizationFormProps) {
	const { t } = useLingui();
	const createOrganization = useCreateOrganization();

	const schema = z.object({
		name: z
			.string()
			.trim()
			.min(2, t`Use at least 2 characters.`)
			.max(64, t`Use at most 64 characters.`),
	});

	const form = useAppForm({
		defaultValues: { name: "" },
		onSubmit: async ({ value }) => {
			await createOrganization.mutateAsync({ name: value.name.trim() });
			onCreated?.();
		},
		validators: { onSubmit: schema },
	});

	return (
		<form.AppForm>
			<form.Form className="grid gap-5">
				<form.AppField name="name">
					{(field) => (
						<field.TextField
							autoComplete="organization"
							autoFocus
							description={<Trans>You can change this later.</Trans>}
							label={<Trans>Organization name</Trans>}
							placeholder="Acme Inc."
						/>
					)}
				</form.AppField>
				<form.SubmitButton className="w-full">
					<Trans>Create organization</Trans>
				</form.SubmitButton>
			</form.Form>
		</form.AppForm>
	);
}
