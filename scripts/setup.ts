#!/usr/bin/env bun
/**
 * One-time local bootstrap: env files, infrastructure, database, e2e browser.
 * Idempotent — existing .env files are never overwritten.
 *
 * Usage: bun install && bun run setup
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const AUTH_SECRET_LINE = /^BETTER_AUTH_SECRET=.*$/m;

const { log } = console;

function run(cmd: string[]) {
	log(`\n→ ${cmd.join(" ")}`);
	const { exitCode } = Bun.spawnSync(cmd, {
		cwd: ROOT,
		stdio: ["inherit", "inherit", "inherit"],
	});
	if (exitCode !== 0) {
		log(`\n✖ Failed: ${cmd.join(" ")}`);
		process.exit(exitCode ?? 1);
	}
}

function createEnv(dir: string, transform: (content: string) => string) {
	const example = resolve(ROOT, dir, ".env.example");
	const target = resolve(ROOT, dir, ".env");
	if (existsSync(target)) {
		log(`✓ ${dir}/.env exists`);
		return;
	}
	writeFileSync(target, transform(readFileSync(example, "utf-8")));
	log(`✓ Created ${dir}/.env`);
}

createEnv("apps/server", (content) =>
	content.replace(
		AUTH_SECRET_LINE,
		`BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`
	)
);

run(["docker", "info", "--format", "{{.ServerVersion}}"]);
run(["bun", "run", "db:start"]);
run(["bun", "run", "db:migrate"]);
run(["bun", "run", "db:seed"]);
run(["bunx", "playwright", "install", "chromium"]);

log(`
✓ Setup complete. Start developing with:

  bun run dev    web http://localhost:3001 · api http://localhost:3000 · mail http://localhost:8026
`);
