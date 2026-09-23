---
name: tanstack-router
description: TanStack Router best practices for type-safe routing, data loading, search params, and navigation. Activate when building React applications with file-based routing, TanStack Router, and SPA navigation patterns.
---

# TanStack Router Best Practices

Comprehensive guidelines for implementing TanStack Router patterns in React applications. These rules optimize type safety, data loading, navigation, and code organization.

## When to Apply

- Setting up application routing
- Creating new routes and layouts
- Implementing search parameter handling
- Configuring data loaders
- Setting up code splitting
- Integrating with TanStack Query
- Refactoring navigation patterns

## Rule Categories by Priority

| Priority | Category | Rules | Impact |
|----------|----------|-------|--------|
| CRITICAL | Type Safety | 4 rules | Prevents runtime errors and enables refactoring |
| CRITICAL | Route Organization | 5 rules | Ensures maintainable route structure |
| HIGH | Router Config | 1 rule | Global router defaults |
| HIGH | Search Params | 5 rules | Enables type-safe URL state |
| HIGH | Error Handling | 1 rule | Handles 404 and errors gracefully |
| MEDIUM | Navigation | 5 rules | Improves UX and accessibility |
| MEDIUM | Code Splitting | 3 rules | Reduces bundle size |
| MEDIUM | Preloading | 3 rules | Improves perceived performance |
| LOW | Route Context | 3 rules | Enables dependency injection |

## Quick Reference

### Type Safety (Prefix: `ts-`)

- **`ts-register-router`** — Register router type for global inference
- **`ts-use-from-param`** — Use `from` parameter for type narrowing
- **`ts-route-context-typing`** — Type route context with createRootRouteWithContext
- **`ts-query-options-loader`** — Use queryOptions in loaders for type inference

### Router Config (Prefix: `router-`)

- **`router-default-options`** — Configure router defaults (scrollRestoration, defaultErrorComponent, etc.)

### Route Organization (Prefix: `org-`)

- **`org-file-based-routing`** — Prefer file-based routing for conventions
- **`org-route-tree-structure`** — Follow hierarchical route tree patterns
- **`org-pathless-layouts`** — Use pathless routes for shared layouts
- **`org-index-routes`** — Understand index vs layout routes
- **`org-virtual-routes`** — Understand virtual file routes

### Search Params (Prefix: `search-`)

- **`search-validation`** — Always validate search params
- **`search-type-inheritance`** — Leverage parent search param types
- **`search-middleware`** — Use search param middleware
- **`search-defaults`** — Provide sensible defaults
- **`search-custom-serializer`** — Configure custom search param serializers

### Error Handling (Prefix: `err-`)

- **`err-not-found`** — Handle not-found routes properly

### Navigation (Prefix: `nav-`)

- **`nav-link-component`** — Prefer Link component for navigation
- **`nav-active-states`** — Configure active link states
- **`nav-use-navigate`** — Use useNavigate for programmatic navigation
- **`nav-relative-paths`** — Understand relative path navigation
- **`nav-route-masks`** — Use route masks for modal URLs

### Code Splitting (Prefix: `split-`)

- **`split-lazy-routes`** — Use `.lazy.tsx` for code splitting
- **`split-critical-path`** — Keep critical config in main route file
- **`split-auto-splitting`** — Enable autoCodeSplitting when possible

### Preloading (Prefix: `preload-`)

- **`preload-intent`** — Enable intent-based preloading
- **`preload-stale-time`** — Configure preload stale time
- **`preload-manual`** — Use manual preloading strategically

### Route Context (Prefix: `ctx-`)

- **`ctx-root-context`** — Define context at root route
- **`ctx-before-load`** — Extend context in beforeLoad
- **`ctx-dependency-injection`** — Use context for dependency injection

## Project Context

This project uses TanStack Router with file-based routing. Routes are defined in `apps/web/src/routes/` and the generated route tree is in `routeTree.gen.ts`. The router is configured in `apps/web/src/main.tsx`.

```typescript
// Type-safe links
import { Link } from "@tanstack/react-router";
<Link to="/todos" search={{ page: 1 }}>Todos</Link>

// Type-safe navigation
import { useNavigate } from "@tanstack/react-router";
const navigate = useNavigate();
navigate({ to: "/dashboard" });
```

## Full Reference

See individual rule files in `rules/` directory for detailed guidance and code examples.
