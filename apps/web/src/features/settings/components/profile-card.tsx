import { Trans, useLingui } from "@lingui/react/macro";
import { Badge } from "@saas-starter/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldLabel,
} from "@saas-starter/ui/components/field";
import { Input } from "@saas-starter/ui/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form";
import { refreshSession, useSession } from "@/features/auth/queries";
import { authClient, unwrap } from "@/lib/auth-client";

export function ProfileCard() {
	const { t } = useLingui();
	const { user } = useSession();
	const queryClient = useQueryClient();

	const updateName = useMutation({
		mutationFn: (name: string) => unwrap(authClient.updateUser({ name })),
		onSuccess: async () => {
			await refreshSession(queryClient);
			toast.success(t`Profile updated.`);
		},
	});

	const schema = z.object({
		name: z
			.string()
			.trim()
			.min(1, t`Enter your name.`)
			.max(100, t`Use at most 100 characters.`),
	});

	const form = useAppForm({
		defaultValues: { name: user.name },
		onSubmit: ({ value }) => updateName.mutateAsync(value.name.trim()),
		validators: { onSubmit: schema },
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Profile</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>This is how others see you in your organizations.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form.Form className="grid gap-5">
						<form.AppField name="name">
							{(field) => (
								<field.TextField
									autoComplete="name"
									label={<Trans>Name</Trans>}
									maxLength={100}
								/>
							)}
						</form.AppField>
						<Field>
							<div className="flex items-center justify-between gap-2">
								<FieldLabel htmlFor="email">
									<Trans>Email</Trans>
								</FieldLabel>
								{user.emailVerified ? (
									<Badge variant="secondary">
										<BadgeCheck />
										<Trans>Verified</Trans>
									</Badge>
								) : (
									<Badge variant="outline">
										<CircleAlert />
										<Trans>Not verified</Trans>
									</Badge>
								)}
							</div>
							<Input
								className="bg-muted/50 text-muted-foreground"
								id="email"
								readOnly
								type="email"
								value={user.email}
							/>
							<FieldDescription>
								<Trans>Your email address is used to sign in.</Trans>
							</FieldDescription>
						</Field>
						<form.SubmitButton className="w-full sm:ml-auto sm:w-auto">
							<Trans>Save changes</Trans>
						</form.SubmitButton>
					</form.Form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
