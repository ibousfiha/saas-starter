import { env } from "@saas-starter/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// biome-ignore lint/performance/noNamespaceImport: Drizzle convention for schema tables
import * as schema from "./schema";

export const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle({
	client: pool,
	logger: env.LOG_DB_QUERIES,
	schema,
});

export type Db = typeof db;
