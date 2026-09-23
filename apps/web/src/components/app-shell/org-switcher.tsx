import { Trans } from "@lingui/react/macro";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@saas-starter/ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@saas-starter/ui/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/features/auth/queries";
import { CreateOrganizationDialog } from "@/features/organization/components/create-organization-dialog";
import {
	organizationQueries,
	useSwitchOrganization,
} from "@/features/organization/queries";

function OrgAvatar({ name }: { name: string }) {
	return (
		<span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground text-sm">
			{name.slice(0, 1).toUpperCase()}
		</span>
	);
}

export function OrgSwitcher() {
	const { isMobile } = useSidebar();
	const { session } = useSession();
	const { data: organizations } = useSuspenseQuery(organizationQueries.list());
	const switchOrganization = useSwitchOrganization();
	const [createOpen, setCreateOpen] = useState(false);

	const active = organizations.find(
		(organization) => organization.id === session.activeOrganizationId
	);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							size="lg"
						>
							<OrgAvatar name={active?.name ?? "?"} />
							<span className="grid flex-1 text-left leading-tight">
								<span className="truncate font-medium text-sm">
									{active?.name}
								</span>
								<span className="truncate text-muted-foreground text-xs">
									<Trans>Organization</Trans>
								</span>
							</span>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							<Trans>Organizations</Trans>
						</DropdownMenuLabel>
						{organizations.map((organization) => (
							<DropdownMenuItem
								disabled={switchOrganization.isPending}
								key={organization.id}
								onSelect={() => {
									if (organization.id !== active?.id) {
										switchOrganization.mutate(organization.id);
									}
								}}
							>
								<span className="flex size-6 items-center justify-center rounded-md border text-xs">
									{organization.name.slice(0, 1).toUpperCase()}
								</span>
								<span className="truncate">{organization.name}</span>
								{organization.id === active?.id && (
									<Check className="ml-auto" />
								)}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={() => setCreateOpen(true)}>
							<span className="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<Plus className="size-4" />
							</span>
							<Trans>Create organization</Trans>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<CreateOrganizationDialog
					onOpenChange={setCreateOpen}
					open={createOpen}
				/>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
