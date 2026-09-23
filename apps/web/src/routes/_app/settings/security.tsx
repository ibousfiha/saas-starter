import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { SecuritySettings } from "@/features/settings/components/security-settings";

export const Route = createFileRoute("/_app/settings/security")({
	component: SecuritySettings,
	staticData: { title: msg`Security` },
});
