const LEADING_ZEROS = /^0+(?=.)/;
const ZERO_RUN = /(^|:)0(:0)+(:|$)/;

// Better Auth stores IPv6 addresses expanded and masked to their /64 prefix.
export function formatIpAddress(ip: string | null | undefined) {
	if (!ip?.includes(":")) {
		return ip ?? undefined;
	}
	const compressed = ip
		.split(":")
		.map((group) => group.replace(LEADING_ZEROS, ""))
		.join(":")
		.replace(ZERO_RUN, "::");
	return compressed === "::" ? undefined : compressed;
}
