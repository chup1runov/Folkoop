#!/usr/bin/env bash
set -euo pipefail
mkdir -p _qa
ln -sfn "$(pwd)/_site" _qa/Sverinav
python3 -m http.server 4173 --directory _qa >/tmp/sverinav-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:4173/Sverinav/ >/dev/null; then break; fi
  sleep .25
done
BASE_URL=http://127.0.0.1:4173/Sverinav/ python3 tests/browser.py
BASE_URL=http://127.0.0.1:4173/Sverinav/ python3 tests/about-browser.py
