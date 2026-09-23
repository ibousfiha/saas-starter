import { useLingui } from "@lingui/react/macro";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@saas-starter/ui/components/select";
import type { ComponentProps } from "react";
import { roleLabels } from "@/features/organization/components/role-badge";
import type { OrganizationRole } from "@/features/organization/roles";

interface RoleSelectProps
	extends Omit<ComponentProps<typeof SelectTrigger>, "onChange"> {
	disabled?: boolean;
	onValueChange: (role: OrganizationRole) => void;
	roles: OrganizationRole[];
	value: string;
}

export function RoleSelect({
	disabled,
	onValueChange,
	roles,
	value,
	...trigger
}: RoleSelectProps) {
	const { t } = useLingui();

	return (
		<Select
			disabled={disabled}
			onValueChange={(role) => onValueChange(role as OrganizationRole)}
			value={value}
		>
			<SelectTrigger {...trigger}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{roles.map((role) => (
					<SelectItem key={role} value={role}>
						{t(roleLabels[role])}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
