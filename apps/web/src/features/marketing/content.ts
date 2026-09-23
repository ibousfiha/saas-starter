import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import {
	Building2,
	Languages,
	type LucideIcon,
	Palette,
	Rocket,
	ShieldCheck,
	Workflow,
} from "lucide-react";

interface Feature {
	description: MessageDescriptor;
	icon: LucideIcon;
	title: MessageDescriptor;
}

export const features: Feature[] = [
	{
		description: msg`Email and password sign-in, verified emails, password resets and TOTP two-factor authentication, powered by Better Auth.`,
		icon: ShieldCheck,
		title: msg`Authentication & 2FA`,
	},
	{
		description: msg`Multi-tenant workspaces with owner, admin and member roles, invitations and permission checks on every request.`,
		icon: Building2,
		title: msg`Organizations & roles`,
	},
	{
		description: msg`oRPC procedures shared end to end with TanStack Query, so the client always matches the server.`,
		icon: Workflow,
		title: msg`Type-safe API`,
	},
	{
		description: msg`Lingui with lazy-loaded catalogs. English, German and French included, ready for more.`,
		icon: Languages,
		title: msg`Internationalization`,
	},
	{
		description: msg`shadcn/ui components on Tailwind CSS v4 with light and dark themes that follow the system.`,
		icon: Palette,
		title: msg`Dark mode & theming`,
	},
	{
		description: msg`One Docker image, database migrations, unit and end-to-end tests, and git hooks as the quality gate.`,
		icon: Rocket,
		title: msg`Production ready`,
	},
];

export const stack = [
	"React 19",
	"TanStack",
	"Hono",
	"oRPC",
	"Better Auth",
	"Drizzle",
	"Tailwind CSS",
];

interface LegalPage {
	sections: { body: MessageDescriptor; heading: MessageDescriptor }[];
	title: MessageDescriptor;
}

export const legalPages = {
	privacy: {
		sections: [
			{
				body: msg`We store the account details you provide (name, email address and password hash) and the content you create in your organizations.`,
				heading: msg`What we collect`,
			},
			{
				body: msg`Your data is used only to provide the service. We do not sell it or share it with third parties except the providers needed to run the service.`,
				heading: msg`How we use it`,
			},
			{
				body: msg`You can delete your account at any time. Contact us to request a copy of your data.`,
				heading: msg`Your rights`,
			},
		],
		title: msg`Privacy policy`,
	},
	terms: {
		sections: [
			{
				body: msg`By creating an account you agree to use the service lawfully and to keep your credentials secure.`,
				heading: msg`Using the service`,
			},
			{
				body: msg`You own the content you create. You grant us the rights needed to store and display it to members of your organization.`,
				heading: msg`Your content`,
			},
			{
				body: msg`The service is provided as is. We may update these terms and will notify you of material changes.`,
				heading: msg`Changes and liability`,
			},
		],
		title: msg`Terms of service`,
	},
} satisfies Record<string, LegalPage>;

export type LegalSlug = keyof typeof legalPages;

export function isLegalSlug(slug: string): slug is LegalSlug {
	return Object.hasOwn(legalPages, slug);
}
