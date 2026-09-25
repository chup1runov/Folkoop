-- FOLKOOP v0.20 shared-purchase lifecycle.
-- Coordination records only. No payment, order submission or delivery verification.
begin;

create table public.fk_purchase_process(
 cooperation_id uuid primary key references public.fk_cooperations(id) on delete cascade,
 stage text not null default 'collecting'
   check(stage in ('collecting','offer_selected','confirming','ordered','delivered','distributing','done','cancelled')),
 confirmation_deadline timestamptz,
 external_order_reference text not null default '' check(length(external_order_reference)<=120),
 ordered_at timestamptz,
 expected_delivery_at timestamptz,
 delivery_note text not null default '' check(length(delivery_note)<=1000),
 delivered_at timestamptz,
 pickup_place text not null default '' check(length(pickup_place)<=200),
 pickup_start timestamptz,
 pickup_end timestamptz,
 result_note text not null default '' check(length(result_note)<=2000),
 finished_at timestamptz,
 updated_at timestamptz not null default now(),
 check(pickup_end is null or pickup_start is null or pickup_end>=pickup_start)
);

create table public.fk_purchase_confirmations(
 cooperation_id uuid not null references public.fk_cooperations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 quantity numeric(14,3) not null check(quantity>0 and quantity<=1000000000),
 decision text not null default 'pending' check(decision in ('pending','confirmed','declined')),
 note text not null default '' check(length(note)<=500),
 decided_at timestamptz,
 collected_at timestamptz,
 collected_note text not null default '' check(length(collected_note)<=500),
 updated_at timestamptz not null default now(),
 primary key(cooperation_id,user_id),
 check((decision='pending' and decided_at is null) or (decision<>'pending' and decided_at is not null)),
 check(decision='confirmed' or collected_at is null)
);
create index fk_purchase_confirmations_user_idx
 on public.fk_purchase_confirmations(user_id,cooperation_id);
create index fk_purchase_confirmations_stage_idx
 on public.fk_purchase_confirmations(cooperation_id,decision,collected_at);

do $$ declare tab text; begin
 foreach tab in array array['fk_purchase_process','fk_purchase_confirmations'] loop
  execute format('alter table public.%I enable row level security',tab);
  execute format('revoke all on public.%I from public,anon,authenticated',tab);
  execute format('grant select on public.%I to authenticated',tab);
 end loop;
end $$;

create function folkoop_private.selected_purchase_provider(cid uuid) returns boolean
language sql stable security definer set search_path=''
as $$
 select folkoop_private.is_pilot()
 and exists(
  select 1
  from public.fk_purchase_offer_choice ch
  join public.fk_purchase_offers o on o.id=ch.offer_id
  where ch.cooperation_id=cid
    and o.provider_id=auth.uid()
 )
$$;
revoke all on function folkoop_private.selected_purchase_provider(uuid)
 from public,anon,authenticated;
grant execute on function folkoop_private.selected_purchase_provider(uuid) to authenticated;

create policy purchase_process_read on public.fk_purchase_process for select to authenticated
using(
 folkoop_private.coop_member(cooperation_id)
 or folkoop_private.selected_purchase_provider(cooperation_id)
);

create policy purchase_confirmations_read on public.fk_purchase_confirmations for select to authenticated
using(folkoop_private.coop_member(cooperation_id));

-- Ensure future purchases get a process row. Existing zero-row pilot data can be initialized lazily too.
create or replace function public.fk_create_cooperation(
 p_kind text,
 p_title text,
 p_description text,
 p_location text,
 p_target_quantity numeric,
 p_unit text
) returns uuid
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); cid uuid;
begin
 if p_kind not in ('need','offer','purchase','resource','project') then raise exception 'INVALID_KIND'; end if;
 if (select count(*) from public.fk_cooperations where owner_id=uid and status<>'cancelled')>=50 then raise exception 'LIMIT_REACHED'; end if;
 if p_kind='purchase' then
  if p_target_quantity is null or p_target_quantity<=0 or length(btrim(coalesce(p_unit,'')))<1 then raise exception 'INVALID_QUANTITY'; end if;
 else
  p_target_quantity:=null;p_unit:='';
 end if;
 insert into public.fk_cooperations(owner_id,kind,title,description,location_text,target_quantity,unit)
 values(uid,p_kind,btrim(p_title),coalesce(p_description,''),coalesce(p_location,''),p_target_quantity,btrim(coalesce(p_unit,'')))
 returning id into cid;
 insert into public.fk_cooperation_members(cooperation_id,user_id,role) values(cid,uid,'owner');
 if p_kind='purchase' then
  insert into public.fk_purchase_process(cooperation_id) values(cid);
 end if;
 return cid;
end $$;

-- Freeze buyer membership once final confirmation begins.
create or replace function public.fk_join_cooperation(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); owner uuid; k text; st text;
begin
 select owner_id,kind into owner,k from public.fk_cooperations
 where id=p_cooperation and status in ('open','active');
 if owner is null then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if folkoop_private.is_blocked(owner) then raise insufficient_privilege using message='UNAVAILABLE'; end if;
 if k='purchase' then
  insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
  select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
  if st not in ('collecting','offer_selected') then raise exception 'FROZEN_PROCESS'; end if;
 end if;
 if exists(select 1 from public.fk_cooperation_members where cooperation_id=p_cooperation and user_id=uid) then return; end if;
 if (select count(*) from public.fk_cooperation_members where user_id=uid)>=100 then raise exception 'LIMIT_REACHED'; end if;
 insert into public.fk_cooperation_members(cooperation_id,user_id,role) values(p_cooperation,uid,'member');
end $$;

create or replace function public.fk_leave_cooperation(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); k text; st text;
begin
 if exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid) then
  raise exception 'OWNER_MUST_DELETE_COOPERATION';
 end if;
 select kind into k from public.fk_cooperations where id=p_cooperation;
 if k='purchase' then
  insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
  select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
  if st not in ('collecting','offer_selected') then raise exception 'FROZEN_PROCESS'; end if;
  delete from public.fk_purchase_commitments where cooperation_id=p_cooperation and user_id=uid;
 end if;
 delete from public.fk_cooperation_members where cooperation_id=p_cooperation and user_id=uid;
end $$;

create or replace function public.fk_remove_cooperation_member(p_cooperation uuid,p_user uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); k text; st text;
begin
 if p_user=uid or not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid) then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 select kind into k from public.fk_cooperations where id=p_cooperation;
 if k='purchase' then
  insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
  select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
  if st not in ('collecting','offer_selected') then raise exception 'FROZEN_PROCESS'; end if;
  delete from public.fk_purchase_commitments where cooperation_id=p_cooperation and user_id=p_user;
 end if;
 delete from public.fk_cooperation_members where cooperation_id=p_cooperation and user_id=p_user and role='member';
end $$;

create or replace function public.fk_set_purchase_commitment(
 p_cooperation uuid,p_quantity numeric,p_note text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and kind='purchase' and status in ('open','active')) then
  raise exception 'PURCHASE_REQUIRED';
 end if;
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
 if st not in ('collecting','offer_selected') then raise exception 'FROZEN_PROCESS'; end if;
 if p_quantity is null or p_quantity<=0 then
  delete from public.fk_purchase_commitments where cooperation_id=p_cooperation and user_id=uid;
  return;
 end if;
 if p_quantity>1000000000 then raise exception 'INVALID_QUANTITY'; end if;
 insert into public.fk_purchase_commitments(cooperation_id,user_id,quantity,note,updated_at)
 values(p_cooperation,uid,p_quantity,coalesce(p_note,''),now())
 on conflict(cooperation_id,user_id) do update
 set quantity=excluded.quantity,note=excluded.note,updated_at=excluded.updated_at;
end $$;

-- Purchase metadata cannot bypass the lifecycle once the lifecycle is active.
create or replace function public.fk_update_cooperation(
 p_cooperation uuid,
 p_title text,
 p_description text,
 p_location text,
 p_status text,
 p_target_quantity numeric,
 p_unit text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); k text; st text;
begin
 select kind into k from public.fk_cooperations where id=p_cooperation and owner_id=uid;
 if k is null then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
 if p_status not in ('open','active','done','cancelled') then raise exception 'INVALID_STATUS'; end if;
 if k='purchase' then
  insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
  select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
  if st in ('confirming','ordered','delivered','distributing') and p_status in ('done','cancelled') then
   raise exception 'USE_PURCHASE_LIFECYCLE';
  end if;
  if st='done' and p_status<>'done' then raise exception 'FROZEN_PROCESS'; end if;
  if st='cancelled' and p_status<>'cancelled' then raise exception 'FROZEN_PROCESS'; end if;
  if p_target_quantity is null or p_target_quantity<=0 or length(btrim(coalesce(p_unit,'')))<1 then raise exception 'INVALID_QUANTITY'; end if;
 else
  p_target_quantity:=null;p_unit:='';
 end if;
 update public.fk_cooperations
 set title=btrim(p_title),description=coalesce(p_description,''),location_text=coalesce(p_location,''),
     status=p_status,target_quantity=p_target_quantity,unit=btrim(coalesce(p_unit,'')),updated_at=now()
 where id=p_cooperation and owner_id=uid;
end $$;

-- Selection is allowed only before confirmation starts.
create or replace function public.fk_choose_purchase_offer(p_cooperation uuid,p_offer uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if not exists(
  select 1 from public.fk_cooperations
  where id=p_cooperation and kind='purchase' and owner_id=uid and status in ('open','active')
 ) then raise insufficient_privilege using message='OWNER_REQUIRED'; end if;
 insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation for update;
 if st not in ('collecting','offer_selected') then raise exception 'FROZEN_PROCESS'; end if;

 if p_offer is null then
  delete from public.fk_purchase_offer_choice where cooperation_id=p_cooperation;
  update public.fk_purchase_process set stage='collecting',updated_at=now() where cooperation_id=p_cooperation;
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
 update public.fk_purchase_process set stage='offer_selected',updated_at=now() where cooperation_id=p_cooperation;
end $$;

-- Supplier terms are editable only before confirmation starts.
create or replace function public.fk_save_purchase_offer(
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
 st text;
begin
 select owner_id into owner from public.fk_cooperations
 where id=p_cooperation and kind='purchase' and status in ('open','active');
 if owner is null then raise insufficient_privilege using message='UNAVAILABLE'; end if;

 insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
 if st not in ('collecting','offer_selected') then raise exception 'FROZEN_PROCESS'; end if;

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
 if p_available_quantity is not null and (p_available_quantity<=0 or p_available_quantity>1000000000 or p_available_quantity<p_min_quantity) then
  raise exception 'INVALID_QUANTITY';
 end if;
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

 -- Changing a selected offer invalidates the previous selection.
 if exists(select 1 from public.fk_purchase_offer_choice where cooperation_id=p_cooperation and offer_id=oid) then
  delete from public.fk_purchase_offer_choice where cooperation_id=p_cooperation and offer_id=oid;
  update public.fk_purchase_process set stage='collecting',updated_at=now() where cooperation_id=p_cooperation;
 end if;

 return oid;
end $$;

-- Suppliers may withdraw before an external order is marked.
-- Withdrawing a selected offer during confirmation resets the confirmation round.
create or replace function public.fk_withdraw_purchase_offer(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); oid uuid; selected boolean; st text;
begin
 insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation for update;

 if st in ('ordered','delivered','distributing','done','cancelled') then
  raise exception 'FROZEN_PROCESS';
 end if;

 update public.fk_purchase_offers
 set withdrawn_at=now(),updated_at=now()
 where cooperation_id=p_cooperation and provider_id=uid and withdrawn_at is null
 returning id into oid;

 if oid is not null then
  select exists(
   select 1 from public.fk_purchase_offer_choice
   where cooperation_id=p_cooperation and offer_id=oid
  ) into selected;

  if selected then
   delete from public.fk_purchase_offer_choice
   where cooperation_id=p_cooperation and offer_id=oid;

   delete from public.fk_purchase_confirmations
   where cooperation_id=p_cooperation;

   update public.fk_purchase_process
   set stage='collecting',
       confirmation_deadline=null,
       updated_at=now()
   where cooperation_id=p_cooperation;
  end if;
 end if;
end $$;

create function public.fk_start_purchase_confirmation(
 p_cooperation uuid,p_deadline timestamptz
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text; n integer;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and kind='purchase' and owner_id=uid and status in ('open','active')) then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if p_deadline is null or p_deadline<=now() or p_deadline>now()+interval '90 days' then raise exception 'INVALID_DEADLINE'; end if;
 insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation for update;
 if st<>'offer_selected' then raise exception 'OFFER_REQUIRED'; end if;
 if not exists(
  select 1 from public.fk_purchase_offer_choice ch
  join public.fk_purchase_offers o on o.id=ch.offer_id
  where ch.cooperation_id=p_cooperation and o.withdrawn_at is null
    and (o.valid_until is null or o.valid_until>=current_date)
 ) then raise exception 'OFFER_REQUIRED'; end if;
 select count(*) into n from public.fk_purchase_commitments where cooperation_id=p_cooperation and quantity>0;
 if n=0 then raise exception 'COMMITMENTS_REQUIRED'; end if;

 delete from public.fk_purchase_confirmations where cooperation_id=p_cooperation;
 insert into public.fk_purchase_confirmations(cooperation_id,user_id,quantity)
 select cooperation_id,user_id,quantity
 from public.fk_purchase_commitments
 where cooperation_id=p_cooperation and quantity>0;

 update public.fk_purchase_process
 set stage='confirming',confirmation_deadline=p_deadline,
     external_order_reference='',ordered_at=null,expected_delivery_at=null,
     delivery_note='',delivered_at=null,pickup_place='',pickup_start=null,pickup_end=null,
     result_note='',finished_at=null,updated_at=now()
 where cooperation_id=p_cooperation;
 update public.fk_cooperations set status='active',updated_at=now() where id=p_cooperation;
end $$;

create function public.fk_confirm_purchase_participation(
 p_cooperation uuid,p_confirm boolean,p_note text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); deadline timestamptz;
begin
 if p_confirm is null then raise exception 'INVALID_DECISION'; end if;
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 select confirmation_deadline into deadline
 from public.fk_purchase_process
 where cooperation_id=p_cooperation and stage='confirming';
 if deadline is null then raise exception 'CONFIRMATION_NOT_OPEN'; end if;
 if now()>deadline then raise exception 'CONFIRMATION_CLOSED'; end if;
 update public.fk_purchase_confirmations
 set decision=case when p_confirm then 'confirmed' else 'declined' end,
     note=coalesce(p_note,''),decided_at=now(),updated_at=now(),
     collected_at=null,collected_note=''
 where cooperation_id=p_cooperation and user_id=uid;
 if not found then raise exception 'NO_COMMITMENT_SNAPSHOT'; end if;
end $$;

create function public.fk_reset_purchase_confirmation(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage='confirming') then
  raise exception 'CONFIRMATION_NOT_OPEN';
 end if;
 delete from public.fk_purchase_confirmations where cooperation_id=p_cooperation;
 update public.fk_purchase_process
 set stage=case when exists(select 1 from public.fk_purchase_offer_choice where cooperation_id=p_cooperation) then 'offer_selected' else 'collecting' end,
     confirmation_deadline=null,updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_mark_purchase_ordered(
 p_cooperation uuid,
 p_reference text,
 p_expected_delivery timestamptz,
 p_note text,
 p_pickup_place text,
 p_pickup_start timestamptz,
 p_pickup_end timestamptz
) returns void
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid:=folkoop_private.actor();
 pending_count integer;
 confirmed_count integer;
 total numeric;
 minq numeric;
 avail numeric;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage='confirming') then
  raise exception 'CONFIRMATION_NOT_OPEN';
 end if;
 select count(*) filter(where decision='pending'),
        count(*) filter(where decision='confirmed'),
        coalesce(sum(quantity) filter(where decision='confirmed'),0)
 into pending_count,confirmed_count,total
 from public.fk_purchase_confirmations where cooperation_id=p_cooperation;
 if pending_count>0 then raise exception 'PENDING_CONFIRMATIONS'; end if;
 if confirmed_count=0 then raise exception 'NO_CONFIRMED_PARTICIPANTS'; end if;

 select o.min_quantity,o.available_quantity into minq,avail
 from public.fk_purchase_offer_choice ch
 join public.fk_purchase_offers o on o.id=ch.offer_id
 where ch.cooperation_id=p_cooperation and o.withdrawn_at is null
   and (o.valid_until is null or o.valid_until>=current_date);
 if minq is null then raise exception 'OFFER_REQUIRED'; end if;
 if total<minq then raise exception 'BELOW_MINIMUM'; end if;
 if avail is not null and total>avail then raise exception 'ABOVE_AVAILABLE'; end if;
 if p_expected_delivery is not null and p_expected_delivery<now() then raise exception 'INVALID_DELIVERY_TIME'; end if;
 if p_pickup_end is not null and p_pickup_start is not null and p_pickup_end<p_pickup_start then raise exception 'INVALID_PICKUP_WINDOW'; end if;

 update public.fk_purchase_process
 set stage='ordered',
     external_order_reference=coalesce(p_reference,''),
     ordered_at=now(),
     expected_delivery_at=p_expected_delivery,
     delivery_note=coalesce(p_note,''),
     pickup_place=coalesce(p_pickup_place,''),
     pickup_start=p_pickup_start,
     pickup_end=p_pickup_end,
     updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_set_purchase_delivery_plan(
 p_cooperation uuid,
 p_expected_delivery timestamptz,
 p_note text,
 p_pickup_place text,
 p_pickup_start timestamptz,
 p_pickup_end timestamptz
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
 if st not in ('ordered','delivered','distributing') then raise exception 'INVALID_STAGE'; end if;
 if p_expected_delivery is not null and p_expected_delivery<now()-interval '1 day' then raise exception 'INVALID_DELIVERY_TIME'; end if;
 if p_pickup_end is not null and p_pickup_start is not null and p_pickup_end<p_pickup_start then raise exception 'INVALID_PICKUP_WINDOW'; end if;
 update public.fk_purchase_process
 set expected_delivery_at=p_expected_delivery,delivery_note=coalesce(p_note,''),
     pickup_place=coalesce(p_pickup_place,''),pickup_start=p_pickup_start,pickup_end=p_pickup_end,updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_mark_purchase_delivered(p_cooperation uuid,p_note text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage='ordered') then
  raise exception 'INVALID_STAGE';
 end if;
 update public.fk_purchase_process
 set stage='delivered',delivered_at=now(),
     delivery_note=case when length(btrim(coalesce(p_note,'')))>0 then btrim(p_note) else delivery_note end,
     updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_mark_purchase_collected(
 p_cooperation uuid,p_collected boolean,p_note text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if p_collected is null then raise exception 'INVALID_DECISION'; end if;
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
 if st not in ('delivered','distributing') then raise exception 'INVALID_STAGE'; end if;
 update public.fk_purchase_confirmations
 set collected_at=case when p_collected then now() else null end,
     collected_note=coalesce(p_note,''),updated_at=now()
 where cooperation_id=p_cooperation and user_id=uid and decision='confirmed';
 if not found then raise exception 'NOT_CONFIRMED'; end if;
 if p_collected and st='delivered' then
  update public.fk_purchase_process set stage='distributing',updated_at=now() where cooperation_id=p_cooperation;
 end if;
end $$;

create function public.fk_finish_purchase(p_cooperation uuid,p_result_note text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); missing integer;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage in ('delivered','distributing')) then
  raise exception 'INVALID_STAGE';
 end if;
 select count(*) into missing from public.fk_purchase_confirmations
 where cooperation_id=p_cooperation and decision='confirmed' and collected_at is null;
 if missing>0 and length(btrim(coalesce(p_result_note,'')))<10 then raise exception 'RESULT_NOTE_REQUIRED'; end if;
 update public.fk_purchase_process
 set stage='done',result_note=coalesce(p_result_note,''),finished_at=now(),updated_at=now()
 where cooperation_id=p_cooperation;
 update public.fk_cooperations set status='done',updated_at=now() where id=p_cooperation;
end $$;

create function public.fk_cancel_purchase_process(p_cooperation uuid,p_reason text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation for update;
 if st in ('done','cancelled') then raise exception 'FROZEN_PROCESS'; end if;
 if length(btrim(coalesce(p_reason,'')))<3 then raise exception 'REASON_REQUIRED'; end if;
 update public.fk_purchase_process
 set stage='cancelled',result_note=btrim(p_reason),finished_at=now(),updated_at=now()
 where cooperation_id=p_cooperation;
 update public.fk_cooperations set status='cancelled',updated_at=now() where id=p_cooperation;
end $$;

do $$ declare f regprocedure; begin
 for f in select oid::regprocedure
 from pg_proc
 where pronamespace='public'::regnamespace
 and proname in (
  'fk_start_purchase_confirmation','fk_confirm_purchase_participation',
  'fk_reset_purchase_confirmation','fk_mark_purchase_ordered',
  'fk_set_purchase_delivery_plan','fk_mark_purchase_delivered',
  'fk_mark_purchase_collected','fk_finish_purchase','fk_cancel_purchase_process'
 )
 loop
  execute format('revoke all on function %s from public,anon,authenticated',f);
  execute format('grant execute on function %s to authenticated',f);
 end loop;
end $$;

commit;
 then raise exception 'INVALID_CURRENCY'; end if;
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
  unit_price=excluded.unit_price,currency=excluded.currency,min_quantity=excluded.min_quantity,
  available_quantity=excluded.available_quantity,delivery_mode=excluded.delivery_mode,
  delivery_fee=excluded.delivery_fee,lead_time_days=excluded.lead_time_days,
  valid_until=excluded.valid_until,note=excluded.note,withdrawn_at=null,updated_at=now()
 returning id into oid;
 return oid;
end $;

-- Suppliers may withdraw before an external order is marked. During confirmation this resets buyer confirmations.
create or replace function public.fk_withdraw_purchase_offer(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); oid uuid; selected boolean; st text;
begin
 insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation for update;
 if st in ('ordered','delivered','distributing','done','cancelled') then raise exception 'FROZEN_PROCESS'; end if;
 update public.fk_purchase_offers
 set withdrawn_at=now(),updated_at=now()
 where cooperation_id=p_cooperation and provider_id=uid and withdrawn_at is null
 returning id into oid;
 if oid is not null then
  select exists(select 1 from public.fk_purchase_offer_choice where cooperation_id=p_cooperation and offer_id=oid) into selected;
  if selected then
   delete from public.fk_purchase_offer_choice where cooperation_id=p_cooperation and offer_id=oid;
   delete from public.fk_purchase_confirmations where cooperation_id=p_cooperation;
   update public.fk_purchase_process
    set stage='collecting',confirmation_deadline=null,updated_at=now()
    where cooperation_id=p_cooperation;
  end if;
 end if;
end $$;

create function public.fk_start_purchase_confirmation(
 p_cooperation uuid,p_deadline timestamptz
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text; n integer;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and kind='purchase' and owner_id=uid and status in ('open','active')) then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if p_deadline is null or p_deadline<=now() or p_deadline>now()+interval '90 days' then raise exception 'INVALID_DEADLINE'; end if;
 insert into public.fk_purchase_process(cooperation_id) values(p_cooperation) on conflict do nothing;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation for update;
 if st<>'offer_selected' then raise exception 'OFFER_REQUIRED'; end if;
 if not exists(
  select 1 from public.fk_purchase_offer_choice ch
  join public.fk_purchase_offers o on o.id=ch.offer_id
  where ch.cooperation_id=p_cooperation and o.withdrawn_at is null
    and (o.valid_until is null or o.valid_until>=current_date)
 ) then raise exception 'OFFER_REQUIRED'; end if;
 select count(*) into n from public.fk_purchase_commitments where cooperation_id=p_cooperation and quantity>0;
 if n=0 then raise exception 'COMMITMENTS_REQUIRED'; end if;

 delete from public.fk_purchase_confirmations where cooperation_id=p_cooperation;
 insert into public.fk_purchase_confirmations(cooperation_id,user_id,quantity)
 select cooperation_id,user_id,quantity
 from public.fk_purchase_commitments
 where cooperation_id=p_cooperation and quantity>0;

 update public.fk_purchase_process
 set stage='confirming',confirmation_deadline=p_deadline,
     external_order_reference='',ordered_at=null,expected_delivery_at=null,
     delivery_note='',delivered_at=null,pickup_place='',pickup_start=null,pickup_end=null,
     result_note='',finished_at=null,updated_at=now()
 where cooperation_id=p_cooperation;
 update public.fk_cooperations set status='active',updated_at=now() where id=p_cooperation;
end $$;

create function public.fk_confirm_purchase_participation(
 p_cooperation uuid,p_confirm boolean,p_note text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); deadline timestamptz;
begin
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 select confirmation_deadline into deadline
 from public.fk_purchase_process
 where cooperation_id=p_cooperation and stage='confirming';
 if deadline is null then raise exception 'CONFIRMATION_NOT_OPEN'; end if;
 if now()>deadline then raise exception 'CONFIRMATION_CLOSED'; end if;
 update public.fk_purchase_confirmations
 set decision=case when p_confirm then 'confirmed' else 'declined' end,
     note=coalesce(p_note,''),decided_at=now(),updated_at=now(),
     collected_at=null,collected_note=''
 where cooperation_id=p_cooperation and user_id=uid;
 if not found then raise exception 'NO_COMMITMENT_SNAPSHOT'; end if;
end $$;

create function public.fk_reset_purchase_confirmation(p_cooperation uuid) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage='confirming') then
  raise exception 'CONFIRMATION_NOT_OPEN';
 end if;
 delete from public.fk_purchase_confirmations where cooperation_id=p_cooperation;
 update public.fk_purchase_process
 set stage=case when exists(select 1 from public.fk_purchase_offer_choice where cooperation_id=p_cooperation) then 'offer_selected' else 'collecting' end,
     confirmation_deadline=null,updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_mark_purchase_ordered(
 p_cooperation uuid,
 p_reference text,
 p_expected_delivery timestamptz,
 p_note text,
 p_pickup_place text,
 p_pickup_start timestamptz,
 p_pickup_end timestamptz
) returns void
language plpgsql security definer set search_path=''
as $$
declare
 uid uuid:=folkoop_private.actor();
 pending_count integer;
 confirmed_count integer;
 total numeric;
 minq numeric;
 avail numeric;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage='confirming') then
  raise exception 'CONFIRMATION_NOT_OPEN';
 end if;
 select count(*) filter(where decision='pending'),
        count(*) filter(where decision='confirmed'),
        coalesce(sum(quantity) filter(where decision='confirmed'),0)
 into pending_count,confirmed_count,total
 from public.fk_purchase_confirmations where cooperation_id=p_cooperation;
 if pending_count>0 then raise exception 'PENDING_CONFIRMATIONS'; end if;
 if confirmed_count=0 then raise exception 'NO_CONFIRMED_PARTICIPANTS'; end if;

 select o.min_quantity,o.available_quantity into minq,avail
 from public.fk_purchase_offer_choice ch
 join public.fk_purchase_offers o on o.id=ch.offer_id
 where ch.cooperation_id=p_cooperation and o.withdrawn_at is null
   and (o.valid_until is null or o.valid_until>=current_date);
 if minq is null then raise exception 'OFFER_REQUIRED'; end if;
 if total<minq then raise exception 'BELOW_MINIMUM'; end if;
 if avail is not null and total>avail then raise exception 'ABOVE_AVAILABLE'; end if;
 if p_expected_delivery is not null and p_expected_delivery<now() then raise exception 'INVALID_DELIVERY_TIME'; end if;
 if p_pickup_end is not null and p_pickup_start is not null and p_pickup_end<p_pickup_start then raise exception 'INVALID_PICKUP_WINDOW'; end if;

 update public.fk_purchase_process
 set stage='ordered',
     external_order_reference=coalesce(p_reference,''),
     ordered_at=now(),
     expected_delivery_at=p_expected_delivery,
     delivery_note=coalesce(p_note,''),
     pickup_place=coalesce(p_pickup_place,''),
     pickup_start=p_pickup_start,
     pickup_end=p_pickup_end,
     updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_set_purchase_delivery_plan(
 p_cooperation uuid,
 p_expected_delivery timestamptz,
 p_note text,
 p_pickup_place text,
 p_pickup_start timestamptz,
 p_pickup_end timestamptz
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
 if st not in ('ordered','delivered','distributing') then raise exception 'INVALID_STAGE'; end if;
 if p_expected_delivery is not null and p_expected_delivery<now()-interval '1 day' then raise exception 'INVALID_DELIVERY_TIME'; end if;
 if p_pickup_end is not null and p_pickup_start is not null and p_pickup_end<p_pickup_start then raise exception 'INVALID_PICKUP_WINDOW'; end if;
 update public.fk_purchase_process
 set expected_delivery_at=p_expected_delivery,delivery_note=coalesce(p_note,''),
     pickup_place=coalesce(p_pickup_place,''),pickup_start=p_pickup_start,pickup_end=p_pickup_end,updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_mark_purchase_delivered(p_cooperation uuid,p_note text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor();
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage='ordered') then
  raise exception 'INVALID_STAGE';
 end if;
 update public.fk_purchase_process
 set stage='delivered',delivered_at=now(),
     delivery_note=case when length(btrim(coalesce(p_note,'')))>0 then btrim(p_note) else delivery_note end,
     updated_at=now()
 where cooperation_id=p_cooperation;
end $$;

create function public.fk_mark_purchase_collected(
 p_cooperation uuid,p_collected boolean,p_note text
) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if not folkoop_private.coop_member(p_cooperation) then raise insufficient_privilege using message='MEMBERSHIP_REQUIRED'; end if;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation;
 if st not in ('delivered','distributing') then raise exception 'INVALID_STAGE'; end if;
 update public.fk_purchase_confirmations
 set collected_at=case when p_collected then now() else null end,
     collected_note=coalesce(p_note,''),updated_at=now()
 where cooperation_id=p_cooperation and user_id=uid and decision='confirmed';
 if not found then raise exception 'NOT_CONFIRMED'; end if;
 if p_collected and st='delivered' then
  update public.fk_purchase_process set stage='distributing',updated_at=now() where cooperation_id=p_cooperation;
 end if;
end $$;

create function public.fk_finish_purchase(p_cooperation uuid,p_result_note text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); missing integer;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 if not exists(select 1 from public.fk_purchase_process where cooperation_id=p_cooperation and stage in ('delivered','distributing')) then
  raise exception 'INVALID_STAGE';
 end if;
 select count(*) into missing from public.fk_purchase_confirmations
 where cooperation_id=p_cooperation and decision='confirmed' and collected_at is null;
 if missing>0 and length(btrim(coalesce(p_result_note,'')))<10 then raise exception 'RESULT_NOTE_REQUIRED'; end if;
 update public.fk_purchase_process
 set stage='done',result_note=coalesce(p_result_note,''),finished_at=now(),updated_at=now()
 where cooperation_id=p_cooperation;
 update public.fk_cooperations set status='done',updated_at=now() where id=p_cooperation;
end $$;

create function public.fk_cancel_purchase_process(p_cooperation uuid,p_reason text) returns void
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=folkoop_private.actor(); st text;
begin
 if not exists(select 1 from public.fk_cooperations where id=p_cooperation and owner_id=uid and kind='purchase') then
  raise insufficient_privilege using message='OWNER_REQUIRED';
 end if;
 select stage into st from public.fk_purchase_process where cooperation_id=p_cooperation for update;
 if st in ('done','cancelled') then raise exception 'FROZEN_PROCESS'; end if;
 if length(btrim(coalesce(p_reason,'')))<3 then raise exception 'REASON_REQUIRED'; end if;
 update public.fk_purchase_process
 set stage='cancelled',result_note=btrim(p_reason),finished_at=now(),updated_at=now()
 where cooperation_id=p_cooperation;
 update public.fk_cooperations set status='cancelled',updated_at=now() where id=p_cooperation;
end $$;

do $$ declare f regprocedure; begin
 for f in select oid::regprocedure
 from pg_proc
 where pronamespace='public'::regnamespace
 and proname in (
  'fk_start_purchase_confirmation','fk_confirm_purchase_participation',
  'fk_reset_purchase_confirmation','fk_mark_purchase_ordered',
  'fk_set_purchase_delivery_plan','fk_mark_purchase_delivered',
  'fk_mark_purchase_collected','fk_finish_purchase','fk_cancel_purchase_process'
 )
 loop
  execute format('revoke all on function %s from public,anon,authenticated',f);
  execute format('grant execute on function %s to authenticated',f);
 end loop;
end $$;

commit;
