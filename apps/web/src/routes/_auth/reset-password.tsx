import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const Route = createFileRoute("/_auth/reset-password")({
	component: ResetPasswordPage,
	staticData: { title: msg`Reset password` },
	validateSearch: z.object({
		error: z.string().optional(),
		token: z.string().optional(),
	}),
});

function ResetPasswordPage() {
	const { error, token } = Route.useSearch();
	return <ResetPasswordForm token={error ? undefined : token} />;
}
