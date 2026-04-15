#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

python3 "$SCRIPT_DIR/bench.py" \
  --rvst-bin "$ROOT/target/release/rvst" \
  --rvst-bundle "$ROOT/benchmarks/targets/rvst/dist/bench.js" \
  --electron-dir "$ROOT/benchmarks/targets/electron" \
  --tauri-bin "$ROOT/benchmarks/targets/tauri/src-tauri/target/release/bench-tauri" \
  --output "$ROOT/benchmarks/results/latest.json" \
  "$@"

echo ""
python3 "$SCRIPT_DIR/report.py" "$ROOT/benchmarks/results/latest.json"
