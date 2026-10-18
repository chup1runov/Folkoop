-- Additive operator preflight: retain the existing inventory, including any
-- deployed resource extensions, and cover newer coordination references.
begin;
create function folkoop_private.account_closure_inventory_v2(p_user uuid)
returns jsonb language sql stable security definer set search_path=''
as $$
 select base.inventory || jsonb_build_object(
  'user_scoped',(base.inventory->'user_scoped') || jsonb_build_object(
   'meeting_responses',(select count(*) from public.fk_meeting_responses where user_id=p_user),
   'economic_flow_roles',(select count(*) from public.fk_economic_flow_roles where user_id=p_user)
  ),
  'pseudonymising_set_null',(base.inventory->'pseudonymising_set_null') || jsonb_build_object(
   'meeting_facilitator_versions',(select count(*) from public.fk_meeting_terms where facilitator_id=p_user),
   'meeting_opener_versions',(select count(*) from public.fk_meeting_terms where opener_id=p_user),
   'economic_flows_authored',(select count(*) from public.fk_economic_flows where created_by=p_user)
  ),
  'owned_shared',(base.inventory->'owned_shared') || jsonb_build_object(
   'meeting_terms',(select count(*) from public.fk_meeting_terms t join public.fk_cooperations c on c.id=t.cooperation_id where c.owner_id=p_user),
   'economic_flows',(select count(*) from public.fk_economic_flows f join public.fk_cooperations c on c.id=f.cooperation_id where c.owner_id=p_user)
  )
 ) from (select folkoop_private.account_closure_inventory(p_user) as inventory) base
$$;
revoke all on function folkoop_private.account_closure_inventory_v2(uuid) from public,anon,authenticated;
comment on function folkoop_private.account_closure_inventory_v2(uuid) is
'Operator-only read-only preflight including meetings/economic flows. Not deletion or a complete privacy access package.';
commit;
