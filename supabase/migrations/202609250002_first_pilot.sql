begin;
create function public.fk_claim_first_pilot() returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then
  raise insufficient_privilege using message='AUTH_REQUIRED';
 end if;
 perform pg_advisory_xact_lock(hashtextextended('folkoop:first-pilot',0));
 if exists(select 1 from folkoop_private.pilots where enabled) then
  if exists(select 1 from folkoop_private.pilots where user_id=uid and enabled) then return true; end if;
  raise insufficient_privilege using message='PILOT_REQUIRED';
 end if;
 insert into folkoop_private.pilots(user_id,enabled) values(uid,true)
 on conflict(user_id) do update set enabled=true;
 return true;
end $$;
revoke all on function public.fk_claim_first_pilot() from public,anon,authenticated;
grant execute on function public.fk_claim_first_pilot() to authenticated;
commit;
