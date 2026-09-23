import { Trans, useLingui } from "@lingui/react/macro";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@saas-starter/i18n";
import { useLocale } from "@saas-starter/i18n/i18n-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import { cn } from "@saas-starter/ui/lib/utils";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { themeOptions } from "@/components/theme-toggle";

interface ChoiceCardsProps<T extends string> {
	label: string;
	name: string;
	onChange: (value: T) => void;
	options: { content: ReactNode; lang?: string; value: T }[];
	value: string | undefined;
}

function ChoiceCards<T extends string>({
	label,
	name,
	onChange,
	options,
	value,
}: ChoiceCardsProps<T>) {
	return (
		<fieldset className="grid grid-cols-3 gap-3">
			<legend className="sr-only">{label}</legend>
			{options.map((option) => (
				<label
					className={cn(
						"flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 font-medium text-sm transition-colors hover:bg-accent/50",
						"has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
						option.value === value &&
							"border-primary bg-accent/50 ring-1 ring-primary"
					)}
					key={option.value}
					lang={option.lang}
				>
					<input
						checked={option.value === value}
						className="sr-only"
						name={name}
						onChange={() => onChange(option.value)}
						type="radio"
						value={option.value}
					/>
					{option.content}
				</label>
			))}
		</fieldset>
	);
}

function localeName(locale: SupportedLocale) {
	const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
	return name
		? name.charAt(0).toLocaleUpperCase(locale) + name.slice(1)
		: locale;
}

export function PreferencesSettings() {
	const { t } = useLingui();
	const { setTheme, theme } = useTheme();
	const { locale, setLocale } = useLocale();

	return (
		<div className="grid grid-cols-1 gap-6">
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Appearance</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>
							Choose a theme, or follow your operating system setting.
						</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChoiceCards
						label={t`Theme`}
						name="theme"
						onChange={setTheme}
						options={themeOptions.map(({ icon: Icon, label, value }) => ({
							content: (
								<>
									<Icon className="size-5 text-muted-foreground" />
									{t(label)}
								</>
							),
							value,
						}))}
						value={theme}
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Language</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>The language used throughout the app.</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChoiceCards
						label={t`Language`}
						name="locale"
						onChange={(value) => setLocale(value).catch(() => undefined)}
						options={SUPPORTED_LOCALES.map((code) => ({
							content: (
								<>
									<span className="font-mono text-muted-foreground text-xs uppercase">
										{code}
									</span>
									{localeName(code)}
								</>
							),
							lang: code,
							value: code,
						}))}
						value={locale}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
