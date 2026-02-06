#!/bin/bash

# Kill other yarn dev processes for this project
# Usage: ./scripts/kill-dev.sh [-i]

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INTERACTIVE=false

while getopts "i" opt; do
  case $opt in
    i) INTERACTIVE=true ;;
    *) echo "Usage: $0 [-i]" && exit 1 ;;
  esac
done

# Find processes running next dev from this project directory
PIDS=$(pgrep -f "$PROJECT_DIR/node_modules/.bin/next dev" | grep -v $$)

if [ -z "$PIDS" ]; then
  echo "No yarn dev processes found for $PROJECT_DIR"
  exit 0
fi

echo "Found yarn dev processes for $PROJECT_DIR:"
for PID in $PIDS; do
  echo "  PID $PID: $(ps -p "$PID" -o command= 2>/dev/null)"
done

if [ "$INTERACTIVE" = true ]; then
  for PID in $PIDS; do
    CMD=$(ps -p "$PID" -o command= 2>/dev/null)
    read -rp "Kill PID $PID ($CMD)? [y/N] " REPLY
    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      kill "$PID" && echo "  Killed $PID"
    else
      echo "  Skipped $PID"
    fi
  done
else
  echo "Killing all..."
  for PID in $PIDS; do
    kill "$PID" && echo "  Killed $PID"
  done
fi
