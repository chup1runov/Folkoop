import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadBridge,validateBridge,validateRepositoryBindings} from '../scripts/validate-sdcf-bridge.mjs';

test('SDCF bridge v0.2 is internally consistent and non-runtime', async () => {
  const bridge = await loadBridge();
  assert.deepEqual(validateBridge(bridge), []);
  assert.deepEqual(await validateRepositoryBindings(bridge), []);
  assert.equal(bridge.schemaVersion, 2);
  assert.equal(bridge.bridgeVersion, '0.2');
  assert.equal(bridge.runtimeDependency, false);
  assert.equal(bridge.status, 'advisory');
  assert.match(bridge.referenceFrameworkStatus, /release-candidate/i);
  assert.match(bridge.referenceFrameworkStatus, /not yet satisfied/i);
  assert.equal(bridge.mappings.length, 10);
  assert.equal(bridge.guards.length, 10);
});

test('SDCF bridge preserves outcome and provenance boundaries', async () => {
  const bridge = await loadBridge();
  const names = new Set(bridge.guards.map(x => x.name));
  assert.ok(names.has('done_is_not_confirmed_outcome'));
  assert.ok(names.has('activity_is_not_real_world_evidence'));
  assert.ok(names.has('source_is_not_claim'));
  assert.ok(names.has('routing_is_not_authority_decision'));
  assert.ok(names.has('unknown_is_not_false'));
});

test('City provenance contract binds current adapters to source and adapter versions', async () => {
  const bridge = await loadBridge();
  const city = bridge.cityProvenanceContract;
  assert.equal(city.status, 'partially-runtime-enforced');
  assert.equal(city.runtimeEnforcement.path, 'civic-core.js');
  assert.ok(city.runtimeEnforcement.enforces.includes('adapterVersion'));
  assert.deepEqual(city.feedEnvelope.required, ['schemaVersion','sourceId','fetchedAt','adapterVersion','items']);
  assert.ok(city.feedEnvelope.itemInheritance.includes('fetchedAt'));
  assert.ok(city.feedEnvelope.itemInheritance.includes('adapterVersion'));
  assert.equal(city.currentAdapters.length, 2);
  assert.deepEqual(await validateRepositoryBindings(bridge), []);
});

test('outcome contract keeps classification separate from external evidence', async () => {
  const bridge = await loadBridge();
  const outcome = bridge.outcomeContract;
  const classes = new Map(outcome.classifications.map(x => [x.id,x]));
  assert.match(classes.get('participant_confirmed').requires, /owner/i);
  assert.match(classes.get('participant_confirmed').requires, /other involved participant/i);
  assert.ok(outcome.evidenceQualifiers.some(x => x.id === 'external_evidence_present'));
  assert.ok(outcome.invariants.includes('cooperation status done alone cannot produce participant_confirmed'));
  assert.ok(outcome.invariants.includes('conflicting participant accounts default to unclear until resolved'));
});

test('SDCF bridge keeps future semantic stack behind evidence and privacy gates', async () => {
  const bridge = await loadBridge();
  const runtimeGuard = bridge.guards.find(x => x.name === 'no_runtime_semantic_stack_before_evidence');
  assert.match(runtimeGuard.rule, /Göteborg pilot/);
  assert.match(JSON.stringify(bridge.futureTriggers), /algorithmic or AI matching/);
  assert.match(JSON.stringify(bridge.futureTriggers), /multi-city/);
  assert.match(JSON.stringify(bridge.outcomeContract.policyRefs), /PRE_PILOT_PRIVACY_DECISIONS/);
});
