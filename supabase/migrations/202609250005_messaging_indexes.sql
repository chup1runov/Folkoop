begin;
create index if not exists fk_conversation_invites_invited_by_idx
on public.fk_conversation_invites(invited_by);
commit;
