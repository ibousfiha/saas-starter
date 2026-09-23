# Project E2E Testing (SaaS Starter)

## Where tests live

All e2e tests go in `e2e/`. The Playwright config is at `playwright.config.ts`.

## How to run

```bash
bun run test:e2e      # all e2e tests (also runs on pre-push; skip with LEFTHOOK_EXCLUDE=e2e)
bun run test:e2e:ui   # Playwright UI mode
PWHEADED=true bun run test:e2e   # visible browser
```

Playwright starts its own servers — never the dev servers:

- API on `http://localhost:3100`, web on `http://localhost:3101` (`baseURL`)
- Database `<DATABASE_URL name>-e2e`, created, migrated and seeded by `scripts/setup/e2e-db.sh` before the API starts
- Only Docker infra must be up (`bun run db:start`); `DATABASE_URL` is read from `apps/server/.env`

To explore the app with `playwright-cli` while developing, use the dev server (`bun run dev`, `http://localhost:3001`).

## Test structure

```
e2e/
├── fixtures.ts         # Shared test fixtures (page setup, auth helpers)
├── seed.spec.ts        # Seed test — starting point for spec-driven testing
├── auth/               # Auth flows
├── organization/       # Organization management
└── ...
```

### Fixtures

The base fixture in `fixtures.ts` navigates to the app root before each test.
Extend it with auth helpers as needed:

```typescript
import { test as baseTest } from "@playwright/test";

export const test = baseTest.extend({
  // Add auth fixture: sign in before each test
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill("admin123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/");
    await use(page);
  },
});
```

## Auth in e2e tests

This project uses Better Auth with session cookies. For tests that need authentication:

1. **Sign in through the UI** — use the sign-in form in `beforeEach` or a fixture.
2. **Set session cookie directly** — if you need to bypass the UI, set the `better-auth.session_token` cookie:

```typescript
await page.context().addCookies([
  {
    name: "better-auth.session_token",
    value: "<session-token-value>",
    domain: "localhost",
    path: "/",
  },
]);
```

## Best practices

- **Seed test**: Always use `seed.spec.ts` as the starting point for spec-driven testing with `playwright-cli`.
- **Isolated tests**: Each test should be independent. Don't chain scenarios.
- **Semantic locators**: Prefer `getByRole`, `getByLabel`, `getByTestId` over CSS selectors.
- **Avoid sleeps**: Use `waitForURL`, `waitForSelector`, or `toBeVisible` assertions instead.
- **Auth state**: If multiple tests need authentication, use Playwright's storage state to reuse login:

```bash
# Capture auth state once
playwright-cli open http://localhost:3001/sign-in
# sign in manually
playwright-cli cookie-list  # verify session cookie exists
playwright-cli state-save auth.json
```

## New test workflow

1. Write a spec in `specs/<feature>.plan.md` following the [spec-driven testing](spec-driven-testing.md) template.
2. Run the seed test in debug mode: `bunx playwright test e2e/seed.spec.ts --debug=cli`
3. Attach with `playwright-cli` and explore the app.
4. Generate the test using the spec as a guide.
5. Save the test file under `e2e/<group>/<scenario>.spec.ts`.
6. Run the test: `bun run test:e2e`.
