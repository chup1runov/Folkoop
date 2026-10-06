-- Post-candidate catalog audit. The existing pre-candidate audit is unchanged.
-- Explicitly reconcile its eight RLS helpers with FOUR reviewed R1 implementations.
create schema fk_r1_privilege_test;
create function fk_r1_privilege_test.assert_contract() returns void language plpgsql as $$
declare
  allowed text[]:=array[
    'folkoop_private.is_pilot()',
    'folkoop_private.chat_member(uuid)',
    'folkoop_private.coop_member(uuid)',
    'folkoop_private.is_blocked(uuid)',
    'folkoop_private.member_of(uuid)',
    'folkoop_private.shares_chat(uuid)',
    'folkoop_private.shares_cooperation(uuid)',
    'folkoop_private.selected_purchase_provider(uuid)',
    'folkoop_private.save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)',
    'folkoop_private.save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)',
    'folkoop_private.remove_resource_plan(text,uuid,uuid,integer)',
    'folkoop_private.resource_availability_revision(uuid)'
  ];
  surface text[]:=array[
    'public.fk_save_resource_requirement(uuid,uuid,uuid,text,text,numeric,text,timestamptz,timestamptz,text,integer)',
    'public.fk_save_resource_availability(uuid,text,numeric,text,timestamptz,timestamptz,text,integer)',
    'public.fk_remove_resource_requirement(uuid,uuid,integer)',
    'public.fk_remove_resource_availability(uuid,integer)',
    'public.fk_resource_availability_revision(uuid)',
    'public.fk_export_resource_planning(text,uuid,integer)'
  ];
  f text;
  o oid;
begin
  if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.prosecdef and n.nspname in ('public','folkoop_private')
    and (not ('search_path=""'=any(coalesce(p.proconfig,array[]::text[])))
      or has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('public',p.oid,'EXECUTE'))) then
    raise exception 'R1_PRIVILEGE_CONTRACT: unsafe definer search path or anonymous grant';
  end if;
  if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.prosecdef and n.nspname='public' and left(p.proname,3)='fk_'
    and not has_function_privilege('authenticated',p.oid,'EXECUTE')) then
    raise exception 'R1_PRIVILEGE_CONTRACT: public RPC grant missing';
  end if;
  if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.prosecdef and n.nspname='folkoop_private'
    and has_function_privilege('authenticated',p.oid,'EXECUTE')
    and not exists(select 1 from unnest(allowed) s where to_regprocedure(s)::oid=p.oid)) then
    raise exception 'R1_PRIVILEGE_CONTRACT: unreviewed private definer signature';
  end if;
  foreach f in array allowed loop
    o:=to_regprocedure(f)::oid;
    if o is null or not (select prosecdef from pg_proc where oid=o)
      or not has_function_privilege('authenticated',o,'EXECUTE') then
      raise exception 'R1_PRIVILEGE_CONTRACT: required private function missing or grant invalid';
    end if;
  end loop;
  foreach f in array surface loop
    o:=to_regprocedure(f)::oid;
    if o is null then raise exception 'R1_PRIVILEGE_CONTRACT: wrapper absent'; end if;
    if (select prosecdef or not ('search_path=""'=any(coalesce(proconfig,array[]::text[]))) from pg_proc where oid=o)
      or has_function_privilege('anon',o,'EXECUTE') or has_function_privilege('public',o,'EXECUTE')
      or not has_function_privilege('authenticated',o,'EXECUTE') then
      raise exception 'R1_PRIVILEGE_CONTRACT: wrapper must be pinned authenticated-only invoker';
    end if;
  end loop;
  if not (select relrowsecurity from pg_class where oid='folkoop_private.resource_plan_removals'::regclass)
    or has_table_privilege('authenticated','folkoop_private.resource_plan_removals','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
    or has_table_privilege('anon','folkoop_private.resource_plan_removals','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then
    raise exception 'R1_PRIVILEGE_CONTRACT: private receipt table exposed';
  end if;
end $$;
select fk_r1_privilege_test.assert_contract();
select fk_resource_test.ok(true,'post-candidate complete privilege audit passes');

-- Negative controls prove the audit fails closed, rather than only endorsing fixtures.
create function folkoop_private.r1_unreviewed() returns integer language sql security definer set search_path='' as 'select 1';
revoke all on function folkoop_private.r1_unreviewed() from public,anon,authenticated;
grant execute on function folkoop_private.r1_unreviewed() to authenticated;
select fk_resource_test.fails('select fk_r1_privilege_test.assert_contract()','P0001','audit rejects new unreviewed private helper');
drop function folkoop_private.r1_unreviewed();
create function folkoop_private.is_pilot(integer) returns boolean language sql security definer set search_path='' as 'select true';
revoke all on function folkoop_private.is_pilot(integer) from public,anon,authenticated;
grant execute on function folkoop_private.is_pilot(integer) to authenticated;
select fk_resource_test.fails('select fk_r1_privilege_test.assert_contract()','P0001','audit rejects overload of approved helper name');
drop function folkoop_private.is_pilot(integer);
alter function folkoop_private.resource_availability_revision(uuid) set search_path='public';
select fk_resource_test.fails('select fk_r1_privilege_test.assert_contract()','P0001','audit detects unsafe search path');
alter function folkoop_private.resource_availability_revision(uuid) set search_path='';
grant execute on function folkoop_private.resource_availability_revision(uuid) to anon;
select fk_resource_test.fails('select fk_r1_privilege_test.assert_contract()','P0001','audit detects anonymous execution');
revoke all on function folkoop_private.resource_availability_revision(uuid) from anon;
revoke execute on function folkoop_private.is_pilot() from authenticated;
select fk_resource_test.fails('select fk_r1_privilege_test.assert_contract()','P0001','audit detects missing required RLS helper grant');
grant execute on function folkoop_private.is_pilot() to authenticated;
alter function public.fk_export_resource_planning(text,uuid,integer) security definer;
select fk_resource_test.fails('select fk_r1_privilege_test.assert_contract()','P0001','audit rejects export elevated past RLS');
alter function public.fk_export_resource_planning(text,uuid,integer) security invoker;
grant select on folkoop_private.resource_plan_removals to authenticated;
select fk_resource_test.fails('select fk_r1_privilege_test.assert_contract()','P0001','audit detects private receipt grant');
revoke select on folkoop_private.resource_plan_removals from authenticated;
select fk_r1_privilege_test.assert_contract();
select fk_resource_test.ok(true,'post-candidate audit restored after negative controls');
