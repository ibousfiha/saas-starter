import { siteConfig } from "@saas-starter/config";
import { db } from "@saas-starter/db";
// biome-ignore lint/performance/noNamespaceImport: Drizzle convention for schema tables
import * as schema from "@saas-starter/db/schema/auth";
import { sendEmail } from "@saas-starter/email";
import { invitationTemplate } from "@saas-starter/email/templates/invitation";
import { resetPasswordTemplate } from "@saas-starter/email/templates/reset-password";
import { verifyEmailTemplate } from "@saas-starter/email/templates/verify-email";
import { env } from "@saas-starter/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization, twoFactor } from "better-auth/plugins";
import { ac, roles } from "./permissions";
import { redis } from "./redis";

const isProduction = env.NODE_ENV === "production";

export const auth = betterAuth({
	advanced: {
		// Send emails without blocking the response (avoids timing leaks); failures are logged by Better Auth.
		backgroundTasks: { handler: () => undefined },
		defaultCookieAttributes: { sameSite: "lax" },
		useSecureCookies: isProduction,
	},
	appName: siteConfig.name,
	baseURL: env.APP_URL,
	database: drizzleAdapter(db, { provider: "pg", schema }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				...resetPasswordTemplate({ name: user.name, url }),
			});
		},
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				...verifyEmailTemplate({ name: user.name, url }),
			});
		},
	},
	plugins: [
		admin(),
		organization({
			ac,
			roles,
			schema: {
				invitation: {
					additionalFields: {
						message: { required: false, type: "string" },
					},
				},
			},
			sendInvitationEmail: async ({
				id,
				email,
				invitation,
				inviter,
				organization: org,
			}) => {
				const message =
					"message" in invitation && typeof invitation.message === "string"
						? invitation.message
						: undefined;
				await sendEmail({
					to: email,
					...invitationTemplate({
						inviterName: inviter.user.name,
						message,
						organizationName: org.name,
						url: `${env.APP_URL}/accept-invitation?id=${encodeURIComponent(id)}`,
					}),
				});
			},
		}),
		twoFactor(),
	],
	// Active in production only (Better Auth default), so dev and e2e aren't throttled.
	rateLimit: {
		customRules: {
			"/request-password-reset": { max: 3, window: 300 },
			"/send-verification-email": { max: 3, window: 300 },
			"/sign-in/*": { max: 5, window: 60 },
			"/sign-up/*": { max: 5, window: 300 },
		},
		storage: "secondary-storage",
	},
	secondaryStorage: {
		delete: async (key) => {
			await redis.del(key);
		},
		get: (key) => redis.get(key),
		set: async (key, value, ttl) => {
			if (ttl) {
				await redis.set(key, value, "EX", ttl);
			} else {
				await redis.set(key, value);
			}
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	session: {
		cookieCache: { enabled: true, maxAge: 5 * 60 },
	},
	trustedOrigins: [env.APP_URL],
});

export type Session = typeof auth.$Infer.Session;
