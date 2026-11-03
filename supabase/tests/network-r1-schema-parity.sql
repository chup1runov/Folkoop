-- Already-hosted R1 schema parity. Disposable PostgreSQL only.
-- No business data, pilot acceptance or R1 UI activation is inferred.
do $r1_parity$
begin
 if to_regclass('public.fk_resource_requirements') is null
    or to_regclass('public.fk_resource_availability') is null
    or to_regclass('folkoop_private.resource_plan_removals') is null then
  raise exception 'R1_TRACKED_MIGRATION_MISSING';
 end if;
 if not (select bool_and(c.relrowsecurity) from pg_catalog.pg_class c
         where c.oid in('public.fk_resource_requirements'::regclass,
                        'public.fk_resource_availability'::regclass,
                        'folkoop_private.resource_plan_removals'::regclass)) then
  raise exception 'R1_PRIVATE_OR_PUBLIC_RLS_MISSING';
 end if;
 if not has_table_privilege('authenticated','public.fk_resource_requirements','SELECT')
    or not has_table_privilege('authenticated','public.fk_resource_availability','SELECT')
    or has_table_privilege('anon','public.fk_resource_requirements','SELECT')
    or has_table_privilege('anon','public.fk_resource_availability','SELECT')
    or has_table_privilege('authenticated','public.fk_resource_requirements','INSERT')
    or has_table_privilege('authenticated','public.fk_resource_availability','UPDATE')
    or has_table_privilege('authenticated','folkoop_private.resource_plan_removals','SELECT')
    or has_table_privilege('anon','folkoop_private.resource_plan_removals','SELECT') then
  raise exception 'R1_EXPOSURE_BOUNDARY_CHANGED';
 end if;
 if not has_function_privilege('authenticated',
    'public.fk_save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)',
    'EXECUTE')
    or has_function_privilege('anon',
    'public.fk_save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)',
    'EXECUTE') then
  raise exception 'R1_EXPLICIT_RPC_AUTHORIZATION_CHANGED';
 end if;
 raise notice 'R1_ALREADY_HOSTED_SCHEMA_PARITY_VERIFIED';
end
$r1_parity$;
