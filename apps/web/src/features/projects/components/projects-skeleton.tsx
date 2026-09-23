import { Skeleton } from "@saas-starter/ui/components/skeleton";

const rows = [0, 1, 2, 3, 4];

export function ProjectsSkeleton() {
	return (
		<>
			<div className="flex items-end justify-between gap-4">
				<div className="grid gap-2">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-4 w-72 max-w-full" />
				</div>
				<Skeleton className="h-9 w-32" />
			</div>
			<div className="grid gap-px overflow-hidden rounded-xl border">
				<Skeleton className="h-10 rounded-none" />
				{rows.map((row) => (
					<div className="flex items-center gap-4 px-4 py-3" key={row}>
						<div className="grid flex-1 gap-2">
							<Skeleton className="h-4 w-48 max-w-full" />
							<Skeleton className="h-3 w-72 max-w-full" />
						</div>
						<Skeleton className="hidden h-4 w-24 sm:block" />
						<Skeleton className="size-8" />
					</div>
				))}
			</div>
		</>
	);
}
