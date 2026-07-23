<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## StyleX

When writing or reviewing StyleX code, read and follow
`docs/agent-references/stylex-authoring.md`.

The local guide mirrors the official
[StyleX authoring guide](https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md)
and was synced on 2026-07-23.

## Frontend state and data flow

Before writing or reviewing React state, XState machines, TanStack Query code,
asynchronous actors, or prefetching under `apps/web`, read and follow
`docs/frontend/state-management.md`.

- XState owns local UI state, workflows, and editable drafts.
- TanStack Query owns server data, cache state, freshness, loading, errors, and
  refetching.
- Keep derived values derived; never mirror query data, status, or errors into
  machine context.
- Use `fromPromise` when a machine owns async timing and outcome, and keep
  TanStack Query hook constraints behind the query adapter boundary.
- Keep flow and API dependencies referentially stable; inject clients through
  a flow factory rather than storing them in machine context.
