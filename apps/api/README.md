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

| Command                           | Purpose                           |
| --------------------------------- | --------------------------------- |
| `pnpm --filter api dev`           | Start the API in watch mode       |
| `pnpm --filter api build`         | Build the production output       |
| `pnpm --filter api lint`          | Lint and run compiler diagnostics |
| `pnpm --filter api format:check`  | Check formatting with Oxfmt       |
| `pnpm --filter api test`          | Run unit tests                    |
| `pnpm --filter api test:e2e`      | Run Fastify end-to-end tests      |
| `pnpm --filter api test:coverage` | Generate test coverage            |

## Starter endpoint

`GET /` returns `Hello World!`. The endpoint is intentionally small and serves
as a smoke test for the NestJS module, dependency injection, and Fastify adapter.

## Compiler tooling

Oxlint owns the no-emit TypeScript diagnostic gate. Production output is emitted
with the TypeScript 7 CLI, while Jest uses SWC with legacy decorator metadata so
Nest dependency injection behaves the same in tests. The Nest CLI's default
TypeScript builder and `ts-jest` are intentionally not used because they require
the programmatic compiler API that TypeScript 7.0 does not expose.
