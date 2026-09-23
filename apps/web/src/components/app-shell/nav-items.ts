import { msg } from "@lingui/core/macro";
import { FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react";

export const navItems = [
	{ icon: LayoutDashboard, label: msg`Dashboard`, to: "/dashboard" },
	{ icon: FolderKanban, label: msg`Projects`, to: "/projects" },
	{ icon: Users, label: msg`Members`, to: "/members" },
	{ icon: Settings, label: msg`Settings`, to: "/settings" },
] as const;
