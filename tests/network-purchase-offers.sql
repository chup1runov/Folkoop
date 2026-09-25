-- Disposable PostgreSQL checks for FOLKOOP v0.19 purchase offers.
\set ON_ERROR_STOP on
begin;

create schema fk_offer_test;
grant usage on schema fk_offer_test to authenticated;
create function fk_offer_test.ok(value boolean,label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function fk_offer_test.denied(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when insufficient_privilege then return true; end $$;
create function fk_offer_test.rejected(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when others then return true; end $$;
grant execute on all functions in schema fk_offer_test to authenticated;

insert into auth.users values
 ('10101010-1010-4010-8010-101010101010'),
 ('20202020-2020-4020-8020-202020202020'),
 ('30303030-3030-4030-8030-303030303030'),
 ('40404040-4040-4040-8040-404040404040');
insert into folkoop_private.pilots(user_id) values
 ('10101010-1010-4010-8010-101010101010'),
 ('20202020-2020-4020-8020-202020202020'),
 ('30303030-3030-4030-8030-303030303030'),
 ('40404040-4040-4040-8040-404040404040');

set local role authenticated;

-- Owner creates a purchase and member joins.
select set_config('request.jwt.claim.sub','10101010-1010-4010-8010-101010101010',true);
select public.fk_save_profile('Owner','Buyer','',true);
select public.fk_create_cooperation('purchase','Shared pellets','Compare supplier offers','Göteborg',1000,'kg') as purchase_id \gset

select set_config('request.jwt.claim.sub','20202020-2020-4020-8020-202020202020',true);
select public.fk_save_profile('Member','Buyer','',true);
select public.fk_join_cooperation(:'purchase_id');

-- Listed provider can offer without joining.
select set_config('request.jwt.claim.sub','30303030-3030-4030-8030-303030303030',true);
select public.fk_save_profile('Supplier','Delivery','',true);
select public.fk_save_purchase_offer(
 :'purchase_id',5.25,'sek',100,1500,'delivery',450,3,current_date+7,'Delivered to one point'
) as offer_id \gset
select fk_offer_test.ok((select currency='SEK' and unit_price=5.25 and withdrawn_at is null from public.fk_purchase_offers where id=:'offer_id'),'provider creates normalized offer');
select fk_offer_test.ok((select count(*)=1 from public.fk_purchase_offers where cooperation_id=:'purchase_id'),'provider sees own offer without joining purchase');
select fk_offer_test.ok((select count(*)=0 from public.fk_cooperation_members where cooperation_id=:'purchase_id' and user_id='30303030-3030-4030-8030-303030303030'),'provider is not silently enrolled as buyer');

-- Outsider neither member nor provider cannot inspect offers.
select set_config('request.jwt.claim.sub','40404040-4040-4040-8040-404040404040',true);
select public.fk_save_profile('Private supplier','', '',false);
select fk_offer_test.ok((select count(*)=0 from public.fk_purchase_offers where cooperation_id=:'purchase_id'),'outsider cannot enumerate supplier offers');
select fk_offer_test.ok(fk_offer_test.denied(format(
 'select public.fk_save_purchase_offer(%L,4.9,''SEK'',100,1000,''pickup'',0,1,current_date+5,''hidden profile'')',:'purchase_id'
)),'unlisted profile cannot submit supplier offer');

-- Joined buyer can compare; only owner may choose.
select set_config('request.jwt.claim.sub','20202020-2020-4020-8020-202020202020',true);
select fk_offer_test.ok((select count(*)=1 from public.fk_purchase_offers where cooperation_id=:'purchase_id'),'joined member sees active offers');
select fk_offer_test.ok(fk_offer_test.denied(format(
 'select public.fk_choose_purchase_offer(%L,%L)',:'purchase_id',:'offer_id'
)),'ordinary purchase member cannot choose supplier offer');
select public.fk_report_purchase_offer(:'offer_id','Test report');
select fk_offer_test.ok((select count(*)=1 from public.fk_purchase_offer_reports),'reporter sees own supplier report');

select set_config('request.jwt.claim.sub','40404040-4040-4040-8040-404040404040',true);
select fk_offer_test.ok((select count(*)=0 from public.fk_purchase_offer_reports),'other pilot cannot read reporter records');

select set_config('request.jwt.claim.sub','10101010-1010-4010-8010-101010101010',true);
select public.fk_choose_purchase_offer(:'purchase_id',:'offer_id');
select fk_offer_test.ok((select offer_id=:'offer_id' from public.fk_purchase_offer_choice where cooperation_id=:'purchase_id'),'purchase owner selects one active offer');

select set_config('request.jwt.claim.sub','30303030-3030-4030-8030-303030303030',true);
select fk_offer_test.ok((select count(*)=1 from public.fk_purchase_offer_choice where cooperation_id=:'purchase_id'),'selected provider can see that its offer was chosen');
select public.fk_withdraw_purchase_offer(:'purchase_id');
select fk_offer_test.ok((select withdrawn_at is not null from public.fk_purchase_offers where id=:'offer_id'),'provider can withdraw own offer');
select fk_offer_test.ok((select count(*)=0 from public.fk_purchase_offer_choice where cooperation_id=:'purchase_id'),'withdrawing selected offer clears owner choice');

-- Server enforces expiry/quantity and block relations.
select fk_offer_test.ok(fk_offer_test.rejected(format(
 'select public.fk_save_purchase_offer(%L,5,''SEK'',100,50,''delivery'',0,1,current_date+5,''bad stock'')',:'purchase_id'
)),'available quantity cannot be below minimum');
select fk_offer_test.ok(fk_offer_test.rejected(format(
 'select public.fk_save_purchase_offer(%L,5,''SEK'',100,1000,''delivery'',0,1,current_date-1,''expired'')',:'purchase_id'
)),'expired supplier offer rejected');

select set_config('request.jwt.claim.sub','10101010-1010-4010-8010-101010101010',true);
select public.fk_block('30303030-3030-4030-8030-303030303030',true);
select set_config('request.jwt.claim.sub','30303030-3030-4030-8030-303030303030',true);
select fk_offer_test.ok(fk_offer_test.denied(format(
 'select public.fk_save_purchase_offer(%L,5.1,''SEK'',100,1200,''delivery'',100,2,current_date+4,''blocked'')',:'purchase_id'
)),'block relation prevents provider from reactivating offer');

reset role;
rollback;
