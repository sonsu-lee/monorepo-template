# monorepo-template

This repository is a pnpm workspace monorepo.

## Structure

- `apps/web` is the Next.js application.
- `packages/*` is reserved for shared packages.

## Requirements

- Node.js `>=20.9.0`
- pnpm `10.33.2`

## Commands

Run these from the repository root:

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm start
```

The main page is at `apps/web/src/app/page.tsx`.
