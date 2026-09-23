import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@saas-starter/ui/components/empty";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
	action?: ReactNode;
	description: ReactNode;
	icon: LucideIcon;
	title: ReactNode;
}

export function EmptyState({
	action,
	description,
	icon: Icon,
	title,
}: EmptyStateProps) {
	return (
		<Empty className="flex-none border border-dashed">
			<EmptyHeader className="max-w-md">
				<EmptyMedia variant="icon">
					<Icon />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{action && <EmptyContent>{action}</EmptyContent>}
		</Empty>
	);
}
