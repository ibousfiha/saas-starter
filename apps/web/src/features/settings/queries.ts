import { queryOptions } from "@tanstack/react-query";
import { authClient, unwrap } from "@/lib/auth-client";

export const activeSessionsQueryOptions = () =>
	queryOptions({
		queryFn: () => unwrap(authClient.listSessions()),
		queryKey: ["session", "list"],
	});
