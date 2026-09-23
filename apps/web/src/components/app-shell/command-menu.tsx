import { Trans, useLingui } from "@lingui/react/macro";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@saas-starter/ui/components/command";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { navItems } from "@/components/app-shell/nav-items";
import { themeOptions } from "@/components/theme-toggle";
import { useSignOut } from "@/features/auth/queries";

interface CommandMenuProps {
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

export function CommandMenu({ onOpenChange, open }: CommandMenuProps) {
	const { t } = useLingui();
	const navigate = useNavigate();
	const { setTheme } = useTheme();
	const signOut = useSignOut();

	const run = (action: () => unknown) => {
		onOpenChange(false);
		action();
	};

	return (
		<CommandDialog
			description={t`Search for a page or action`}
			onOpenChange={onOpenChange}
			open={open}
			showCloseButton={false}
			title={t`Command menu`}
		>
			<CommandInput placeholder={t`Type a command or search…`} />
			<CommandList>
				<CommandEmpty>
					<Trans>No results found.</Trans>
				</CommandEmpty>
				<CommandGroup heading={t`Navigation`}>
					{navItems.map(({ icon: Icon, label, to }) => (
						<CommandItem key={to} onSelect={() => run(() => navigate({ to }))}>
							<Icon />
							{t(label)}
						</CommandItem>
					))}
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading={t`Theme`}>
					{themeOptions.map(({ icon: Icon, label, value }) => (
						<CommandItem
							key={value}
							onSelect={() => run(() => setTheme(value))}
						>
							<Icon />
							{t(label)}
						</CommandItem>
					))}
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading={t`Account`}>
					<CommandItem onSelect={() => run(() => signOut.mutate())}>
						<LogOut />
						<Trans>Sign out</Trans>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
