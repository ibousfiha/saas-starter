import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { TwoFactorForm } from "@/features/auth/components/two-factor-form";
import { redirectSearchSchema } from "@/features/auth/search";

export const Route = createFileRoute("/_auth/two-factor")({
	component: TwoFactorPage,
	staticData: { title: msg`Two-factor authentication` },
	validateSearch: redirectSearchSchema,
});

function TwoFactorPage() {
	const { redirect } = Route.useSearch();
	return <TwoFactorForm redirect={redirect} />;
}
