-- Explicit, text-only stories. Expiry affects visibility, never agreements/results.
create table public.fk_stories(
 id uuid primary key,
 author_id uuid not null references public.fk_profiles(id) on delete cascade,
 author_name text not null check(length(author_name) between 1 and 60),
 body text not null check(length(btrim(body)) between 1 and 500),
 tone text not null check(tone in ('teal','plum','blue')),
 audience text not null check(audience in ('network','project')),
 cooperation_id uuid references public.fk_cooperations(id) on delete cascade,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '24 hours',
 withdrawn_at timestamptz,
 check(audience<>'project' or cooperation_id is not null),
 check(expires_at=created_at+interval '24 hours')
);
create index fk_stories_recent on public.fk_stories(created_at desc,id);
create index fk_stories_author on public.fk_stories(author_id,created_at desc);
create index fk_stories_cooperation on public.fk_stories(cooperation_id);
alter table public.fk_stories enable row level security;
revoke all on public.fk_stories from public,anon,authenticated;
grant select on public.fk_stories to authenticated;

create function folkoop_private.story_visible(p_story uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select folkoop_private.is_pilot() and exists(
  select 1 from public.fk_stories s where s.id=p_story and (
   s.author_id=auth.uid() or (
    s.withdrawn_at is null and s.expires_at>now() and s.created_at<=now()
    and not folkoop_private.is_blocked(s.author_id)
    and (s.cooperation_id is null or exists(
     select 1 from public.fk_cooperations c where c.id=s.cooperation_id
     and not folkoop_private.is_blocked(c.owner_id)
     and exists(select 1 from public.fk_cooperation_members m where m.cooperation_id=c.id and m.user_id=s.author_id)
    ))
    and (s.audience='network' or folkoop_private.coop_member(s.cooperation_id))
   )
  )
 )
$$;
revoke all on function folkoop_private.story_visible(uuid) from public,anon,authenticated;
grant execute on function folkoop_private.story_visible(uuid) to authenticated;
create policy stories_read on public.fk_stories for select to authenticated
 using(folkoop_private.story_visible(id));
-- Invoker query retains RLS and uses server time, independent of browser clock.
create function public.fk_story_feed() returns setof public.fk_stories
language sql stable security invoker set search_path='' as $$
 select * from public.fk_stories where withdrawn_at is null and created_at<=now()
 and expires_at>now() order by created_at desc,id desc limit 60
$$;
revoke all on function public.fk_story_feed() from public,anon,authenticated;
grant execute on function public.fk_story_feed() to authenticated;

create function public.fk_publish_story(p_id uuid,p_body text,p_tone text,p_audience text,p_cooperation uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); n text; old public.fk_stories;
begin
 if p_id is null or p_body is null or length(btrim(p_body)) not between 1 and 500
 or p_tone is null or p_tone not in ('teal','plum','blue')
 or p_audience is null or p_audience not in ('network','project')
 or (p_audience='project' and p_cooperation is null) then raise exception 'INVALID_INPUT';end if;
 select * into old from public.fk_stories where id=p_id;
 if found then
  if old.author_id=uid and old.body=btrim(p_body) and old.tone=p_tone
   and old.audience=p_audience and old.cooperation_id is not distinct from p_cooperation then return old.id;end if;
  raise exception 'VERSION_CONFLICT';
 end if;
 select name into n from public.fk_profiles where id=uid;
 if n is null then raise exception 'PROFILE_REQUIRED';end if;
 if p_cooperation is not null and (not folkoop_private.coop_member(p_cooperation)
 or not exists(select 1 from public.fk_cooperations where id=p_cooperation and status in ('open','active') and not folkoop_private.is_blocked(owner_id))) then
  raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 if (select count(*) from public.fk_stories where author_id=uid and created_at>now()-interval '24 hours')>=5 then raise exception 'RATE_LIMIT';end if;
 insert into public.fk_stories(id,author_id,author_name,body,tone,audience,cooperation_id)
 values(p_id,uid,n,btrim(p_body),p_tone,p_audience,p_cooperation);
 return p_id;
end $$;
create function public.fk_withdraw_story(p_story uuid) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor();
begin
 update public.fk_stories set withdrawn_at=coalesce(withdrawn_at,now()) where id=p_story and author_id=uid;
 if not found then raise insufficient_privilege using message='UNAVAILABLE';end if;
end $$;
revoke all on function public.fk_publish_story(uuid,text,text,text,uuid),public.fk_withdraw_story(uuid) from public,anon,authenticated;
grant execute on function public.fk_publish_story(uuid,text,text,text,uuid),public.fk_withdraw_story(uuid) to authenticated;

create table public.fk_story_reports(
 id uuid primary key default gen_random_uuid(),
 story_id uuid not null references public.fk_stories(id) on delete cascade,
 reporter_id uuid not null references public.fk_profiles(id) on delete cascade,
 reason text not null check(reason in ('spam','unsafe','privacy','other')),
 created_at timestamptz not null default now(),
 unique(story_id,reporter_id)
);
create index fk_story_reports_reporter on public.fk_story_reports(reporter_id);
alter table public.fk_story_reports enable row level security;
revoke all on public.fk_story_reports from public,anon,authenticated;
grant select on public.fk_story_reports to authenticated;
create policy story_reports_own on public.fk_story_reports for select to authenticated
 using(folkoop_private.is_pilot() and reporter_id=(select auth.uid()));
create function public.fk_report_story(p_story uuid,p_reason text) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor();
begin
 if p_reason is null or p_reason not in ('spam','unsafe','privacy','other') then raise exception 'INVALID_INPUT';end if;
 if not folkoop_private.story_visible(p_story) or not exists(select 1 from public.fk_stories where id=p_story and author_id<>uid and withdrawn_at is null and expires_at>now()) then
  raise insufficient_privilege using message='UNAVAILABLE';end if;
 insert into public.fk_story_reports(story_id,reporter_id,reason) values(p_story,uid,p_reason) on conflict(story_id,reporter_id) do nothing;
end $$;
revoke all on function public.fk_report_story(uuid,text) from public,anon,authenticated;
grant execute on function public.fk_report_story(uuid,text) to authenticated;

-- Operator inventory; tables themselves cascade on profile closure.
create function folkoop_private.account_closure_inventory_v22(p_user uuid) returns jsonb
language sql security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v21(p_user)||jsonb_build_object(
 'stories',(select count(*) from public.fk_stories where author_id=p_user),
 'story_reports',(select count(*) from public.fk_story_reports where reporter_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v22(uuid) from public,anon,authenticated;
