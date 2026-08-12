# Oxlint policy

This repository treats Oxlint as an executable code policy: it should reject
unsafe or inconsistent patterns, while framework-supported patterns must not
need inline suppressions.

## Configuration ownership

- The repository root has no Oxlint configuration or JavaScript/TypeScript lint
  task. Turbo runs the app lint tasks.
- `/apps/web/.oxlintrc.json` is self-contained and owns the repository-wide
  invariants plus Next.js, React, StyleX, Vitest, Playwright, browser, and
  frontend architecture decisions.
- `/apps/api/.oxlintrc.json` is self-contained and owns the repository-wide
  invariants plus NestJS, Fastify, Jest, Node.js, and backend complexity
  decisions.
- Both apps enable the `correctness`, `pedantic`, `perf`, `style`, and
  `suspicious` categories as errors. `restriction` and `nursery` are not blanket
  enabled; rules from those categories need an individual justification.
- `oxlint` and `oxlint-tsgolint` are exact-pinned. Category membership can grow
  between releases, so every upgrade must review newly active diagnostics.

The following options are intentionally repeated in both app configurations:

- `denyWarnings` prevents a future warning-severity rule from silently passing
  CI.
- `reportUnusedDisableDirectives: error` makes stale suppression comments fail.
- `typeAware` enables rules that need TypeScript's type graph.
- `typeCheck` runs TypeScript compiler diagnostics in the same program as the
  type-aware rules. Both apps exact-pin TypeScript 7.0.2 to match the compiler
  used by `oxlint-tsgolint`, so `pnpm lint` owns the no-emit diagnostic gate.
  Separate `tsc --noEmit` tasks would repeat the same work.
- Web lint runs `next typegen` first. Generated `.next` files stay excluded from
  normal source linting, then `scripts/check-next-types.mjs` runs a compiler-only
  Oxlint pass against `.next/types/validator.ts`. This second pass is required for
  Next page, layout, and route contracts: ignored files do not contribute
  diagnostics to the normal pass. The wrapper supplies absolute paths because
  `oxlint-tsgolint` 7.0.2001 can panic while resolving a relative ignored path.
  Keep `.oxlint-next-typecheck.json` rule-free and the target limited to the
  generated validator.
- Framework builds remain independent safety checks and artifact producers.
  Next uses its TypeScript CLI backend, and the API uses the TypeScript 7 CLI to
  emit JavaScript, declarations, and source maps.

## Repository-wide invariants

Both app configurations enforce the same framework-neutral contracts:

- Avoid ambiguous control flow and legacy constructs: empty blocks, sequence
  expressions, `var`, `__proto__`, and parameter mutation are rejected.
- Keep module boundaries predictable: cycles, path concatenation, accumulating
  object spread, CommonJS `require` in application code, and type-only import
  side effects are rejected.
- Keep types explicit at unsafe boundaries: `any`, non-null assertions, empty
  object types, invalid `void`, truthiness shortcuts, and non-`unknown` promise
  rejection values are rejected.
- Promise failures must remain visible. Floating promises, promise conditions,
  and values returned from a void callback are rejected. `void promise` is not
  an escape hatch; handle or deliberately propagate the outcome.
- Prefer interfaces for object contracts, sort members within an import without
  alphabetizing import declarations, and sort arrays only after making a copy.

Some category rules are disabled to give one diagnostic a single owner:

| Disabled rule family | Diagnostic owner |
| --- | --- |
| `no-duplicate-imports` | `import/no-duplicates` |
| core implied-eval, throw, promise-rejection, and require-await variants | type-aware TypeScript variants |
| `typescript/ban-types`, `typescript/no-empty-interface` | the non-deprecated replacement rules |
| specialized non-null assertion rules | `typescript/no-non-null-assertion` |
| `typescript/prefer-find` | `unicorn/prefer-array-find` |
| Unicorn includes and string-boundary preferences | type-aware TypeScript variants |
| `no-misused-promises` spread and void-return checks | `typescript/no-misused-spread` and `typescript/strict-void-return` |

Other shared `off` rules are deliberate non-policies. The repository permits
function declarations and expressions, readable ternaries, `null` where an API
uses it, semantic object-key order, named or default exports, sequential
`await`, Node built-ins, and promise/callback APIs. Capitalization, comment
position, identifier regexes, and alphabetic key order are not reliable code
quality signals. Do not re-enable these rules merely to reduce the `off` list.

## Web policy

The web configuration keeps the five broad categories and then makes narrow
framework adjustments.

- Next.js entry points may use the framework's named function exports and
  multiple route exports. The repository-wide `func-style` policy therefore
  permits both declarations and expressions.
- React Compiler owns automatic memoization. Compiler rule violations are
  errors, but every optimization bailout is not. A blanket `react-perf` policy
  would reject normal JSX closures and object props, so it is not enabled.
- Raw DOM `style` and dangerous HTML are rejected. StyleX namespace imports and
  StyleX files' named exports are enforced. `react/no-danger` is the sole owner
  for dangerous HTML diagnostics.
- `jsx-props-no-spreading`, `no-null`, key sorting, and shallow JSX depth limits
  remain off because StyleX and semantic React markup require those patterns.
- Complexity and size metrics remain off for JSX, machine declarations, and
  tests. Splitting related render or state-machine logic only to satisfy a line
  count makes the code harder to read.
- Vitest and Playwright imports are mutually scoped to their configured files.
  Adding the Vitest plugin in the test override activates the app's categories
  for those files, including focused/disabled-test checks. Hooks are allowed,
  assertion counts are not required, explicit boolean assertions are allowed,
  and tests consistently use `test`.
- Production components cannot import TanStack Query's `useQuery` or
  `usePrefetchQuery` directly, or bind XState with `useActor`, `useActorRef`,
  `useMachine`, or `useSelector`. The query and machine-flow adapter modules are
  the only exceptions, preserving the ownership rules in
  `docs/frontend/state-management.md` without restricting `QueryClient`,
  `queryOptions`, `useQueryClient`, or provider imports.
- Playwright currently has no built-in Oxlint semantic plugin. Its files still
  receive the generic, import, and type-aware policies.
- The Babel config is the sole CommonJS exception. The installed Next.js Babel
  loader rejects `.mjs` and `.cjs` configs during a real production build, so a
  file-scoped config override is more accurate than an inline lint comment.

When changing framework entry-point patterns, read the installed documentation
under `apps/web/node_modules/next/dist/docs/` and run a small representative
lint probe before changing the policy.

## API policy

The API configuration adapts the shared policy to NestJS and Fastify.

- Capitalized calls are allowed because Nest decorators are factories, while
  lowercase constructors remain rejected.
- Decorated empty classes and constructor parameter properties are allowed and
  preferred because they are Nest module and dependency-injection conventions.
- `consistent-type-imports` is disabled for `src/**/*.ts`. Oxlint 1.75 can
  incorrectly convert a constructor dependency used by decorator metadata into
  a type-only import, breaking runtime injection.
- The Express-before-v5 async endpoint heuristic is disabled; Nest with Fastify
  owns endpoint rejection handling.
- General functions are limited to complexity 20, 100 logical lines, 20
  statements, and five parameters. Tests are exempt from the locality metrics,
  and Nest module composition roots may import up to 20 runtime dependencies.
- Explicitly typed public parameters are checked for readonly compatibility,
  but inferred callbacks and Nest constructor properties are not. This protects
  API contracts without requiring wrappers around mutable framework types.
- Unsafe typed values, missing exported return types, `console`, synchronous
  request-path I/O, and `process.exit()` are rejected. Bootstrap failures use
  Nest's `Logger` and set `process.exitCode`; `no-console` is the sole owner for
  console diagnostics.
- Jest globals and imports are rejected in production code. The Jest environment
  and plugin exist only in spec/test overrides, so semantic rules such as
  focused/disabled-test checks remain active without misclassifying production
  promises as hooks. Nest test lifecycle hooks are allowed; assertion counts,
  imported Jest globals, and lowercase suite titles are not required.

Lint cannot prove that external HTTP payloads match a TypeScript DTO. Runtime
validation and integration tests must own that boundary.

## Suppression policy

Use this order when a rule conflicts with real code:

1. Confirm the framework or library pattern against the installed version.
2. Reproduce the conflict in a minimal file and identify duplicate diagnostics.
3. Prefer a rule option that retains the useful part of the check.
4. Otherwise use the narrowest file-pattern override and record the reason here.
5. Use an inline disable only when configuration cannot express the exception.
   Scope it to one rule and one line, and state why the code is correct.

Never disable all rules, suppress a type error, or use a lint comment to avoid a
refactor. Unused suppression directives fail lint.

## Verification

From the repository root, run:

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm --filter api test:e2e
pnpm build
```

For a policy change, also create temporary positive and negative probes for the
affected pattern. Delete the probes before committing. `--print-config` is
useful for the base configuration, but Oxlint 1.75 does not fully display
file-override behavior; verify overrides by linting a matching file.
