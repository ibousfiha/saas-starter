import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { redirectSearchSchema } from "@/features/auth/search";

export const Route = createFileRoute("/_auth/sign-in")({
	component: SignInPage,
	staticData: { title: msg`Sign in` },
	validateSearch: redirectSearchSchema,
});

function SignInPage() {
	const { redirect } = Route.useSearch();
	return <SignInForm redirect={redirect} />;
}
