# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile --ignore-scripts
RUN bun run --cwd apps/web build && bun run --cwd apps/server build

FROM oven/bun:1.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build --chown=bun:bun /app/apps/server/dist ./apps/server/dist
COPY --from=build --chown=bun:bun /app/apps/web/dist ./apps/web/dist
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD ["bun", "-e", "const r = await fetch(`http://localhost:${process.env.PORT}/health`); process.exit(r.ok ? 0 : 1)"]
# Release step (run once per deploy, before starting new containers): bun apps/server/dist/migrate.js
CMD ["bun", "apps/server/dist/index.js"]
