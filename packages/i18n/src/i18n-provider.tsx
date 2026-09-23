import { i18n } from "@lingui/core";
import { I18nProvider as LinguiProvider } from "@lingui/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { activateLocale } from "./client";
import {
	detectLocale,
	getLocaleCookie,
	type SupportedLocale,
	setLocaleCookie,
} from "./detect";

interface LocaleContextValue {
	locale: SupportedLocale;
	setLocale: (locale: SupportedLocale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error("useLocale must be used within I18nProvider");
	}
	return context;
}

async function applyLocale(locale: SupportedLocale) {
	const active = await activateLocale(locale).catch(() => activateLocale("en"));
	document.documentElement.lang = active;
	return active;
}

export function I18nProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<SupportedLocale | null>(null);

	useEffect(() => {
		applyLocale(detectLocale(getLocaleCookie())).then(setLocaleState);
	}, []);

	const setLocale = useCallback(async (next: SupportedLocale) => {
		setLocaleCookie(next);
		setLocaleState(await applyLocale(next));
	}, []);

	const value = useMemo(
		() => (locale ? { locale, setLocale } : null),
		[locale, setLocale]
	);

	if (!value) {
		return null;
	}

	return (
		<LocaleContext.Provider value={value}>
			<LinguiProvider i18n={i18n}>{children}</LinguiProvider>
		</LocaleContext.Provider>
	);
}
