-- Operator-only preflight for deliberate FOLKOOP account closure.
-- Read-only inventory: does not delete, transfer or pseudonymise any data.
begin;

create or replace function folkoop_private.account_closure_inventory(p_user uuid)
returns jsonb
language sql
stable
security definer
set search_path=''
as $$
 select jsonb_build_object(
  'user_id',p_user,
  'owned_shared',jsonb_build_object(
    'communities',(
      select count(*) from public.fk_communities c where c.owner_id=p_user
    ),
    'standalone_group_chats',(
      select count(*)
      from public.fk_conversations c
      where c.kind='group' and c.owner_id=p_user
        and not exists(
          select 1 from public.fk_cooperation_chats cc
          where cc.conversation_id=c.id
        )
    ),
    'cooperations',(
      select count(*) from public.fk_cooperations c where c.owner_id=p_user
    ),
    'linked_cooperation_chats',(
      select count(*)
      from public.fk_cooperation_chats cc
      join public.fk_cooperations c on c.id=cc.cooperation_id
      where c.owner_id=p_user
    )
  ),
  'user_scoped',jsonb_build_object(
    'profile',(
      select count(*) from public.fk_profiles p where p.id=p_user
    ),
    'community_memberships',(
      select count(*) from public.fk_memberships m where m.user_id=p_user
    ),
    'authored_posts',(
      select count(*) from public.fk_posts p where p.author_id=p_user
    ),
    'blocks_created',(
      select count(*) from public.fk_blocks b where b.user_id=p_user
    ),
    'blocks_received',(
      select count(*) from public.fk_blocks b where b.target_id=p_user
    ),
    'post_reports_filed',(
      select count(*) from public.fk_reports r where r.reporter_id=p_user
    ),
    'chat_memberships',(
      select count(*) from public.fk_conversation_members m where m.user_id=p_user
    ),
    'chat_invites_received',(
      select count(*) from public.fk_conversation_invites i where i.user_id=p_user
    ),
    'chat_invites_sent',(
      select count(*) from public.fk_conversation_invites i where i.invited_by=p_user
    ),
    'authored_messages',(
      select count(*) from public.fk_messages m where m.author_id=p_user
    ),
    'message_reports_filed',(
      select count(*) from public.fk_message_reports r where r.reporter_id=p_user
    ),
    'cooperation_memberships',(
      select count(*) from public.fk_cooperation_members m where m.user_id=p_user
    ),
    'cooperation_updates',(
      select count(*) from public.fk_cooperation_updates u where u.author_id=p_user
    ),
    'tasks_created',(
      select count(*) from public.fk_project_tasks t where t.creator_id=p_user
    ),
    'tasks_assigned',(
      select count(*) from public.fk_project_tasks t where t.assignee_id=p_user
    ),
    'purchase_commitments',(
      select count(*) from public.fk_purchase_commitments x where x.user_id=p_user
    ),
    'purchase_offers',(
      select count(*) from public.fk_purchase_offers x where x.provider_id=p_user
    ),
    'offer_choices_made',(
      select count(*) from public.fk_purchase_offer_choice x where x.selected_by=p_user
    ),
    'offer_reports_filed',(
      select count(*) from public.fk_purchase_offer_reports x where x.reporter_id=p_user
    ),
    'purchase_confirmations',(
      select count(*) from public.fk_purchase_confirmations x where x.user_id=p_user
    ),
    'cooperation_reads',(
      select count(*) from public.fk_cooperation_reads x where x.user_id=p_user
    )
  ),
  'pseudonymising_set_null',jsonb_build_object(
    'activity_as_actor',(
      select count(*) from public.fk_cooperation_activity a where a.actor_id=p_user
    ),
    'task_assignments',(
      select count(*) from public.fk_project_tasks t where t.assignee_id=p_user
    )
  ),
  'private_pilot',jsonb_build_object(
    'admission',(
      select count(*) from folkoop_private.pilots p where p.user_id=p_user
    ),
    'write_budget',(
      select count(*) from folkoop_private.write_budgets w where w.user_id=p_user
    )
  ),
  'claimant_linked_invites',0,
  'warning','Preflight only. Resolve owned shared objects and retention policy before Auth deletion.'
 )
$$;

revoke all on function folkoop_private.account_closure_inventory(uuid)
 from public,anon,authenticated;

comment on function folkoop_private.account_closure_inventory(uuid) is
'Operator-only read-only account closure preflight. Never a deletion procedure.';

commit;
