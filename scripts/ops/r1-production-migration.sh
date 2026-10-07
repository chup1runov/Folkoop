#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-check}"
EXPECTED_PROJECT_REF="cwvhkdqsrbllsykhccmb"
HOSTED_R1_VERSION="20261007121210"
MIGRATION_FILE="20261007121210_folkoop_resource_planning_r1.sql"
MIGRATION_PATH="supabase/migrations/${MIGRATION_FILE}"
EXPECTED_GIT_BLOB="3d5073fb68c8dd1050814e5237bea1aa41216902"
FLAG_FILE="apps/web/network-config.js"

fail(){ printf 'R1_PRODUCTION_GUARD: %s\n' "$*" >&2; exit 1; }

[[ -f "$MIGRATION_PATH" ]] || fail "missing hosted R1 migration $MIGRATION_PATH"
command -v git >/dev/null || fail "git is required"

actual_blob="$(git hash-object "$MIGRATION_PATH")"
[[ "$actual_blob" == "$EXPECTED_GIT_BLOB" ]] || fail "migration SQL changed: $actual_blob"

grep -Eq '^[[:space:]]*resourcePlanningEnabled:false,[[:space:]]*$' "$FLAG_FILE" ||
  fail "resourcePlanningEnabled must remain false until hosted activation gates pass"

mapfile -t r1_files < <(
  find supabase/migrations -maxdepth 1 -type f -name '*_folkoop_resource_planning_r1.sql' -printf '%f\n' | sort
)
[[ "${#r1_files[@]}" -eq 1 && "${r1_files[0]}" == "$MIGRATION_FILE" ]] ||
  fail "expected exactly hosted R1 migration; found: ${r1_files[*]:-none}"

printf 'R1 post-apply static guard OK: project=%s hosted-version=%s blob=%s flag=off\n'   "$EXPECTED_PROJECT_REF" "$HOSTED_R1_VERSION" "$EXPECTED_GIT_BLOB"

case "$MODE" in
  check) exit 0 ;;
  dry-run|apply)
    fail "R1 production migration is already applied; repeat apply is disabled. Use hosted post-checks only."
    ;;
  *) fail "usage: $0 check" ;;
esac
