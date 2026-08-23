#!/usr/bin/env bash

set -euo pipefail

node_version="$(<.node-version)"

nodeup override set "$node_version"
nodeup shim setup

node --version
pnpm --version
