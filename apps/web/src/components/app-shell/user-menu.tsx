import { Trans } from "@lingui/react/macro";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@saas-starter/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { getInitials } from "@/components/app-shell/user-initials";
import { LanguageMenuSub } from "@/components/language-switcher";
import { ThemeMenuSub } from "@/components/theme-toggle";
import { useSession, useSignOut } from "@/features/auth/queries";

function UserSummary() {
	const { user } = useSession();

	return (
		<>
			<Avatar className="size-8 rounded-lg">
				{user.image && <AvatarImage alt="" src={user.image} />}
				<AvatarFallback className="rounded-lg">
					{getInitials(user.name)}
				</AvatarFallback>
			</Avatar>
			<span className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{user.name}</span>
				<span className="truncate text-muted-foreground text-xs">
					{user.email}
				</span>
			</span>
		</>
	);
}

export function UserMenu() {
	const { isMobile, setOpenMobile } = useSidebar();
	const signOut = useSignOut();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							size="lg"
						>
							<UserSummary />
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="flex items-center gap-2 font-normal">
							<UserSummary />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link
									onClick={() => setOpenMobile(false)}
									to="/settings/account"
								>
									<UserRound />
									<Trans>Account settings</Trans>
								</Link>
							</DropdownMenuItem>
							<ThemeMenuSub />
							<LanguageMenuSub />
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							disabled={signOut.isPending}
							onSelect={() => signOut.mutate()}
						>
							<LogOut />
							<Trans>Sign out</Trans>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
