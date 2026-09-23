import type { QueryClient } from "@tanstack/react-query";
import {
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authClient, unwrap } from "@/lib/auth-client";

export const sessionQueryOptions = () =>
	queryOptions({
		queryFn: () => unwrap(authClient.getSession()),
		queryKey: ["session"],
		staleTime: 5 * 60_000,
	});

export function useSession() {
	const { data } = useSuspenseQuery(sessionQueryOptions());
	if (!data) {
		throw new Error("useSession requires a signed-in user");
	}
	return data;
}

export function useSignOut() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: () => unwrap(authClient.signOut()),
		onSuccess: async () => {
			queryClient.clear();
			await navigate({ to: "/sign-in" });
		},
	});
}

export function refreshSession(queryClient: QueryClient) {
	return queryClient.invalidateQueries({
		queryKey: sessionQueryOptions().queryKey,
		refetchType: "all",
	});
}
