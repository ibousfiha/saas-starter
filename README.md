# saas-starter

A production-ready SaaS starter: multi-tenant organizations with roles, email/password auth with verification and 2FA, a type-safe API, i18n, and a modern shadcn/ui app shell — in one small Bun monorepo.

**Stack:** Bun · Turborepo · Hono · oRPC · Better Auth · Drizzle + PostgreSQL · Redis · React 19 · TanStack Router/Query/Form · shadcn/ui + Tailwind v4 · Lingui

## What you get

- **Auth** — sign up with email verification, sign in, password reset, TOTP two-factor with backup codes, session management, rate limiting (Redis).
- **Organizations** — create/switch organizations, invite members by email, owner/admin/member roles enforced on the server.
- **Example feature** — org-scoped `projects` CRUD, end to end, to copy for your own features.
- **App shell** — collapsible sidebar, organization switcher, ⌘K command menu, light/dark theme, English/German/French.
- **Production** — one Docker image serving the API and the SPA from a single origin, health check, graceful shutdown, structured logs.
- **Guard rails** — git hooks run types, lint, unit tests, package boundaries, dead-code and i18n checks, plus Playwright e2e.

## Getting started

### Requirements

- [Bun](https://bun.com) 1.3+
- [Docker](https://www.docker.com/products/docker-desktop/) with Compose. It runs PostgreSQL, Redis and Mailpit; Bun runs on the host.
- Windows: use WSL2 and keep the project inside the Linux filesystem (not `/mnt/c/...`).

### Setup

```bash
bun install      # also installs the git hooks
bun run setup    # one-time bootstrap, safe to re-run
bun run dev
```

`bun run setup`:

1. Creates `apps/server/.env` from `.env.example` with a random `BETTER_AUTH_SECRET`. An existing `.env` is never overwritten.
2. Starts PostgreSQL, Redis and Mailpit in Docker (`bun run db:start`).
3. Applies migrations and seeds an admin user with an organization (`bun run db:migrate`, `bun run db:seed`).
4. Installs the Playwright Chromium used by the e2e tests. On Linux you may also need `bunx playwright install-deps chromium`.

Then open http://localhost:3001 and sign in as `admin@example.com` / `admin123`. To seed a different user, set the `SEED_*` variables in `apps/server/.env` before seeding.

| URL | What |
|---|---|
| http://localhost:3001 | Web app (Vite). Use this one in development. |
| http://localhost:3000 | API server. Page requests redirect to the web app. |
| http://localhost:8026 | Mailpit: verification, password reset and invitation emails |

### Troubleshooting

**Port already in use.** Docker publishes Postgres on 5433, Redis on 6380 and Mailpit on 8026 (UI) and 1026 (SMTP), so saas-starter can run next to other projects. If a port is taken, override it in a root `.env` (`SAAS_STARTER_POSTGRES_PORT`, `SAAS_STARTER_REDIS_PORT`, `SAAS_STARTER_MAILPIT_UI_PORT`, `SAAS_STARTER_MAILPIT_SMTP_PORT`). Then update `DATABASE_URL`, `REDIS_URL` or `SMTP_PORT` in `apps/server/.env` to match:

```bash
echo 'SAAS_STARTER_POSTGRES_PORT=5434' >> .env
bun run db:start
```

**Dependencies out of sync after `git pull`.** Run `rm -rf node_modules && bun install`, then `bun run db:migrate` if new migrations arrived.

E2E tests run on ports 3100/3101 against their own `<db>-e2e` database, so they never touch your dev servers or data.

## Working on the code

[AGENTS.md](./AGENTS.md) describes the architecture, boundaries, patterns and the step-by-step recipe for adding a feature. It is written for AI agents and humans alike — read it before contributing.

Git hooks (lefthook) are the quality gate; there is no CI:

- **pre-commit** — `ultracite fix` on staged files
- **commit-msg** — Conventional Commits
- **pre-push** — `bun run check`, then `bun run test:e2e` (skip e2e with `LEFTHOOK_EXCLUDE=e2e git push`)

## Deployment

The root `Dockerfile` builds one image: the server serves `/api/auth/*`, `/rpc/*`, `/health` and the built web app.

```bash
docker build -t saas-starter .
docker run --rm --env-file .env.production saas-starter bun apps/server/dist/migrate.js   # release step
docker run -d -p 3000:3000 --env-file .env.production saas-starter
```

Required environment (see `apps/server/.env.example`): `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET`, `APP_URL` (the public URL), and email settings (`FROM_EMAIL` plus `RESEND_API_KEY` or `SMTP_*`). Behind a reverse proxy that sets `X-Forwarded-For`, also set `TRUST_PROXY=true` so rate limits use the real client IP.

Run migrations as a separate release step before starting new containers; the server never migrates on boot, and the seed script refuses to run in production.
