import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const client=await readFile('apps/web/network-client.js','utf8');
const ui=await readFile('apps/web/network-ui.js','utf8');
const module=await readFile('apps/web/network-purchase-lifecycle.js','utf8');

test('Economic Flow client exposes only the reviewed v0 RPC surface',()=>{
 for(const name of [
  'fk_create_economic_flow','fk_update_economic_flow','fk_delete_economic_flow',
  'fk_add_economic_flow_role','fk_remove_economic_flow_role'
 ])assert(client.includes(name),name);
 for(const kind of ['procurement','production','sale','service','distribution'])assert(client.includes(kind),kind);
 for(const role of ['coordinator','contributor','producer','buyer','seller','logistics'])assert(client.includes(role),role);
});

test('Economic Flow UI remains a child of Project or Shared Purchase',()=>{
 assert.match(ui,/\['project','purchase'\]\.includes\(coop\.kind\)/);
 assert.match(ui,/economicFlowDomain\.render/);
 assert.match(ui,/readOnly:guestDemo/);
 assert.match(ui,/ownCoopMember&&\['project','purchase'\]/);
});

test('Economic Flow presentation preserves truth boundaries',()=>{
 assert.match(module,/Closed does not mean paid, delivered or independently verified/i);
 assert.match(module,/not employment, qualification or legal authority/i);
 assert.match(module,/does not replace supplier offers, confirmation, external order, delivery or pickup/i);
 assert.match(module,/stageOptions/);
 assert.match(module,/flow\.stage==='planning'/);
});

test('Mura gets an illustrative read-only procurement flow',()=>{
 assert(ui.includes("id:'mura-firewood-flow'"));
 assert(ui.includes("kind:'procurement'"));
 assert(ui.includes("role:'buyer'"));
 assert(ui.includes("role:'logistics'"));
 assert.match(ui,/readOnly:guestDemo/);
});

test('Economic Flow UI introduces no payment or KYC form fields',()=>{
 for(const field of ['name="amount"','name="currency"','name="payment','name="invoice','name="tax','name="kyc','name="bank','name="card']){
  assert(!module.toLowerCase().includes(field.toLowerCase()),field);
 }
});


test('Economic Flow renderer gives owners lifecycle/role controls and keeps Mura read-only',()=>{
 const context={};vm.createContext(context);vm.runInContext(module,context);
 const escape=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const profiles=new Map([['u1',{name:'Owner'}],['u2',{name:'Member'}]]);
 const domain=context.FolkoopNetworkEconomicFlow.create({escape,getLanguage:()=> 'en',getProfile:id=>profiles.get(id)});
 const project={id:'p1',owner_id:'u1',kind:'project',status:'active'};
 const members=[{user_id:'u1'},{user_id:'u2'}];
 const flow={id:'f1',cooperation_id:'p1',kind:'production',stage:'planning',summary:'Small batch',created_by:'u1'};
 const roles=[{flow_id:'f1',user_id:'u1',role:'coordinator'}];
 const ownerHtml=domain.render({user:{id:'u1'},coop:project,owner:true,members,flows:[flow],flowRoles:roles,createDraft:{kind:'service',summary:''},editDrafts:{},roleDrafts:{},readOnly:false});
 assert.match(ownerHtml,/netEconomicFlowCreate/);
 assert.match(ownerHtml,/netEconomicFlowEdit/);
 assert.match(ownerHtml,/netEconomicRoleAdd/);
 for(const kind of ['procurement','production','sale','service','distribution'])assert(ownerHtml.includes('value="'+kind+'"'),kind);
 for(const role of ['coordinator','contributor','producer','buyer','seller','logistics'])assert(ownerHtml.includes('value="'+role+'"'),role);
 const muraHtml=domain.render({user:{id:'u1'},coop:project,owner:true,members,flows:[flow],flowRoles:roles,createDraft:{},editDrafts:{},roleDrafts:{},readOnly:true});
 assert(!muraHtml.includes('<form'));
 assert(!muraHtml.includes('data-economic='));
});

test('Shared Purchase renderer limits Economic Flow kinds and terminal flows cannot reopen',()=>{
 const context={};vm.createContext(context);vm.runInContext(module,context);
 const escape=v=>String(v??'');
 const domain=context.FolkoopNetworkEconomicFlow.create({escape,getLanguage:()=> 'en',getProfile:()=>({name:'Person'})});
 const purchase={id:'p2',owner_id:'u1',kind:'purchase',status:'active'};
 const members=[{user_id:'u1'}];
 const openHtml=domain.render({user:{id:'u1'},coop:purchase,owner:true,members,flows:[],flowRoles:[],createDraft:{kind:'procurement',summary:''},editDrafts:{},roleDrafts:{},readOnly:false});
 assert.match(openHtml,/value="procurement"/);
 assert.match(openHtml,/value="distribution"/);
 assert(!openHtml.includes('value="production"'));
 const closed={id:'f2',cooperation_id:'p2',kind:'procurement',stage:'closed',summary:'Coordination closed',created_by:'u1'};
 const closedHtml=domain.render({user:{id:'u1'},coop:purchase,owner:true,members,flows:[closed],flowRoles:[],createDraft:{},editDrafts:{},roleDrafts:{},readOnly:false});
 assert(!closedHtml.includes('netEconomicFlowEdit'));
 assert.match(closedHtml,/Terminal flows stay as history/);
});
