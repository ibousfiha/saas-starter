import { describe, expect, it } from "vitest";
import { DEFAULT_REDIRECT, safeRedirect } from "./redirect";

describe("safeRedirect", () => {
	it("keeps same-origin relative paths", () => {
		expect(safeRedirect("/projects?tab=all#top")).toBe("/projects?tab=all#top");
	});

	it.each([
		undefined,
		null,
		42,
		"",
		"dashboard",
		"https://evil.example",
		"//evil.example",
		"/\\evil.example",
		"javascript:alert(1)",
		"/\t/evil.example",
	])("falls back for %s", (value) => {
		expect(safeRedirect(value)).toBe(DEFAULT_REDIRECT);
	});

	it("uses the provided fallback", () => {
		expect(safeRedirect("https://evil.example", "/sign-in")).toBe("/sign-in");
	});
});
