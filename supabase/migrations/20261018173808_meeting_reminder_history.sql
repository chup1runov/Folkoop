begin;
create table public.fk_meeting_history(
 id bigint generated always as identity primary key,
 cooperation_id uuid not null references public.fk_cooperations on delete cascade,
 participant_id uuid references auth.users on delete set null,
 actor_id uuid references auth.users on delete set null,
 event_type text not null check(event_type in ('history_started','reminder','confirmed','withdrawn','terms','room_terms','room_link')),
 version integer,
 role text,
 request_id uuid references public.fk_room_requests on delete set null,
 revision integer,
 room_state text,
 changed_fields text[] not null default '{}',
 prior_reminder_id bigint references public.fk_meeting_history on delete set null,
 recorded_at timestamptz not null default clock_timestamp(),
 check(role is null or role in ('attendee','facilitator','opener'))
);
create index fk_meeting_history_project_idx on public.fk_meeting_history(cooperation_id,id desc);
create index fk_meeting_history_participant_idx on public.fk_meeting_history(participant_id);
create index fk_meeting_history_actor_idx on public.fk_meeting_history(actor_id);
create index fk_meeting_history_request_idx on public.fk_meeting_history(request_id);
create index fk_meeting_history_prior_idx on public.fk_meeting_history(prior_reminder_id);
alter table public.fk_meeting_history enable row level security;
revoke all on public.fk_meeting_history from public,anon,authenticated;
grant select on public.fk_meeting_history to authenticated;
create policy meeting_history_read on public.fk_meeting_history for select to authenticated using(
 (select folkoop_private.meeting_session_active()) and folkoop_private.coop_member(cooperation_id)
 and (participant_id=auth.uid() or exists(select 1 from public.fk_cooperations c where c.id=cooperation_id and c.owner_id=auth.uid())));

-- No fabricated reconstruction: prior mutable reminders/answers are not an event log.
insert into public.fk_meeting_history(cooperation_id,event_type)
 select distinct cooperation_id,'history_started' from public.fk_meeting_terms;

create function folkoop_private.meeting_history_trigger() returns trigger
language plpgsql security definer set search_path='' as $$
declare project uuid; participant uuid; actor uuid:=auth.uid(); kind text; ver integer; event_role text;
 req uuid; rev integer; previous jsonb; current_value jsonb; changes text[]:='{}'; reminder bigint;
begin
 if tg_table_name='fk_meeting_reminders' then
  if tg_op='UPDATE' and new.sent_at is not distinct from old.sent_at then return new; end if;
  project:=new.cooperation_id;participant:=new.recipient_id;actor:=new.sender_id;
  kind:='reminder';ver:=new.version;event_role:=new.role;
 elsif tg_table_name='fk_meeting_responses' then
  if tg_op='UPDATE' and new.confirmed is not distinct from old.confirmed then return new; end if;
  project:=new.cooperation_id;participant:=new.user_id;ver:=new.version;event_role:=new.role;
  kind:=case when new.confirmed then 'confirmed' else 'withdrawn' end;
  select id into reminder from public.fk_meeting_history where cooperation_id=project
   and participant_id=participant and version=ver and role=event_role and event_type='reminder' order by id desc limit 1;
 elsif tg_table_name='fk_meeting_terms' then
  project:=new.cooperation_id;ver:=new.version;kind:='terms';current_value:=to_jsonb(new);
  select to_jsonb(t) into previous from public.fk_meeting_terms t where cooperation_id=project and version<ver order by version desc limit 1;
  select coalesce(array_agg(k order by k),'{}') into changes from unnest(array['starts_at','ends_at','place','conditions','minimum_attendees','capacity','facilitator_id','opener_id']) k
   where current_value->k is distinct from previous->k;
 elsif tg_table_name='fk_meeting_rooms' then
  project:=new.cooperation_id;ver:=new.version;req:=new.request_id;rev:=new.revision;kind:='room_link';
 else
  req:=new.request_id;rev:=new.revision;kind:='room_terms';current_value:=new.terms;
  select project_id into project from public.fk_room_requests where id=req;
  -- Only room chains that have actually been linked to this meeting.
  if not exists(select 1 from public.fk_meeting_rooms where request_id=req) then return new; end if;
  select terms into previous from public.fk_room_request_versions where request_id=req and revision<rev order by revision desc limit 1;
  select coalesce(array_agg(k order by k),'{}') into changes from unnest(array['state','starts_at','ends_at','people','note','offer_expires_at']) k
   where current_value->k is distinct from previous->k;
 end if;
 if not exists(select 1 from public.fk_meeting_history where cooperation_id=project) then
  insert into public.fk_meeting_history(cooperation_id,event_type) values(project,'history_started');
 end if;
 insert into public.fk_meeting_history(cooperation_id,participant_id,actor_id,event_type,version,role,request_id,revision,room_state,changed_fields,prior_reminder_id)
 values(project,participant,actor,kind,ver,event_role,req,rev,case when kind='room_terms' then current_value->>'state' end,changes,reminder);
 return new;
end $$;
revoke all on function folkoop_private.meeting_history_trigger() from public,anon,authenticated;
create trigger fk_reminder_history after insert or update on public.fk_meeting_reminders for each row execute function folkoop_private.meeting_history_trigger();
create trigger fk_response_history after insert or update on public.fk_meeting_responses for each row execute function folkoop_private.meeting_history_trigger();
create trigger fk_terms_history after insert on public.fk_meeting_terms for each row execute function folkoop_private.meeting_history_trigger();
create trigger fk_room_link_history after insert on public.fk_meeting_rooms for each row execute function folkoop_private.meeting_history_trigger();
create trigger fk_room_terms_history after insert on public.fk_room_request_versions for each row execute function folkoop_private.meeting_history_trigger();

create function folkoop_private.account_closure_inventory_v10(p_user uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select folkoop_private.account_closure_inventory_v9(p_user)||jsonb_build_object('meeting_history',
 (select count(*) from public.fk_meeting_history where participant_id=p_user or actor_id=p_user))
$$;
revoke all on function folkoop_private.account_closure_inventory_v10(uuid) from public,anon,authenticated;
commit;
