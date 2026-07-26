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

- Node.js 24 LTS (`24.18.0` or newer within the 24.x line)
- pnpm `11.15.1`

## Getting started

```bash
pnpm install
pnpm dev
```

Run a task for one application with a package filter:

```bash
pnpm --filter @repo/web dev
pnpm --filter api dev
```

## Commands

| Command              | Purpose                         |
| -------------------- | ------------------------------- |
| `pnpm build`         | Build all applications          |
| `pnpm format`        | Format workspace files          |
| `pnpm format:check`  | Check formatting                |
| `pnpm lint`          | Run strict, type-aware linting  |
| `pnpm lint:fix`      | Fix supported lint violations   |
| `pnpm typecheck`     | Type-check all applications     |
| `pnpm test`          | Run tests once                  |
| `pnpm test:watch`    | Run tests in watch mode         |
| `pnpm test:coverage` | Generate coverage reports       |
| `pnpm test:e2e`      | Run Playwright tests headlessly |
| `pnpm test:e2e:ui`   | Open Playwright UI              |

Install Chromium once before running the browser tests:

```bash
pnpm --filter @repo/web exec playwright install chromium
```

## Conventions

- [Frontend state and data flow](docs/frontend/state-management.md) defines the
  XState and TanStack Query ownership boundaries.
- Linting is strict and type-aware. Warnings fail the command.

## Recommended deployment

A typical production deployment for a project created from this template uses
the following services. The providers are recommendations and are not
preconfigured by the template.

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
