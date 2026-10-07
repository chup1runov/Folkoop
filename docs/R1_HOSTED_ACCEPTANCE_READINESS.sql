-- R1 hosted two-account readiness audit.
-- Read-only operator/admin SQL. Does not reveal identity values.
-- PASS requires exactly two Auth users explicitly marked as developer/test
-- through app/user metadata, and both already admitted under current policy.
with marked as (
  select id
  from auth.users
  where coalesce(raw_app_meta_data->>'folkoop_test_identity','')='true'
     or coalesce(raw_user_meta_data->>'folkoop_test_identity','')='true'
),
checks as (
  select 'exactly two marked test identities'::text as check_name,
         (select count(*) from marked)::text as actual,
         ((select count(*) from marked)=2) as pass
  union all
  select 'both marked identities are enabled pilots',
         (select count(*) from folkoop_private.pilots p join marked m on m.id=p.user_id where p.enabled)::text,
         ((select count(*) from folkoop_private.pilots p join marked m on m.id=p.user_id where p.enabled)=2)
  union all
  select 'both marked identities have current Terms/Privacy evidence',
         (select count(*) from folkoop_private.pilots p join marked m on m.id=p.user_id
          where p.enabled
            and p.terms_version='2026-09-29-v1'
            and p.terms_accepted_at is not null
            and p.privacy_version='2026-09-29-v1'
            and p.privacy_acknowledged_at is not null)::text,
         ((select count(*) from folkoop_private.pilots p join marked m on m.id=p.user_id
          where p.enabled
            and p.terms_version='2026-09-29-v1'
            and p.terms_accepted_at is not null
            and p.privacy_version='2026-09-29-v1'
            and p.privacy_acknowledged_at is not null)=2)
  union all
  select 'no TECH-R1 leftovers before run',
         (select count(*) from public.fk_cooperations where title like 'TECH-R1:%')::text,
         ((select count(*) from public.fk_cooperations where title like 'TECH-R1:%')=0)
  union all
  select 'R1 feature flag remains an application-side gate',
         'operator must verify resourcePlanningEnabled=false',
         true
)
select check_name,actual,pass
from checks
order by check_name;

with marked as (
  select id
  from auth.users
  where coalesce(raw_app_meta_data->>'folkoop_test_identity','')='true'
     or coalesce(raw_user_meta_data->>'folkoop_test_identity','')='true'
)
select
  (select count(*) from marked)=2
  and (select count(*) from folkoop_private.pilots p join marked m on m.id=p.user_id
       where p.enabled
         and p.terms_version='2026-09-29-v1'
         and p.terms_accepted_at is not null
         and p.privacy_version='2026-09-29-v1'
         and p.privacy_acknowledged_at is not null)=2
  and (select count(*) from public.fk_cooperations where title like 'TECH-R1:%')=0
  as r1_hosted_acceptance_readiness_pass;
