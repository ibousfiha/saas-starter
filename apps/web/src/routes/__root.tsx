import type { MessageDescriptor } from "@lingui/core";
import { siteConfig } from "@saas-starter/config";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import type { orpc } from "@/lib/orpc";

const Devtools = import.meta.env.DEV
	? lazy(async () => {
			const [{ ReactQueryDevtools }, { TanStackRouterDevtools }] =
				await Promise.all([
					import("@tanstack/react-query-devtools"),
					import("@tanstack/react-router-devtools"),
				]);
			return {
				default: () => (
					<>
						<ReactQueryDevtools buttonPosition="bottom-right" />
						<TanStackRouterDevtools
							position="bottom-right"
							toggleButtonProps={{ style: { right: "4rem" } }}
						/>
					</>
				),
			};
		})
	: () => null;

interface RouterContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

declare module "@tanstack/react-router" {
	interface StaticDataRouteOption {
		title?: MessageDescriptor;
	}
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{ title: siteConfig.name },
			{ content: siteConfig.description, name: "description" },
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<Outlet />
			<Suspense>
				<Devtools />
			</Suspense>
		</>
	);
}
