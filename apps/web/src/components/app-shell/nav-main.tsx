import { Trans, useLingui } from "@lingui/react/macro";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@saas-starter/ui/components/sidebar";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { navItems } from "@/components/app-shell/nav-items";

export function NavMain() {
	const { t } = useLingui();
	const matchRoute = useMatchRoute();
	const { setOpenMobile } = useSidebar();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>
				<Trans>Workspace</Trans>
			</SidebarGroupLabel>
			<SidebarMenu>
				{navItems.map(({ icon: Icon, label, to }) => {
					const title = t(label);
					return (
						<SidebarMenuItem key={to}>
							<SidebarMenuButton
								asChild
								isActive={Boolean(matchRoute({ fuzzy: true, to }))}
								tooltip={title}
							>
								<Link onClick={() => setOpenMobile(false)} to={to}>
									<Icon />
									<span>{title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
