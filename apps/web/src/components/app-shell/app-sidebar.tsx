import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@saas-starter/ui/components/sidebar";
import { NavMain } from "@/components/app-shell/nav-main";
import { OrgSwitcher } from "@/components/app-shell/org-switcher";
import { UserMenu } from "@/components/app-shell/user-menu";

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<OrgSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
			</SidebarContent>
			<SidebarFooter>
				<UserMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
