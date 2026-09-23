import { msg } from "@lingui/core/macro";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { requireSession } from "@/features/auth/guards";
import { Onboarding } from "@/features/organization/components/onboarding";

export const Route = createFileRoute("/onboarding")({
	beforeLoad: async (options) => {
		const session = await requireSession(options);
		if (session.session.activeOrganizationId) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: () => (
		<AuthLayout>
			<Onboarding />
		</AuthLayout>
	),
	staticData: { title: msg`Set up your workspace` },
});
