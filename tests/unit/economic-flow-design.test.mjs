import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const text=await readFile('docs/architecture/ECONOMIC_FLOW_V0_DESIGN.md','utf8');

test('Economic Flow design is review-ready but does not authorize SQL',()=>{
  assert.match(text,/DESIGN REVIEW READY/i);
  assert.match(text,/NO MIGRATION AUTHORISED UNTIL THIS DESIGN IS REVIEWED\/MERGED/i);
  assert.match(text,/not authorize production SQL[\s\S]*reviewed\/merged/i);
});

test('flow authorization derives from parent cooperation',()=>{
  assert.match(text,/Reuse the parent Cooperation authorization boundary/i);
  assert.match(text,/folkoop_private\.coop_member\(cooperation_id\)/);
  assert.match(text,/parent Cooperation owner only/i);
  assert.match(text,/role target must already be a parent Cooperation member/i);
});

test('v0 has closed economic vocabulary without finance custody fields',()=>{
  for(const kind of ['procurement','production','sale','service','distribution'])assert(text.includes(kind),kind);
  for(const forbidden of ['payment status','invoice number','inventory valuation','generic JSON/EAV'])assert(text.includes(forbidden),forbidden);
  assert.match(text,/Do not request:[\s\S]*bank\/payment data/i);
});

test('lifecycle never upgrades closed state into a real-world outcome',()=>{
  assert.match(text,/closed.*does not mean goods were delivered/is);
  assert.match(text,/Outcome\/evidence remains a separate later model/i);
  assert.match(text,/terminal flows cannot be reopened/i);
});

test('v0 decisions constrain parent kinds, cardinality and deletion',()=>{
  assert.match(text,/maximum \*\*20 non-terminal flows per parent Cooperation\*\*/i);
  assert.match(text,/hard delete is allowed only while.*planning/is);
  assert.match(text,/Shared Purchase parent allows only.*procurement.*distribution/is);
  assert.match(text,/Project parent allows[\s\S]*procurement[\s\S]*production[\s\S]*sale[\s\S]*service[\s\S]*distribution/i);
  assert.match(text,/Project may contain \*\*multiple\*\* economic flows/i);
  assert.match(text,/cooperation_id[\s\S]*must not be UNIQUE/i);
});

test('first migration intentionally adds no economic activity event types',()=>{
  assert.match(text,/first schema\/RPC migration does not extend the activity-event/i);
  assert.match(text,/Add them only with the first UI slice/i);
});
