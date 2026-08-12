# Shared Oxlint Configuration Implementation Plan

> **Status:** Superseded. The repository-root Oxlint configuration was removed;
> `apps/api/.oxlintrc.json` and `apps/web/.oxlintrc.json` now own complete,
> self-contained policies. See `docs/agent-references/oxlint-policy.md` for the
> current source of truth.

> Historical implementation plan. The current policy and rationale are defined
> in [`docs/agent-references/oxlint-policy.md`](../../agent-references/oxlint-policy.md);
> current configuration files are the source of truth.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Oxlint policy that is already identical in the web and API apps into one repository-root configuration without changing either app's lint behavior.

**Architecture:** The root `.oxlintrc.json` owns the shared built-in plugins, root-only Oxlint options, and rules whose configurations are identical in both apps. Each app keeps a nested `.oxlintrc.json` that explicitly extends the root and owns its environment, categories, ignores, framework plugins, overrides, and app-specific rules.

**Tech Stack:** Oxlint 1.75.0, oxlint-tsgolint 7.0.2001, pnpm workspaces, Turborepo, TypeScript 7

## Global Constraints

- Keep the configuration internal to this monorepo.
- Preserve the current effective API and web lint policies.
- Keep `env`, `categories`, `ignorePatterns`, and framework `settings` in app configs because Oxlint does not inherit them through `extends`.
- Keep `typeAware`, `typeCheck`, warning handling, and unused-disable handling in the repository-root config.
- Do not include `.pnpm-store/` or `mise.toml` in any commit.

---

### Task 1: Create the shared root configuration

**Files:**
- Create: `.oxlintrc.json`
- Modify: `package.json`
- Modify: `apps/api/package.json`
- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Rules and plugins currently configured identically in `apps/api/.oxlintrc.json` and `apps/web/.oxlintrc.json`.
- Produces: A root Oxlint config that both app configs can extend and one root-owned Oxlint toolchain version.

- [ ] **Step 1: Move Oxlint dependencies to the workspace root**

Run:

```bash
pnpm add --workspace-root --save-dev oxlint@latest oxlint-tsgolint@latest
pnpm --filter api remove oxlint oxlint-tsgolint
pnpm --filter @repo/web remove oxlint oxlint-tsgolint
```

Expected: root `package.json` owns both dependencies, app manifests no longer list them, and `pnpm-lock.yaml` resolves one version of each package.

- [ ] **Step 2: Create the root configuration**

Create `.oxlintrc.json` with:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["eslint", "import", "node", "oxc", "promise", "typescript", "unicorn"],
  "options": {
    "denyWarnings": true,
    "reportUnusedDisableDirectives": "error",
    "typeAware": true,
    "typeCheck": true
  },
  "rules": {
    "typescript/no-empty-object-type": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-import-type-side-effects": "error",
    "typescript/no-invalid-void-type": "error",
    "typescript/no-non-null-asserted-nullish-coalescing": "error",
    "typescript/no-non-null-assertion": "error",
    "typescript/no-require-imports": "error",
    "typescript/use-unknown-in-catch-callback-variable": "error",
    "import/no-cycle": "error",
    "node/no-path-concat": "error",
    "oxc/no-accumulating-spread": "error",
    "unicorn/no-abusive-eslint-disable": "error",
    "unicorn/no-useless-error-capture-stack-trace": "error",
    "unicorn/no-array-sort": ["error", { "allowAfterSpread": true }]
  }
}
```

Expected: the root owns only plugin, option, and rule policy shared by both apps.

### Task 2: Make both app configs extend the shared policy

**Files:**
- Modify: `apps/api/.oxlintrc.json`
- Modify: `apps/web/.oxlintrc.json`

**Interfaces:**
- Consumes: The repository-root `.oxlintrc.json`.
- Produces: Small app-specific configs whose merged result preserves the current API and web policies.

- [ ] **Step 1: Update the API config**

Add:

```json
"$schema": "../../node_modules/oxlint/configuration_schema.json",
"extends": ["../../.oxlintrc.json"],
"plugins": []
```

Remove the root-owned `options` object, common plugin list, and the fourteen common rules. Keep `env`, `categories`, `ignorePatterns`, and all API-only TypeScript rules.

- [ ] **Step 2: Update the web config**

Add:

```json
"$schema": "../../node_modules/oxlint/configuration_schema.json",
"extends": ["../../.oxlintrc.json"]
```

Set the app-specific plugins to:

```json
["jsdoc", "jsx-a11y", "nextjs", "react", "react-perf", "vitest"]
```

Remove the root-owned `options` object and fourteen common rules. Keep the browser and Node environments, Next settings, categories, ignore patterns, test overrides, frontend-only plugins, frontend-only rule configuration, and existing explicit rule exceptions.

### Task 3: Verify behavior and commit the commonization

**Files:**
- Verify: `.oxlintrc.json`
- Verify: `apps/api/.oxlintrc.json`
- Verify: `apps/web/.oxlintrc.json`
- Verify: `package.json`
- Verify: `apps/api/package.json`
- Verify: `apps/web/package.json`
- Verify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Root and nested Oxlint configurations from Tasks 1 and 2.
- Produces: A verified commonization commit with no application source changes.

- [ ] **Step 1: Validate dependency state**

Run:

```bash
pnpm install --frozen-lockfile
```

Expected: exit code 0 with no lockfile changes.

- [ ] **Step 2: Validate both app configs**

Run:

```bash
pnpm --filter api lint
pnpm --filter @repo/web lint
pnpm --filter api format:check
pnpm --filter @repo/web format:check
pnpm --filter api build
```

Expected: every command exits with code 0 and produces no application source changes.

- [ ] **Step 3: Validate the complete workspace**

Run:

```bash
pnpm lint
pnpm format:check
git diff --check
```

Expected: every command exits with code 0.

- [ ] **Step 4: Commit one coherent configuration change**

Stage only the root config, both nested configs, the three package manifests, the lockfile, and this plan. Commit with:

```bash
git commit -m "build: share oxlint configuration"
```

Expected: one commit that moves existing lint policy without changing application behavior.
