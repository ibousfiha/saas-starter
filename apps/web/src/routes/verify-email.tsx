import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { VerifyEmail } from "@/features/auth/components/verify-email";
import { refreshSession } from "@/features/auth/queries";

export const Route = createFileRoute("/verify-email")({
	component: VerifyEmailPage,
	loader: ({ context }) => refreshSession(context.queryClient),
	staticData: { title: msg`Verify email` },
	validateSearch: z.object({
		error: z.string().optional(),
		redirect: z.string().optional(),
	}),
});

function VerifyEmailPage() {
	const { error, redirect } = Route.useSearch();
	return (
		<AuthLayout>
			<VerifyEmail error={error} redirect={redirect} />
		</AuthLayout>
	);
}
