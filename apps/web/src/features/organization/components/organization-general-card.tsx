import { Trans, useLingui } from "@lingui/react/macro";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import {
	isOrganizationSlugAvailable,
	useUpdateOrganization,
} from "@/features/organization/queries";
import { slugify } from "@/features/organization/slug";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface OrganizationGeneralCardProps {
	canUpdate: boolean;
	organization: { name: string; slug: string };
}

export function OrganizationGeneralCard({
	canUpdate,
	organization,
}: OrganizationGeneralCardProps) {
	const { t } = useLingui();
	const updateOrganization = useUpdateOrganization();

	const schema = z.object({
		name: z
			.string()
			.trim()
			.min(2, t`Use at least 2 characters.`)
			.max(64, t`Use at most 64 characters.`),
		slug: z
			.string()
			.min(2, t`Use at least 2 characters.`)
			.max(48, t`Use at most 48 characters.`)
			.regex(SLUG_PATTERN, t`Use lowercase letters, numbers and dashes.`),
	});

	const form = useAppForm({
		defaultValues: { name: organization.name, slug: organization.slug },
		onSubmit: async ({ value }) => {
			await updateOrganization.mutateAsync({
				name: value.name.trim(),
				slug: value.slug,
			});
			toast.success(t`Organization updated.`);
		},
		validators: {
			onSubmit: schema,
			onSubmitAsync: async ({ value }) => {
				if (
					value.slug === organization.slug ||
					(await isOrganizationSlugAvailable(value.slug))
				) {
					return;
				}
				return {
					fields: { slug: { message: t`This slug is already taken.` } },
				};
			},
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>General</Trans>
				</CardTitle>
				<CardDescription>
					{canUpdate ? (
						<Trans>Update your organization's name and slug.</Trans>
					) : (
						<Trans>Only owners and admins can change these settings.</Trans>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className="grid gap-5">
						<fieldset className="grid gap-5" disabled={!canUpdate}>
							<form.AppField name="name">
								{(field) => (
									<field.TextField
										autoComplete="organization"
										label={<Trans>Name</Trans>}
										maxLength={64}
									/>
								)}
							</form.AppField>
							<form.AppField name="slug">
								{(field) => (
									<field.TextField
										action={
											canUpdate && (
												<button
													className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
													onClick={() =>
														field.handleChange(
															slugify(form.getFieldValue("name"))
														)
													}
													type="button"
												>
													<Trans>Generate from name</Trans>
												</button>
											)
										}
										autoCapitalize="none"
										autoComplete="off"
										description={
											<Trans>
												A unique identifier. Lowercase letters, numbers and
												dashes.
											</Trans>
										}
										label={<Trans>Slug</Trans>}
										maxLength={48}
										spellCheck={false}
									/>
								)}
							</form.AppField>
						</fieldset>
						{canUpdate && (
							<form.SubmitButton className="w-full sm:ml-auto sm:w-auto">
								<Trans>Save changes</Trans>
							</form.SubmitButton>
						)}
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
