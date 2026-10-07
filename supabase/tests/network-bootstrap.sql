-- Disposable CI database ONLY; never run on a live Supabase project.
create schema extensions;
create extension pgcrypto with schema extensions;
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key);
create table auth.sessions(
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 not_after timestamptz
);
create function auth.uid() returns uuid language sql stable as $ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $;
create function auth.jwt() returns jsonb language sql stable as $
 select jsonb_strip_nulls(jsonb_build_object(
  'sub',nullif(current_setting('request.jwt.claim.sub',true),''),
  'session_id',coalesce(
    nullif(current_setting('request.jwt.claim.session_id',true),''),
    nullif(current_setting('request.jwt.claim.sub',true),'')
  )
 ))
$;
grant usage on schema auth to anon,authenticated;
grant execute on function auth.uid(),auth.jwt() to anon,authenticated;
