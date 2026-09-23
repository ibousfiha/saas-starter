import { Trans, useLingui } from "@lingui/react/macro";
import { type LegalSlug, legalPages } from "@/features/marketing/content";

export function LegalPage({ slug }: { slug: LegalSlug }) {
	const { t } = useLingui();
	const page = legalPages[slug];

	return (
		<article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
			<h1 className="font-semibold text-4xl tracking-tight">{t(page.title)}</h1>
			<p className="mt-4 rounded-lg border border-dashed bg-muted/40 p-4 text-muted-foreground text-sm">
				<Trans>
					Template text. Replace it with your own legal copy before going to
					production.
				</Trans>
			</p>
			<div className="mt-10 grid gap-8">
				{page.sections.map((section) => (
					<section key={section.heading.id}>
						<h2 className="font-semibold text-xl">{t(section.heading)}</h2>
						<p className="mt-2 text-muted-foreground leading-relaxed">
							{t(section.body)}
						</p>
					</section>
				))}
			</div>
		</article>
	);
}
