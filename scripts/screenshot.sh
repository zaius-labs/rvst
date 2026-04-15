#!/bin/bash
# Capture the rvst window by CGWindowID and print the screenshot path.
# Usage: ./screenshot.sh [output.png]
#
# The script locates the rvst process, finds its main window via CoreGraphics
# (which works even when the window isn't front/focused), captures it, and
# prints the output path so the caller can read/analyze the image.

set -e

PROC="${RVST_PROC:-rvst}"
OUT="${1:-/tmp/rvst-screenshot-$(date +%s).png}"

# Find PID of the rvst binary (not the cargo wrapper)
PID=$(pgrep -x "$PROC" 2>/dev/null | head -1)
if [ -z "$PID" ]; then
  echo "ERROR: no '$PROC' process found" >&2
  exit 1
fi

# Find the main window (largest area with kCGWindowName set, or fallback to largest)
WINID=$(swift -e "
import Foundation
import CoreGraphics

let list = CGWindowListCopyWindowInfo([], kCGNullWindowID)! as! [[String: Any]]
var best: (id: Int, area: Int) = (0, 0)
for w in list {
    guard let pid = w[\"kCGWindowOwnerPID\"] as? Int, pid == $PID else { continue }
    guard let bounds = w[\"kCGWindowBounds\"] as? [String: Any] else { continue }
    let ww = bounds[\"Width\"] as? Int ?? 0
    let hh = bounds[\"Height\"] as? Int ?? 0
    let id  = w[\"kCGWindowNumber\"] as? Int ?? 0
    let named = (w[\"kCGWindowName\"] as? String ?? \"\") != \"\"
    let area = ww * hh
    if named && area > best.area { best = (id, area) }
}
if best.id == 0 {
    // fallback: largest window regardless of name
    for w in list {
        guard let pid = w[\"kCGWindowOwnerPID\"] as? Int, pid == $PID else { continue }
        guard let bounds = w[\"kCGWindowBounds\"] as? [String: Any] else { continue }
        let ww = bounds[\"Width\"] as? Int ?? 0
        let hh = bounds[\"Height\"] as? Int ?? 0
        let id  = w[\"kCGWindowNumber\"] as? Int ?? 0
        let area = ww * hh
        if area > best.area { best = (id, area) }
    }
}
print(best.id)
" 2>/dev/null | tail -1)

if [ -z "$WINID" ] || [ "$WINID" = "0" ]; then
  echo "ERROR: rvst window not found for PID $PID" >&2
  exit 1
fi

# Capture just that window (-l = window ID, -x = no sound)
screencapture -x -l "$WINID" "$OUT"
echo "$OUT"
