import { I18nProvider } from "@saas-starter/i18n/i18n-provider";
import { Toaster } from "@saas-starter/ui/components/sonner";
import { TooltipProvider } from "@saas-starter/ui/components/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	RouteError,
	RouteNotFound,
	RoutePending,
} from "@/components/route-states";
import { orpc } from "@/lib/orpc";
import { createQueryClient } from "@/lib/query-client";
import { routeTree } from "@/routeTree.gen";
import "@/index.css";

const queryClient = createQueryClient();

const router = createRouter({
	context: { orpc, queryClient },
	defaultErrorComponent: RouteError,
	defaultNotFoundComponent: RouteNotFound,
	defaultPendingComponent: RoutePending,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	routeTree,
	scrollRestoration: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");
if (!rootElement) {
	throw new Error("Missing #app root element");
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" disableTransitionOnChange enableSystem>
				<I18nProvider>
					<TooltipProvider>
						<RouterProvider router={router} />
						<Toaster position="top-center" richColors />
					</TooltipProvider>
				</I18nProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>
);
