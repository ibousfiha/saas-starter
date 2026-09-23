import { Trans } from "@lingui/react/macro";
import { siteConfig } from "@saas-starter/config";
import { cn } from "@saas-starter/ui/lib/utils";
import { createLink, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

function BrandPanel() {
	return (
		<aside className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-zinc-50 lg:flex">
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255/0.08),transparent_40%),radial-gradient(circle_at_80%_90%,rgb(255_255_255/0.06),transparent_45%)]"
			/>
			<Link className="relative w-fit rounded-md" to="/">
				<Logo className="[&>span:first-child]:bg-zinc-50 [&>span:first-child]:text-zinc-950" />
			</Link>
			<div className="relative grid max-w-md gap-6">
				<p className="text-balance font-semibold text-3xl leading-tight tracking-tight">
					<Trans>Everything you need to launch, already wired together.</Trans>
				</p>
				<ul className="grid gap-3 text-sm text-zinc-400">
					<li className="flex items-center gap-2">
						<CheckCircle2 className="size-4 text-zinc-50" />
						<Trans>Secure authentication with two-factor support</Trans>
					</li>
					<li className="flex items-center gap-2">
						<CheckCircle2 className="size-4 text-zinc-50" />
						<Trans>Organizations, roles and invitations</Trans>
					</li>
					<li className="flex items-center gap-2">
						<CheckCircle2 className="size-4 text-zinc-50" />
						<Trans>Type-safe API from database to UI</Trans>
					</li>
				</ul>
			</div>
			<p className="relative text-sm text-zinc-500">
				© {new Date().getFullYear()} {siteConfig.company}
			</p>
		</aside>
	);
}

export function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<BrandPanel />
			<div className="flex flex-col">
				<header className="flex items-center justify-between p-4 sm:p-6">
					<Link className="rounded-md lg:invisible" to="/">
						<Logo />
					</Link>
					<div className="flex items-center gap-1">
						<LanguageSwitcher />
						<ThemeToggle />
					</div>
				</header>
				<main className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
					<div className="w-full max-w-sm">{children}</div>
				</main>
				<footer className="flex justify-center gap-6 p-6 text-muted-foreground text-xs">
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
				</footer>
			</div>
		</div>
	);
}

interface AuthHeaderProps {
	description?: ReactNode;
	title: ReactNode;
}

export function AuthHeader({ description, title }: AuthHeaderProps) {
	return (
		<div className="mb-8 grid gap-2 text-center">
			<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
			{description && (
				<p className="text-balance text-muted-foreground text-sm">
					{description}
				</p>
			)}
		</div>
	);
}

export function AuthFooter({ children }: { children: ReactNode }) {
	return (
		<p className="mt-6 text-center text-muted-foreground text-sm">{children}</p>
	);
}

function TextAnchor({ className, ...props }: ComponentProps<"a">) {
	return (
		<a
			className={cn(
				"font-medium text-foreground underline-offset-4 hover:underline",
				className
			)}
			{...props}
		/>
	);
}

export const TextLink = createLink(TextAnchor);
