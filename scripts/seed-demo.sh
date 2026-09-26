#!/usr/bin/env sh
set -eu
pnpm db:generate
pnpm db:seed
