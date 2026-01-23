# In dev, start fresh with a new database.
# This script can be run from any directory. It backs up the existing data directory (if any)
# by renaming it with a timestamp, then creates a new data directory and runs migrations.
# The backups can be manually deleted later.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/data"

if [ -d "$DATA_DIR" ]; then
  mv "$DATA_DIR" "$PROJECT_ROOT/data-$(date +%Y%m%d-%H%M%S)"
fi

cd "$PROJECT_ROOT"
mkdir "$DATA_DIR"
yarn drizzle-kit migrate