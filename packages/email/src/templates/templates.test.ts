import { describe, expect, it } from "vitest";
import { invitationTemplate } from "./invitation";
import { escapeHtml } from "./layout";
import { resetPasswordTemplate } from "./reset-password";
import { verifyEmailTemplate } from "./verify-email";

const payload = '<script>alert("x")</script>';
const url = 'https://app.test/verify?token=a&b="c"';

describe("escapeHtml", () => {
	it("escapes HTML special characters", () => {
		expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
			"&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
		);
	});
});

describe("email templates", () => {
	const rendered = [
		verifyEmailTemplate({ name: payload, url }),
		resetPasswordTemplate({ name: payload, url }),
		invitationTemplate({
			inviterName: payload,
			message: payload,
			organizationName: payload,
			url,
		}),
	];

	it.each(rendered)("escapes every interpolated value", ({ html }) => {
		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;");
		expect(html).not.toContain('"c"');
		expect(html).toContain("token=a&amp;b=&quot;c&quot;");
	});
});
