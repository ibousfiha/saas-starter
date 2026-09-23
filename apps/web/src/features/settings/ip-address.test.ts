import { describe, expect, it } from "vitest";
import { formatIpAddress } from "@/features/settings/ip-address";

describe("formatIpAddress", () => {
	it.each([
		["203.0.113.7", "203.0.113.7"],
		["2001:0db8:85a3:0000:0000:0000:0000:0000", "2001:db8:85a3::"],
		["fe80:0000:0000:0000:0001:0000:0000:0001", "fe80::1:0:0:1"],
		["0000:0000:0000:0000:0000:0000:0000:0000", undefined],
		[null, undefined],
	])("formats %s", (ip, expected) => {
		expect(formatIpAddress(ip)).toBe(expected);
	});
});
