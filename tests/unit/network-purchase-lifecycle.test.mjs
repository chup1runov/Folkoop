import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({globalThis:{}});
context.globalThis=context;
vm.runInContext(await readFile('apps/web/network-purchase-lifecycle.js','utf8'),context,{filename:'network-purchase-lifecycle.js'});
const create=context.FolkoopNetworkPurchaseLifecycle.create;

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);

const labels=key=>({
 lifecycle:'Purchase lifecycle',collecting:'Collecting',offer_selected:'Offer selected',confirming:'Confirming',
 ordered:'Ordered',delivered:'Delivered',distributing:'Distributing',done:'Done',cancelled:'Cancelled',
 selfReported:'Self reported',confirmationDeadline:'Deadline',externalReference:'External reference',
 expectedDelivery:'Expected delivery',pickupPlace:'Pickup place',pickupStart:'Pickup starts',
 resultNote:'Result note',startConfirmation:'Start confirmation',frozen:'Frozen',confirmations:'Confirmations',
 noSnapshot:'No snapshot',confirmedTotal:'Confirmed total',pending:'Pending',declined:'Declined',
 confirmed:'Confirmed',responseNote:'Response note',confirmYes:'Confirm',confirmNo:'Decline',
 resetConfirmation:'Reset',markOrdered:'Mark ordered',externalOrderNotice:'External order',
 pickupEnd:'Pickup ends',deliveryNote:'Delivery note',allResponsesNeeded:'All responses needed',
 saveDeliveryPlan:'Save delivery plan',deliverySelfReport:'Delivery self report',markDelivered:'Mark delivered',
 collectionNote:'Collection note',markCollected:'Mark collected',undoCollected:'Undo collected',
 resultSelfReport:'Result self report',finishPurchase:'Finish purchase',cancelReason:'Cancel reason',
 cancelPurchase:'Cancel purchase'
})[key]||key;

function fixture(){
 const data={
  purchaseProcess:[],
  purchaseChoice:[],
  purchaseConfirmations:[]
 };
 const drafts={};
 const profiles={other:{id:'other',name:'Bob <script>x</script>'}};
 const domain=create({
  escape,
  getData:()=>data,
  getProfile:id=>profiles[id],
  getDrafts:()=>drafts,
  lifecycleText:labels,
  chatText:key=>key==='you'?'You':key,
  cooperationText:key=>key==='noProfile'?'Participant':key,
  formatWhen:()=> 'WHEN',
  localDateTime:value=>value?'LOCAL':'',
  button:(action,key,id)=>`<button data-coop="${action}" data-id="${escape(id)}">${escape(labels(key))}</button>`
 });
 return {data,drafts,domain};
}

test('purchase lifecycle domain exposes only rendering responsibility',()=>{
 assert.deepEqual(Object.keys(fixture().domain),['render']);
});

test('offer-selected owner sees confirmation and cancellation controls while member does not',()=>{
 const f=fixture();
 f.data.purchaseChoice=[{offer_id:'offer-1'}];
 const coop={id:'c1',unit:'kg'};
 const owner=f.domain.render({id:'me'},coop,true);
 const member=f.domain.render({id:'me'},coop,false);
 assert(owner.includes('id="netPurchaseStart"'));
 assert(owner.includes('id="netPurchaseCancel"'));
 assert(!member.includes('id="netPurchaseStart"'));
 assert(!member.includes('id="netPurchaseCancel"'));
});

test('confirming state preserves participant semantics, escaping and action hooks',()=>{
 const f=fixture();
 f.data.purchaseProcess=[{stage:'confirming'}];
 f.data.purchaseConfirmations=[
  {user_id:'me',quantity:2,decision:'confirmed',note:'mine <b>x</b>'},
  {user_id:'other',quantity:3,decision:'confirmed',note:'other <img src=x>'}
 ];
 const html=f.domain.render({id:'me'},{id:'c1',unit:'kg'},true);
 assert(html.includes('You'));
 assert(html.includes('Bob &lt;script&gt;x&lt;/script&gt;'));
 assert(!html.includes('<script>x</script>'));
 assert(!html.includes('<img src=x>'));
 assert(html.includes('Confirmed total: 5 kg'));
 assert(html.includes('id="netPurchaseConfirm"'));
 assert(html.includes('data-coop="resetConfirmation"'));
 assert(html.includes('id="netPurchaseOrdered"'));
});

test('ordered and delivered states preserve delivery, collection and finish forms',()=>{
 const f=fixture();
 f.data.purchaseProcess=[{
  stage:'ordered',
  expected_delivery_at:'2030-01-01T12:00:00Z',
  pickup_place:'Center <b>x</b>',
  delivery_note:'note <script>x</script>'
 }];
 f.data.purchaseConfirmations=[{user_id:'me',quantity:2,decision:'confirmed'}];
 let html=f.domain.render({id:'me'},{id:'c1',unit:'kg'},true);
 assert(html.includes('id="netPurchaseDeliveryPlan"'));
 assert(html.includes('id="netPurchaseDelivered"'));
 assert(html.includes('value="LOCAL"'));
 assert(html.includes('Center &lt;b&gt;x&lt;/b&gt;'));
 assert(!html.includes('<script>x</script>'));

 f.data.purchaseProcess=[{stage:'delivered'}];
 f.data.purchaseConfirmations=[{user_id:'me',quantity:2,decision:'confirmed',collected_at:'2030-01-02T12:00:00Z'}];
 html=f.domain.render({id:'me'},{id:'c1',unit:'kg'},true);
 assert(html.includes('id="netPurchaseCollected"'));
 assert(html.includes('Undo collected'));
 assert(html.includes('id="netPurchaseFinish"'));
});

test('pending confirmations prevent order marker until all answers exist',()=>{
 const f=fixture();
 f.data.purchaseProcess=[{stage:'confirming'}];
 f.data.purchaseConfirmations=[
  {user_id:'me',quantity:2,decision:'confirmed'},
  {user_id:'other',quantity:3,decision:'pending'}
 ];
 const html=f.domain.render({id:'me'},{id:'c1',unit:'kg'},true);
 assert(html.includes('All responses needed'));
 assert(!html.includes('id="netPurchaseOrdered"'));
});
