import { redis } from "@saas-starter/auth/redis";
import { pool } from "@saas-starter/db";
import type { Context } from "hono";

const TIMEOUT_MS = 2000;

async function probe(check: () => Promise<unknown>): Promise<"ok" | "error"> {
	let timer: Timer | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS);
	});
	try {
		await Promise.race([check(), timeout]);
		return "ok";
	} catch {
		return "error";
	} finally {
		clearTimeout(timer);
	}
}

export async function health(c: Context) {
	const [postgres, cache] = await Promise.all([
		probe(() => pool.query("select 1")),
		probe(() => redis.ping()),
	]);
	const ok = postgres === "ok" && cache === "ok";
	return c.json(
		{ postgres, redis: cache, status: ok ? "ok" : "error" },
		ok ? 200 : 503
	);
}
