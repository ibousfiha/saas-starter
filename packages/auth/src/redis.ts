import { env } from "@saas-starter/env/server";
import Redis from "ioredis";

export const redis = new Redis(env.REDIS_URL, {
	lazyConnect: true,
	maxRetriesPerRequest: 3,
	retryStrategy: (attempt) => Math.min(attempt * 200, 5000),
});
