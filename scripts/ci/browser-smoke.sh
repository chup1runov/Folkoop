#!/usr/bin/env bash
set -euo pipefail
mkdir -p _qa
ln -sfn "$(pwd)/_site" _qa/Folkoop
python3 -m http.server 4173 --directory _qa >/tmp/folkoop-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
for _ in $(seq 1 20); do
 if curl -fsS http://127.0.0.1:4173/Folkoop/ >/dev/null; then break; fi
 sleep .25
done
export BASE_URL=http://127.0.0.1:4173/Folkoop/
python3 tests/support/city-regression.py tests/e2e/browser.py
python3 tests/support/city-regression.py tests/e2e/about-browser.py
python3 tests/e2e/folkoop-browser.py
python3 tests/e2e/guest-demo-browser.py
python3 tests/e2e/network-form-focus-browser.py
python3 tests/e2e/network-browser.py
python3 tests/e2e/marketplace-browser.py
python3 tests/e2e/purchase-lifecycle-browser.py
python3 tests/e2e/activity-chat-browser.py
python3 tests/e2e/navigation-ia-browser.py
python3 tests/e2e/theme-visual-browser.py
python3 tests/e2e/onboarding-browser.py
python3 tests/e2e/home-browser.py
python3 tests/e2e/home-welcome-browser.py
python3 tests/e2e/security-csp-browser.py
python3 tests/e2e/entry-welcome-audit-browser.py
python3 tests/e2e/onboarding-audit-browser.py
python3 tests/e2e/i18n-route-matrix-browser.py
