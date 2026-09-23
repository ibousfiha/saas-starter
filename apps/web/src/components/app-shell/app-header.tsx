import { Trans } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { Kbd } from "@saas-starter/ui/components/kbd";
import { Separator } from "@saas-starter/ui/components/separator";
import { SidebarTrigger } from "@saas-starter/ui/components/sidebar";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppBreadcrumb } from "@/components/app-shell/app-breadcrumb";
import { CommandMenu } from "@/components/app-shell/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
	const [commandOpen, setCommandOpen] = useState(false);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setCommandOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
			<SidebarTrigger className="-ml-1" />
			<Separator
				className="mr-2 data-[orientation=vertical]:h-4"
				orientation="vertical"
			/>
			<AppBreadcrumb />
			<div className="ml-auto flex items-center gap-1">
				<Button
					className="hidden w-56 justify-start gap-2 text-muted-foreground sm:flex"
					onClick={() => setCommandOpen(true)}
					variant="outline"
				>
					<Search />
					<span className="flex-1 text-left">
						<Trans>Search…</Trans>
					</span>
					<Kbd>⌘K</Kbd>
				</Button>
				<Button
					className="sm:hidden"
					onClick={() => setCommandOpen(true)}
					size="icon"
					variant="ghost"
				>
					<Search />
					<span className="sr-only">
						<Trans>Search</Trans>
					</span>
				</Button>
				<ThemeToggle />
			</div>
			<CommandMenu onOpenChange={setCommandOpen} open={commandOpen} />
		</header>
	);
}
