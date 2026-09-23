import { expect, test } from "@playwright/test";
import { ADMIN, createUser, emailLink, signIn, uniqueEmail } from "./utils";

test("redirects guests to sign-in and back after signing in", async ({
	page,
}) => {
	await page.goto("/projects");
	await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fprojects/);

	await page.getByLabel("Email", { exact: true }).fill(ADMIN.email);
	await page.getByLabel("Password", { exact: true }).fill(ADMIN.password);
	await page.getByRole("button", { exact: true, name: "Sign in" }).click();
	await expect(page).toHaveURL(/\/projects$/);
	await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
});

test("rejects a wrong password", async ({ page }) => {
	await page.goto("/sign-in");
	await page.getByLabel("Email", { exact: true }).fill(ADMIN.email);
	await page.getByLabel("Password", { exact: true }).fill("wrong-password");
	await page.getByRole("button", { exact: true, name: "Sign in" }).click();

	await expect(page.getByText("Invalid email or password")).toBeVisible();
	await expect(page).toHaveURL(/\/sign-in/);
});

test("signs up, verifies the email and creates a first organization", async ({
	page,
}) => {
	const email = uniqueEmail("signup");
	await page.goto("/sign-up");
	await page.getByLabel("Name", { exact: true }).fill("New User");
	await page.getByLabel("Email", { exact: true }).fill(email);
	await page.getByLabel("Password", { exact: true }).fill("password123");
	await page.getByRole("button", { name: "Create account" }).click();
	await expect(page.getByText("Check your inbox")).toBeVisible();

	await page.goto(await emailLink(email));
	await expect(page.getByText("Email verified")).toBeVisible();
	await page.getByRole("link", { name: "Continue" }).click();

	await expect(page).toHaveURL(/\/onboarding$/);
	await page.getByLabel("Organization name", { exact: true }).fill("Acme Inc");
	await page.getByRole("button", { name: "Create organization" }).click();
	await expect(page).toHaveURL(/\/dashboard$/);
	await expect(page.getByRole("button", { name: /Acme Inc/ })).toBeVisible();
});

test("signs out and clears the session", async ({ page }) => {
	const user = createUser(uniqueEmail("signout"));
	await signIn(page, user);

	await page.getByRole("button", { name: new RegExp(user.email) }).click();
	await page.getByRole("menuitem", { name: "Sign out" }).click();
	await expect(page).toHaveURL(/\/sign-in$/);

	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/sign-in/);
});

test("resets a forgotten password", async ({ page }) => {
	const user = createUser(uniqueEmail("reset"));
	await page.goto("/forgot-password");
	await page.getByLabel("Email", { exact: true }).fill(user.email);
	await page.getByRole("button", { name: "Send reset link" }).click();

	await page.goto(await emailLink(user.email));
	await expect(page).toHaveURL(/\/reset-password/);
	await page
		.getByLabel("New password", { exact: true })
		.fill("new-password123");
	await page
		.getByLabel("Confirm password", { exact: true })
		.fill("new-password123");
	await page.getByRole("button", { name: "Update password" }).click();
	await expect(page).toHaveURL(/\/sign-in/);

	await signIn(page, { email: user.email, password: "new-password123" });
});
