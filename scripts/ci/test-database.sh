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

# Bootstrap only the PostgreSQL/Supabase role primitives needed by the migrations.
run_sql supabase/tests/network-bootstrap.sql

# Migration filenames are timestamp-prefixed. C-locale glob ordering is therefore
# the migration order, and every newly committed migration automatically enters CI.
shopt -s nullglob
migrations=(supabase/migrations/*.sql)
if (("${#migrations[@]}" == 0)); then
  echo "No Supabase migrations found" >&2
  exit 1
fi
for file in "${migrations[@]}"; do
  run_sql "$file"
done

# Every network SQL test is automatically executed. Bootstrap is setup, not a test.
db_tests=(supabase/tests/network-*.sql)
for file in "${db_tests[@]}"; do
  [[ "$file" == "supabase/tests/network-bootstrap.sql" ]] && continue
  run_sql "$file"
done
