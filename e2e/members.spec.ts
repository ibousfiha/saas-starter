import { expect, test } from "@playwright/test";
import { createUser, emailLink, signIn, uniqueEmail } from "./utils";

test("invites a member who accepts the invitation", async ({
	browser,
	page,
}) => {
	const owner = createUser(uniqueEmail("owner"));
	const invitee = createUser(uniqueEmail("invitee"));
	const ownerOrg = `${owner.email.split("@")[0]} org`;

	await signIn(page, owner);
	await page.goto("/members");
	await page.getByRole("button", { name: "Invite member" }).click();
	await page.getByLabel("Email", { exact: true }).fill(invitee.email);
	await page.getByRole("button", { name: "Send invitation" }).click();
	await expect(
		page.getByText(`Invitation sent to ${invitee.email}.`)
	).toBeVisible();

	const link = await emailLink(invitee.email);
	const inviteePage = await (await browser.newContext()).newPage();
	await signIn(inviteePage, invitee);
	await inviteePage.goto(link);
	await inviteePage.getByRole("button", { name: "Accept invitation" }).click();
	await expect(inviteePage).toHaveURL(/\/dashboard$/);
	await expect(
		inviteePage.getByRole("button", { name: new RegExp(ownerOrg) })
	).toBeVisible();

	await page.reload();
	await expect(
		page.getByRole("row", { name: new RegExp(invitee.email) })
	).toBeVisible();
});
