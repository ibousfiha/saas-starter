import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
	...defaultStatements,
	project: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
	admin: ac.newRole({
		...adminAc.statements,
		project: ["create", "read", "update", "delete"],
	}),
	member: ac.newRole({
		...memberAc.statements,
		project: ["create", "read", "update"],
	}),
	owner: ac.newRole({
		...ownerAc.statements,
		project: ["create", "read", "update", "delete"],
	}),
};

export type Permissions = {
	[K in keyof typeof statement]?: (typeof statement)[K][number][];
};

/** Checks an organization member role (may be comma-separated, e.g. "admin,member"). */
export function hasPermission(role: string, permissions: Permissions): boolean {
	return role
		.split(",")
		.map((name) => roles[name.trim() as keyof typeof roles])
		.some((granted) => granted?.authorize(permissions).success === true);
}
