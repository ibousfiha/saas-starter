import { ORPCError, os } from "@orpc/server";
import type { Session } from "@saas-starter/auth";
import {
	hasPermission,
	type Permissions,
} from "@saas-starter/auth/permissions";
import { db } from "@saas-starter/db";
import { member } from "@saas-starter/db/schema/auth";
import { and, eq } from "drizzle-orm";

export interface Context {
	session: Session | null;
}

export const publicProcedure = os.$context<Context>();

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
	if (!context.session) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({ context: { session: context.session } });
});

export const orgProcedure = protectedProcedure.use(
	async ({ context, next }) => {
		const organizationId = context.session.session.activeOrganizationId;
		if (!organizationId) {
			throw new ORPCError("FORBIDDEN", {
				message: "No active organization.",
			});
		}
		const [membership] = await db
			.select({ role: member.role })
			.from(member)
			.where(
				and(
					eq(member.organizationId, organizationId),
					eq(member.userId, context.session.user.id)
				)
			);
		if (!membership) {
			throw new ORPCError("FORBIDDEN", {
				message: "You are not a member of this organization.",
			});
		}
		return next({ context: { organizationId, role: membership.role } });
	}
);

export function requirePermission(permissions: Permissions) {
	return os.$context<{ role: string }>().middleware(({ context, next }) => {
		if (!hasPermission(context.role, permissions)) {
			throw new ORPCError("FORBIDDEN", {
				message: "You don't have permission to do this.",
			});
		}
		return next();
	});
}
