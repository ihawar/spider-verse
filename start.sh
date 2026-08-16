#!/usr/bin/env bash
set -e

# Spider-Verse Startup Script
# Starts the backend API, frontend dev server, and opens the browser

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="/tmp/spider-verse"
mkdir -p "$LOG_DIR"

echo "[Spider-Verse] Starting..."

# Start Express API server
cd "$APP_DIR"
npx tsx server/index.ts > "$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo "[Spider-Verse] API server PID: $SERVER_PID"

# Start Vite dev server
npx vite > "$LOG_DIR/vite.log" 2>&1 &
VITE_PID=$!
echo "[Spider-Verse] Vite dev server PID: $VITE_PID"

# Wait for Vite to be ready
echo "[Spider-Verse] Waiting for Vite to be ready..."
for i in $(seq 1 30); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "[Spider-Verse] Vite is ready!"
    break
  fi
  sleep 1
done

# Open browser
if command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:5173 &
elif command -v open &> /dev/null; then
  open http://localhost:5173 &
elif command -v gnome-open &> /dev/null; then
  gnome-open http://localhost:5173 &
fi

echo "[Spider-Verse] Running. Logs at $LOG_DIR"
echo "[Spider-Verse] API: http://localhost:3001"
echo "[Spider-Verse] App: http://localhost:5173"

# Keep the script alive so PIDs don't get reaped
wait
