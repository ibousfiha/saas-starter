import { describe, expect, it } from "vitest";
import { getInitials } from "@/components/app-shell/user-initials";

describe("getInitials", () => {
	it("uses the first and last name", () => {
		expect(getInitials("Ada Byron Lovelace")).toBe("AL");
	});

	it("uses two letters of a single name", () => {
		expect(getInitials("ada")).toBe("AD");
	});

	it("falls back for empty names", () => {
		expect(getInitials("   ")).toBe("?");
	});
});
