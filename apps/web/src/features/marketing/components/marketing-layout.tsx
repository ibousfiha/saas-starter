import { Trans } from "@lingui/react/macro";
import { siteConfig } from "@saas-starter/config";
import { Button } from "@saas-starter/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { sessionQueryOptions } from "@/features/auth/queries";

function AuthActions() {
	const { data: session, isPending } = useQuery(sessionQueryOptions());

	if (isPending) {
		return null;
	}

	if (session) {
		return (
			<Button asChild size="sm">
				<Link to="/dashboard">
					<Trans>Go to dashboard</Trans>
				</Link>
			</Button>
		);
	}

	return (
		<>
			<Button
				asChild
				className="hidden sm:inline-flex"
				size="sm"
				variant="ghost"
			>
				<Link to="/sign-in">
					<Trans>Sign in</Trans>
				</Link>
			</Button>
			<Button asChild size="sm">
				<Link to="/sign-up">
					<Trans>Get started</Trans>
				</Link>
			</Button>
		</>
	);
}

function MarketingHeader() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
				<Link aria-label={siteConfig.name} className="rounded-md" to="/">
					<Logo />
				</Link>
				<nav className="flex items-center gap-1">
					<LanguageSwitcher />
					<ThemeToggle />
					<div className="ml-2 flex items-center gap-2">
						<AuthActions />
					</div>
				</nav>
			</div>
		</header>
	);
}

function MarketingFooter() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<p>
					© {new Date().getFullYear()} {siteConfig.company}
				</p>
				<nav className="flex gap-6">
					<Link
						className="hover:text-foreground"
						params={{ slug: "terms" }}
						to="/legal/$slug"
					>
						<Trans>Terms</Trans>
					</Link>
					<Link
						className="hover:text-foreground"
						params={{ slug: "privacy" }}
						to="/legal/$slug"
					>
						<Trans>Privacy</Trans>
					</Link>
				</nav>
			</div>
		</footer>
	);
}

export function MarketingLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-svh flex-col">
			<MarketingHeader />
			<main className="flex-1">{children}</main>
			<MarketingFooter />
		</div>
	);
}
