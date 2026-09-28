-- Disposable PostgreSQL checks for FOLKOOP v0.24 invite-only pilot admission.
\set ON_ERROR_STOP on
begin;

create schema fk_boot_test;
create function fk_boot_test.ok(value boolean,label text) returns void language plpgsql as $$
begin
 if value is distinct from true then raise exception 'FAIL: %',label; end if;
 raise notice 'PASS: %',label;
end $$;
create function fk_boot_test.denied(statement text) returns boolean language plpgsql security definer set search_path='' as $$
begin
 execute statement;
 return false;
exception when insufficient_privilege then
 return true;
end $$;
grant usage on schema fk_boot_test to authenticated;
grant execute on function fk_boot_test.ok(boolean,text),fk_boot_test.denied(text) to authenticated;

insert into auth.users values
 ('99999999-9999-4999-8999-999999999999'),
 ('88888888-8888-4888-8888-888888888888'),
 ('77777777-7777-4777-8777-777777777777');

-- Operator creates codes out-of-band. Only hashes are stored.
insert into folkoop_private.pilot_invites(code_hash,label)
values
 (
  encode(extensions.digest(convert_to('FOLK-A-4J7K-P9Q2','UTF8'),'sha256'),'hex'),
  'pilot A'
 ),
 (
  encode(extensions.digest(convert_to('FOLK-B-8R3M-X6T1','UTF8'),'sha256'),'hex'),
  'pilot B'
 ),
 (
  encode(extensions.digest(convert_to('FOLK-X-EXPIRED-01','UTF8'),'sha256'),'hex'),
  'expired'
 );
update folkoop_private.pilot_invites
 set expires_at=now()-interval '1 minute'
 where label='expired';

set local role authenticated;

-- A consumes one valid invite.
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',true);
select fk_boot_test.ok(
 public.fk_claim_pilot_invite('FOLK-A-4J7K-P9Q2'),
 'first invited user is admitted'
);
select fk_boot_test.ok(
 public.fk_claim_pilot_invite(''),
 'existing pilot can re-enter without presenting a code'
);

-- B cannot enter with a wrong/expired code, then consumes its own code.
select set_config('request.jwt.claim.sub','88888888-8888-4888-8888-888888888888',true);
select fk_boot_test.ok(
 fk_boot_test.denied($q$select public.fk_claim_pilot_invite('WRONG-CODE-0000')$q$),
 'unknown invite is denied'
);
select fk_boot_test.ok(
 fk_boot_test.denied($q$select public.fk_claim_pilot_invite('FOLK-X-EXPIRED-01')$q$),
 'expired invite is denied'
);
select fk_boot_test.ok(
 public.fk_claim_pilot_invite('FOLK-B-8R3M-X6T1'),
 'second invited user is admitted independently'
);

-- C cannot self-admit through the old bootstrap and cannot reuse A's code.
select set_config('request.jwt.claim.sub','77777777-7777-4777-8777-777777777777',true);
select fk_boot_test.ok(
 fk_boot_test.denied('select public.fk_claim_first_pilot()'),
 'legacy first-pilot RPC no longer admits new users'
);
select fk_boot_test.ok(
 fk_boot_test.denied($q$select public.fk_claim_pilot_invite('FOLK-A-4J7K-P9Q2')$q$),
 'consumed one-time invite cannot be reused'
);

reset role;

select fk_boot_test.ok(
 (select count(*)=2 from folkoop_private.pilots where enabled),
 'exactly the two invited users are enabled pilots'
);
select fk_boot_test.ok(
 (select uses=1 and not enabled from folkoop_private.pilot_invites where label='pilot A'),
 'first invite is consumed and disabled'
);
select fk_boot_test.ok(
 (select uses=1 and not enabled from folkoop_private.pilot_invites where label='pilot B'),
 'second invite is consumed and disabled'
);

rollback;
