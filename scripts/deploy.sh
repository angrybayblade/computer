#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Building and starting container"
docker compose up -d --build --remove-orphans

echo "==> Pruning dangling images"
docker image prune -f >/dev/null

echo "==> Deploy complete"
docker compose ps
