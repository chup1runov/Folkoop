#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-check}"
EXPECTED_PROJECT_REF="cwvhkdqsrbllsykhccmb"
BASELINE_VERSION="20261004194921"
MIGRATION_FILE="20261006152958_folkoop_resource_planning_r1.sql"
MIGRATION_PATH="supabase/migrations/${MIGRATION_FILE}"
EXPECTED_GIT_BLOB="3d5073fb68c8dd1050814e5237bea1aa41216902"
FLAG_FILE="apps/web/network-config.js"

fail(){ printf 'R1_PRODUCTION_GUARD: %s\n' "$*" >&2; exit 1; }

[[ -f "$MIGRATION_PATH" ]] || fail "missing migration $MIGRATION_PATH"
[[ -f "$FLAG_FILE" ]] || fail "missing $FLAG_FILE"
command -v git >/dev/null || fail "git is required"

actual_blob="$(git hash-object "$MIGRATION_PATH")"
[[ "$actual_blob" == "$EXPECTED_GIT_BLOB" ]] || fail "migration blob changed: $actual_blob"

grep -Eq '^[[:space:]]*resourcePlanningEnabled:false,[[:space:]]*$' "$FLAG_FILE" ||
  fail "resourcePlanningEnabled must remain false before and during schema apply"

mapfile -t after_baseline < <(
  find supabase/migrations -maxdepth 1 -type f -name '[0-9]*_*.sql' -printf '%f\n' |
    awk -F_ -v base="$BASELINE_VERSION" 'substr($1,1,14)>base {print}' |
    sort
)
[[ "${#after_baseline[@]}" -eq 1 ]] ||
  fail "expected exactly one migration after hosted baseline; found ${#after_baseline[@]}: ${after_baseline[*]:-none}"
[[ "${after_baseline[0]}" == "$MIGRATION_FILE" ]] ||
  fail "unexpected pending migration: ${after_baseline[0]}"

printf 'R1 static guard OK: project=%s migration=%s blob=%s flag=off\n'   "$EXPECTED_PROJECT_REF" "$MIGRATION_FILE" "$EXPECTED_GIT_BLOB"

case "$MODE" in
  check)
    exit 0
    ;;
  dry-run|apply)
    ;;
  *)
    fail "usage: $0 [check|dry-run|apply]"
    ;;
esac

command -v supabase >/dev/null || fail "Supabase CLI is required"
[[ "$(supabase --version)" == "2.117.0" ]] ||
  fail "expected Supabase CLI 2.117.0; got $(supabase --version)"

PROJECT_REF_FILE="supabase/.temp/project-ref"
[[ -f "$PROJECT_REF_FILE" ]] ||
  fail "repository is not linked; run supabase link --project-ref $EXPECTED_PROJECT_REF first"
linked_ref="$(tr -d '\r\n' < "$PROJECT_REF_FILE")"
[[ "$linked_ref" == "$EXPECTED_PROJECT_REF" ]] ||
  fail "linked project mismatch: $linked_ref"

printf 'R1 remote dry-run against linked project %s\n' "$linked_ref"
supabase migration list
supabase db push --dry-run

if [[ "$MODE" == "dry-run" ]]; then
  printf 'R1 dry-run completed. No remote schema change requested.\n'
  exit 0
fi

[[ "${FOLKOOP_R1_PRODUCTION_CONFIRM:-}" == "APPLY_R1_TO_PRODUCTION" ]] ||
  fail "apply requires FOLKOOP_R1_PRODUCTION_CONFIRM=APPLY_R1_TO_PRODUCTION"

printf 'R1 APPLY requested for %s; feature flag remains off.\n' "$linked_ref"
supabase db push --yes
supabase migration list
printf 'R1 db push completed. Keep resourcePlanningEnabled=false until hosted post-checks pass.\n'
