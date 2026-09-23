import { siteConfig } from "@saas-starter/config";
import { type EmailTemplate, escapeHtml, layout, paragraph } from "./layout";

export function invitationTemplate({
	inviterName,
	organizationName,
	message,
	url,
}: {
	inviterName: string;
	message?: string;
	organizationName: string;
	url: string;
}): EmailTemplate {
	const personalMessage = message
		? paragraph(`<em>&ldquo;${escapeHtml(message)}&rdquo;</em>`)
		: "";
	return {
		html: layout({
			body:
				paragraph(
					`<strong>${escapeHtml(inviterName)}</strong> has invited you to join <strong>${escapeHtml(organizationName)}</strong> on ${escapeHtml(siteConfig.name)}.`
				) + personalMessage,
			cta: { label: "Accept invitation", url },
			footer:
				"This invitation expires in 48 hours. If you weren't expecting it, you can ignore this email.",
			heading: `Join ${organizationName}`,
		}),
		subject: `${inviterName} invited you to join ${organizationName}`,
	};
}
