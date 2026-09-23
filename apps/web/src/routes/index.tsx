import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/marketing/components/landing-page";
import { MarketingLayout } from "@/features/marketing/components/marketing-layout";

export const Route = createFileRoute("/")({
	component: () => (
		<MarketingLayout>
			<LandingPage />
		</MarketingLayout>
	),
});
