import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, type Page } from "@playwright/test";

export const ADMIN = {
	email: "admin@example.com",
	name: "Admin",
	password: "admin123",
} as const;

const ROOT = path.resolve(import.meta.dirname, "..");
const MAILPIT_URL = `http://localhost:${process.env.SAAS_STARTER_MAILPIT_UI_PORT ?? 8026}`;

export function uniqueEmail(prefix: string): string {
	return `${prefix}-${crypto.randomUUID().slice(0, 8)}@example.com`;
}

/** Creates a verified user who owns a fresh organization, bypassing sign-up rate limits. */
export function createUser(email: string): { email: string; password: string } {
	const password = "password123";
	const slug = email.split("@")[0] ?? email;
	execFileSync("bun", ["packages/db/src/seed.ts"], {
		cwd: ROOT,
		env: {
			...process.env,
			DATABASE_URL: process.env.E2E_DATABASE_URL,
			SEED_EMAIL: email,
			SEED_NAME: slug,
			SEED_ORG_NAME: `${slug} org`,
			SEED_ORG_SLUG: slug,
			SEED_PASSWORD: password,
		},
		stdio: "ignore",
	});
	return { email, password };
}

export async function signIn(
	page: Page,
	{ email, password }: { email: string; password: string }
) {
	await page.goto("/sign-in");
	await page.getByLabel("Email", { exact: true }).fill(email);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { exact: true, name: "Sign in" }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
	// The URL changes before the dashboard's guards finish; wait for its heading.
	await expect(
		page.getByRole("heading", { name: /^Welcome back, / })
	).toBeVisible();
}

/** Returns the first link in the newest email sent to `to` (polls Mailpit). */
export async function emailLink(to: string): Promise<string> {
	let link = "";
	await expect
		.poll(
			async () => {
				const search = await fetch(
					`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`
				).then((response) => response.json());
				const id = search.messages?.[0]?.ID;
				if (!id) {
					return "";
				}
				const message = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`).then(
					(response) => response.json()
				);
				link = message.HTML?.match(/href="([^"]+)"/)?.[1] ?? "";
				return link;
			},
			{ message: `email to ${to}`, timeout: 10_000 }
		)
		.not.toBe("");
	return link.replaceAll("&amp;", "&");
}
