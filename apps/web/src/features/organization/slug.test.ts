import { describe, expect, it } from "vitest";
import { createOrganizationSlug, slugify } from "./slug";

describe("slugify", () => {
	it("lowercases and dashes words", () => {
		expect(slugify("  Acme Labs, Inc. ")).toBe("acme-labs-inc");
	});

	it("strips diacritics", () => {
		expect(slugify("Crème Brûlée Café")).toBe("creme-brulee-cafe");
	});

	it("caps the length without a trailing dash", () => {
		const slug = slugify(`${"a".repeat(39)} b`);
		expect(slug).toBe("a".repeat(39));
	});
});

describe("createOrganizationSlug", () => {
	it("appends the suffix", () => {
		expect(createOrganizationSlug("Acme", "x1y2z3")).toBe("acme-x1y2z3");
	});

	it("falls back to the suffix for names without letters", () => {
		expect(createOrganizationSlug("日本", "x1y2z3")).toBe("x1y2z3");
	});
});
