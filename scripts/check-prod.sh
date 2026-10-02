#!/usr/bin/env bash
set -euo pipefail

# Post-deploy safety checks against the running production container.
# Run after starting/restarting the container. Exits nonzero (and stops the
# container) if a check fails.

APP_NAME="chesslog.me"
HOST_PORT=3002

echo "Waiting for the app to come up..."
for _ in $(seq 1 30); do
  if curl -sf -o /dev/null "http://127.0.0.1:$HOST_PORT"; then
    break
  fi
  sleep 1
done

# /dev-login logs in as any user with no auth check — it must 404 in
# production (gated on NODE_ENV === 'development'). Verify that on every
# deploy rather than trusting the code never regresses.
status=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$HOST_PORT/dev-login")
if [ "$status" != "404" ]; then
  echo "SECURITY: /dev-login returned $status instead of 404 — it must not be reachable in production." >&2
  echo "Stopping the container. Do not leave it running until this is fixed." >&2
  docker stop "$APP_NAME"
  exit 1
fi
echo "/dev-login confirmed 404 in production."
