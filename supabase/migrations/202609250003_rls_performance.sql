begin;
create index if not exists fk_blocks_target_id_idx on public.fk_blocks(target_id);

drop policy if exists profiles_read on public.fk_profiles;
create policy profiles_read on public.fk_profiles for select to authenticated
using(folkoop_private.is_pilot() and (id=(select auth.uid()) or (listed and not folkoop_private.is_blocked(id))));

drop policy if exists memberships_read on public.fk_memberships;
create policy memberships_read on public.fk_memberships for select to authenticated
using(folkoop_private.is_pilot() and user_id=(select auth.uid()));

drop policy if exists blocks_read on public.fk_blocks;
create policy blocks_read on public.fk_blocks for select to authenticated
using(folkoop_private.is_pilot() and user_id=(select auth.uid()));

drop policy if exists reports_read on public.fk_reports;
create policy reports_read on public.fk_reports for select to authenticated
using(folkoop_private.is_pilot() and reporter_id=(select auth.uid()));
commit;
