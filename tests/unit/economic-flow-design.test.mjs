import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const text=await readFile('docs/architecture/ECONOMIC_FLOW_V0_DESIGN.md','utf8');

test('Economic Flow v0 remains explicitly blocked from migration',()=>{
  assert.match(text,/DESIGN ONLY — BLOCKED UNTIL PR #211 IS MERGED/i);
  assert.match(text,/NO MIGRATION AUTHORISED/i);
  assert.match(text,/Until these are settled and tested, there is no approved migration/i);
});

test('design reuses cooperation membership rather than creating another membership system',()=>{
  assert.match(text,/Reuse the parent Cooperation authorization boundary/i);
  assert.match(text,/folkoop_private\.coop_member\(cooperation_id\)/);
  assert.match(text,/must not.*second project\/task\/membership system/is);
  assert.match(text,/role target must already be a member of the parent Cooperation/i);
});

test('design excludes money/accounting and generic EAV shortcuts',()=>{
  for(const phrase of ['payment status','invoice number','inventory valuation','generic JSON/EAV','target_type + target_id']){
    assert(text.includes(phrase),phrase);
  }
  assert.match(text,/Do not request:[\s\S]*bank\/payment data/i);
});

test('closed economic flow is not treated as real-world outcome',()=>{
  assert.match(text,/closed.*does not mean goods were delivered/is);
  assert.match(text,/Outcome\/evidence remains a separate later model/i);
});

test('parent model allows multiple flows and limits first parent kinds',()=>{
  assert.match(text,/Allowed parent kinds in v0:[\s\S]*project[\s\S]*purchase/i);
  assert.match(text,/Project may contain \*\*multiple\*\* economic flows/i);
  assert.match(text,/cooperation_id.*must not be UNIQUE/i);
});
