'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  activeDayCount,
  completedFocusCount,
  chooseFirstWeekMoment,
  roomProps
} = require('../src/engine/first-week.cjs');

function state(overrides = {}) {
  return {
    identity: {
      sessions: 2,
      metAt: '2026-09-01T08:00:00.000Z',
      activeDays: ['2026-09-01', '2026-09-19']
    },
    relationship: { stage: { id: 'meeting' } },
    files: [],
    objects: [],
    timers: [],
    moments: [],
    episodes: [],
    keepsakes: [],
    discoveries: [],
    ...overrides
  };
}

test('first-week cadence counts active days, not streaks or elapsed calendar days', () => {
  const s = state();
  assert.equal(activeDayCount(s), 2);
  assert.equal(chooseFirstWeekMoment(s).id, 'continuity:return-hello');
});

test('first return moment does not occur in the first session', () => {
  const s = state({ identity: { sessions: 1, metAt: '2026-09-19T08:00:00.000Z', activeDays: ['2026-09-19'] } });
  assert.equal(chooseFirstWeekMoment(s), null);
});

test('remembered object becomes a later continuity beat without exposing its name', () => {
  const s = state({
    files: [{ id: 'f1', name: 'private-secret.pdf' }],
    discoveries: [{ id: 'continuity:return-hello' }]
  });
  const moment = chooseFirstWeekMoment(s);
  assert.equal(moment.id, 'continuity:remembered-gift');
  assert.doesNotMatch(moment.message, /private-secret/);
});

test('repeated calls can become a ritual beat', () => {
  const s = state({
    identity: { sessions: 3, metAt: '2026-09-01T08:00:00.000Z', activeDays: ['2026-09-01', '2026-09-19'] },
    discoveries: [{ id: 'continuity:return-hello' }],
    moments: [{ kind: 'called-to-cursor' }, { kind: 'called-to-cursor' }]
  });
  const moment = chooseFirstWeekMoment(s);
  assert.equal(moment.id, 'continuity:called-ritual');
});

test('completed focus can become a contextual return beat', () => {
  const s = state({
    identity: { sessions: 3, metAt: '2026-09-01T08:00:00.000Z', activeDays: ['1','2','3'] },
    timers: [{ status: 'done', meta: { focus: true } }],
    discoveries: [{ id: 'continuity:return-hello' }, { id: 'continuity:called-ritual' }]
  });
  assert.equal(completedFocusCount(s), 1);
  assert.equal(chooseFirstWeekMoment(s).id, 'continuity:focus-memory');
});

test('first-seven-active-day cadence stops after day seven without punishing absence', () => {
  const s = state({
    identity: {
      sessions: 20,
      metAt: '2026-01-01T08:00:00.000Z',
      activeDays: ['1','2','3','4','5','6','7','8']
    }
  });
  assert.equal(chooseFirstWeekMoment(s), null);
});

test('room props materialize consented milestones, not raw private values', () => {
  const s = state({
    relationship: { stage: { id: 'shared-history' } },
    keepsakes: [
      { kind: 'first-gift', emoji: '📎', title: 'secret.pdf' },
      { kind: 'first-focus', emoji: '🎯' }
    ]
  });
  const props = roomProps(s);
  assert.deepEqual(props.map(item => item.id), ['first-gift', 'first-focus', 'history-star']);
  assert.equal(props.some(item => JSON.stringify(item).includes('secret.pdf')), false);
});
