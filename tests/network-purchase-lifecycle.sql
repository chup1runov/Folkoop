-- Disposable PostgreSQL checks for FOLKOOP v0.20 purchase lifecycle.
\set ON_ERROR_STOP on
begin;

create schema fk_lifecycle_test;
grant usage on schema fk_lifecycle_test to authenticated;
create function fk_lifecycle_test.ok(value boolean,label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function fk_lifecycle_test.denied(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when insufficient_privilege then return true; end $$;
create function fk_lifecycle_test.rejected(statement text) returns boolean language plpgsql as $$
begin execute statement; return false; exception when others then return true; end $$;
grant execute on all functions in schema fk_lifecycle_test to authenticated;

insert into auth.users values
 ('51515151-5151-4515-8515-515151515151'),
 ('62626262-6262-4626-8626-626262626262'),
 ('73737373-7373-4737-8737-737373737373'),
 ('84848484-8484-4848-8848-848484848484');
insert into folkoop_private.pilots(user_id) values
 ('51515151-5151-4515-8515-515151515151'),
 ('62626262-6262-4626-8626-626262626262'),
 ('73737373-7373-4737-8737-737373737373'),
 ('84848484-8484-4848-8848-848484848484');

set local role authenticated;

-- Owner creates purchase and adds own quantity.
select set_config('request.jwt.claim.sub','51515151-5151-4515-8515-515151515151',true);
select public.fk_save_profile('Owner','Coordinator','',true);
select public.fk_create_cooperation('purchase','Shared firewood','Lifecycle test','Göteborg',10,'m3') as purchase_id \gset
select public.fk_set_purchase_commitment(:'purchase_id',4,'Owner quantity');

-- Member joins and commits.
select set_config('request.jwt.claim.sub','62626262-6262-4626-8626-626262626262',true);
select public.fk_save_profile('Member','Buyer','',true);
select public.fk_join_cooperation(:'purchase_id');
select public.fk_set_purchase_commitment(:'purchase_id',6,'Member quantity');

-- Provider creates valid offer.
select set_config('request.jwt.claim.sub','73737373-7373-4737-8737-737373737373',true);
select public.fk_save_profile('Supplier','Delivery','',true);
select public.fk_save_purchase_offer(
 :'purchase_id',100,'SEK',8,20,'delivery',200,2,current_date+30,'One drop-off'
) as offer_id \gset

-- Owner selects offer and starts confirmation.
select set_config('request.jwt.claim.sub','51515151-5151-4515-8515-515151515151',true);
select public.fk_choose_purchase_offer(:'purchase_id',:'offer_id');
select fk_lifecycle_test.ok((select stage='offer_selected' from public.fk_purchase_process where cooperation_id=:'purchase_id'),'selecting offer advances lifecycle');

-- Supplier edits selected terms before confirmation: owner must explicitly select again.
select set_config('request.jwt.claim.sub','73737373-7373-4737-8737-737373737373',true);
select public.fk_save_purchase_offer(
 :'purchase_id',101,'SEK',8,20,'delivery',200,2,current_date+30,'Updated before confirmation'
);
select fk_lifecycle_test.ok((select count(*)=0 from public.fk_purchase_offer_choice where cooperation_id=:'purchase_id'),'editing selected supplier terms clears the old choice');
select fk_lifecycle_test.ok((select stage='collecting' from public.fk_purchase_process where cooperation_id=:'purchase_id'),'edited selected offer returns process to collecting');

select set_config('request.jwt.claim.sub','51515151-5151-4515-8515-515151515151',true);
select public.fk_choose_purchase_offer(:'purchase_id',:'offer_id');
select public.fk_start_purchase_confirmation(:'purchase_id',now()+interval '2 days');
select fk_lifecycle_test.ok((select stage='confirming' from public.fk_purchase_process where cooperation_id=:'purchase_id'),'owner starts final confirmation');
select fk_lifecycle_test.ok((select count(*)=2 from public.fk_purchase_confirmations where cooperation_id=:'purchase_id'),'commitments are snapshotted into confirmations');

-- Joining, changing commitments and supplier terms are frozen now.
select set_config('request.jwt.claim.sub','84848484-8484-4848-8848-848484848484',true);
select public.fk_save_profile('Late user','Buyer','',true);
select fk_lifecycle_test.ok(fk_lifecycle_test.rejected(format('select public.fk_join_cooperation(%L)',:'purchase_id')),'late join blocked after confirmation starts');

select set_config('request.jwt.claim.sub','62626262-6262-4626-8626-626262626262',true);
select fk_lifecycle_test.ok(fk_lifecycle_test.rejected(format('select public.fk_set_purchase_commitment(%L,7,''change'')',:'purchase_id')),'buyer quantity frozen during confirmation');

select set_config('request.jwt.claim.sub','73737373-7373-4737-8737-737373737373',true);
select fk_lifecycle_test.ok(fk_lifecycle_test.rejected(format(
 'select public.fk_save_purchase_offer(%L,90,''SEK'',8,20,''delivery'',200,2,current_date+30,''changed'')',:'purchase_id'
)),'supplier terms frozen during confirmation');

-- Provider cannot inspect individual confirmations.
select fk_lifecycle_test.ok((select count(*)=0 from public.fk_purchase_confirmations where cooperation_id=:'purchase_id'),'selected provider cannot inspect individual buyer decisions');
select fk_lifecycle_test.ok((select count(*)=1 from public.fk_purchase_process where cooperation_id=:'purchase_id'),'selected provider can see lifecycle stage');

-- Member confirms. Owner cannot mark ordered while own response is pending.
select set_config('request.jwt.claim.sub','62626262-6262-4626-8626-626262626262',true);
select public.fk_confirm_purchase_participation(:'purchase_id',true,'Confirmed six');

select set_config('request.jwt.claim.sub','51515151-5151-4515-8515-515151515151',true);
select fk_lifecycle_test.ok(fk_lifecycle_test.rejected(format(
 'select public.fk_mark_purchase_ordered(%L,''EXT-1'',now()+interval ''3 days'',''manual external order'',''Community center'',now()+interval ''4 days'',now()+interval ''4 days 2 hours'')',:'purchase_id'
)),'owner cannot mark ordered while confirmations are pending');

select public.fk_confirm_purchase_participation(:'purchase_id',true,'Owner confirmed four');
select public.fk_mark_purchase_ordered(
 :'purchase_id','EXT-1',now()+interval '3 days','Marked by organizer; external order not verified',
 'Community center',now()+interval '4 days',now()+interval '4 days 2 hours'
);
select fk_lifecycle_test.ok((select stage='ordered' and external_order_reference='EXT-1' from public.fk_purchase_process where cooperation_id=:'purchase_id'),'all-confirmed purchase can be marked externally ordered');
select fk_lifecycle_test.ok((select sum(quantity)=10 from public.fk_purchase_confirmations where cooperation_id=:'purchase_id' and decision='confirmed'),'confirmed quantity preserved');

-- Chosen offer cannot change and buyer cannot leave after external-order mark.
select fk_lifecycle_test.ok(fk_lifecycle_test.rejected(format('select public.fk_choose_purchase_offer(%L,null)',:'purchase_id')),'chosen offer frozen after confirmation');
select set_config('request.jwt.claim.sub','62626262-6262-4626-8626-626262626262',true);
select fk_lifecycle_test.ok(fk_lifecycle_test.rejected(format('select public.fk_leave_cooperation(%L)',:'purchase_id')),'buyer cannot leave after final confirmation');

-- Owner records delivery and a revised pickup window.
select set_config('request.jwt.claim.sub','51515151-5151-4515-8515-515151515151',true);
select public.fk_set_purchase_delivery_plan(
 :'purchase_id',now()+interval '2 days','Supplier says tomorrow',
 'Community center',now()+interval '2 days',now()+interval '2 days 3 hours'
);
select public.fk_mark_purchase_delivered(:'purchase_id','Organizer reports goods arrived');
select fk_lifecycle_test.ok((select stage='delivered' and delivered_at is not null from public.fk_purchase_process where cooperation_id=:'purchase_id'),'owner marks external delivery result');

-- Member self-reports collection; stage moves to distributing.
select set_config('request.jwt.claim.sub','62626262-6262-4626-8626-626262626262',true);
select public.fk_mark_purchase_collected(:'purchase_id',true,'Collected my six');
select fk_lifecycle_test.ok((select collected_at is not null from public.fk_purchase_confirmations where cooperation_id=:'purchase_id' and user_id='62626262-6262-4626-8626-626262626262'),'member can mark own confirmed share collected');
select fk_lifecycle_test.ok((select stage='distributing' from public.fk_purchase_process where cooperation_id=:'purchase_id'),'first collection advances distribution stage');

-- Owner cannot silently claim full completion while its own confirmed share remains uncollected.
select set_config('request.jwt.claim.sub','51515151-5151-4515-8515-515151515151',true);
select fk_lifecycle_test.ok(fk_lifecycle_test.rejected(format('select public.fk_finish_purchase(%L,'''')',:'purchase_id')),'unfinished collection requires an explanatory result note');
select public.fk_finish_purchase(:'purchase_id','Member collected; owner share retained by organizer after distribution.');
select fk_lifecycle_test.ok((select stage='done' and finished_at is not null from public.fk_purchase_process where cooperation_id=:'purchase_id'),'owner can close with explicit result note');
select fk_lifecycle_test.ok((select status='done' from public.fk_cooperations where id=:'purchase_id'),'cooperation status closes with lifecycle');

-- Separate purchase can be cancelled with reason.
select public.fk_create_cooperation('purchase','Cancelled buy','Cancel test','Göteborg',5,'kg') as cancel_id \gset
select public.fk_cancel_purchase_process(:'cancel_id','No suitable supplier');
select fk_lifecycle_test.ok((select stage='cancelled' from public.fk_purchase_process where cooperation_id=:'cancel_id'),'owner cancellation records lifecycle result');
select fk_lifecycle_test.ok((select status='cancelled' from public.fk_cooperations where id=:'cancel_id'),'owner cancellation closes cooperation');

reset role;
rollback;
