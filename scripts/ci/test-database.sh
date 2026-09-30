#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C

: "${DB_CONTAINER:?DB_CONTAINER must be set to the disposable PostgreSQL service container}"

psql_ci() {
  docker exec -i "$DB_CONTAINER" psql -U postgres -d folkoop_test -v ON_ERROR_STOP=1
}

run_sql() {
  local file="$1"
  echo "==> $file"
  psql_ci < "$file"
}

run_sql supabase/tests/network-bootstrap.sql

shopt -s nullglob
migrations=(supabase/migrations/*.sql)
if (("${#migrations[@]}" == 0)); then
  echo "No Supabase migrations found" >&2
  exit 1
fi
for file in "${migrations[@]}"; do
  run_sql "$file"
done

db_tests=(supabase/tests/network-*.sql)
for file in "${db_tests[@]}"; do
  [[ "$file" == "supabase/tests/network-bootstrap.sql" ]] && continue
  run_sql "$file"
done
