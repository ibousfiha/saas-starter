# ADR-001: Flat oRPC Procedures over Layered Modules

- **Status:** Accepted (supersedes the earlier "Factory DI" design)
- **Date:** 2026-09-22
- **Deciders:** Project maintainers

## Context

The starter originally shipped a NestJS-inspired layered architecture. Every feature was meant to live in `packages/api/src/modules/<name>/` as six files — `schema`, `repository`, `service`, `controller`, `module`, plus a test — wired together by a hand-written factory chain:

```
controller(service(repository(db)))
```

`CONVENTIONS.md` mandated the layer order, `.dependency-cruiser.js` enforced it with rules matching `(controller)\.ts$`, `(service)\.ts$`, `(repository)\.ts$` and `modules/([^/]+)/`, and hygen scaffolds generated the six files.

The only feature ever built this way was the `todos` module. When it was removed, nothing replaced it. The API surface settled into three files:

```
packages/api/src/
├── context.ts          # createContext — session, auth, locale
├── index.ts            # publicProcedure / protectedProcedure / adminProcedure
└── routers/index.ts    # appRouter — the actual procedures
```

That left the documentation, the dependency-cruiser rules, and the code generator describing a structure with zero instances in the codebase. The architecture gates still ran and still passed — they were validating patterns that matched no files, giving false confidence in `bun run check`.

## Decision

Keep the API flat. Procedures are defined directly in `packages/api/src/routers/index.ts` using the procedure builders in `packages/api/src/index.ts`, validated with Zod, and added to `appRouter`.

Remove the supporting fiction:

- Deleted `.dependency-cruiser.js` and the `check-architecture` / `depcruise` steps from `bun run check` — their rules matched no files.
- Deleted the code generators (hygen) and the `generate:*` scripts.
- Documented the real structure (now in `AGENTS.md`).

Update (2026-09): the `project` router (`packages/api/src/routers/project.ts`) is now the reference feature. Procedures are grouped one router file per resource and composed in `routers/index.ts`; tenant scoping and authorization are middleware (`orgProcedure`, `requirePermission`) rather than layers. Packages export plain module singletons (`db`, `auth`, `redis`, `sendEmail`) — tests mock the module instead of injecting factories.

Business logic that outgrows a single handler should become a plain function next to the router, or a **new package** when several packages need it — not a new layer inside `packages/api`.

## Consequences

**Positive**

- Documentation and tooling match reality; `bun run check` no longer reports green on gates that check nothing.
- Adding an endpoint is one router edit instead of five files.
- Fewer concepts for contributors and agents to hold in mind.

**Negative**

- No enforced separation between HTTP concerns and business logic inside `packages/api`. Acceptable while routers stay small; revisit if a router passes a few hundred lines.
- If the API grows substantially, extraction into packages is a manual refactor.

**Neutral**

- `turbo boundaries` validates workspace declarations, circular dependencies and package tags (`app-web`, `app-server`, `server-lib`, `client-lib`, `shared-lib`).

## Alternatives Considered

1. **Implement the layered architecture as documented.** Rejected: it would add four files of indirection per feature to a codebase whose entire API is one router, and the layering existed to serve a `todos` module that no longer exists.
2. **Leave the docs and rules in place.** Rejected: it makes the architecture gates meaningless and misleads every new contributor and agent.
3. **Adopt a DI container (tsyringe / InversifyJS).** Rejected: decorators and `reflect-metadata` buy nothing here; module singletons plus module mocking in tests are sufficient.
