import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// The root .env holds the Docker port overrides (see docker-compose.yml).
dotenv.config({
	path: [
		path.resolve(import.meta.dirname, "apps/server/.env"),
		path.resolve(import.meta.dirname, ".env"),
	],
	quiet: true,
});

const SERVER_PORT = 3100;
const WEB_PORT = 3101;
const WEB_URL = `http://localhost:${WEB_PORT}`;

// E2E never touches dev data: its own Postgres database and Redis logical database.
function e2eUrl(name: string, withPath: (url: URL) => void): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is required (run \`bun run setup\`)`);
	}
	const url = new URL(value);
	withPath(url);
	return url.toString();
}

const e2eEnv = {
	APP_URL: WEB_URL,
	DATABASE_URL: e2eUrl("DATABASE_URL", (url) => {
		url.pathname = `${url.pathname}-e2e`;
	}),
	REDIS_URL: e2eUrl("REDIS_URL", (url) => {
		url.pathname = "/1";
	}),
};

// Read by e2e/utils.ts to seed users into the e2e database.
process.env.E2E_DATABASE_URL = e2eEnv.DATABASE_URL;

export default defineConfig({
	forbidOnly: true,
	fullyParallel: true,
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	reporter: [["list"], ["html", { open: "never" }]],
	testDir: "./e2e",
	use: {
		baseURL: WEB_URL,
		trace: "retain-on-failure",
	},
	webServer: [
		{
			command: "bash ../../scripts/setup/e2e-db.sh && bun run src/index.ts",
			cwd: path.resolve(import.meta.dirname, "apps/server"),
			env: { ...e2eEnv, PORT: String(SERVER_PORT) },
			reuseExistingServer: false,
			stderr: "pipe",
			stdout: "ignore",
			timeout: 120_000,
			url: `http://localhost:${SERVER_PORT}/health`,
		},
		{
			command: "bun run dev",
			cwd: path.resolve(import.meta.dirname, "apps/web"),
			env: {
				API_PROXY_TARGET: `http://localhost:${SERVER_PORT}`,
				PORT: String(WEB_PORT),
			},
			reuseExistingServer: false,
			stderr: "pipe",
			stdout: "ignore",
			url: WEB_URL,
		},
	],
});
