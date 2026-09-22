#!/usr/bin/env bash
set -euo pipefail

python3 -m http.server 4173 --directory _site >/tmp/sverinav-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:4173/ >/dev/null; then break; fi
  sleep .25
done

CHROME=""
for candidate in google-chrome chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then CHROME="$(command -v "$candidate")"; break; fi
done
if [[ -z "$CHROME" ]]; then echo "No Chromium-compatible browser found on runner" >&2; exit 1; fi

dump_route() {
  local route="$1"
  local marker="$2"
  local profile
  profile="$(mktemp -d)"
  local dom
  dom="$("$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage     --user-data-dir="$profile" --virtual-time-budget=3500 --dump-dom     "http://127.0.0.1:4173/$route" 2>/tmp/chrome-stderr.log)"
  rm -rf "$profile"
  if ! grep -Fq "$marker" <<<"$dom"; then
    echo "Browser smoke failed for $route; expected $marker" >&2
    cat /tmp/chrome-stderr.log >&2 || true
    exit 1
  fi
}

dump_route "" 'id="homeIssue"'
dump_route "#rapportera" 'id="routeRoadReport"'
dump_route "#nara" 'id="openPlansList"'
dump_route "#beslut" 'id="decisionList"'

echo "Browser smoke OK: home, Rapportera, Nära mig and Beslut rendered in headless Chrome."
