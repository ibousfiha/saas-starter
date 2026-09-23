import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const Route = createFileRoute("/_auth/forgot-password")({
	component: ForgotPasswordForm,
	staticData: { title: msg`Forgot password` },
});
