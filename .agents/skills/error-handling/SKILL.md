---
name: error-handling
description: Full error flow from database to client — ORPCError taxonomy, Error Boundaries, toast patterns, retry strategies.
---

# Error Handling

Complete error flow from database to client, with patterns for each layer.

## Error Flow Architecture

```
Drizzle error → Repository → Service (domain error) → Controller (ORPCError) → Client
```

Each layer transforms errors to the appropriate abstraction level.

## ORPCError Codes

| Code | HTTP Status | When to Use |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate resource, version conflict |
| `PRECONDITION_FAILED` | 412 | Business rule violation |
| `BAD_REQUEST` | 400 | Invalid input |
| `TOO_MANY_REQUESTS` | 429 | Rate limited |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Usage

```typescript
import { ORPCError } from "@orpc/server";

throw new ORPCError("NOT_FOUND", {
  message: "Todo not found",
  cause: originalError, // always pass the cause for debugging
});
```

## Service Layer Error Patterns

Domain errors are thrown in the service layer:

```typescript
class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

function createTodoService(repo: TodoRepository) {
  return {
    async getById(id: string) {
      const todo = await repo.findById(id);
      if (!todo) throw new DomainError("Todo not found", "TODO_NOT_FOUND");
      return todo;
    },
  };
}
```

Controllers catch domain errors and map to ORPCError:

```typescript
controller.procedure = (input, context) => {
  try {
    return await service.getById(input.id);
  } catch (err) {
    if (err instanceof DomainError) {
      throw new ORPCError("NOT_FOUND", { message: err.message });
    }
    throw err;
  }
};
```

## React Error Boundaries

Wrap sections of UI with Error Boundaries to prevent total white screens:

```tsx
import { ErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={Fallback} onReset={() => window.location.reload()}>
  <UserProfile />
</ErrorBoundary>
```

## TanStack Query Error Handling

```typescript
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message);
    },
  }),
});

// Per-query error handling
const { data, error, isError, refetch } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
});
```

## Toast Notification Patterns (Sonner)

```tsx
import { toast } from "sonner";

// Operation errors
try {
  await createTodoMutation.mutateAsync({ text });
  toast.success("Todo created");
} catch (err) {
  toast.error(err instanceof Error ? err.message : "Failed to create todo");
}

// During mutation
const mutation = useMutation({
  mutationFn: createTodo,
  onError: (err) => toast.error(err.message),
  onSuccess: () => toast.success("Todo created"),
});
```

## When to Surface vs Swallow Errors

| Situation | Action |
|-----------|--------|
| Validation error | Surface to user immediately |
| Network error | Show toast + retry |
| Auth error | Redirect to login |
| Background sync | Log via evlog, optional toast |
| Analytics failure | Swallow with `.catch(() => {})` |
| Non-critical third-party | Log only |

## Retry Strategies

```typescript
// TanStack Query retry config
const query = useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  staleTime: 30_000,
});

// Manual retry with exponential backoff
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}
```

## Structured Error Logging with evlog

```typescript
import { evlog } from "@saas-starter/api/lib/evlog";

evlog.error("Operation failed", {
  operation: "createTodo",
  userId: context.user.id,
  error: err.message,
  duration: Date.now() - start,
});
```

Use evlog for all server-side errors. Never use `console.log` or `console.error` — the `noConsole` Biome rule will catch them.
