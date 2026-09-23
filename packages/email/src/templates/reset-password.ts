import { type EmailTemplate, escapeHtml, layout, paragraph } from "./layout";

export function resetPasswordTemplate({
	name,
	url,
}: {
	name: string;
	url: string;
}): EmailTemplate {
	return {
		html: layout({
			body: paragraph(
				`Hi ${escapeHtml(name)}, we received a request to reset your password. Click the button below to choose a new one.`
			),
			cta: { label: "Reset password", url },
			footer:
				"If you didn't request a password reset, you can ignore this email. The link expires in 1 hour.",
			heading: "Reset your password",
		}),
		subject: "Reset your password",
	};
}
