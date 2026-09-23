import { siteConfig } from "@saas-starter/config";

const HTML_ESCAPES: Record<string, string> = {
	"'": "&#39;",
	'"': "&quot;",
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
};

export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

export interface EmailTemplate {
	html: string;
	subject: string;
}

interface LayoutOptions {
	/** Pre-escaped HTML paragraphs. */
	body: string;
	cta: { label: string; url: string };
	footer: string;
	heading: string;
}

export function layout({ heading, body, cta, footer }: LayoutOptions): string {
	const url = escapeHtml(cta.url);
	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f7; margin: 0; padding: 40px 16px;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px;">
		<tr>
			<td style="padding: 32px;">
				<h1 style="font-size: 22px; color: #18181b; margin: 0 0 16px;">${escapeHtml(heading)}</h1>
				${body}
				<p style="margin: 24px 0; text-align: center;">
					<a href="${url}" style="display: inline-block; background: #18181b; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">${escapeHtml(cta.label)}</a>
				</p>
				<p style="color: #a3a3a3; font-size: 13px; margin: 0 0 8px;">Or copy this link into your browser:</p>
				<p style="margin: 0 0 24px;"><a href="${url}" style="color: #2563eb; font-size: 13px; word-break: break-all;">${url}</a></p>
				<p style="color: #a3a3a3; font-size: 12px; margin: 0; border-top: 1px solid #e5e7eb; padding-top: 16px;">${escapeHtml(footer)}</p>
			</td>
		</tr>
	</table>
	<p style="color: #a3a3a3; font-size: 12px; text-align: center; margin: 16px 0 0;">${escapeHtml(siteConfig.name)}</p>
</body>
</html>`;
}

export function paragraph(html: string): string {
	return `<p style="color: #525252; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">${html}</p>`;
}
