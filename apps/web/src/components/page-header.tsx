import type { ReactNode } from "react";

interface PageHeaderProps {
	actions?: ReactNode;
	description?: ReactNode;
	title: ReactNode;
}

export function PageHeader({ actions, description, title }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="grid gap-1">
				<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
			{actions && <div className="flex shrink-0 gap-2">{actions}</div>}
		</div>
	);
}
