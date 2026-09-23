import type { QueryClient } from "@tanstack/react-query";
import { type ParsedLocation, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/features/auth/queries";
import { safeRedirect } from "@/lib/redirect";

interface GuardOptions {
	context: { queryClient: QueryClient };
	location: ParsedLocation;
}

export async function requireSession({ context, location }: GuardOptions) {
	const session = await context.queryClient.ensureQueryData(
		sessionQueryOptions()
	);
	if (!session) {
		throw redirect({ search: { redirect: location.href }, to: "/sign-in" });
	}
	return session;
}

export async function redirectIfSignedIn({ context, location }: GuardOptions) {
	const session = await context.queryClient.ensureQueryData(
		sessionQueryOptions()
	);
	if (session) {
		const search = location.search as { redirect?: unknown };
		throw redirect({ href: safeRedirect(search.redirect) });
	}
}
