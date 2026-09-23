#!/usr/bin/env bash
# Recreates the e2e database, applies migrations, seeds it and flushes the e2e Redis
# database, so every run starts from the same state. Env is set by playwright.config.ts.
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${REDIS_URL:?REDIS_URL is required}"

bun -e '
import { RedisClient, SQL } from "bun";
const url = new URL(process.env.DATABASE_URL);
const name = url.pathname.slice(1);
url.pathname = "/postgres";
const sql = new SQL(url.toString());
await sql`select pg_terminate_backend(pid) from pg_stat_activity where datname = ${name} and pid <> pg_backend_pid()`;
await sql.unsafe(`drop database if exists "${name}"`);
await sql.unsafe(`create database "${name}"`);
await sql.close();
const redis = new RedisClient(process.env.REDIS_URL);
await redis.send("FLUSHDB", []);
redis.close();
'

bun run --cwd packages/db db:migrate
bun run --cwd packages/db db:seed
