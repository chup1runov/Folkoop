#!/usr/bin/env bash
set -euo pipefail
export SUPABASE_TELEMETRY_DISABLED=1
ROOT="$(pwd)"
TMP="$(mktemp -d)"
cleanup(){
  set +e
  if [[ -d "$TMP" ]]; then
    cd "$TMP"
    supabase stop --no-backup >/dev/null 2>&1 || true
    rm -rf "$TMP"
  fi
}
trap cleanup EXIT
cd "$TMP"
supabase init >/dev/null
rm -rf supabase/migrations
cp -R "$ROOT/supabase/migrations" supabase/migrations
supabase start --exclude studio,mail,storage,realtime,functions,analytics,pooler >/tmp/folkoop-supabase-start.log
supabase db reset >/tmp/folkoop-supabase-reset.log
supabase status --env --output-format text > /tmp/folkoop-supabase.env
set -a
# shellcheck disable=SC1091
source /tmp/folkoop-supabase.env
set +a
command -v psql >/dev/null
cd "$ROOT"
node tests/integration/resource-planning-local-supabase.mjs
