import { expect, test } from "@playwright/test";
import { createUser, signIn, uniqueEmail } from "./utils";

test("updates the profile name", async ({ page }) => {
	await signIn(page, createUser(uniqueEmail("profile")));
	await page.goto("/settings/account");
	await page.getByLabel("Name", { exact: true }).fill("Jane Doe");
	await page.getByRole("button", { name: "Save changes" }).click();
	await expect(page.getByText("Profile updated.")).toBeVisible();
	await page.reload();
	await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
		"Jane Doe"
	);
});

test("switches the interface language", async ({ page }) => {
	await signIn(page, createUser(uniqueEmail("language")));
	await page.goto("/settings/preferences");
	await page.getByText("Deutsch").click();
	await expect(page.locator("html")).toHaveAttribute("lang", "de");
});
