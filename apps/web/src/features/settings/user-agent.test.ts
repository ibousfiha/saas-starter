import { describe, expect, it } from "vitest";
import { parseUserAgent } from "@/features/settings/user-agent";

describe("parseUserAgent", () => {
	it.each([
		[
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
			{ browser: "Chrome", isMobile: false, os: "macOS" },
		],
		[
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
			{ browser: "Edge", isMobile: false, os: "Windows" },
		],
		[
			"Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0",
			{ browser: "Firefox", isMobile: false, os: "Linux" },
		],
		[
			"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
			{ browser: "Safari", isMobile: true, os: "iOS" },
		],
		[
			"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
			{ browser: "Chrome", isMobile: true, os: "Android" },
		],
	])("parses %s", (userAgent, expected) => {
		expect(parseUserAgent(userAgent)).toEqual(expected);
	});

	it("returns unknown values for missing user agents", () => {
		expect(parseUserAgent(null)).toEqual({
			browser: undefined,
			isMobile: false,
			os: undefined,
		});
	});
});
