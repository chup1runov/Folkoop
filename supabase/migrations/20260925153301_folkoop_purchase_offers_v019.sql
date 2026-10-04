-- FOLKOOP v0.19 marketplace offers for shared purchases. Coordination only; no payment.
begin;

create table public.fk_purchase_offers(
 id uuid primary key default gen_random_uuid(),
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 provider_id uuid not null references auth.users(id) on delete cascade,
 unit_price numeric(14,2) not null check(unit_price>0 and unit_price<=1000000000),
 currency text not null check(currency ~ '^[A-Z]{3}$'),
 min_quantity numeric(14,3) not null check(min_quantity>0 and min_quantity<=1000000000),
 available_quantity numeric(14,3) check(available_quantity is null or (available_quantity>0 and available_quantity<=1000000000)),
 delivery_mode text not null check(delivery_mode in ('pickup','delivery','both')),
 delivery_fee numeric(14,2) not null default 0 check(delivery_fee>=0 and delivery_fee<=1000000000),
 lead_time_days integer not null default 0 check(lead_time_days between 0 and 365),
 valid_until date,
 note text not null default '' check(length(note)<=1000),
 withdrawn_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(cooperation_id,provider_id),
 check(delivery_mode<>'pickup' or delivery_fee=0)
);
create index fk_purchase_offers_coop_idx on public.fk_purchase_offers(cooperation_id,withdrawn_at,unit_price);
create index fk_purchase_offers_provider_idx on public.fk_purchase_offers(provider_id,updated_at desc);

create table public.fk_purchase_offer_choice(
 cooperation_id uuid primary key references public.fk_cooperations(id) on delete cascade,
 offer_id uuid not null references public.fk_purchase_offers(id) on delete cascade,
 selected_by uuid not null references auth.users(id) on delete cascade,
 selected_at timestamptz not null default now()
);
create index fk_purchase_offer_choice_offer_idx on public.fk_purchase_offer_choice(offer_id);
create index fk_purchase_offer_choice_selected_by_idx on public.fk_purchase_offer_choice(selected_by,selected_at desc);

create table public.fk_purchase_offer_reports(
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references auth.users(id) on delete cascade,
 offer_id uuid references public.fk_purchase_offers(id) on delete set null,
 reason text not null check(length(btrim(reason)) between 2 and 1000),
 created_at timestamptz not null default now()
);
create index fk_purchase_offer_reports_reporter_idx on public.fk_purchase_offer_reports(reporter_id,created_at desc);
create index fk_purchase_offer_reports_offer_idx on public.fk_purchase_offer_reports(offer_id);

do $$ declare tab text; begin
 foreach tab in array array['fk_purchase_offers','fk_purchase_offer_choice','fk_purchase_offer_reports'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('revoke all on public.%I from public,anon,authenticated',tab);
  execute format('grant select on public.%I to authenticated',tab);
 end loop;
end $$;

create policy purchase_offers_read on public.fk_purchase_offers for select to authenticated
using(
 folkoop_private.is_pilot()
 and (
  provider_id=(select auth.uid())
  or (
   folkoop_private.coop_member(cooperation_id)
   and not folkoop_private.is_blocked(provider_id)
  )
 )
);

create policy purchase_offer_choice_read on public.fk_purchase_offer_choice for select to authenticated
using(
 folkoop_private.is_pilot()
 and (
  folkoop_private.coop_member(cooperation_id)
  or exists(
   select 1 from public.fk_purchase_offers o
   where o.id=offer_id and o.provider_id=(select auth.uid())
  )
 )
);

create policy purchase_offer_reports_read on public.fk_purchase_offer_reports for select to authenticated
using(folkoop_private.is_pilot() and reporter_id=(select auth.uid()));

create function public.fk_save_purchase_offer(
 p_cooperation uuid,
 p_unit_price numeric,
 p_currency text,
 p_min_quantity numeric,
 p_available_quantity numeric,
 p_delivery_mode text,
 p_delivery_fee numeric,
 p_lead_time_days integer,
 p_valid_until date,
 p_note text
) returns uuid
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid:=folkoop_private.actor();
 oid uuid;
 owner uuid;
begin
 select owner_id into owner from public.fk_cooperations
 where id=p_cooperation and kind='purchase' and status in ('open','active');
 if owner is null then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if not exists(select 1 from public.fk_profiles where id=uid and listed) then
  raise insufficient_privilege using message='DISCOVERABLE_PROFILE_REQUIRED';
 end if;
 if folkoop_private.is_blocked(owner) then
  raise insufficient_privilege using message='UNAVAILABLE';
 end if;
 if p_unit_price is null or p_unit_price<=0 or p_unit_price>1000000000 then raise exception 'INVALID_PRICE'; end if;
 p_currency:=upper(btrim(coalesce(p_currency,'')));
 if p_currency !~ '^[A-Z]{3}$' then raise exception 'INVALID_CURRENCY'; end if;
 if p_min_quantity is null or p_min_quantity<=0 or p_min_quantity>1000000000 then raise exception 'INVALID_QUANTITY'; end if;
 if p_available_quantity is not null and (p_available_quantity<=0 or p_available_quantity>1000000000 or p_available_quantity<p_min_quantity) then raise exception 'INVALID_QUANTITY'; end if;
 if p_delivery_mode not in ('pickup','delivery','both') then raise exception 'INVALID_DELIVERY'; end if;
 p_delivery_fee:=coalesce(p_delivery_fee,0);
 if p_delivery_fee<0 or p_delivery_fee>1000000000 then raise exception 'INVALID_PRICE'; end if;
 if p_delivery_mode='pickup' then p_delivery_fee:=0; end if;
 p_lead_time_days:=coalesce(p_lead_time_days,0);
 if p_lead_time_days<0 or p_lead_time_days>365 then raise exception 'INVALID_LEAD_TIME'; end if;
 if p_valid_until is not null and p_valid_until<current_date then raise exception 'EXPIRED_OFFER'; end if;
 if (select count(*) from public.fk_purchase_offers where cooperation_id=p_cooperation and withdrawn_at is null)>=100
    and not exists(select 1 from public.fk_purchase_offers where cooperation_id=p_cooperation and provider_id=uid) then
   raise exception 'LIMIT_REACHED';
 end if;

 insert into public.fk_purchase_offers(
  cooperation_id,provider_id,unit_price,currency,min_quantity,available_quantity,
  delivery_mode,delivery_fee,lead_time_days,valid_until,note,withdrawn_at,updated_at
 ) values(
  p_cooperation,uid,p_unit_price,p_currency,p_min_quantity,p_available_quantity,
  p_delivery_mode,p_delivery_fee,p_lead_time_days,p_valid_until,coalesce(p_note,''),null,now()
 )
 on conflict(cooperation_id,provider_id) do update set
  unit_price=excluded.unit_price,
  currency=excluded.currency,
  min_quantity=excluded.min_quantity,
  available_quantity=excluded.available_quantity,
  delivery_mode=excluded.delivery_mode,
  delivery_fee=excluded.delivery_fee,
  lead_time_days=excluded.lead_time_days,
  valid_until=excluded.valid_until,
  note=excluded.note,
  withdrawn_at=null,
  updated_at=now()
 returning id into oid;
 return oid;
end $$;

create function public.fk_withdraw_purchase_offer(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); oid uuid;
begin
 update public.fk_purchase_offers
 set withdrawn_at=now(),updated_at=now()
 where cooperation_id=p_cooperation and provider_id=uid and withdrawn_at is null
 returning id into oid;
 if oid is not null then
  delete from public.fk_purchase_offer_choice where cooperation_id=p_cooperation and offer_id=oid;
 end if;
end $$;

create function public.fk_choose_purchase_offer(p_cooperation uuid,p_offer uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(
  select 1 from public.fk_cooperations
  where id=p_cooperation and kind='purchase' and owner_id=uid and status in ('open','active')
 ) then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;

 if p_offer is null then
  delete from public.fk_purchase_offer_choice where cooperation_id=p_cooperation;
  return;
 end if;

 if not exists(
  select 1 from public.fk_purchase_offers
  where id=p_offer and cooperation_id=p_cooperation and withdrawn_at is null
    and (valid_until is null or valid_until>=current_date)
 ) then raise exception 'UNAVAILABLE'; end if;

 insert into public.fk_purchase_offer_choice(cooperation_id,offer_id,selected_by,selected_at)
 values(p_cooperation,p_offer,uid,now())
 on conflict(cooperation_id) do update set
  offer_id=excluded.offer_id,selected_by=excluded.selected_by,selected_at=excluded.selected_at;
end $$;

create function public.fk_report_purchase_offer(p_offer uuid,p_reason text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(
  select 1 from public.fk_purchase_offers o
  where o.id=p_offer
    and o.provider_id<>uid
    and o.withdrawn_at is null
    and folkoop_private.coop_member(o.cooperation_id)
    and not folkoop_private.is_blocked(o.provider_id)
 ) then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if (select count(*) from public.fk_purchase_offer_reports where reporter_id=uid and created_at>now()-interval '1 hour')>=10 then
  raise exception 'RATE_LIMIT';
 end if;
 insert into public.fk_purchase_offer_reports(reporter_id,offer_id,reason)
 values(uid,p_offer,btrim(p_reason));
end $$;

do $$ declare f regprocedure; begin
 for f in select oid::regprocedure
 from pg_proc
 where pronamespace='public'::regnamespace
 and proname in ('fk_save_purchase_offer','fk_withdraw_purchase_offer','fk_choose_purchase_offer','fk_report_purchase_offer')
 loop
  execute format('revoke all on function %s from public,anon,authenticated',f);
  execute format('grant execute on function %s to authenticated',f);
 end loop;
end $$;

commit;
