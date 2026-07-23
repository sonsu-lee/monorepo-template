# monorepo-template

This repository is a pnpm workspace monorepo orchestrated by Turborepo.

## Structure

- `apps/web` is the Next.js application.
- `packages/*` is reserved for shared packages.

## Frontend conventions

- [State and data flow](docs/frontend/state-management.md) explains the
  XState and TanStack Query ownership boundaries.

## Requirements

- Node.js 24 LTS (`24.18.0` or newer within the 24.x line)
- pnpm `11.15.1`

## Commands

Run these from the repository root:

```bash
pnpm install
pnpm dev
pnpm build
pnpm format
pnpm format:check
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm start
```

Root commands run through Turbo. `lint` is strict, type-aware, and type-checks;
warnings fail the command. Build and type-check results use the local task
cache; `format:check` and `lint` may cache their logs. The mutating `format`
and `lint:fix` tasks and the persistent `dev` and `start` tasks are not cached.
No remote cache is configured.

For direct application commands, use the package escape hatch:

```bash
pnpm --filter @repo/web dev
```

The main page is at `apps/web/src/app/page.tsx`.
