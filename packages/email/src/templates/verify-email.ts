import { siteConfig } from "@saas-starter/config";
import { type EmailTemplate, escapeHtml, layout, paragraph } from "./layout";

export function verifyEmailTemplate({
	name,
	url,
}: {
	name: string;
	url: string;
}): EmailTemplate {
	return {
		html: layout({
			body: paragraph(
				`Hi ${escapeHtml(name)}, thanks for signing up. Please verify your email address to get started.`
			),
			cta: { label: "Verify email", url },
			footer: "If you didn't create an account, you can ignore this email.",
			heading: `Welcome to ${siteConfig.name}`,
		}),
		subject: `Verify your email for ${siteConfig.name}`,
	};
}
