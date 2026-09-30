-- FOLKOOP two-account hosted technical audit.
-- Read-only. Run in an operator/admin SQL context immediately after completing
-- docs/GOTEBORG_PILOT_OPERATOR_RUNBOOK.md and before cleanup/account closure.
--
-- Preconditions:
-- - the hosted database was empty before this technical gate;
-- - exactly two developer/test identities were admitted with P01/P02;
-- - the test Need title begins exactly with "TECH-GATE:";
-- - B joined, sent a work-chat message, then left;
-- - A added one cooperation update;
-- - A progressed the Need open -> active -> done;
-- - A blocked then unblocked B.
--
-- This proves database/application state only. It is NOT evidence of a
-- real-world cooperation outcome and must not be counted in pilot metrics.

with technical as (
  select id,status
  from public.fk_cooperations
  where kind='need' and title like 'TECH-GATE:%'
),
checks as (
  select
    'exactly two Auth users'::text as check_name,
    (select count(*) from auth.users)::text as actual,
    ((select count(*) from auth.users)=2) as pass
  union all
  select
    'exactly two enabled pilot admissions',
    (select count(*) from folkoop_private.pilots where enabled)::text,
    ((select count(*) from folkoop_private.pilots where enabled)=2)
  union all
  select
    'both pilots have current Terms/Privacy evidence',
    (select count(*) from folkoop_private.pilots
      where enabled
        and terms_version='2026-09-29-v1'
        and terms_accepted_at is not null
        and privacy_version='2026-09-29-v1'
        and privacy_acknowledged_at is not null)::text,
    ((select count(*) from folkoop_private.pilots
      where enabled
        and terms_version='2026-09-29-v1'
        and terms_accepted_at is not null
        and privacy_version='2026-09-29-v1'
        and privacy_acknowledged_at is not null)=2)
  union all
  select
    'two invite uses consumed',
    (select coalesce(sum(uses),0) from folkoop_private.pilot_invites)::text,
    ((select coalesce(sum(uses),0) from folkoop_private.pilot_invites)=2)
  union all
  select
    'two invite uses remain available',
    (select coalesce(sum(max_uses-uses),0)
       from folkoop_private.pilot_invites
       where enabled and (expires_at is null or expires_at>now()))::text,
    ((select coalesce(sum(max_uses-uses),0)
       from folkoop_private.pilot_invites
       where enabled and (expires_at is null or expires_at>now()))=2)
  union all
  select
    'two network profiles exist',
    (select count(*) from public.fk_profiles)::text,
    ((select count(*) from public.fk_profiles)=2)
  union all
  select
    'exactly one TECH-GATE Need exists',
    (select count(*) from technical)::text,
    ((select count(*) from technical)=1)
  union all
  select
    'TECH-GATE Need is done',
    coalesce((select status from technical limit 1),'missing'),
    ((select count(*) from technical where status='done')=1)
  union all
  select
    'TECH-GATE Need has one remaining member after B leaves',
    (select count(*)
       from public.fk_cooperation_members m
       join technical t on t.id=m.cooperation_id)::text,
    ((select count(*)
       from public.fk_cooperation_members m
       join technical t on t.id=m.cooperation_id)=1)
  union all
  select
    'TECH-GATE Need retains exactly one linked work chat',
    (select count(*)
       from public.fk_cooperation_chats c
       join technical t on t.id=c.cooperation_id)::text,
    ((select count(*)
       from public.fk_cooperation_chats c
       join technical t on t.id=c.cooperation_id)=1)
  union all
  select
    'linked work chat contains at least one message',
    (select count(*)
       from public.fk_messages m
       join public.fk_cooperation_chats c on c.conversation_id=m.conversation_id
       join technical t on t.id=c.cooperation_id)::text,
    ((select count(*)
       from public.fk_messages m
       join public.fk_cooperation_chats c on c.conversation_id=m.conversation_id
       join technical t on t.id=c.cooperation_id)>=1)
  union all
  select
    'TECH-GATE Need contains at least one cooperation update',
    (select count(*)
       from public.fk_cooperation_updates u
       join technical t on t.id=u.cooperation_id)::text,
    ((select count(*)
       from public.fk_cooperation_updates u
       join technical t on t.id=u.cooperation_id)>=1)
  union all
  select
    'activity contains creation',
    (select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='created')::text,
    ((select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='created')>=1)
  union all
  select
    'activity contains member join',
    (select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='member_joined')::text,
    ((select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='member_joined')>=1)
  union all
  select
    'activity contains member leave',
    (select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='member_left')::text,
    ((select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='member_left')>=1)
  union all
  select
    'activity contains active status',
    (select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='cooperation_status' and a.label='active')::text,
    ((select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='cooperation_status' and a.label='active')>=1)
  union all
  select
    'activity contains done status',
    (select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='cooperation_status' and a.label='done')::text,
    ((select count(*)
       from public.fk_cooperation_activity a
       join technical t on t.id=a.cooperation_id
       where a.event_type='cooperation_status' and a.label='done')>=1)
  union all
  select
    'no block remains after unblock',
    (select count(*) from public.fk_blocks)::text,
    ((select count(*) from public.fk_blocks)=0)
)
select check_name,actual,pass
from checks
order by check_name;

-- Overall technical database verdict.
with technical as (
  select id,status
  from public.fk_cooperations
  where kind='need' and title like 'TECH-GATE:%'
)
select
  (
    (select count(*) from auth.users)=2
    and (select count(*) from folkoop_private.pilots where enabled)=2
    and (select count(*) from public.fk_profiles)=2
    and (select coalesce(sum(uses),0) from folkoop_private.pilot_invites)=2
    and (select count(*) from technical where status='done')=1
    and (select count(*) from public.fk_cooperation_members m join technical t on t.id=m.cooperation_id)=1
    and (select count(*) from public.fk_cooperation_chats c join technical t on t.id=c.cooperation_id)=1
    and (select count(*) from public.fk_messages m join public.fk_cooperation_chats c on c.conversation_id=m.conversation_id join technical t on t.id=c.cooperation_id)>=1
    and (select count(*) from public.fk_cooperation_updates u join technical t on t.id=u.cooperation_id)>=1
    and (select count(*) from public.fk_blocks)=0
  ) as technical_database_gate_pass;
