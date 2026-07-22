# monorepo-template

This repository is a pnpm workspace monorepo orchestrated by Turborepo.

## Structure

- `apps/web` is the Next.js application.
- `packages/*` is reserved for shared packages.

## Requirements

- Node.js `20.19.x` or `>=22.12.0`
- pnpm `11.15.1`

## Commands

Run these from the repository root:

```bash
pnpm install
pnpm dev
pnpm build
pnpm format
pnpm format:check
pnpm typecheck
pnpm start
```

Root commands run through Turbo. Build and type-check results use the local
task cache; `format:check` caches its logs. The mutating `format` task and the
persistent `dev` and `start` tasks are not cached. No remote cache is
configured.

For direct application commands, use the package escape hatch:

```bash
pnpm --filter @repo/web dev
```

The main page is at `apps/web/src/app/page.tsx`.
