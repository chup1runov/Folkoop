-- Disposable CI test for one-time first-pilot bootstrap.
\set ON_ERROR_STOP on
begin;
create schema fk_boot_test;
create function fk_boot_test.ok(value boolean,label text) returns void language plpgsql as $$ begin if value is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function fk_boot_test.denied(statement text) returns boolean language plpgsql security definer set search_path='' as $$ begin execute statement; return false; exception when insufficient_privilege then return true; end $$;
grant usage on schema fk_boot_test to authenticated;
grant execute on function fk_boot_test.ok(boolean,text),fk_boot_test.denied(text) to authenticated;
insert into auth.users values('99999999-9999-4999-8999-999999999999'),('88888888-8888-4888-8888-888888888888');
set local role authenticated;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',true);
select fk_boot_test.ok(public.fk_claim_first_pilot(),'first authenticated user can claim the empty pilot slot');
select fk_boot_test.ok(public.fk_claim_first_pilot(),'first pilot can call bootstrap again idempotently');
select set_config('request.jwt.claim.sub','88888888-8888-4888-8888-888888888888',true);
select fk_boot_test.ok(fk_boot_test.denied('select public.fk_claim_first_pilot()'),'second authenticated user cannot self-admit');
reset role;
rollback;
