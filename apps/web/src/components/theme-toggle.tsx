import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@saas-starter/ui/components/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const themeOptions = [
	{ icon: Sun, label: msg`Light`, value: "light" },
	{ icon: Moon, label: msg`Dark`, value: "dark" },
	{ icon: Monitor, label: msg`System`, value: "system" },
] as const;

function ThemeRadioItems() {
	const { t } = useLingui();
	const { setTheme, theme } = useTheme();

	return (
		<DropdownMenuRadioGroup onValueChange={setTheme} value={theme}>
			{themeOptions.map(({ icon: Icon, label, value }) => (
				<DropdownMenuRadioItem key={value} value={value}>
					<Icon />
					{t(label)}
				</DropdownMenuRadioItem>
			))}
		</DropdownMenuRadioGroup>
	);
}

export function ThemeToggle() {
	const { t } = useLingui();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button aria-label={t`Change theme`} size="icon" variant="ghost">
					<Sun className="dark:hidden" />
					<Moon className="hidden dark:block" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<ThemeRadioItems />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function ThemeMenuSub() {
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<Sun className="dark:hidden" />
				<Moon className="hidden dark:block" />
				<Trans>Theme</Trans>
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<ThemeRadioItems />
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
