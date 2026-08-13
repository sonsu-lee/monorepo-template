# monorepo-template

[English](README.md) | [한국어](README.ko.md)

An opinionated TypeScript monorepo template with a Next.js frontend and a Hono
API, managed with pnpm workspaces and Turborepo.

## Included

| Area            | Path         | Stack                                          |
| --------------- | ------------ | ---------------------------------------------- |
| Web             | `apps/web`   | Next.js, React, StyleX, TanStack Query, XState |
| API             | `apps/api`   | Hono, Node.js                                  |
| Tooling         | Workspace    | Turborepo, TypeScript, oxfmt, oxlint           |
| Tests           | `apps/web`   | Vitest, Playwright                             |
| Shared packages | `packages/*` | Reserved for code shared across applications   |

## Requirements

- Node.js 24 LTS (`24.18.1` or newer within the 24.x line)
- pnpm `11.18.0`
- Docker Desktop or Docker Engine with Docker Compose v2 (required only for
  local object storage)

## Getting started

```bash
pnpm install
pnpm dev
```

Garage is optional and runs separately from the applications. Start it first
when working with object storage:

```bash
pnpm storage:up
```

Run a task for one application with a package filter:

```bash
pnpm --filter @repo/web dev
pnpm --filter api dev
```

## Commands

| Command               | Purpose                              |
| --------------------- | ------------------------------------ |
| `pnpm build`          | Build all applications               |
| `pnpm format`         | Format workspace files               |
| `pnpm format:check`   | Check formatting                     |
| `pnpm lint`           | Run strict, type-aware linting       |
| `pnpm lint:fix`       | Fix supported lint violations        |
| `pnpm typecheck`      | Type-check all applications          |
| `pnpm test`           | Run tests once                       |
| `pnpm test:watch`     | Run tests in watch mode              |
| `pnpm test:coverage`  | Generate coverage reports            |
| `pnpm test:e2e`       | Run Playwright tests headlessly      |
| `pnpm test:e2e:ui`    | Open Playwright UI                   |
| `pnpm storage:up`     | Start Garage and wait until healthy  |
| `pnpm storage:down`   | Stop Garage and preserve stored data |
| `pnpm storage:logs`   | Follow Garage logs                   |
| `pnpm storage:status` | Show Garage node and layout status   |
| `pnpm storage:reset`  | Delete all local object storage data |

Install Chromium once before running the browser tests:

```bash
pnpm --filter @repo/web exec playwright install chromium
```

## Local object storage

[Garage](https://garagehq.deuxfleurs.fr/) provides S3-compatible object storage
for local development. Docker must be running, and `pnpm dev` does not start
Garage automatically.

Start Garage and inspect its node status:

```bash
pnpm storage:up
pnpm storage:status
```

The local connection defaults are documented in `.env.example`:

| Variable                           | Local default                                                      |
| ---------------------------------- | ------------------------------------------------------------------ |
| `OBJECT_STORAGE_ENDPOINT`          | `http://127.0.0.1:3900`                                            |
| `OBJECT_STORAGE_REGION`            | `garage`                                                           |
| `OBJECT_STORAGE_BUCKET`            | `local-dev`                                                        |
| `OBJECT_STORAGE_ACCESS_KEY_ID`     | `GK0123456789abcdef0123456789abcdef`                               |
| `OBJECT_STORAGE_SECRET_ACCESS_KEY` | `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` |
| `OBJECT_STORAGE_FORCE_PATH_STYLE`  | `true`                                                             |

The S3 endpoint is `http://127.0.0.1:3900`, and the health endpoint is
`http://127.0.0.1:3903/health`. The fixed credentials are intentionally limited
to local development. Keep them in server-only configuration and never expose
them through a `NEXT_PUBLIC_*` variable.

`pnpm storage:down` removes the Garage containers and network but preserves the
named volumes. `pnpm storage:reset` deletes those volumes, permanently removing
all local objects and Garage metadata. The development key and `local-dev`
bucket are recreated the next time Garage starts.

Changing the initial bucket or credentials in `.env` does not update existing
Garage metadata. Run `pnpm storage:reset` to apply those changes.

This single-node setup uses a replication factor of one and provides no
redundancy or backup. Use it only for disposable local development data. It
does not configure AWS S3 or Cloudflare R2.

## Conventions

- [Frontend state and data flow](docs/frontend/state-management.md) defines the
  XState and TanStack Query ownership boundaries.
- Linting is strict and type-aware. Warnings fail the command.

## Recommended deployment

The Garage service described above is for local development only. A typical
production deployment for a project created from this template uses the
following services. The providers are recommendations and are not preconfigured
by the template.

| Area              | Service                  | Use                                              |
| ----------------- | ------------------------ | ------------------------------------------------ |
| Frontend          | Cloudflare Workers       | Deploy the Next.js application through OpenNext  |
| Backend           | Railway                  | Run the Hono API as a persistent Node.js service |
| Database          | Railway PostgreSQL       | Store transactional application data             |
| Object storage    | Cloudflare R2            | Store uploaded files and other objects           |
| Error monitoring  | Sentry                   | Collect frontend and backend errors              |
| Uptime and alerts | Better Stack             | Monitor public web and API health checks         |
| Metrics           | Railway built-in metrics | Monitor initial production resource usage        |

Add these services only when the project needs them:

| Need                                                 | Service          |
| ---------------------------------------------------- | ---------------- |
| Shared cache, rate limiting, locks, or sessions      | Upstash Redis    |
| Prometheus-compatible metrics and Grafana dashboards | Grafana Cloud    |
| High-volume event, log, or product analytics         | ClickHouse Cloud |
