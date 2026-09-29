'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ECHOES,
  eligibleEchoes,
  MemoryEchoEngine
} = require('../src/engine/memory-echo.cjs');

function baseState(overrides = {}) {
  return {
    identity: { sessions: 4 },
    preferences: { onboardingCompleted: true },
    files: [],
    objects: [],
    timers: [],
    episodes: [],
    discoveries: [],
    moments: [{ kind: 'session-start', at: '2026-09-19T08:00:00.000Z', data: {} }],
    relationship: { stage: { id: 'familiar' } },
    ...overrides
  };
}

function fakeStore(state) {
  return {
    state,
    snapshot() { return JSON.parse(JSON.stringify(this.state)); },
    recordDiscovery(id, metadata) {
      this.state.discoveries.unshift({ id, lastSeenAt: '2026-09-19T12:00:00.000Z', metadata });
    },
    recordMoment(kind, options) {
      this.state.moments.push({ kind, at: '2026-09-19T12:00:00.000Z', data: options.data || {}, salience: options.salience || 0 });
    }
  };
}

test('ambient memory echo never exposes trusted file names or object values', () => {
  const state = baseState({
    files: [{ id: 'f1', name: 'private-secret.pdf', path: '/Users/me/private-secret.pdf' }],
    objects: [{ id: 'o1', title: 'very-secret-link', value: 'https://secret.example/private' }]
  });
  const eligible = eligibleEchoes(state, Date.parse('2026-09-19T12:00:00Z'));
  const trusted = eligible.find(item => item.kind === 'trusted');
  assert.ok(trusted);
  const serialized = JSON.stringify({ action: trusted.action, message: trusted.message });
  assert.doesNotMatch(serialized, /private-secret|very-secret-link|secret\.example/);
});

test('memory echoes require completed onboarding and real shared-history signals', () => {
  assert.deepEqual(eligibleEchoes(baseState({ preferences: { onboardingCompleted: false }, files: [{ id: 'f1' }] })), []);
  assert.equal(eligibleEchoes(baseState()).length, 0);
});

test('focus echo requires repeated completed focus, not one productivity event', () => {
  const one = baseState({ timers: [{ status: 'done', meta: { focus: true } }] });
  assert.equal(eligibleEchoes(one).some(item => item.kind === 'focus'), false);

  const two = baseState({
    timers: [
      { status: 'done', meta: { focus: true } },
      { status: 'done', meta: { focus: true } }
    ]
  });
  assert.equal(eligibleEchoes(two).some(item => item.kind === 'focus'), true);
});

test('one memory echo maximum is allowed per session', () => {
  const state = baseState({
    files: [{ id: 'f1' }],
    moments: [
      { kind: 'session-start', at: '2026-09-19T08:00:00.000Z', data: {} },
      { kind: 'memory-echo', at: '2026-09-19T10:00:00.000Z', data: { session: 4 } }
    ]
  });
  assert.deepEqual(eligibleEchoes(state, Date.parse('2026-09-19T12:00:00Z')), []);
});

test('engine waits before speaking and respects quiet/focus/interaction/movement', () => {
  const state = baseState({ files: [{ id: 'f1' }] });
  const store = fakeStore(state);
  const engine = new MemoryEchoEngine(store, { rng: () => 0, baseChance: 1, minSessionAgeMs: 180_000 });

  assert.equal(engine.maybePick({}, Date.parse('2026-09-19T08:02:00Z')), null);
  assert.equal(engine.maybePick({ quiet: true }, Date.parse('2026-09-19T12:00:00Z')), null);
  assert.equal(engine.maybePick({ focus: true }, Date.parse('2026-09-19T12:00:00Z')), null);
  assert.equal(engine.maybePick({ interactive: true }, Date.parse('2026-09-19T12:00:00Z')), null);
  assert.equal(engine.maybePick({ moving: true }, Date.parse('2026-09-19T12:00:00Z')), null);
});

test('engine turns a real memory into bounded behavior and records only generic metadata', () => {
  const state = baseState({ files: [{ id: 'f1', name: 'private-secret.pdf' }] });
  const store = fakeStore(state);
  const engine = new MemoryEchoEngine(store, { rng: () => 0, baseChance: 1, minSessionAgeMs: 0 });
  const picked = engine.maybePick({}, Date.parse('2026-09-19T12:00:00Z'));

  assert.equal(picked.id, 'memory-echo:trusted');
  assert.equal(picked.action, 'inspect');
  const moment = store.state.moments.at(-1);
  assert.equal(moment.kind, 'memory-echo');
  assert.deepEqual(Object.keys(moment.data).sort(), ['echoId', 'kind', 'session']);
  assert.equal(JSON.stringify(moment.data).includes('private-secret.pdf'), false);
});

test('echo copy avoids guilt, absence pressure and streak language', () => {
  const copy = ECHOES.map(item => item.message || '').join(' ').toLowerCase();
  for (const fragment of ['скуч', 'пропал', 'давно тебя', 'где ты', 'серия', 'стрик']) {
    assert.equal(copy.includes(fragment), false);
  }
});
