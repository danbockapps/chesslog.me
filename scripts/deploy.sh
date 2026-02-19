#!/bin/bash
set -euo pipefail

# Run from project root regardless of where the script is invoked from
cd "$(dirname "$0")/.."

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
APP_NAME="chesslog.me"
IMAGE_NAME="chesslog.me"
DATA_DIR="/var/lib/chesslog.me"
HOST_PORT=3001
ENV_FILE="/etc/chesslog.me/env"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()   { echo -e "${GREEN}[$(date '+%H:%M:%S')] $*${NC}"; }
warn()  { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARN: $*${NC}"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $*${NC}" >&2; }

# ---------------------------------------------------------------------------
# Load environment variables from env file
# ---------------------------------------------------------------------------
if [[ -f "$ENV_FILE" ]]; then
  log "Loading env from $ENV_FILE"
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
else
  warn "Env file not found at $ENV_FILE — LICHESS_TOKEN must already be in environment"
fi

if [[ -z "${LICHESS_TOKEN:-}" ]]; then
  error "LICHESS_TOKEN is not set. Add it to $ENV_FILE or export it before running this script."
  exit 1
fi

# ---------------------------------------------------------------------------
# 1. Git pull
# ---------------------------------------------------------------------------
log "Pulling latest code..."
git pull

# ---------------------------------------------------------------------------
# 2. Build images
#    Build the builder stage first (has drizzle-kit for migrations),
#    then build the full production image (reuses cached builder layers).
# ---------------------------------------------------------------------------
log "Building builder image (for migrations)..."
docker build --target builder -t "$IMAGE_NAME:builder" .

log "Building production image..."
docker build -t "$IMAGE_NAME:latest" .

# ---------------------------------------------------------------------------
# 3. Ensure data directory exists
# ---------------------------------------------------------------------------
log "Ensuring data directory $DATA_DIR exists..."
mkdir -p "$DATA_DIR"

# ---------------------------------------------------------------------------
# 4. Run database migrations
#    Uses the builder image which has drizzle-kit installed.
# ---------------------------------------------------------------------------
log "Running database migrations..."
docker run --rm \
  -v "$DATA_DIR:/app/data" \
  -e DATABASE_PATH=/app/data/database.db \
  -e LICHESS_TOKEN="$LICHESS_TOKEN" \
  "$IMAGE_NAME:builder" \
  sh -c "cd /app && yarn drizzle-kit migrate"

# ---------------------------------------------------------------------------
# 5. Tag current image as previous (enables manual rollback)
# ---------------------------------------------------------------------------
if docker image inspect "$IMAGE_NAME:previous" &>/dev/null; then
  docker rmi "$IMAGE_NAME:previous" || true
fi
if docker image inspect "$IMAGE_NAME:current" &>/dev/null; then
  docker tag "$IMAGE_NAME:current" "$IMAGE_NAME:previous"
fi
docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:current"

# ---------------------------------------------------------------------------
# 6. Stop and remove existing container (if any)
# ---------------------------------------------------------------------------
if docker ps -a --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
  log "Saving logs before container removal..."
  LOG_FILE="$DATA_DIR/logs/$(date '+%Y-%m-%dT%H:%M:%S').log"
  mkdir -p "$DATA_DIR/logs"
  docker logs "$APP_NAME" &>> "$LOG_FILE" || warn "Could not save logs"
  log "Stopping existing container..."
  docker stop "$APP_NAME" || warn "Container already stopped"
  docker rm "$APP_NAME"
else
  log "No existing container to remove"
fi

# ---------------------------------------------------------------------------
# 7. Start new container
# ---------------------------------------------------------------------------
log "Starting new container on port $HOST_PORT..."
docker run -d \
  --name "$APP_NAME" \
  --restart unless-stopped \
  -p "$HOST_PORT:3000" \
  -v "$DATA_DIR:/app/data" \
  -e DATABASE_PATH=/app/data/database.db \
  -e LICHESS_TOKEN="$LICHESS_TOKEN" \
  "$IMAGE_NAME:latest"

# ---------------------------------------------------------------------------
# 8. Health check
# ---------------------------------------------------------------------------
log "Waiting for app to start..."
sleep 5

if docker ps --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
  log "Deployment successful! App is running on port $HOST_PORT."
  log "Rollback with: docker stop $APP_NAME && docker rm $APP_NAME && docker run -d --name $APP_NAME --restart unless-stopped -p $HOST_PORT:3000 -v $DATA_DIR:/app/data -e DATABASE_PATH=/app/data/database.db -e LICHESS_TOKEN=\$LICHESS_TOKEN $IMAGE_NAME:previous"
else
  error "Container is not running. Check logs:"
  error "  docker logs $APP_NAME"
  exit 1
fi

# ---------------------------------------------------------------------------
# 9. Clean up dangling images
# ---------------------------------------------------------------------------
log "Cleaning up dangling images..."
docker image prune -f || warn "Image prune failed (non-fatal)"

log "Done."
