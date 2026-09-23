import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { SettingsNav } from "@/features/settings/components/settings-nav";

export const Route = createFileRoute("/_app/settings")({
	component: SettingsLayout,
	staticData: { title: msg`Settings` },
});

function SettingsLayout() {
	return (
		<>
			<PageHeader
				description={
					<Trans>Manage your account, security and organization.</Trans>
				}
				title={<Trans>Settings</Trans>}
			/>
			<div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
				<SettingsNav />
				<div className="min-w-0">
					<Outlet />
				</div>
			</div>
		</>
	);
}
