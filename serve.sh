#!/usr/bin/env bash
# Wish House — local dev server
# Usage: ./serve.sh [page]
#   ./serve.sh              → opens index.html
#   ./serve.sh conveyor     → opens conveyor.html

set -euo pipefail

PORT=8238
DIR="$(cd "$(dirname "$0")/web-demo" && pwd)"
PAGE="${1:-index}.html"
URL="http://localhost:${PORT}/${PAGE}"

# Kill any existing server on the same port
if lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "Stopping existing server on port $PORT..."
  kill "$(lsof -ti:"$PORT")" 2>/dev/null || true
  sleep 0.5
fi

echo "Serving $DIR on http://localhost:$PORT"
echo "Opening $URL"

# Start server in the background
cd "$DIR"
python3 -m http.server "$PORT" &
SERVER_PID=$!

# Open in default browser
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
elif command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "Open $URL in your browser."
fi

# Wait for Ctrl-C, then clean up
trap "kill $SERVER_PID 2>/dev/null; echo; echo 'Server stopped.'; exit 0" INT TERM
echo "Press Ctrl-C to stop."
wait "$SERVER_PID"
