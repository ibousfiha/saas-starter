import type { LinguiConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";

const config: LinguiConfig = {
	catalogs: [
		{
			include: [
				"<rootDir>/../../apps/web/src",
				"<rootDir>/../ui/src",
				"<rootDir>/src",
			],
			path: "<rootDir>/src/locales/{locale}/messages",
		},
	],
	fallbackLocales: {
		default: "en",
	},
	format: formatter({ origins: false }),
	locales: ["en", "de", "fr"],
	sourceLocale: "en",
};

export default config;
