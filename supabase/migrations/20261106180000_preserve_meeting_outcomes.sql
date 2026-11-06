-- Forward-only: membership changes must not rewrite an event's outcome.
begin;
alter table public.fk_meeting_outcomes
 drop constraint fk_meeting_outcomes_cooperation_id_user_id_fkey;
alter table public.fk_meeting_outcomes
 add constraint fk_meeting_outcomes_user_id_fkey foreign key(user_id)
 references auth.users(id) on delete cascade;
-- The meeting/version FK still removes outcomes when the meeting itself is deleted.
-- Auth deletion still removes this person's data; leaving/kicking membership does not.
commit;
