begin;
create table public.fk_meeting_reminders(
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 recipient_id uuid not null references auth.users on delete cascade,
 role text not null check(role in ('attendee','facilitator','opener')),
 version integer not null,
 sender_id uuid references auth.users on delete set null,
 sent_at timestamptz not null default now(),
 primary key(cooperation_id,recipient_id,role),
 foreign key(cooperation_id,version) references public.fk_meeting_terms on delete cascade
);
create index fk_meeting_reminders_recipient_idx on public.fk_meeting_reminders(recipient_id);
create index fk_meeting_reminders_sender_idx on public.fk_meeting_reminders(sender_id);
alter table public.fk_meeting_reminders enable row level security;
revoke all on public.fk_meeting_reminders from public,anon,authenticated;
grant select on public.fk_meeting_reminders to authenticated;
create policy meeting_reminders_read on public.fk_meeting_reminders for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id)
 and (recipient_id=auth.uid() or exists(select 1 from public.fk_cooperations p where p.id=cooperation_id and p.owner_id=auth.uid())));

-- Internal predicate only; callers establish access before invoking it.
create function folkoop_private.meeting_reminder_pending(p_project uuid,p_version integer,p_recipient uuid,p_role text)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.fk_meeting_terms t
 join public.fk_cooperation_members m on m.cooperation_id=t.cooperation_id and m.user_id=p_recipient
 join folkoop_private.pilots pilot on pilot.user_id=p_recipient and pilot.enabled
 where t.cooperation_id=p_project and t.version=p_version
 and (p_role='attendee' or (p_role='facilitator' and t.facilitator_id=p_recipient) or (p_role='opener' and t.opener_id=p_recipient))
 -- Any explicit response to this role, including withdrawal, excludes reminders.
 and not exists(select 1 from public.fk_meeting_responses r where r.cooperation_id=p_project and r.version=p_version and r.user_id=p_recipient and r.role=p_role)
 and not exists(select 1 from public.fk_meeting_responses r where r.cooperation_id=p_project and r.version=p_version and r.user_id=p_recipient and r.role='attendee' and not r.confirmed)
 and (p_role='attendee' or exists(select 1 from public.fk_meeting_responses r where r.cooperation_id=p_project and r.version=p_version and r.user_id=p_recipient and r.role='attendee' and r.confirmed)))
$$;
revoke all on function folkoop_private.meeting_reminder_pending(uuid,integer,uuid,text) from public,anon,authenticated;

create function folkoop_private.send_meeting_reminder(p_project uuid,p_version integer,p_recipient uuid,p_role text)
returns boolean language plpgsql security definer set search_path='' as $$
declare p public.fk_cooperations; s jsonb; last_sent timestamptz;
begin
 if not folkoop_private.meeting_session_active() or not folkoop_private.coop_member(p_project) then raise insufficient_privilege; end if;
 select * into p from public.fk_cooperations where id=p_project for update;
 if p.owner_id is distinct from auth.uid() or p_recipient=auth.uid() or folkoop_private.is_blocked(p_recipient) then raise insufficient_privilege; end if;
 s:=folkoop_private.meeting_ready_snapshot(p_project);
 if (s->'terms'->>'version')::integer is distinct from p_version
 or not coalesce((s->>'current')::boolean,false) or not coalesce((s->'room'->>'confirmed')::boolean,false)
 or not folkoop_private.meeting_reminder_pending(p_project,p_version,p_recipient,p_role) then raise exception 'REMINDER_NOT_NEEDED'; end if;
 select sent_at into last_sent from public.fk_meeting_reminders where cooperation_id=p_project and recipient_id=p_recipient and role=p_role;
 if last_sent>now()-interval '24 hours' then return false; end if;
 insert into public.fk_meeting_reminders values(p_project,p_recipient,p_role,p_version,auth.uid(),now())
 on conflict(cooperation_id,recipient_id,role) do update set version=excluded.version,sender_id=excluded.sender_id,sent_at=excluded.sent_at;
 return true;
end $$;
create function folkoop_private.meeting_reminder_inbox()
returns table(cooperation_id uuid,project_title text,version integer,role text,sent_at timestamptz)
language sql stable security definer set search_path='' as $$
 select r.cooperation_id,p.title,r.version,r.role,r.sent_at
 from public.fk_meeting_reminders r join public.fk_cooperations p on p.id=r.cooperation_id
 where folkoop_private.meeting_session_active() and r.recipient_id=auth.uid() and folkoop_private.coop_member(p.id)
 and p.owner_id=r.sender_id and not folkoop_private.is_blocked(p.owner_id)
 and folkoop_private.meeting_reminder_pending(p.id,r.version,auth.uid(),r.role)
 and exists(select 1 from public.fk_meeting_terms t where t.cooperation_id=p.id and t.version=r.version and t.starts_at>now()
  and t.version=(select max(v.version) from public.fk_meeting_terms v where v.cooperation_id=p.id))
 and (folkoop_private.meeting_ready_snapshot(p.id)->>'current')::boolean
 and (folkoop_private.meeting_ready_snapshot(p.id)->'room'->>'confirmed')::boolean
 order by r.sent_at desc,p.id limit 100
$$;
create function public.fk_send_meeting_reminder(p_project uuid,p_version integer,p_recipient uuid,p_role text)
returns boolean language sql security invoker set search_path='' as $$ select folkoop_private.send_meeting_reminder(p_project,p_version,p_recipient,p_role); $$;
create function public.fk_meeting_reminder_inbox()
returns table(cooperation_id uuid,project_title text,version integer,role text,sent_at timestamptz)
language sql stable security invoker set search_path='' as $$ select * from folkoop_private.meeting_reminder_inbox(); $$;
revoke all on function folkoop_private.send_meeting_reminder(uuid,integer,uuid,text),public.fk_send_meeting_reminder(uuid,integer,uuid,text),folkoop_private.meeting_reminder_inbox(),public.fk_meeting_reminder_inbox() from public,anon,authenticated;
grant execute on function folkoop_private.send_meeting_reminder(uuid,integer,uuid,text),public.fk_send_meeting_reminder(uuid,integer,uuid,text),folkoop_private.meeting_reminder_inbox(),public.fk_meeting_reminder_inbox() to authenticated;
create function folkoop_private.account_closure_inventory_v9(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v8(p_user)||jsonb_build_object('meeting_reminders',
 (select count(*) from public.fk_meeting_reminders where recipient_id=p_user or sender_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v9(uuid) from public,anon,authenticated;
commit;
