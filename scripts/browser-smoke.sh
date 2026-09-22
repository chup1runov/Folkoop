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

IOS_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1'

dump_route() {
  local route="$1"
  local marker="$2"
  local width="${3:-1280}"
  local height="${4:-900}"
  local ua="${5:-}"
  local profile
  profile="$(mktemp -d)"
  local args=(
    --headless=new
    --no-sandbox
    --disable-gpu
    --disable-dev-shm-usage
    "--window-size=${width},${height}"
    "--user-data-dir=${profile}"
    --virtual-time-budget=3500
    --dump-dom
  )
  if [[ -n "$ua" ]]; then args+=("--user-agent=$ua"); fi

  local dom
  dom="$("$CHROME" "${args[@]}" "http://127.0.0.1:4173/$route" 2>/tmp/chrome-stderr.log)"
  rm -rf "$profile"

  if ! grep -Fq "$marker" <<<"$dom"; then
    echo "Browser smoke failed for $route at ${width}x${height}; expected $marker" >&2
    cat /tmp/chrome-stderr.log >&2 || true
    exit 1
  fi
}

# Mobile-sized render for all four pilot surfaces.
dump_route "" 'id="homeIssue"' 390 844
dump_route "#rapportera" 'id="routeRoadReport"' 390 844
dump_route "#nara" 'id="openPlansList"' 390 844
dump_route "#beslut" 'id="decisionList"' 390 844

# Desktop shell still renders.
dump_route "" 'id="homeIssue"' 1280 900

# iPhone-like browser gets explicit Add to Home Screen guidance.
dump_route "" 'data-ios-install="true"' 390 844 "$IOS_UA"

echo "Browser smoke OK: mobile surfaces, desktop shell and iPhone install guidance rendered."
