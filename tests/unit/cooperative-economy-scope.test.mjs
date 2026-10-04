import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const scope=JSON.parse(await readFile('docs/architecture/cooperative-economy-v1-scope.json','utf8'));
const noLoss=JSON.parse(await readFile('docs/NO_LOSS_REQUIREMENTS_REGISTER.json','utf8'));
const ids=new Set(noLoss.entries.map(x=>x.id));

test('Cooperative Economy v1 is split into three ordered slices',()=>{
  assert.equal(scope.schema_version,'1.0');
  assert.equal(scope.controlling_decision,'FK-FOUNDATION-2026-10-04');
  assert.deepEqual(scope.v1_slices.map(x=>x.id),[
    'economy-1-flow-intent',
    'economy-2-fulfilment-logistics',
    'economy-3-agreement-decision-trail'
  ]);
});

test('economic scope references only canonical no-loss requirements',()=>{
  const refs=[
    ...scope.v1_slices.flatMap(x=>x.requirements||[])
  ];
  const missing=[...new Set(refs)].filter(x=>!ids.has(x));
  assert.deepEqual(missing,[]);
});

test('money, accounting, KYC and legally significant voting remain specialist boundaries',()=>{
  const caps=new Set(scope.specialist_handoffs.map(x=>x.capability));
  for(const expected of ['payments_and_money_custody','bookkeeping_and_tax','KYC_or_formal_identity','legally_significant_voting']){
    assert(caps.has(expected),expected);
  }
});

test('scope document alone never authorizes a database migration',()=>{
  assert.match(scope.migration_gate.rule,/No new economic table is approved/i);
  assert(scope.migration_gate.before_sql.includes('define RLS/RPC ownership and visibility'));
  assert(scope.migration_gate.before_sql.includes('add Mura story'));
  assert(scope.migration_gate.before_sql.includes('add real-user acceptance scenario'));
});

test('Cooperative Economy status advances E01 to hosted backend and E02 to next prototype',()=>{
  const first=scope.v1_slices.find(x=>x.id==='economy-1-flow-intent');
  const second=scope.v1_slices.find(x=>x.id==='economy-2-fulfilment-logistics');
  assert.equal(first.status,'hosted_backend_v0');
  assert.equal(first.implementation_evidence.migration,'20261004194921_folkoop_economic_flow_v0');
  assert.deepEqual(first.implementation_evidence.tables,['public.fk_economic_flows','public.fk_economic_flow_roles']);
  assert.equal(first.implementation_evidence.participant_facing_ui,'not_yet_shipped');
  assert.equal(second.status,'next_disposable_runtime_prototype');
  assert.equal(second.design_contract,'docs/architecture/FULFILMENT_LOGISTICS_V0_DESIGN.md');
});

test('first economic flow candidate does not replace project/cooperation truth',()=>{
  const first=scope.v1_slices[0];
  assert(first.candidate_objects.includes('economic_flow'));
  assert(first.dependencies.includes('project'));
  assert(first.dependencies.includes('shared_purchase'));
  assert(scope.domain_principles.some(x=>/Project remains the coordination container/i.test(x)));
  assert(scope.domain_principles.some(x=>/Economic Flow should reference/i.test(x)));
});
