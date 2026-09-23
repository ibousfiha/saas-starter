import { i18n } from "@lingui/core";
import type { SupportedLocale } from "./detect";
import { messages as enMessages } from "./locales/en/messages";

const catalogs: Partial<
	Record<string, () => Promise<{ messages: Record<string, string> }>>
> = {
	de: () =>
		import("./locales/de/messages") as Promise<{
			messages: Record<string, string>;
		}>,
	en: () =>
		Promise.resolve(
			enMessages as unknown as { messages: Record<string, string> }
		),
	fr: () =>
		import("./locales/fr/messages") as Promise<{
			messages: Record<string, string>;
		}>,
};

export async function activateLocale(
	locale: SupportedLocale
): Promise<SupportedLocale> {
	if (locale === "en") {
		i18n.loadAndActivate({ locale: "en", messages: enMessages });
		return "en";
	}
	const loadFn = catalogs[locale as string];
	if (!loadFn) {
		return "en";
	}
	const catalog = await loadFn();
	i18n.loadAndActivate({ locale, messages: catalog.messages });
	return locale;
}

i18n.loadAndActivate({ locale: "en", messages: enMessages });
