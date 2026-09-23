import { describe, expect, it } from "vitest";
import { getAssignableRoles, getMemberActions } from "./roles";

const owner = { id: "owner", role: "owner" };
const admin = { id: "admin", role: "admin" };
const otherAdmin = { id: "admin-2", role: "admin" };
const member = { id: "member", role: "member" };

describe("getMemberActions", () => {
	it("never allows acting on yourself", () => {
		expect(getMemberActions(owner, owner)).toEqual({
			canChangeRole: false,
			canRemove: false,
		});
	});

	it("lets owners manage everyone else", () => {
		expect(getMemberActions(owner, { id: "owner-2", role: "owner" })).toEqual({
			canChangeRole: true,
			canRemove: true,
		});
	});

	it("keeps admins away from owners", () => {
		expect(getMemberActions(admin, owner)).toEqual({
			canChangeRole: false,
			canRemove: false,
		});
		expect(getMemberActions(admin, otherAdmin)).toEqual({
			canChangeRole: true,
			canRemove: true,
		});
	});

	it("gives members no management actions", () => {
		expect(getMemberActions(member, admin)).toEqual({
			canChangeRole: false,
			canRemove: false,
		});
	});
});

describe("getAssignableRoles", () => {
	it("only lets owners hand out ownership", () => {
		expect(getAssignableRoles("owner")).toContain("owner");
		expect(getAssignableRoles("admin")).toEqual(["admin", "member"]);
	});
});
