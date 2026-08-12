#!/usr/bin/env bash
set -euo pipefail

cd /workspace
exec node src/server.js
