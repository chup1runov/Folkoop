import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

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
