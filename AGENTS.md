# AGENTS.md

The single source of truth for how this codebase is built. Humans start at [README.md](./README.md); agents start here. Keep this file accurate — if code and this file disagree, fix one of them in the same change.

## Stack

- **Runtime / monorepo:** Bun 1.3, Turborepo.
- **Server (`apps/server`):** Hono, oRPC (`/rpc`, OpenAPI reference at `/api-reference` outside production), Better Auth (`/api/auth/*`), evlog logging.
- **Data:** Drizzle ORM + PostgreSQL, Redis (Better Auth secondary storage + rate limits).
- **Web (`apps/web`):** Vite, React 19, TanStack Router / Query / Form, shadcn/ui (Tailwind v4), Lingui (en/de/fr), next-themes, sonner.
- **Quality:** Biome via ultracite, Vitest, Playwright, fallow (dead code), `turbo boundaries`, lefthook. There is no CI — git hooks are the gate.

## Runtime topology

One origin. In production the server serves the built SPA (`apps/web/dist`) plus `/api/auth/*`, `/rpc/*` and `/health`. In development Vite (3001) proxies `/api` and `/rpc` to the server (3000), and the server redirects page requests to `APP_URL` instead of serving a possibly stale build. Consequences:

- No CORS, cookies are `sameSite: lax`, the web app has **no env vars** and uses relative URLs.
- `APP_URL` (server env) is the public origin users see: Better Auth `baseURL`, trusted origins, links in emails.
- `TRUST_PROXY=true` only behind a reverse proxy that sets `X-Forwarded-For`; otherwise the socket address is used for rate limiting.

## Layout and boundaries

```
apps/server     Hono entry: auth handler, oRPC handlers, health, static SPA, shutdown
apps/web        SPA
packages/api    procedure builders (index.ts) + routers/<resource>.ts + routers/index.ts (appRouter)
packages/auth   Better Auth config, permissions (roles/statements), Redis client
packages/db     Drizzle client, schema/<table>.ts, migrations, seed (dev only)
packages/email  sendEmail + escaped HTML templates
packages/env    server env validation (zod)
packages/i18n   Lingui catalogs + I18nProvider
packages/ui     shadcn/ui primitives, hooks, globals.css
packages/config siteConfig + shared tsconfig
```

Enforced by `turbo boundaries` (package tags in each `turbo.json`) and a Biome `noRestrictedImports` override for `apps/web`: server-only code (`@saas-starter/db`, `@saas-starter/email`, `@saas-starter/env/server`, `@saas-starter/auth` and `@saas-starter/auth/redis`) never reaches the browser; the one exception is `@saas-starter/auth/permissions`, which the web app uses for role checks. The web app imports router *types* from `@saas-starter/api` and talks to the server only through `lib/orpc.ts` and `lib/auth-client.ts`.

## Backend patterns

**Procedures** — pick the builder from `packages/api/src/index.ts`:

| Builder | Context it adds | Use for |
|---|---|---|
| `publicProcedure` | `session \| null` | public reads (e.g. `invitation.getPublic`) |
| `protectedProcedure` | `session` | user-scoped data |
| `orgProcedure` | `session`, `organizationId`, `role` | anything tenant-scoped (default for app data) |

Chain `.use(requirePermission({ resource: ["action"] }))` for authorization; statements and roles live in `packages/auth/src/permissions.ts`. Every org-scoped query filters by `context.organizationId` — never trust an id from input alone. Throw `ORPCError` with a standard code (`NOT_FOUND`, `FORBIDDEN`, `BAD_REQUEST`, …) and a plain-English message; the web app maps codes to translated copy.

Keep the API flat: one router file per resource, no repository/service layers (see [ADR-001](./docs/adr/001-flat-procedures.md)). Logic shared by several procedures goes in a plain function next to the router; logic shared by several packages becomes a package.

**Logging** — evlog. Per request: `c.get("log")` (Hono) is emitted automatically at the end of the request. Elsewhere: `log.info/warn/error({ action: "noun verb", ... })`. Never `console.*` in server code (Biome enforces it); CLI scripts may use it with a `biome-ignore` comment. Never log secrets, tokens or full emails.

**Env** — add server vars to `packages/env/src/server.ts` and document them in `apps/server/.env.example`.

**Email** — `sendEmail({ to, subject, html })` from `@saas-starter/email`; build HTML with the templates in `packages/email/src/templates` and escape every interpolated value with `escapeHtml`.

## Frontend patterns

```
apps/web/src/
  main.tsx               router + QueryClient; router context = { orpc, queryClient }
  routes/                THIN route files: path, validateSearch, beforeLoad/loader, render one feature component
  features/<feature>/    components + queries.ts (query option factories, mutation hooks) for one feature
  components/            app-wide only: app-shell, form, page-header, empty-state, confirm-dialog, …
  lib/                   auth-client, orpc, query-client, errors, redirect
```

- **Routing:** `_auth` = guest pages (redirects signed-in users), `_app` = authenticated shell (requires a session and an active organization, else `/onboarding`). Set `staticData: { title }` for the breadcrumb. Guards live in `features/auth/guards.ts`.
- **Data:** oRPC through TanStack Query only — `orpc.<router>.<proc>.queryOptions()` / `.mutationOptions()`, invalidate with `orpc.<router>.key()`. Loaders call `context.queryClient.ensureQueryData(...)`; components use `useSuspenseQuery`. Better Auth data has one factory per resource (`sessionQueryOptions`, `organizationQueries.*`). The session and active organization always come from the session — never pick `organizations[0]`.
- **Mutations:** failed mutations toast automatically (`lib/query-client.ts`); pass `meta: { toastError: false }` when the form shows the error inline. Sign-out clears the whole cache; switching organization resets it (cached data belongs to the previous org).
- **Forms:** `useAppForm` from `components/form.tsx` (TanStack Form + zod) with its field components; never hand-roll inputs + error state.
- **UI:** compose `@saas-starter/ui` primitives; add new ones with `bunx shadcn@latest add <name> -c packages/ui`. Don't fork primitives. Every page handles loading (skeletons), empty and error states; destructive actions use `ConfirmDialog`.
- **i18n:** all user-visible text goes through Lingui macros (`<Trans>`, `useLingui().t`). Never call `t` at module level — use `msg` descriptors for static arrays and translate at render time. This includes built-in labels in `@saas-starter/ui` primitives (extraction scans `apps/web` and `packages/ui`).
- **Style:** kebab-case files, named exports, no barrel files, no `"use client"`, route files under ~60 lines, real `<button>`/`<a>` with labels on icon buttons.

## Recipe: add a feature

The `project` feature is the reference implementation; copy its shape.

1. **Table:** `packages/db/src/schema/<name>.ts` (org-scoped: `organizationId` FK with cascade + index). Run `bun run db:generate`, review the SQL, then `bun run db:migrate`.
2. **Permissions:** add the resource's actions to `statement` and each role in `packages/auth/src/permissions.ts`.
3. **Router:** `packages/api/src/routers/<name>.ts` using `orgProcedure` + `requirePermission`; register it in `routers/index.ts`.
4. **Web:** `apps/web/src/features/<name>/` (components + `queries.ts` if needed) and a thin route in `routes/_app/<name>.tsx`; add a nav entry in `components/app-shell`.
5. **Copy:** `bun run i18n:extract`, translate the new `de`/`fr` entries in `packages/i18n/src/locales/*/messages.po`, then `bun run i18n:compile`.
6. **Tests:** unit tests next to the pure logic they cover (`<name>.test.ts`); extend `e2e/` for the user-facing flow.
7. **Done gate:** `bun run check` passes (types → lint → unit tests → boundaries → dead code → i18n), and `bun run test:e2e` for UI flows.

## Commands

| Command | Purpose |
|---|---|
| `bun run setup` | one-time bootstrap (env, Docker infra, migrations, seed, Playwright) |
| `bun run dev` | server :3000 + web :3001 |
| `bun run check` | full verification (pre-push runs this, then e2e) |
| `bun run fix` | format + autofix |
| `bun run test` / `test:e2e` | unit / Playwright (isolated ports 3100/3101 and `<db>-e2e` database) |
| `bun run db:generate` / `db:migrate` / `db:seed` / `db:studio` | Drizzle |
| `bun run i18n:extract` / `i18n:compile` | Lingui catalogs |

Seeded dev login: `admin@example.com` / `admin123`. Dev emails (verification, reset, invitations) land in Mailpit at http://localhost:8026.

## Rules for agents

- Read the reference implementation before writing a new feature; match its idioms instead of inventing new ones.
- Prefer deleting over adding. No speculative options, placeholder content, or comments that restate code.
- Don't add dependencies without a clear need; check what `@saas-starter/ui` and the existing stack already provide.
- Skills for each library live in `.agents/skills/<name>/SKILL.md`. Dependency sources can be inspected with `opensrc path <pkg>` when docs aren't enough.
