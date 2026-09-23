import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { PreferencesSettings } from "@/features/settings/components/preferences-settings";

export const Route = createFileRoute("/_app/settings/preferences")({
	component: PreferencesSettings,
	staticData: { title: msg`Preferences` },
});
