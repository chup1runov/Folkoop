-- FOLKOOP v0.31: versioned Pilot Terms / Privacy Notice acceptance gate.
-- First admission is fail-closed unless the authenticated user explicitly accepts
-- the active terms and acknowledges the active privacy notice.
begin;

alter table folkoop_private.pilots
 add column terms_version text,
 add column terms_accepted_at timestamptz,
 add column privacy_version text,
 add column privacy_acknowledged_at timestamptz;

alter table folkoop_private.pilots
 add constraint pilots_terms_pair check (
  (terms_version is null and terms_accepted_at is null)
  or
  (terms_version is not null and terms_accepted_at is not null)
 ),
 add constraint pilots_privacy_pair check (
  (privacy_version is null and privacy_acknowledged_at is null)
  or
  (privacy_version is not null and privacy_acknowledged_at is not null)
 ),
 add constraint pilots_terms_version_length check (
  terms_version is null or length(terms_version) between 1 and 80
 ),
 add constraint pilots_privacy_version_length check (
  privacy_version is null or length(privacy_version) between 1 and 80
 );

drop function public.fk_claim_pilot_invite(text);

create function public.fk_claim_pilot_invite(
 p_code text,
 p_terms_version text,
 p_accept_terms boolean,
 p_privacy_version text,
 p_ack_privacy boolean
) returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
 uid uuid:=auth.uid();
 cleaned text:=btrim(coalesce(p_code,''));
 terms text:=btrim(coalesce(p_terms_version,''));
 privacy text:=btrim(coalesce(p_privacy_version,''));
 required_terms constant text:='2026-09-29-v1';
 required_privacy constant text:='2026-09-29-v1';
 h text;
 claimed boolean;
 accepted_at timestamptz:=now();
begin
 if uid is null then
  raise insufficient_privilege using message='AUTH_REQUIRED';
 end if;

 if p_accept_terms is distinct from true or terms<>required_terms then
  raise insufficient_privilege using message='PILOT_TERMS_REQUIRED';
 end if;
 if p_ack_privacy is distinct from true or privacy<>required_privacy then
  raise insufficient_privilege using message='PILOT_PRIVACY_REQUIRED';
 end if;

 if exists(
  select 1 from folkoop_private.pilots
  where user_id=uid and enabled
 ) then
  update folkoop_private.pilots
  set
   terms_version=required_terms,
   terms_accepted_at=case
    when terms_version=required_terms and terms_accepted_at is not null
    then terms_accepted_at else accepted_at end,
   privacy_version=required_privacy,
   privacy_acknowledged_at=case
    when privacy_version=required_privacy and privacy_acknowledged_at is not null
    then privacy_acknowledged_at else accepted_at end
  where user_id=uid;
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

 insert into folkoop_private.pilots(
  user_id,enabled,
  terms_version,terms_accepted_at,
  privacy_version,privacy_acknowledged_at
 )
 values(
  uid,true,
  required_terms,accepted_at,
  required_privacy,accepted_at
 )
 on conflict(user_id) do update set
  enabled=true,
  terms_version=excluded.terms_version,
  terms_accepted_at=excluded.terms_accepted_at,
  privacy_version=excluded.privacy_version,
  privacy_acknowledged_at=excluded.privacy_acknowledged_at;

 return true;
end
$$;

revoke all on function public.fk_claim_pilot_invite(text,text,boolean,text,boolean)
 from public,anon,authenticated;
grant execute on function public.fk_claim_pilot_invite(text,text,boolean,text,boolean)
 to authenticated;

create or replace function public.fk_claim_first_pilot() returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
 uid uuid:=auth.uid();
 required_terms constant text:='2026-09-29-v1';
 required_privacy constant text:='2026-09-29-v1';
begin
 if uid is null then
  raise insufficient_privilege using message='AUTH_REQUIRED';
 end if;
 if exists(
  select 1 from folkoop_private.pilots
  where user_id=uid
    and enabled
    and terms_version=required_terms
    and terms_accepted_at is not null
    and privacy_version=required_privacy
    and privacy_acknowledged_at is not null
 ) then
  return true;
 end if;
 if exists(
  select 1 from folkoop_private.pilots
  where user_id=uid and enabled
 ) then
  raise insufficient_privilege using message='PILOT_TERMS_REQUIRED';
 end if;
 raise insufficient_privilege using message='PILOT_INVITE_REQUIRED';
end
$$;

revoke all on function public.fk_claim_first_pilot()
 from public,anon,authenticated;
grant execute on function public.fk_claim_first_pilot()
 to authenticated;

commit;
