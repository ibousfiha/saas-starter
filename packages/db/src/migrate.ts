import { resolve } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

await migrate(db, {
	migrationsFolder: resolve(import.meta.dirname, "migrations"),
});
await pool.end();
