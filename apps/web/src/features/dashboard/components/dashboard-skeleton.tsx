import { Skeleton } from "@saas-starter/ui/components/skeleton";

const stats = [0, 1, 2];
const rows = [0, 1, 2, 3, 4];

export function DashboardSkeleton() {
	return (
		<>
			<div className="grid gap-2">
				<Skeleton className="h-7 w-56" />
				<Skeleton className="h-4 w-72 max-w-full" />
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				{stats.map((stat) => (
					<Skeleton className="h-[106px] rounded-xl" key={stat} />
				))}
			</div>
			<div className="grid items-start gap-4 lg:grid-cols-3">
				<div className="grid gap-4 rounded-xl border p-6 lg:col-span-2">
					<Skeleton className="h-5 w-40" />
					{rows.map((row) => (
						<Skeleton className="h-10" key={row} />
					))}
				</div>
				<Skeleton className="h-48 rounded-xl" />
			</div>
		</>
	);
}
