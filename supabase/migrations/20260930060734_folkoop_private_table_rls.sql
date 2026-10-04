-- FOLKOOP pre-pilot defense-in-depth for private admission/rate-limit tables.
-- Browser roles already have no direct table grants. RLS adds a second barrier.
-- No client policies are created intentionally: access remains through reviewed
-- SECURITY DEFINER functions owned by the table owner. FORCE ROW LEVEL SECURITY
-- is deliberately not enabled so those owner-executed functions retain access.
begin;

alter table folkoop_private.pilots enable row level security;
alter table folkoop_private.write_budgets enable row level security;
alter table folkoop_private.pilot_invites enable row level security;

commit;
