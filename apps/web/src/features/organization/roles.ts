import { hasPermission } from "@saas-starter/auth/permissions";

export const organizationRoles = ["owner", "admin", "member"] as const;

export type OrganizationRole = (typeof organizationRoles)[number];

interface MemberRef {
	id: string;
	role: string;
}

export function hasRole(role: string, expected: OrganizationRole) {
	return role.split(",").includes(expected);
}

export function getAssignableRoles(actorRole: string): OrganizationRole[] {
	return hasRole(actorRole, "owner")
		? ["owner", "admin", "member"]
		: ["admin", "member"];
}

export function getMemberActions(actor: MemberRef, target: MemberRef) {
	const canManage =
		actor.id !== target.id &&
		(!hasRole(target.role, "owner") || hasRole(actor.role, "owner"));

	return {
		canChangeRole:
			canManage && hasPermission(actor.role, { member: ["update"] }),
		canRemove: canManage && hasPermission(actor.role, { member: ["delete"] }),
	};
}
