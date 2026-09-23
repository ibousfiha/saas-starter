import { Trans } from "@lingui/react/macro";
import { Building2 } from "lucide-react";
import { AuthHeader } from "@/features/auth/components/auth-layout";
import { useSignOut } from "@/features/auth/queries";
import { CreateOrganizationForm } from "@/features/organization/components/create-organization-form";
import { PendingInvitations } from "@/features/organization/components/pending-invitations";

export function Onboarding() {
	const signOut = useSignOut();

	return (
		<>
			<div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-muted">
				<Building2 className="size-6" />
			</div>
			<AuthHeader
				description={
					<Trans>
						Create an organization to start. You can invite your team next.
					</Trans>
				}
				title={<Trans>Set up your workspace</Trans>}
			/>
			<PendingInvitations />
			<CreateOrganizationForm />
			<p className="mt-6 text-center text-muted-foreground text-sm">
				<button
					className="underline-offset-4 hover:text-foreground hover:underline"
					disabled={signOut.isPending}
					onClick={() => signOut.mutate()}
					type="button"
				>
					<Trans>Sign out</Trans>
				</button>
			</p>
		</>
	);
}
