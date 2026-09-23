import { beforeEach, describe, expect, it, vi } from "vitest";
import { detectLocale } from "./detect";

beforeEach(() => {
	vi.stubGlobal("navigator", undefined);
});

describe("detectLocale", () => {
	it("returns 'en' when no cookie and no navigator", () => {
		expect(detectLocale(undefined)).toBe("en");
	});

	it("returns 'de' when German cookie is provided", () => {
		expect(detectLocale("de")).toBe("de");
	});

	it("returns 'fr' when French cookie is provided", () => {
		expect(detectLocale("fr")).toBe("fr");
	});

	it("returns 'en' when English cookie is provided (cookie is authoritative)", () => {
		expect(detectLocale("en")).toBe("en");
	});

	it("negotiates first 2 chars from locale string like 'de-DE'", () => {
		expect(detectLocale("de-DE")).toBe("de");
	});

	it("returns 'en' for unsupported locale 'ja'", () => {
		expect(detectLocale("ja")).toBe("en");
	});

	it("falls through to navigator/fallback when cookie is an empty string", () => {
		expect(detectLocale("")).toBe("en");
	});
});
