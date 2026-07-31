#!/usr/bin/env bash
# Wish House — local dev server
# Usage: ./serve.sh [page]
#   ./serve.sh              → opens index.html
#   ./serve.sh conveyor     → opens conveyor.html

set -euo pipefail

PORT=8238
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIR="${SCRIPT_DIR}/web-demo"

# Validate that the web-demo directory exists
if [[ ! -d "$DIR" ]]; then
  echo "Error: web-demo directory not found at $DIR" >&2
  exit 1
fi

# Validate that python3 is available
if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is required but not found in PATH" >&2
  exit 1
fi

# Sanitise the page argument: allow only alphanumeric characters, hyphens, and
# underscores to prevent path-traversal and shell meta-character issues.
RAW_PAGE="${1:-index}"
if [[ ! "$RAW_PAGE" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "Error: invalid page name '${RAW_PAGE}'. Use only letters, digits, hyphens, or underscores." >&2
  exit 1
fi
PAGE="${RAW_PAGE}.html"

# Verify the requested HTML file exists
if [[ ! -f "${DIR}/${PAGE}" ]]; then
  echo "Error: ${PAGE} not found in ${DIR}" >&2
  exit 1
fi

URL="http://localhost:${PORT}/${PAGE}"

# Set up cleanup trap early, before starting any background processes
cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  echo
  echo "Server stopped."
  exit 0
}
trap cleanup INT TERM

# Kill any existing server on the same port
if command -v lsof >/dev/null 2>&1 && lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "Stopping existing server on port $PORT..."
  lsof -ti:"$PORT" | xargs -r kill 2>/dev/null || true
  sleep 0.5
fi

echo "Serving $DIR on http://localhost:$PORT"

# Start server in the background
python3 -m http.server "$PORT" --directory "$DIR" &
SERVER_PID=$!

# Brief wait to let the server bind before opening the browser
sleep 0.3
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "Error: server failed to start on port $PORT" >&2
  exit 1
fi

echo "Opening $URL"

# Open in default browser
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "Open $URL in your browser."
fi

echo "Press Ctrl-C to stop."
wait "$SERVER_PID"
