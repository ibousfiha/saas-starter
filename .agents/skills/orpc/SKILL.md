---
name: orpc
description: Write oRPC procedures and call them from the web app in this project. Triggers when adding or changing API procedures, auth/permission guards, API errors, or oRPC queries/mutations in React.
---

# oRPC in this project

The reference implementation is the `project` feature — read it before writing a new router:

- Server: `packages/api/src/routers/project.ts`
- Web: `apps/web/src/features/projects/`

## Layout

```
packages/api/src/
├── index.ts              Context, publicProcedure, protectedProcedure, orgProcedure, requirePermission
└── routers/
    ├── index.ts          appRouter = { invitation, project } + AppRouterClient type
    └── <resource>.ts     one router object per resource
apps/server/src/index.ts  mounts RPCHandler at /rpc and (non-production) OpenAPIHandler at /api-reference
apps/web/src/lib/orpc.ts  typed client + TanStack Query utils (`orpc`)
```

The request context is just `{ session }`, resolved once per request by the Hono `resolveSession` middleware.

## Procedure builders

| Builder | Context | Use for |
|---|---|---|
| `publicProcedure` | `session \| null` | public reads |
| `protectedProcedure` | `session` | user-scoped operations |
| `orgProcedure` | `session`, `organizationId`, `role` | tenant data (the default) |

```ts
import { orgProcedure, requirePermission } from "../index";

export const widgetRouter = {
	create: orgProcedure
		.use(requirePermission({ widget: ["create"] }))
		.input(z.object({ name: z.string().trim().min(1).max(100) }))
		.handler(async ({ context, input }) => {
			const [created] = await db
				.insert(widget)
				.values({ name: input.name, organizationId: context.organizationId })
				.returning();
			return created;
		}),
};
```

Rules:

- Always filter tenant data by `context.organizationId` (reads, updates and deletes).
- Add new permission statements in `packages/auth/src/permissions.ts` for every role.
- Register the router in `routers/index.ts`; no other wiring exists.

## Errors

Throw `ORPCError` with a standard code and a short plain-English message. The web app decides what to show based on the code (`apps/web/src/lib/errors.ts`), so never rely on the message for control flow.

| Code | Status | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | no session (handled by `protectedProcedure`) |
| `FORBIDDEN` | 403 | no active org / missing permission |
| `NOT_FOUND` | 404 | missing, or belongs to another organization |
| `CONFLICT` | 409 | duplicate / state conflict |
| `BAD_REQUEST` | 400 | invalid input beyond the zod schema |

Unexpected errors (5xx) are logged by the server's `onError` interceptor; don't log and rethrow.

## Web usage

```ts
import { orpc } from "@/lib/orpc";

// loader (route file)
loader: ({ context }) => context.queryClient.ensureQueryData(orpc.project.list.queryOptions()),

// component
const { data: projects } = useSuspenseQuery(orpc.project.list.queryOptions());

const queryClient = useQueryClient();
const create = useMutation(
	orpc.project.create.mutationOptions({
		onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.project.key() }),
	})
);
```

Failed mutations show a toast automatically (`lib/query-client.ts`); pass `meta: { toastError: false }` when the form renders the error inline.
