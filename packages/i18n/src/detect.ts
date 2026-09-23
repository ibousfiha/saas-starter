export const SUPPORTED_LOCALES = ["en", "de", "fr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

const LOCALE_COOKIE_REGEX = /(?:^|;\s*)locale=([^;]*)/;

function parseLocale(locale: string): SupportedLocale {
	const exact = locale.toLowerCase().slice(0, 2);
	if (SUPPORTED_LOCALES.includes(exact as SupportedLocale)) {
		return exact as SupportedLocale;
	}
	return DEFAULT_LOCALE;
}

export function detectLocale(cookieValue?: string): SupportedLocale {
	// Always respect an explicit cookie value — the user chose this locale.
	// Do NOT fall through to navigator.language even if the cookie says "en",
	// otherwise a user who explicitly selected English via the switcher
	// would see German if their browser is set to de-DE.
	if (cookieValue) {
		return parseLocale(cookieValue);
	}
	// On the server (Bun), navigator may exist but navigator.language may be undefined.
	// Only use navigator.language when it's defined and the value is a string.
	if (
		typeof navigator !== "undefined" &&
		typeof (navigator as { language?: string }).language === "string"
	) {
		return parseLocale((navigator as { language: string }).language);
	}
	return DEFAULT_LOCALE;
}

export function getLocaleCookie(): string | undefined {
	if (typeof document === "undefined") {
		return;
	}
	const match = document.cookie.match(LOCALE_COOKIE_REGEX);
	return match?.[1];
}

export function setLocaleCookie(locale: string): void {
	document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}
