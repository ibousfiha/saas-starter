import { ORPCError } from "@orpc/server";
import { db } from "@saas-starter/db";
import { project } from "@saas-starter/db/schema/project";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { orgProcedure, requirePermission } from "../index";

const name = z.string().trim().min(1).max(100);
const description = z.string().trim().max(500);

function notFound() {
	return new ORPCError("NOT_FOUND", { message: "Project not found." });
}

export const projectRouter = {
	create: orgProcedure
		.use(requirePermission({ project: ["create"] }))
		.input(z.object({ description: description.optional(), name }))
		.handler(async ({ context, input }) => {
			const [created] = await db
				.insert(project)
				.values({
					createdById: context.session.user.id,
					description: input.description || null,
					name: input.name,
					organizationId: context.organizationId,
				})
				.returning();
			if (!created) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
			return created;
		}),

	delete: orgProcedure
		.use(requirePermission({ project: ["delete"] }))
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const [deleted] = await db
				.delete(project)
				.where(
					and(
						eq(project.id, input.id),
						eq(project.organizationId, context.organizationId)
					)
				)
				.returning({ id: project.id });
			if (!deleted) {
				throw notFound();
			}
			return deleted;
		}),

	get: orgProcedure
		.use(requirePermission({ project: ["read"] }))
		.input(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const [found] = await db
				.select()
				.from(project)
				.where(
					and(
						eq(project.id, input.id),
						eq(project.organizationId, context.organizationId)
					)
				);
			if (!found) {
				throw notFound();
			}
			return found;
		}),

	list: orgProcedure
		.use(requirePermission({ project: ["read"] }))
		.handler(({ context }) =>
			db
				.select()
				.from(project)
				.where(eq(project.organizationId, context.organizationId))
				.orderBy(desc(project.createdAt))
		),

	update: orgProcedure
		.use(requirePermission({ project: ["update"] }))
		.input(
			z.object({
				description: description.optional(),
				id: z.string(),
				name: name.optional(),
			})
		)
		.handler(async ({ context, input }) => {
			const [updated] = await db
				.update(project)
				.set({
					description:
						input.description === undefined
							? undefined
							: input.description || null,
					name: input.name,
				})
				.where(
					and(
						eq(project.id, input.id),
						eq(project.organizationId, context.organizationId)
					)
				)
				.returning();
			if (!updated) {
				throw notFound();
			}
			return updated;
		}),
};
