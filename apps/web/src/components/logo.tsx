import { siteConfig } from "@saas-starter/config";
import { cn } from "@saas-starter/ui/lib/utils";

function LogoMark({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
				className
			)}
		>
			<svg aria-hidden="true" className="size-4" viewBox="8 6 18 20">
				<path
					d="M21.5 11c-1-1.5-2.9-2.5-5.3-2.5-3.1 0-5.2 1.6-5.2 3.9 0 5.4 10.8 3 10.8 8.4 0 2.4-2.3 4.2-5.6 4.2-2.6 0-4.6-1-5.9-2.8"
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="3"
				/>
			</svg>
		</span>
	);
}

export function Logo({ className }: { className?: string }) {
	return (
		<span className={cn("flex items-center gap-2 font-semibold", className)}>
			<LogoMark />
			<span className="text-base tracking-tight">{siteConfig.name}</span>
		</span>
	);
}
