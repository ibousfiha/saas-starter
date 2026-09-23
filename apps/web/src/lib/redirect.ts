export const DEFAULT_REDIRECT = "/dashboard";

export function safeRedirect(value: unknown, fallback = DEFAULT_REDIRECT) {
	if (typeof value !== "string" || !value.startsWith("/")) {
		return fallback;
	}
	if (value.startsWith("//") || value.startsWith("/\\")) {
		return fallback;
	}
	try {
		const url = new URL(value, "http://localhost");
		if (url.origin !== "http://localhost") {
			return fallback;
		}
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallback;
	}
}
