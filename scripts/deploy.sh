#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PM2_APP_NAME="me"
ECOSYSTEM="$ROOT/ecosystem.config.cjs"

run_with_secrets() {
  if command -v doppler >/dev/null 2>&1; then
    doppler run -- "$@"
  else
    "$@"
  fi
}

echo "==> Installing dependencies"
npm ci

echo "==> Building application"
run_with_secrets npm run build

mkdir -p logs

echo "==> Reloading PM2 process"
if run_with_secrets pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  run_with_secrets pm2 reload "$ECOSYSTEM" --update-env
else
  run_with_secrets pm2 start "$ECOSYSTEM"
fi

run_with_secrets pm2 save

echo "==> Deploy complete"
run_with_secrets pm2 status "$PM2_APP_NAME"
