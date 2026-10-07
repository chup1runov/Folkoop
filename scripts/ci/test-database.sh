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

# R1 DDL is now a normal migration. Exercise its behavior after all migrations
# have been applied to the disposable database; do not replay proposal DDL.
echo '==> R1 migration behavior + lifecycle + post-migration privilege contract'
{
  printf 'begin;\n'
  cat supabase/tests/resource-planning-v0.sql
  cat supabase/tests/resource-planning-lifecycle-v0.sql
  cat supabase/tests/resource-planning-privileges-v0.sql
  printf '\nrollback;\n'
} | psql_ci
