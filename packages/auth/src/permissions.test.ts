import { describe, expect, it } from "vitest";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
	it("lets every role read projects", () => {
		for (const role of ["owner", "admin", "member"]) {
			expect(hasPermission(role, { project: ["read"] })).toBe(true);
		}
	});

	it("only lets owners and admins delete projects", () => {
		expect(hasPermission("owner", { project: ["delete"] })).toBe(true);
		expect(hasPermission("admin", { project: ["delete"] })).toBe(true);
		expect(hasPermission("member", { project: ["delete"] })).toBe(false);
	});

	it("only lets owners delete the organization", () => {
		expect(hasPermission("owner", { organization: ["delete"] })).toBe(true);
		expect(hasPermission("admin", { organization: ["delete"] })).toBe(false);
	});

	it("requires every requested action", () => {
		expect(hasPermission("member", { project: ["read", "delete"] })).toBe(
			false
		);
	});

	it("accepts comma-separated roles", () => {
		expect(hasPermission("member,admin", { project: ["delete"] })).toBe(true);
	});

	it("denies unknown roles", () => {
		expect(hasPermission("guest", { project: ["read"] })).toBe(false);
	});
});
