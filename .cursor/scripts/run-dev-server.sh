#!/usr/bin/env bash
set -euo pipefail

cd /workspace
exec python3 .cursor/scripts/dev-server.py
