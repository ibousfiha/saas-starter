import { createFileRoute, notFound } from "@tanstack/react-router";
import { RouteNotFound } from "@/components/route-states";
import { LegalPage } from "@/features/marketing/components/legal-page";
import { MarketingLayout } from "@/features/marketing/components/marketing-layout";
import { isLegalSlug } from "@/features/marketing/content";

export const Route = createFileRoute("/legal/$slug")({
	beforeLoad: ({ params }) => {
		if (!isLegalSlug(params.slug)) {
			throw notFound();
		}
		return { slug: params.slug };
	},
	component: LegalRoute,
	notFoundComponent: () => (
		<MarketingLayout>
			<RouteNotFound />
		</MarketingLayout>
	),
});

function LegalRoute() {
	const { slug } = Route.useRouteContext();

	return (
		<MarketingLayout>
			<LegalPage slug={slug} />
		</MarketingLayout>
	);
}
