---
name: vitest
description: Write and run tests in this project. Triggers when writing unit tests, integration tests, mocking dependencies, running test suites, or debugging test failures. Uses Vitest with Bun runner across all packages.
---

# Vitest Testing

This project uses Vitest with Bun as the test runner. Packages that need custom settings have their own `vitest.config.ts`.

## Test Configuration

| Setting | Value |
|---------|-------|
| Test runner | Bun (Vitest auto-detects) |
| Config location | `vitest.config.ts` per package |
| Globals | Enabled (`globals: true`) |
| UI packages | `environment: "jsdom"` |
| Server packages | Default (node-like) |

## Running Tests

```bash
# Run all tests across all packages
bun run test

# Run tests for a specific package
turbo run test --filter=@saas-starter/api

# Run tests once (no watch)
bun run test -- --run

# Run a single test file
bun vitest run packages/i18n/src/__tests__/server.test.ts

# Run with coverage
bun vitest run --coverage
```

## Test File Convention

Test files live next to the source they test, using `.test.ts`. Tests that need several files or fixtures go in a colocated `__tests__/` directory:

```
packages/i18n/src/
├── server.ts
├── detect.ts
└── __tests__/
    ├── server.test.ts     # Tests for ./server.ts
    └── detect.test.ts     # Tests for ./detect.ts
```

Packages with no tests yet still declare `"test": "vitest run --passWithNoTests"`, so `turbo run test` succeeds across the workspace.

## Mocking

Packages expose `create*` factories that take their dependencies as parameters, so tests inject mocks directly — no container setup:

```typescript
import { describe, expect, it, vi } from "vitest";
import { createEmail } from "@saas-starter/email";

describe("createEmail", () => {
  it("returns a noop service when no transport is configured", async () => {
    const email = createEmail({ from: "noreply@example.com" });
    await expect(
      email.sendWelcome({ to: "a@b.com", name: "A", verifyUrl: "https://x" })
    ).resolves.toBeUndefined();
  });
});
```

For module-level dependencies, mock the module instead:

```typescript
vi.mock("@saas-starter/db", () => ({
  db: { select: vi.fn() },
}));
```

`vi.clearAllMocks()` in `beforeEach` keeps state from leaking between tests.

## Testing oRPC Procedures

Procedures in `packages/api/src/routers/index.ts` are plain handler functions. Call them with a constructed context rather than standing up an HTTP server:

```typescript
import { appRouter } from "../routers/index";

const context = { auth, session: null, locale: "en" as const };

await expect(
  appRouter.getPublicInvitation.handler({ input: { id: "missing" }, context })
).rejects.toThrow();
```

Add tests next to the code as `*.test.ts`; each package runs them with `vitest run`.

## What to Test

- **Package factories**: the branch each option selects (e.g. Resend vs SMTP vs noop)
- **Pure helpers**: validation, locale detection, formatting, error mapping
- **Procedure handlers**: input validation and error codes for a constructed context

## What NOT to Test

- Hono middleware behavior (tested by hono itself)
- oRPC framework internals
- Better Auth session handling (tested by better-auth)
- Drizzle ORM internals
- Third-party library behavior without custom wrappers

## Turbo Integration

Tests run through Turborepo. The `test` task depends on `^build`:

```json
// turbo.json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

This ensures all upstream packages are built before tests run.

## What to Test

- **Repository**: DB query correctness (requires test DB)
- **Service**: Business logic, validation, edge cases
- **Controller**: Input validation, error responses
- **Module factory**: Wiring is correct (smoke test)

## What NOT to Test

- Hono middleware behavior (tested by hono itself)
- oRPC framework internals
- Better Auth session handling (tested by better-auth)
- Drizzle ORM internals
- Third-party library behavior without custom wrappers
