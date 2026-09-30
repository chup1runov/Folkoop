import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadIntegrity,validateIntegrity,validateRepositoryBindings} from '../scripts/validate-outcome-integrity.mjs';

test('FOLKOOP outcome integrity profile is internally consistent and non-runtime',async()=>{
  const p=await loadIntegrity();
  assert.deepEqual(validateIntegrity(p),[]);
  assert.deepEqual(await validateRepositoryBindings(p),[]);
  assert.equal(p.schemaVersion,1);
  assert.equal(p.profileVersion,'1.0');
  assert.equal(p.runtimeDependency,false);
  assert.equal(p.status,'advisory');
  assert.equal(p.mappings.length,10);
  assert.equal(p.guards.length,10);
});

test('outcome and provenance boundaries remain explicit',async()=>{
  const p=await loadIntegrity();
  const names=new Set(p.guards.map(x=>x.name));
  for(const n of ['done_is_not_confirmed_outcome','activity_is_not_real_world_evidence','source_is_not_claim','routing_is_not_authority_decision','unknown_is_not_false']) assert.ok(names.has(n));
  const out=p.outcomeContract;
  assert.ok(out.evidenceQualifiers.some(x=>x.id==='external_evidence_present'));
  assert.ok(out.invariants.includes('cooperation status done alone cannot produce participant_confirmed'));
  assert.ok(out.invariants.includes('conflicting participant accounts default to unclear until resolved'));
});

test('City provenance remains bound to current adapters',async()=>{
  const p=await loadIntegrity();
  assert.equal(p.cityProvenanceContract.runtimeEnforcement.path,'civic-core.js');
  assert.deepEqual(p.cityProvenanceContract.feedEnvelope.required,['schemaVersion','sourceId','fetchedAt','adapterVersion','items']);
  assert.equal(p.cityProvenanceContract.currentAdapters.length,2);
  assert.deepEqual(await validateRepositoryBindings(p),[]);
});
