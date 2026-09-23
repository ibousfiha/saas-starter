import { Trans } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@saas-starter/ui/components/empty";
import { Skeleton } from "@saas-starter/ui/components/skeleton";
import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import { FileQuestion, TriangleAlert } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export function RouteError({ error, reset }: ErrorComponentProps) {
	const router = useRouter();

	return (
		<Empty className="min-h-[60svh]">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<TriangleAlert />
				</EmptyMedia>
				<EmptyTitle>
					<Trans>Something went wrong</Trans>
				</EmptyTitle>
				<EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button
					onClick={() => {
						reset();
						router.invalidate();
					}}
				>
					<Trans>Try again</Trans>
				</Button>
			</EmptyContent>
		</Empty>
	);
}

export function RouteNotFound() {
	return (
		<Empty className="min-h-[60svh]">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<FileQuestion />
				</EmptyMedia>
				<EmptyTitle>
					<Trans>Page not found</Trans>
				</EmptyTitle>
				<EmptyDescription>
					<Trans>
						The page you are looking for does not exist or was moved.
					</Trans>
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild variant="outline">
					<Link to="/">
						<Trans>Back to home</Trans>
					</Link>
				</Button>
			</EmptyContent>
		</Empty>
	);
}

export function RoutePending() {
	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="grid gap-2">
				<Skeleton className="h-7 w-48" />
				<Skeleton className="h-4 w-72" />
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				<Skeleton className="h-28" />
				<Skeleton className="h-28" />
				<Skeleton className="h-28" />
			</div>
			<Skeleton className="h-64" />
		</div>
	);
}
