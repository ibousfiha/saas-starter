import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { redirectSearchSchema } from "@/features/auth/search";

export const Route = createFileRoute("/_auth/sign-up")({
	component: SignUpPage,
	staticData: { title: msg`Sign up` },
	validateSearch: redirectSearchSchema,
});

function SignUpPage() {
	const { redirect } = Route.useSearch();
	return <SignUpForm redirect={redirect} />;
}
