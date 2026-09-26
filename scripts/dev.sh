#!/usr/bin/env sh
set -eu
pnpm install
pnpm db:generate
pnpm dev
