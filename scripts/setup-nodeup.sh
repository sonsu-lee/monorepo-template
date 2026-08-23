#!/usr/bin/env bash

set -euo pipefail

nodeup override set "$(<.node-version)"
nodeup shim setup
