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
pnpm test
pnpm test:coverage
pnpm test:watch
pnpm typecheck
pnpm start
```

Root commands run through Turbo. `lint` is strict, type-aware, and type-checks;
warnings fail the command. Build, type-check, test, and coverage results use the
local task cache; `format:check` and `lint` may cache their logs. The mutating
`format` and `lint:fix` tasks and the persistent `dev`, `start`, and `test:watch`
tasks are not cached. No remote cache is configured.

Unit and integration tests use Vitest's Node environment. Keep unit tests next
to their source as `*.test.ts` or `*.test.tsx`, and put integration tests under
`apps/web/tests/integration` as `*.integration.test.ts` or
`*.integration.test.tsx`. `test` runs once, `test:watch` stays open for local
development, and `test:coverage` writes V8 coverage reports under each
package's ignored `coverage` directory.

For direct application commands, use the package escape hatch:

```bash
pnpm --filter @repo/web dev
```

The main page is at `apps/web/src/app/page.tsx`.
