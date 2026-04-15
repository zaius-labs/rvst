#!/bin/bash
echo "=== RVST 10k DOM Op Benchmark ==="
echo ""

# Build the benchmark bundle (it's already raw JS, just copy)
cp bench.js dist/bench.js

# Run headless with snapshot to capture result
echo "Running benchmark..."
(sleep 5; echo '{"cmd":"find","params":{"id":"bench-result"}}'; sleep 1; echo '{"cmd":"close"}') | \
    rvst dist/bench.js --test 2>/dev/null | grep "bench-result"

echo ""
echo "Done."
