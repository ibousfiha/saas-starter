import { expect, test } from "@playwright/test";
import { createUser, signIn, uniqueEmail } from "./utils";

test("creates, edits and deletes a project", async ({ page }) => {
	await signIn(page, createUser(uniqueEmail("projects")));
	await page.goto("/projects");

	await page.getByRole("link", { name: "New project" }).click();
	await page.getByLabel("Name", { exact: true }).fill("Launch plan");
	await page
		.getByLabel("Description", { exact: true })
		.fill("Refresh the marketing site.");
	await page.getByRole("button", { name: "Create project" }).click();
	await expect(page.getByText("Project created.")).toBeVisible();
	await expect(page.getByRole("cell", { name: /^Launch plan/ })).toBeVisible();

	await page.getByRole("button", { name: "Edit Launch plan" }).click();
	await page.getByLabel("Name", { exact: true }).fill("Launch plan v2");
	await page.getByRole("button", { name: "Save changes" }).click();
	await expect(page.getByText("Project updated.")).toBeVisible();

	await page.getByRole("button", { name: "Delete Launch plan v2" }).click();
	await page
		.getByRole("alertdialog")
		.getByRole("button", { name: "Delete project" })
		.click();
	await expect(page.getByText("Project deleted.")).toBeVisible();
	await expect(page.getByRole("cell", { name: /^Launch plan v2/ })).toHaveCount(
		0
	);
});

test("validates the project name", async ({ page }) => {
	await signIn(page, createUser(uniqueEmail("projects-invalid")));
	await page.goto("/projects?new=true");
	await page.getByRole("button", { name: "Create project" }).click();
	await expect(page.getByText("Enter a project name.")).toBeVisible();
});
