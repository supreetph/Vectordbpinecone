#!/usr/bin/env bash
set -euo pipefail

cd /workspace

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but not installed." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required but not installed." >&2
  exit 1
fi

chmod +x .cursor/scripts/*.sh
npm install

echo "Install complete: node $(node --version), python3 $(python3 --version 2>&1 | awk '{print $2}')"
