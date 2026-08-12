#!/usr/bin/env bash
set -euo pipefail

cd /workspace

PORT="${DEV_SERVER_PORT:-8080}"
PID_FILE="/tmp/vectordbpinecone-dev-server.pid"

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(cat "$PID_FILE")"
  if kill -0 "$existing_pid" 2>/dev/null; then
    echo "Dev server already running (pid ${existing_pid})."
    exit 0
  fi
  rm -f "$PID_FILE"
fi

nohup bash .cursor/scripts/run-dev-server.sh >/tmp/vectordbpinecone-dev-server.log 2>&1 &
echo "$!" >"$PID_FILE"

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "Dev server ready on http://127.0.0.1:${PORT}/"
    exit 0
  fi
  sleep 1
done

echo "Dev server failed to become ready within 30 seconds." >&2
tail -n 50 /tmp/vectordbpinecone-dev-server.log >&2 || true
exit 1
