import { ORPCError } from "@orpc/server";
import { db } from "@saas-starter/db";
import { invitation, organization, user } from "@saas-starter/db/schema/auth";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure } from "../index";

export const invitationRouter = {
	getPublic: publicProcedure
		.input(z.object({ id: z.string().min(1) }))
		.handler(async ({ input }) => {
			const [found] = await db
				.select({
					email: invitation.email,
					inviterName: user.name,
					organizationId: invitation.organizationId,
					organizationName: organization.name,
				})
				.from(invitation)
				.innerJoin(organization, eq(invitation.organizationId, organization.id))
				.innerJoin(user, eq(invitation.inviterId, user.id))
				.where(
					and(
						eq(invitation.id, input.id),
						eq(invitation.status, "pending"),
						gt(invitation.expiresAt, new Date())
					)
				);
			if (!found) {
				throw new ORPCError("NOT_FOUND", {
					message: "Invitation not found or has expired.",
				});
			}
			return found;
		}),
};
