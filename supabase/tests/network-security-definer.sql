-- SECURITY DEFINER privilege contract for disposable CI.
-- The application intentionally uses authenticated RPCs plus a small set of
-- private RLS helper functions. Everything else must remain non-client-callable.
\set ON_ERROR_STOP on
begin;

create schema fk_secdef_test;
create function fk_secdef_test.ok(value boolean,label text) returns void
language plpgsql as $$
begin
 if value is distinct from true then raise exception 'FAIL: %',label; end if;
 raise notice 'PASS: %',label;
end $$;

-- SECURITY DEFINER must never inherit a caller-controlled search_path.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname in ('public','folkoop_private')
    and not ('search_path=""'=any(coalesce(p.proconfig,array[]::text[])))
 ),
 'all FOLKOOP SECURITY DEFINER functions pin empty search_path'
);

-- No anonymous or PUBLIC execution on any FOLKOOP SECURITY DEFINER function.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname in ('public','folkoop_private')
    and (
      has_function_privilege('anon',p.oid,'execute')
      or has_function_privilege('public',p.oid,'execute')
    )
 ),
 'no SECURITY DEFINER function is executable by anon or PUBLIC'
);

-- Public fk_* functions are the intentional authenticated RPC surface.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='public'
    and p.proname like 'fk\_%' escape '\'
    and not has_function_privilege('authenticated',p.oid,'execute')
 ),
 'all public fk_* SECURITY DEFINER RPCs remain authenticated-only callable'
);

-- Only reviewed RLS helpers and actor-checked private RPC implementations may be executable.
select fk_secdef_test.ok(
 not exists(
  select 1
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='folkoop_private'
    and has_function_privilege('authenticated',p.oid,'execute')
    and p.proname not in (
      'story_visible','is_pilot','chat_member','coop_member','is_blocked','member_of',
      'shares_chat','shares_cooperation','selected_purchase_provider',
      'resource_session_active','save_resource_requirement','save_resource_availability','remove_resource_plan','resource_availability_revision',
      'meeting_session_active','save_meeting_terms','respond_meeting','meeting_snapshot','meeting_action_inbox',
      'report_meeting_outcome','meeting_outcome_snapshot','repeat_meeting','mark_messages_read','send_message_once',
      'propose_project_decision','respond_project_decision','finish_project_decision','task_work_action','task_action_inbox',
      'respond_shared_need','project_from_need','room_request_action','room_notification_inbox','read_room_notifications','bind_meeting_room','meeting_ready_snapshot','meeting_room_alerts','send_meeting_reminder','meeting_reminder_inbox','save_project_document','respond_project_document',
      'save_task_basis','respond_task_basis','task_bases_snapshot','save_project_welcome',
      'propose_decision_rules','save_decision_objection','answer_decision_objection',
      'resource_handoff_action','resource_use_action','save_resource_booking_policy','project_budget_action','project_budget_snapshot','contribution_notice_inbox','read_contribution_notice',
      'save_meeting_budget','meeting_budget_ready_snapshot','meeting_budget_notice_inbox','read_meeting_budget_notice'
    )
 ),
 'authenticated cannot execute unreviewed private SECURITY DEFINER helpers'
);

-- Conversely, every whitelisted RLS helper must stay executable or policies break.
select fk_secdef_test.ok(
 (
  select count(*)
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where p.prosecdef
    and n.nspname='folkoop_private'
    and p.proname in (
      'is_pilot','chat_member','coop_member','is_blocked','member_of',
      'shares_chat','shares_cooperation','selected_purchase_provider'
    )
    and has_function_privilege('authenticated',p.oid,'execute')
 )=8,
 'all eight private RLS helpers are explicitly executable by authenticated'
);

rollback;
