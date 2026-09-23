import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export const env = createEnv({
	emptyStringAsUndefined: true,
	runtimeEnv: process.env,
	server: {
		APP_URL: z.url(),
		BETTER_AUTH_SECRET: z
			.string()
			.min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
		DATABASE_URL: z.url(),
		FROM_EMAIL: isProduction
			? z.email()
			: z.email().default("noreply@example.com"),
		LOG_DB_QUERIES: z.stringbool().default(false),
		LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		PORT: z.coerce.number().int().positive().default(3000),
		REDIS_URL: z.url(),
		RESEND_API_KEY: z.string().optional(),
		SMTP_HOST: isProduction
			? z.string().optional()
			: z.string().default("localhost"),
		SMTP_PASSWORD: z.string().optional(),
		SMTP_PORT: z.coerce.number().int().positive().default(1026),
		SMTP_USER: z.string().optional(),
		TRUST_PROXY: z.stringbool().default(false),
		WEB_DIST_DIR: z.string().optional(),
	},
});

if (isProduction && !(env.RESEND_API_KEY || env.SMTP_HOST)) {
	throw new Error(
		"Invalid environment variables: set RESEND_API_KEY or SMTP_HOST in production"
	);
}
