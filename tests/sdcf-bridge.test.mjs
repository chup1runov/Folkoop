import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadBridge,validateBridge} from '../scripts/validate-sdcf-bridge.mjs';

test('SDCF bridge profile is internally consistent and non-runtime', async () => {
  const bridge = await loadBridge();
  assert.deepEqual(validateBridge(bridge), []);
  assert.equal(bridge.runtimeDependency, false);
  assert.equal(bridge.status, 'advisory');
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

test('SDCF bridge keeps future semantic stack behind evidence gate', async () => {
  const bridge = await loadBridge();
  const runtimeGuard = bridge.guards.find(x => x.name === 'no_runtime_semantic_stack_before_evidence');
  assert.match(runtimeGuard.rule, /Göteborg pilot/);
  assert.match(JSON.stringify(bridge.futureTriggers), /algorithmic or AI matching/);
  assert.match(JSON.stringify(bridge.futureTriggers), /multi-city/);
});
