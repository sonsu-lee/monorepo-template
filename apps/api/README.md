# API

NestJS 11 API running on Fastify. This package is part of the repository's pnpm
workspace and is managed through Turborepo.

## Development

Run commands from the repository root:

```bash
pnpm --filter api dev
```

The API listens on `0.0.0.0:3001` by default. Override the bind address with
`HOST` and the port with `PORT`.

## Commands

| Command                           | Purpose                         |
| --------------------------------- | ------------------------------- |
| `pnpm --filter api dev`           | Start the API in watch mode     |
| `pnpm --filter api build`         | Build the production output     |
| `pnpm --filter api typecheck`     | Run the TypeScript type checker |
| `pnpm --filter api lint`          | Run Oxlint                      |
| `pnpm --filter api format:check`  | Check formatting with Oxfmt     |
| `pnpm --filter api test`          | Run unit tests                  |
| `pnpm --filter api test:e2e`      | Run Fastify end-to-end tests    |
| `pnpm --filter api test:coverage` | Generate test coverage          |

## Starter endpoint

`GET /` returns `Hello World!`. The endpoint is intentionally small and serves
as a smoke test for the NestJS module, dependency injection, and Fastify adapter.
