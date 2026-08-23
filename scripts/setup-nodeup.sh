#!/usr/bin/env bash

set -euo pipefail

node_version="$(<.node-version)"
shim_dir="${NODEUP_SHIM_DIR:-$HOME/.local/bin}"

nodeup override set "$node_version"
nodeup shim setup --dir "$shim_dir"

export PATH="$shim_dir:$PATH"

node_engine="$(node -p "require('./package.json').engines.node")"
pnpm_version="$(node -p "require('./package.json').packageManager.split('@')[1].split('+')[0]")"
actual_node_version="$(node --version)"
actual_pnpm_version="$(pnpm --version)"

test "$node_engine" = "^$node_version"
test "$actual_node_version" = "v$node_version"
test "$actual_pnpm_version" = "$pnpm_version"

printf '%s\n' "$actual_node_version" "$actual_pnpm_version"
