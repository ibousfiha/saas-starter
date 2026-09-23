import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { appRouter } from "@saas-starter/api/routers/index";
import { auth, type Session } from "@saas-starter/auth";
import { redis } from "@saas-starter/auth/redis";
import { pool } from "@saas-starter/db";
import { env } from "@saas-starter/env/server";
import { log } from "evlog";
import { identifyUser } from "evlog/better-auth";
import { type EvlogVariables, evlog } from "evlog/hono";
import { Hono, type MiddlewareHandler } from "hono";
import { getConnInfo, serveStatic } from "hono/bun";
import { health } from "./health";
import { errorFields } from "./logger";

const isProduction = env.NODE_ENV === "production";

redis.on("error", (error) =>
	log.warn({ action: "redis", ...errorFields(error) })
);
pool.on("error", (error) =>
	log.error({ action: "postgres", ...errorFields(error) })
);

function logUnexpected(error: unknown) {
	if (error instanceof ORPCError && error.status < 500) {
		return;
	}
	log.error({ action: "rpc", ...errorFields(error) });
}

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [onError(logUnexpected)],
});

const openApiHandler = isProduction
	? undefined
	: new OpenAPIHandler(appRouter, {
			interceptors: [onError(logUnexpected)],
			plugins: [
				new OpenAPIReferencePlugin({
					schemaConverters: [new ZodToJsonSchemaConverter()],
				}),
			],
		});

interface AppEnv {
	Variables: EvlogVariables["Variables"] & { session: Session | null };
}

const app = new Hono<AppEnv>();

const resolveSession: MiddlewareHandler<AppEnv> = async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (session) {
		identifyUser(c.get("log"), session, { maskEmail: true });
	}
	c.set("session", session);
	await next();
};

app.use(evlog({ exclude: ["/health", "/assets/**"] }));

app.onError((error, c) => {
	c.get("log").error(error);
	return c.json({ message: "Internal Server Error" }, 500);
});

app.get("/health", health);

// Better Auth rate-limits by X-Forwarded-For. Unless a trusted proxy sets it,
// overwrite it with the socket address so clients cannot spoof their IP.
app.on(["GET", "POST"], "/api/auth/*", (c) => {
	if (env.TRUST_PROXY) {
		return auth.handler(c.req.raw);
	}
	const request = new Request(c.req.raw);
	request.headers.set("x-forwarded-for", getConnInfo(c).remote.address ?? "");
	return auth.handler(request);
});

app.use("/rpc/*", resolveSession, async (c, next) => {
	const { matched, response } = await rpcHandler.handle(c.req.raw, {
		context: { session: c.get("session") },
		prefix: "/rpc",
	});
	return matched ? c.newResponse(response.body, response) : next();
});

if (openApiHandler) {
	app.use("/api-reference/*", resolveSession, async (c, next) => {
		const { matched, response } = await openApiHandler.handle(c.req.raw, {
			context: { session: c.get("session") },
			prefix: "/api-reference",
		});
		return matched ? c.newResponse(response.body, response) : next();
	});
}

app.all("/api/*", (c) => c.notFound());
app.all("/rpc/*", (c) => c.notFound());

const webDist =
	env.WEB_DIST_DIR ?? resolve(import.meta.dirname, "../../web/dist");
const indexHtmlPath = join(webDist, "index.html");

if (!isProduction) {
	// Vite serves the SPA in development; a leftover web/dist build would be stale.
	app.get("*", (c) => {
		const url = new URL(c.req.url);
		const target = new URL(url.pathname + url.search, env.APP_URL);
		return target.origin === url.origin ? c.notFound() : c.redirect(target);
	});
} else if (existsSync(indexHtmlPath)) {
	const indexHtml = await Bun.file(indexHtmlPath).text();
	app.use(
		"/assets/*",
		serveStatic({
			onFound: (_path, c) => {
				c.header("Cache-Control", "public, max-age=31536000, immutable");
			},
			root: webDist,
		})
	);
	app.get("/assets/*", (c) => c.notFound());
	app.use("*", serveStatic({ root: webDist }));
	app.get("*", (c) => {
		c.header("Cache-Control", "no-cache");
		return c.html(indexHtml);
	});
}

const server = Bun.serve({ fetch: app.fetch, port: env.PORT });
log.info({ action: "server started", url: server.url.href });

async function shutdown(signal: string) {
	log.info({ action: "server stopping", signal });
	await server.stop();
	await Promise.allSettled([redis.quit(), pool.end()]);
	process.exit(0);
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
