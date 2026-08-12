#!/usr/bin/env bash
set -euo pipefail

cd /workspace

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but not installed." >&2
  exit 1
fi

chmod +x .cursor/scripts/*.sh

echo "Install complete: python3 $(python3 --version 2>&1 | awk '{print $2}')"
