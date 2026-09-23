import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { Badge } from "@saas-starter/ui/components/badge";
import {
	hasRole,
	type OrganizationRole,
	organizationRoles,
} from "@/features/organization/roles";

export const roleLabels = {
	admin: msg`Admin`,
	member: msg`Member`,
	owner: msg`Owner`,
} satisfies Record<OrganizationRole, unknown>;

const roleVariants = {
	admin: "secondary",
	member: "outline",
	owner: "default",
} as const;

export function RoleBadge({ role }: { role: string }) {
	const { t } = useLingui();
	const roles = organizationRoles.filter((name) => hasRole(role, name));

	return (
		<span className="flex flex-wrap gap-1">
			{roles.map((name) => (
				<Badge key={name} variant={roleVariants[name]}>
					{t(roleLabels[name])}
				</Badge>
			))}
		</span>
	);
}
