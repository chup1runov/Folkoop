-- Explicit internet publication is separate from the existing member directory.
-- Private editing state is never granted to anon or authenticated directly.
create table folkoop_private.profile_pages(
 id uuid primary key references public.fk_profiles(id) on delete cascade,
 revision integer not null default 1,
 published boolean not null default false,
 content jsonb not null default '{}'::jsonb,
 visible text[] not null default '{}'
);
alter table folkoop_private.profile_pages enable row level security;
revoke all on folkoop_private.profile_pages from public,anon,authenticated;
create table public.fk_public_pages(
 id uuid primary key references folkoop_private.profile_pages(id) on delete cascade,
 content jsonb not null check(jsonb_typeof(content)='object')
);
alter table public.fk_public_pages enable row level security;
revoke all on public.fk_public_pages from public,anon,authenticated;
grant select on public.fk_public_pages to anon,authenticated;
create policy public_pages_read on public.fk_public_pages for select to anon,authenticated using(true);

create function public.fk_my_public_page() returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); result jsonb;
begin
 select jsonb_build_object('revision',p.revision,'published',p.published,'content',p.content,'visible',p.visible)
 into result from folkoop_private.profile_pages p where p.id=uid;
 return coalesce(result,jsonb_build_object('revision',0,'published',false,'content','{}'::jsonb,'visible','[]'::jsonb));
end $$;
create function public.fk_save_public_page(p_revision integer,p_published boolean,p_content jsonb,p_visible text[]) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid:=folkoop_private.actor(); old_revision integer; k text; value jsonb; projection jsonb:='{}'::jsonb;
 allowed constant text[]:=array['name','about','skills','thoughts','resources','ideas','achievements'];
begin
 if p_revision is null or p_revision<0 or p_published is null or p_visible is null or p_content is null or jsonb_typeof(p_content)<>'object'
 or octet_length(p_content::text)>14000 or cardinality(p_visible)>7 or not p_visible<@allowed or array_position(p_visible,null) is not null then raise exception 'INVALID_INPUT'; end if;
 for k,value in select * from jsonb_each(p_content) loop
  if not k=any(allowed) or jsonb_typeof(value)<>'string' or length(value#>>'{}')>(case when k='name' then 60 else 1500 end) then raise exception 'INVALID_INPUT';end if;
 end loop;
 if p_published and (not 'name'=any(p_visible) or length(btrim(coalesce(p_content->>'name','')))=0) then raise exception 'INVALID_INPUT';end if;
 -- Serialize even the first save; this also requires a fully created profile.
 perform 1 from public.fk_profiles where id=uid for update;
 if not found then raise exception 'PROFILE_REQUIRED';end if;
 select revision into old_revision from folkoop_private.profile_pages where id=uid;
 if coalesce(old_revision,0)<>p_revision then raise exception 'VERSION_CONFLICT';end if;
 insert into folkoop_private.profile_pages(id,revision,published,content,visible)
 values(uid,p_revision+1,p_published,p_content,p_visible)
 on conflict(id) do update set revision=excluded.revision,published=excluded.published,content=excluded.content,visible=excluded.visible;
 if p_published then
  select coalesce(jsonb_object_agg(key,val),'{}'::jsonb) into projection from jsonb_each(p_content) as x(key,val) where key=any(p_visible);
  insert into public.fk_public_pages(id,content) values(uid,projection) on conflict(id) do update set content=excluded.content;
 else
  delete from public.fk_public_pages where id=uid;
 end if;
end $$;
revoke all on function public.fk_my_public_page() from public,anon,authenticated;
revoke all on function public.fk_save_public_page(integer,boolean,jsonb,text[]) from public,anon,authenticated;
grant execute on function public.fk_my_public_page() to authenticated;
grant execute on function public.fk_save_public_page(integer,boolean,jsonb,text[]) to authenticated;
