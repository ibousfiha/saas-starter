import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";

const settingsLinks = [
	{ label: msg`Account`, to: "/settings/account" },
	{ label: msg`Security`, to: "/settings/security" },
	{ label: msg`Preferences`, to: "/settings/preferences" },
	{ label: msg`Organization`, to: "/settings/organization" },
] as const;

export function SettingsNav() {
	const { t } = useLingui();

	return (
		<nav
			aria-label={t`Settings`}
			className="-mx-1 flex gap-1 self-start overflow-x-auto border-b pb-px lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:border-b-0 lg:pb-0"
		>
			{settingsLinks.map(({ label, to }) => (
				<Link
					className="-mb-px whitespace-nowrap border-transparent border-b-2 px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground data-[status=active]:border-foreground data-[status=active]:text-foreground lg:mb-0 lg:rounded-md lg:border-b-0 lg:data-[status=active]:bg-muted lg:hover:bg-muted/60"
					key={to}
					to={to}
				>
					{t(label)}
				</Link>
			))}
		</nav>
	);
}
