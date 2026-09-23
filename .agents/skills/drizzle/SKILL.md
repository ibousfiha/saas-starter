---
name: drizzle
description: Write Drizzle ORM schemas, queries, and migrations in this project. Triggers when creating database tables, writing repository queries, running migrations, or debugging database issues. Uses Drizzle ORM with PostgreSQL via node-postgres.
---

# Drizzle ORM

This project uses Drizzle ORM with PostgreSQL. The database client is created via a factory in `@saas-starter/db`. Schema tables use `snake_case` naming. All queries go through the repository layer.

## Architecture

```
packages/db/src/
├── index.ts              # createDb() factory + singleton
├── schema/
│   ├── index.ts          # Barrel export of all tables
│   ├── auth.ts           # Better Auth tables (user, session, account, verification)
│   └── todo.ts           # Feature tables
└── migrations/           # SQL migration files
```

## Schema Conventions

### Table naming

Tables use `snake_case` in PostgreSQL and `camelCase` in TypeScript:

```typescript
import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const todo = pgTable("todo", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Naming rules

| Element | Convention | Example |
|---------|-----------|---------|
| Table variable | `camelCase` | `userProfile` |
| Table name in DB | `snake_case` | `"user_profile"` |
| Columns in DB | `snake_case` | `"created_at"` |
| Columns in TS | `camelCase` | `createdAt` |
| Primary key | Always `id` | `serial("id").primaryKey()` |
| Timestamps | Always include `createdAt` + `updatedAt` | |
| Schema barrel | Re-export from `schema/index.ts` | |

### Indexes

Add indexes for frequently queried columns:

```typescript
import { pgTable, text, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
}, (table) => ({
  emailIdx: index("user_email_idx").on(table.email),
}));
```

### Relations

For related tables, define Drizzle relations referencing the parent table's primary key:

```typescript
// schema/todo.ts
export const todo = pgTable("todo", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  // ...
});
```

## Database Client

The DB client is created via a factory. Import from `@saas-starter/db`:

```typescript
import { db } from "@saas-starter/db";
import { todo } from "@saas-starter/db/schema/todo";
```

**Rule**: Apps must never import from `@saas-starter/db` directly. Database access goes through `@saas-starter/api` (repository layer). This is enforced by `turbo boundaries`.

## Query Patterns

All queries go through the repository layer. Use these patterns:

### Select

```typescript
// Get all rows
await db.select().from(todo);

// Get with condition
import { eq } from "drizzle-orm";
await db.select().from(todo).where(eq(todo.id, 1));

// Get single row (returns first match or undefined)
await db.select().from(todo).where(eq(todo.id, 1)).limit(1);
```

### Insert

```typescript
// Insert and return the created row
await db.insert(todo).values({ text: "buy milk" }).returning();

// Insert without returning
await db.insert(todo).values({ text: "buy milk" });
```

### Update

```typescript
await db.update(todo)
  .set({ completed: true })
  .where(eq(todo.id, 1));
```

### Delete

```typescript
await db.delete(todo).where(eq(todo.id, 1));
```

### Type inference

Use Drizzle's type helpers for repository interfaces:

```typescript
import type { todo } from "@saas-starter/db/schema/todo";

// Row type (what SELECT returns)
type Todo = typeof todo.$inferSelect;

// Insert type (what INSERT accepts)
type NewTodo = typeof todo.$inferInsert;
```

## Migrations

### Development workflow

```bash
# 1. Edit schema files in packages/db/src/schema/
# 2. Generate migration
bun run db:generate

# 3. Apply migration
bun run db:migrate
```

Migrations are the source of truth — don't use `drizzle-kit push`.

### When to use which

| Command | Use case |
|---------|----------|
| `db:generate` | Production — creates SQL migration from schema diff |
| `db:migrate` | Apply generated migration to database |

### Migration files

Migrations are stored in `packages/db/src/migrations/` as numbered SQL files. Never edit migration files manually — regenerate with `db:generate` if needed.

## New Table Checklist

When adding a new database table:

1. Create `packages/db/src/schema/<name>.ts` with `pgTable` definition
2. Export it from `packages/db/src/schema/index.ts`
3. Run `bun run db:generate` to create the migration
4. Run `bun run db:migrate` to apply it
5. Create the corresponding repository in the API package

## Docker (Local Development)

PostgreSQL runs via Docker Compose:

```bash
bun run db:start    # Start PostgreSQL + Redis + Mailpit
bun run db:stop     # Stop them
```

The database URL is in `apps/server/.env`:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mydb
```

## Common Pitfalls

- **Don't import `db` in apps** — use the repository pattern through `@saas-starter/api`
- **Don't use `pg` directly** — always use Drizzle's query builder
- **Don't write raw SQL** — use Drizzle's schema and query API. If raw SQL is unavoidable, use `db.execute(sql)`
- **Don't forget `await`** — Drizzle queries return promises
- **Don't call `$inferSelect` on a union of schemas** — infer on the specific table type
