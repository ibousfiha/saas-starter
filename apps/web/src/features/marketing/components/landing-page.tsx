import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { features, stack } from "@/features/marketing/content";

function Hero() {
	return (
		<section className="relative overflow-hidden">
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--foreground)_8%,transparent),transparent)]"
			/>
			<div className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
				<span className="mb-6 rounded-full border bg-background px-3 py-1 font-medium text-muted-foreground text-xs">
					<Trans>Open-source SaaS starter</Trans>
				</span>
				<h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-6xl">
					<Trans>Ship your product, not the boilerplate</Trans>
				</h1>
				<p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
					<Trans>
						Authentication, organizations, a type-safe API and a polished
						interface, wired together so you can start on the features that
						matter.
					</Trans>
				</p>
				<div className="mt-10 flex flex-col gap-3 sm:flex-row">
					<Button asChild size="lg">
						<Link to="/sign-up">
							<Trans>Get started</Trans>
							<ArrowRight />
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link to="/sign-in">
							<Trans>Sign in</Trans>
						</Link>
					</Button>
				</div>
				<ul className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-muted-foreground text-sm">
					{stack.map((name) => (
						<li key={name}>{name}</li>
					))}
				</ul>
			</div>
		</section>
	);
}

function Features() {
	const { t } = useLingui();

	return (
		<section className="border-t bg-muted/30" id="features">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="font-semibold text-3xl tracking-tight">
						<Trans>Everything a SaaS needs on day one</Trans>
					</h2>
					<p className="mt-4 text-muted-foreground">
						<Trans>
							Opinionated defaults with one obvious way to do each thing.
						</Trans>
					</p>
				</div>
				<ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{features.map(({ description, icon: Icon, title }) => (
						<li
							className="rounded-xl border bg-card p-6 shadow-xs"
							key={title.id}
						>
							<span className="flex size-10 items-center justify-center rounded-lg border bg-background">
								<Icon className="size-5" />
							</span>
							<h3 className="mt-4 font-medium">{t(title)}</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{t(description)}
							</p>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

function CallToAction() {
	return (
		<section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
			<div className="flex flex-col items-center rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
				<h2 className="text-balance font-semibold text-3xl tracking-tight">
					<Trans>Start building today</Trans>
				</h2>
				<p className="mt-4 max-w-xl text-balance text-primary-foreground/70">
					<Trans>
						Create an account, set up your organization and invite your team in
						minutes.
					</Trans>
				</p>
				<Button asChild className="mt-8" size="lg" variant="secondary">
					<Link to="/sign-up">
						<Trans>Create your account</Trans>
					</Link>
				</Button>
			</div>
		</section>
	);
}

export function LandingPage() {
	return (
		<>
			<Hero />
			<Features />
			<CallToAction />
		</>
	);
}
