import { Trans, useLingui } from "@lingui/react/macro";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@saas-starter/i18n";
import { useLocale } from "@saas-starter/i18n/i18n-provider";
import { Button } from "@saas-starter/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@saas-starter/ui/components/dropdown-menu";
import { Languages } from "lucide-react";

const localeNames: Record<SupportedLocale, string> = {
	de: "Deutsch",
	en: "English",
	fr: "Français",
};

function LocaleRadioItems() {
	const { locale, setLocale } = useLocale();

	return (
		<DropdownMenuRadioGroup
			onValueChange={(value) => setLocale(value as SupportedLocale)}
			value={locale}
		>
			{SUPPORTED_LOCALES.map((code) => (
				<DropdownMenuRadioItem key={code} lang={code} value={code}>
					{localeNames[code]}
				</DropdownMenuRadioItem>
			))}
		</DropdownMenuRadioGroup>
	);
}

export function LanguageSwitcher() {
	const { t } = useLingui();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button aria-label={t`Change language`} size="icon" variant="ghost">
					<Languages />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<LocaleRadioItems />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function LanguageMenuSub() {
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<Languages />
				<Trans>Language</Trans>
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<LocaleRadioItems />
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
