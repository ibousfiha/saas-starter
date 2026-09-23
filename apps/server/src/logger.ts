import { resolve } from "node:path";
import { siteConfig } from "@saas-starter/config";
import { env } from "@saas-starter/env/server";
import { initLogger } from "evlog";
import { createFsDrain } from "evlog/fs";

initLogger({
	// Production logs go to stdout only; the file drain is a local debugging aid.
	drain:
		env.NODE_ENV === "development"
			? createFsDrain({
					dir: resolve(import.meta.dirname, "../../../.evlog/logs"),
				})
			: undefined,
	env: { environment: env.NODE_ENV, service: `${siteConfig.slug}-server` },
	minLevel: env.LOG_LEVEL,
	pretty: env.NODE_ENV !== "production",
});

export function errorFields(error: unknown) {
	return error instanceof Error
		? { message: error.message, name: error.name, stack: error.stack }
		: { message: String(error) };
}
