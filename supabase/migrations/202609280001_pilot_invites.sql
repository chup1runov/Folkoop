-- FOLKOOP v0.24 invite-only pilot admission.
-- Replaces one-user bootstrap for new admissions while preserving existing pilot re-login.
begin;

create table folkoop_private.pilot_invites(
  code_hash text primary key check(code_hash ~ '^[0-9a-f]{64}$'),
  label text not null default '' check(length(label)<=120),
  enabled boolean not null default true,
  max_uses integer not null default 1 check(max_uses between 1 and 20),
  uses integer not null default 0 check(uses>=0 and uses<=max_uses),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

revoke all on folkoop_private.pilot_invites from public,anon,authenticated;

create function public.fk_claim_pilot_invite(p_code text) returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
 uid uuid:=auth.uid();
 cleaned text:=btrim(coalesce(p_code,''));
 h text;
 claimed boolean;
begin
 if uid is null then
  raise insufficient_privilege using message='AUTH_REQUIRED';
 end if;

 if exists(
  select 1 from folkoop_private.pilots
  where user_id=uid and enabled
 ) then
  return true;
 end if;

 if length(cleaned)<12 or length(cleaned)>120 then
  raise insufficient_privilege using message='PILOT_INVITE_REQUIRED';
 end if;

 h:=encode(extensions.digest(convert_to(cleaned,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended('folkoop:pilot-invite:'||h,0));

 update folkoop_private.pilot_invites
 set
  uses=uses+1,
  used_at=now(),
  enabled=case when uses+1>=max_uses then false else enabled end
 where code_hash=h
   and enabled
   and uses<max_uses
   and (expires_at is null or expires_at>now())
 returning true into claimed;

 if claimed is distinct from true then
  raise insufficient_privilege using message='PILOT_INVITE_REQUIRED';
 end if;

 insert into folkoop_private.pilots(user_id,enabled)
 values(uid,true)
 on conflict(user_id) do update set enabled=true;

 return true;
end
$$;

revoke all on function public.fk_claim_pilot_invite(text) from public,anon,authenticated;
grant execute on function public.fk_claim_pilot_invite(text) to authenticated;

-- Historical bootstrap name remains for compatibility but can no longer self-admit.
create or replace function public.fk_claim_first_pilot() returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then
  raise insufficient_privilege using message='AUTH_REQUIRED';
 end if;
 if exists(
  select 1 from folkoop_private.pilots
  where user_id=uid and enabled
 ) then
  return true;
 end if;
 raise insufficient_privilege using message='PILOT_INVITE_REQUIRED';
end
$$;

revoke all on function public.fk_claim_first_pilot() from public,anon,authenticated;
grant execute on function public.fk_claim_first_pilot() to authenticated;

commit;
