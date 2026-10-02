#!/usr/bin/env bash
set -euo pipefail
mkdir -p _qa-webkit qa-output/webkit
ln -sfn "$(pwd)/_site" _qa-webkit/Folkoop
python3 -m http.server 4174 --directory _qa-webkit >/tmp/folkoop-webkit-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
for _ in $(seq 1 30); do
 if curl -fsS http://127.0.0.1:4174/Folkoop/ >/dev/null; then break; fi
 sleep .25
done
export BASE_URL=http://127.0.0.1:4174/Folkoop/
export BROWSER_ENGINE=webkit
export QA_OUTPUT=qa-output/webkit
python3 tests/e2e/onboarding-browser.py
python3 tests/e2e/entry-welcome-audit-browser.py
python3 tests/e2e/onboarding-audit-browser.py
