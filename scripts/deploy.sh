#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_with_secrets() {
  if command -v doppler >/dev/null 2>&1; then
    doppler run -- "$@"
  else
    "$@"
  fi
}

mkdir -p .data

echo "==> Building and starting container"
run_with_secrets docker compose up -d --build --remove-orphans

echo "==> Pruning dangling images"
docker image prune -f >/dev/null

echo "==> Deploy complete"
docker compose ps
