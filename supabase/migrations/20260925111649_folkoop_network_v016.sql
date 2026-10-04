-- FOLKOOP network pilot. Dedicated Supabase project only; no automatic Auth users.
begin;
create schema if not exists folkoop_private;
revoke all on schema folkoop_private from public,anon,authenticated;
grant usage on schema folkoop_private to authenticated;
create table folkoop_private.pilots(user_id uuid primary key references auth.users(id) on delete cascade,enabled boolean not null default true);
create table folkoop_private.write_budgets(user_id uuid primary key references auth.users(id) on delete cascade,window_start timestamptz not null,hits integer not null);
revoke all on folkoop_private.pilots,folkoop_private.write_budgets from public,anon,authenticated;
create table public.fk_profiles(id uuid primary key references auth.users(id) on delete cascade,name text not null check(length(btrim(name)) between 1 and 60),skills text not null default '' check(length(skills)<=200),about text not null default '' check(length(about)<=600),listed boolean not null default false);
create table public.fk_communities(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,name text not null check(length(btrim(name)) between 2 and 80),description text not null default '' check(length(description)<=1000),created_at timestamptz not null default now());
create index on public.fk_communities(owner_id);
create table public.fk_memberships(community_id uuid not null references public.fk_communities(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,banned boolean not null default false,primary key(community_id,user_id));
create index on public.fk_memberships(user_id);
create table public.fk_posts(id uuid primary key default gen_random_uuid(),community_id uuid not null references public.fk_communities(id) on delete cascade,author_id uuid not null references auth.users(id) on delete cascade,body text not null check(length(btrim(body)) between 1 and 3000),created_at timestamptz not null default now());
create index on public.fk_posts(community_id,created_at);
create index on public.fk_posts(author_id,created_at);
create table public.fk_blocks(user_id uuid not null references auth.users(id) on delete cascade,target_id uuid not null references auth.users(id) on delete cascade,primary key(user_id,target_id),check(user_id<>target_id));
create table public.fk_reports(id uuid primary key default gen_random_uuid(),reporter_id uuid not null references auth.users(id) on delete cascade,post_id uuid references public.fk_posts(id) on delete set null,reason text not null check(length(btrim(reason)) between 2 and 1000),created_at timestamptz not null default now());
create index on public.fk_reports(reporter_id,created_at);
create index on public.fk_reports(post_id);
create function folkoop_private.is_pilot() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from folkoop_private.pilots where user_id=auth.uid() and enabled) $$;
create function folkoop_private.member_of(cid uuid) returns boolean language sql stable security definer set search_path='' as $$ select folkoop_private.is_pilot() and exists(select 1 from public.fk_memberships where community_id=cid and user_id=auth.uid() and not banned) $$;
create function folkoop_private.is_blocked(other uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.fk_blocks where (user_id=auth.uid() and target_id=other) or (user_id=other and target_id=auth.uid())) $$;
create function folkoop_private.actor() returns uuid language plpgsql security definer set search_path='' as $$
begin
 if not folkoop_private.is_pilot() then raise insufficient_privilege using message='PILOT_REQUIRED'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 insert into folkoop_private.write_budgets(user_id,window_start,hits) values(auth.uid(),date_trunc('minute',now()),1)
 on conflict(user_id) do update set hits=case when folkoop_private.write_budgets.window_start=excluded.window_start then folkoop_private.write_budgets.hits+1 else 1 end,window_start=excluded.window_start;
 if (select hits from folkoop_private.write_budgets where user_id=auth.uid())>60 then raise exception 'RATE_LIMIT'; end if;
 return auth.uid();
end $$;
revoke all on function folkoop_private.is_pilot(),folkoop_private.member_of(uuid),folkoop_private.is_blocked(uuid),folkoop_private.actor() from public,anon,authenticated;
grant execute on function folkoop_private.is_pilot(),folkoop_private.member_of(uuid),folkoop_private.is_blocked(uuid) to authenticated;
do $$ declare tab text; begin
 foreach tab in array array['fk_profiles','fk_communities','fk_memberships','fk_posts','fk_blocks','fk_reports'] loop
 execute format('alter table public.%I enable row level security',tab);
 execute format('revoke all on public.%I from public,anon,authenticated',tab);
 execute format('grant select on public.%I to authenticated',tab);
 end loop;
end $$;
create policy profiles_read on public.fk_profiles for select to authenticated using(folkoop_private.is_pilot() and (id=auth.uid() or (listed and not folkoop_private.is_blocked(id))));
create policy communities_read on public.fk_communities for select to authenticated using(folkoop_private.is_pilot());
create policy memberships_read on public.fk_memberships for select to authenticated using(folkoop_private.is_pilot() and user_id=auth.uid());
create policy posts_read on public.fk_posts for select to authenticated using(folkoop_private.member_of(community_id) and not folkoop_private.is_blocked(author_id));
create policy blocks_read on public.fk_blocks for select to authenticated using(folkoop_private.is_pilot() and user_id=auth.uid());
create policy reports_read on public.fk_reports for select to authenticated using(folkoop_private.is_pilot() and reporter_id=auth.uid());
create function public.fk_save_profile(p_name text,p_skills text,p_about text,p_listed boolean) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); begin
 insert into public.fk_profiles(id,name,skills,about,listed) values(uid,btrim(p_name),p_skills,p_about,p_listed)
 on conflict(id) do update set name=excluded.name,skills=excluded.skills,about=excluded.about,listed=excluded.listed;
end $$;
create function public.fk_create_community(p_name text,p_description text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); cid uuid; begin
 if (select count(*) from public.fk_communities where owner_id=uid)>=10 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_communities(owner_id,name,description) values(uid,btrim(p_name),p_description) returning id into cid;
 insert into public.fk_memberships(community_id,user_id) values(cid,uid);return cid;
end $$;
create function public.fk_join(p_community uuid) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); begin
 if not exists(select 1 from public.fk_communities where id=p_community) then raise exception 'UNAVAILABLE'; end if;
 if exists(select 1 from public.fk_memberships where community_id=p_community and user_id=uid and banned) then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if (select count(*) from public.fk_memberships where user_id=uid)>=100 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_memberships(community_id,user_id) values(p_community,uid) on conflict do nothing;
end $$;
create function public.fk_leave(p_community uuid) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); begin
 if exists(select 1 from public.fk_communities where id=p_community and owner_id=uid) then raise exception 'OWNER_MUST_DELETE_COMMUNITY'; end if;
 delete from public.fk_memberships where community_id=p_community and user_id=uid and not banned;
end $$;
create function public.fk_publish(p_community uuid,p_body text) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); pid uuid; begin
 if not folkoop_private.member_of(p_community) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 if (select count(*) from public.fk_posts where author_id=uid and created_at>now()-interval '1 minute')>=10 then raise exception 'RATE_LIMIT'; end if;
 insert into public.fk_posts(community_id,author_id,body) values(p_community,uid,btrim(p_body)) returning id into pid;return pid;
end $$;
create function public.fk_delete_post(p_post uuid) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); begin
 delete from public.fk_posts p where p.id=p_post and (p.author_id=uid or exists(select 1 from public.fk_communities c where c.id=p.community_id and c.owner_id=uid));
end $$;
create function public.fk_ban(p_community uuid,p_user uuid) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); begin
 if uid=p_user or not exists(select 1 from public.fk_communities where id=p_community and owner_id=uid) then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
 insert into public.fk_memberships(community_id,user_id,banned) values(p_community,p_user,true) on conflict(community_id,user_id) do update set banned=true;
end $$;
create function public.fk_block(p_user uuid,p_blocked boolean) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); begin
 if uid=p_user then raise exception 'INVALID_TARGET'; end if;
 if p_blocked then insert into public.fk_blocks(user_id,target_id) values(uid,p_user) on conflict do nothing;
 else delete from public.fk_blocks where user_id=uid and target_id=p_user; end if;
end $$;
create function public.fk_report(p_post uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); begin
 if not exists(select 1 from public.fk_posts where id=p_post and folkoop_private.member_of(community_id) and not folkoop_private.is_blocked(author_id)) then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if (select count(*) from public.fk_reports where reporter_id=uid and created_at>now()-interval '1 hour')>=10 then raise exception 'RATE_LIMIT'; end if;
 insert into public.fk_reports(reporter_id,post_id,reason) values(uid,p_post,btrim(p_reason));
end $$;
create function public.fk_delete_community(p_community uuid) returns void language plpgsql security definer set search_path='' as $$ declare uid uuid:=folkoop_private.actor(); begin delete from public.fk_communities where id=p_community and owner_id=uid; end $$;
create function public.fk_delete_profile() returns void language plpgsql security definer set search_path='' as $$ declare uid uuid:=folkoop_private.actor(); begin delete from public.fk_profiles where id=uid; end $$;
do $$ declare f regprocedure; begin
 for f in select oid::regprocedure from pg_proc where pronamespace='public'::regnamespace and proname in ('fk_save_profile','fk_create_community','fk_join','fk_leave','fk_publish','fk_delete_post','fk_ban','fk_block','fk_report','fk_delete_community','fk_delete_profile') loop
 execute format('revoke all on function %s from public,anon,authenticated',f);
 execute format('grant execute on function %s to authenticated',f);
 end loop;
end $$;
commit;
