import { env } from "@saas-starter/env/server";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, pool } from "./index";
import { account, member, organization, user } from "./schema/auth";
import { project } from "./schema/project";

if (env.NODE_ENV === "production") {
	throw new Error("Refusing to seed a production database.");
}

const seedEnv = z
	.object({
		SEED_EMAIL: z.email().default("admin@example.com"),
		SEED_NAME: z.string().min(1).default("Admin"),
		SEED_ORG_NAME: z.string().min(1).default("My Organization"),
		SEED_ORG_SLUG: z.string().min(1).default("my-organization"),
		SEED_PASSWORD: z.string().min(8).default("admin123"),
	})
	.parse(process.env);

const [existing] = await db
	.select({ id: user.id })
	.from(user)
	.where(eq(user.email, seedEnv.SEED_EMAIL));

if (existing) {
	// biome-ignore lint/suspicious/noConsole: CLI output
	console.log(`Seed skipped: ${seedEnv.SEED_EMAIL} already exists.`);
} else {
	const password = await hashPassword(seedEnv.SEED_PASSWORD);

	await db.transaction(async (tx) => {
		const [admin] = await tx
			.insert(user)
			.values({
				email: seedEnv.SEED_EMAIL,
				emailVerified: true,
				id: crypto.randomUUID(),
				name: seedEnv.SEED_NAME,
				role: "admin",
			})
			.returning({ id: user.id });
		if (!admin) {
			throw new Error("Failed to create seed user.");
		}

		await tx.insert(account).values({
			accountId: admin.id,
			id: crypto.randomUUID(),
			password,
			providerId: "credential",
			updatedAt: new Date(),
			userId: admin.id,
		});

		const [org] = await tx
			.insert(organization)
			.values({
				id: crypto.randomUUID(),
				name: seedEnv.SEED_ORG_NAME,
				slug: seedEnv.SEED_ORG_SLUG,
			})
			.returning({ id: organization.id });
		if (!org) {
			throw new Error("Failed to create seed organization.");
		}

		await tx.insert(member).values({
			id: crypto.randomUUID(),
			organizationId: org.id,
			role: "owner",
			userId: admin.id,
		});

		await tx.insert(project).values([
			{
				createdById: admin.id,
				description: "Landing page refresh and new pricing section.",
				name: "Website redesign",
				organizationId: org.id,
			},
			{
				createdById: admin.id,
				description: "iOS and Android release planning.",
				name: "Mobile app",
				organizationId: org.id,
			},
		]);
	});

	// biome-ignore lint/suspicious/noConsole: CLI output
	console.log(
		`Seeded ${seedEnv.SEED_EMAIL} / ${seedEnv.SEED_PASSWORD} (owner of "${seedEnv.SEED_ORG_NAME}").`
	);
}

await pool.end();
