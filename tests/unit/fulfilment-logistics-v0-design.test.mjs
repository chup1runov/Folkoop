import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const design=JSON.parse(await readFile('docs/architecture/fulfilment-logistics-v0-design.json','utf8'));
const noLoss=JSON.parse(await readFile('docs/NO_LOSS_REQUIREMENTS_REGISTER.json','utf8'));
const ids=new Set(noLoss.entries.map(x=>x.id));

test('E02 remains a design-only slice after E01',()=>{
  assert.equal(design.schema_version,'1.0');
  assert.equal(design.issue,222);
  assert.equal(design.dependency_issue,212);
  assert.equal(design.status,'design_only_no_migration_authorised');
  assert.equal(design.migration_gate.requires_e01_migration,true);
  assert.match(design.migration_gate.rule,/No database migration is authorised/i);
});

test('E02 references only canonical no-loss IDs',()=>{
  const missing=design.requirements.filter(x=>!ids.has(x));
  assert.deepEqual(missing,[]);
  for(const id of ['KP-06','IN-02','FX-06']) assert(ids.has(id),id);
});

test('initial fulfilment runtime is Project-only and does not duplicate Shared Purchase truth',()=>{
  assert.deepEqual(design.initial_parent_scope.allowed_cooperation_kinds,['project']);
  assert.match(design.initial_parent_scope.shared_purchase_policy,/remain authoritative/i);
  assert.match(design.initial_parent_scope.shared_purchase_policy,/must not duplicate/i);
});

test('v0 stores plan and milestone coordination but defers evidence-like handoff records',()=>{
  assert(design.records.fk_fulfilment_plans);
  assert(design.records.fk_fulfilment_milestones);
  assert(design.deferred_records.some(x=>x.name==='handoff_or_return_record'));
  assert.match(design.deferred_records[0].reason,/Outcome\/Evidence/i);
});

test('milestone vocabulary covers logistics failure, cancellation and return explicitly',()=>{
  const m=design.records.fk_fulfilment_milestones;
  for(const kind of ['storage','handoff','transport','distribution','return']) assert(m.kinds.includes(kind),kind);
  for(const status of ['planned','ready','in_progress','completed','failed','cancelled']) assert(m.statuses.includes(status),status);
  assert.equal(m.max_per_plan,50);
  assert.equal(design.records.fk_fulfilment_plans.max_non_terminal_per_flow,10);
});

test('terminal milestones cannot silently reopen and corrections are explicit',()=>{
  for(const terminal of ['completed','failed','cancelled']){
    assert.deepEqual(design.lifecycle.milestone[terminal],[terminal]);
  }
  assert.match(design.lifecycle.correction_rule,/supersedes_milestone_id/i);
  assert.match(design.lifecycle.completion_rule,/never independently proves a real-world Outcome/i);
});

test('forbidden regulated and pseudo-proof fields stay out of candidate records',()=>{
  const fields=Object.values(design.records).flatMap(x=>x.fields||[]).map(x=>x.toLowerCase());
  for(const forbidden of ['amount','currency','payment','invoice','tax','kyc','address','latitude','longitude','tracking_id','inventory_value','verified']){
    assert(!fields.includes(forbidden),forbidden);
  }
  assert.match(design.truth_boundary,/not payment settlement/i);
  assert.match(design.truth_boundary,/confirmed Outcome/i);
});

test('Mura delta stays illustrative and uses an existing whole-system story',()=>{
  assert.equal(design.mura_delta.story,'mura-03-project-plant-exchange');
  assert.match(design.mura_delta.rule,/illustrative/i);
  assert(design.mura_delta.target_path.includes('Outcome/Evidence boundary'));
});
