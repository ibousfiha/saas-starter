import { msg } from "@lingui/core/macro";
import { createFileRoute } from "@tanstack/react-router";
import { ProfileCard } from "@/features/settings/components/profile-card";

export const Route = createFileRoute("/_app/settings/account")({
	component: ProfileCard,
	staticData: { title: msg`Account` },
});
