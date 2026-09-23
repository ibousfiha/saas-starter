import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

export const project = pgTable(
	"project",
	{
		createdAt: timestamp("created_at").defaultNow().notNull(),
		createdById: text("created_by_id").references(() => user.id, {
			onDelete: "set null",
		}),
		description: text("description"),
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text("name").notNull(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("project_organizationId_idx").on(table.organizationId)]
);

export type Project = typeof project.$inferSelect;
