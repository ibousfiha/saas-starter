import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				retry: 1,
				staleTime: 30_000,
			},
		},
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, mutation) => {
				if (mutation.meta?.toastError !== false) {
					toast.error(getErrorMessage(error));
				}
			},
		}),
	});
}

declare module "@tanstack/react-query" {
	interface Register {
		mutationMeta: { toastError?: boolean };
	}
}
