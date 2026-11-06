begin;
create function folkoop_private.account_closure_inventory_v21(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v20(p_user)||jsonb_build_object('message_command_receipts',
 (select count(*) from folkoop_private.message_commands where actor_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v21(uuid) from public,anon,authenticated;
commit;
