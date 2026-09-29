'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const Web = require('../web-preview/model.js');
const FirstWeek = require('../src/engine/first-week.cjs');
const Relationship = require('../src/engine/relationship.cjs');
const HomeWorld = require('../src/engine/home-world.cjs');
const { evaluateEpisode, EPISODES } = require('../src/engine/episode-engine.cjs');

function baseState() {
  return {
    identity: {
      metAt: '2026-09-01T12:00:00.000Z',
      lastSeenAt: '2026-09-05T12:00:00.000Z',
      sessions: 4,
      activeDays: ['2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05']
    },
    stats: { interactionCount: 8 },
    preferences: { onboardingCompleted: true, quietUntil: null },
    files: [{ id:'f1', name:'one.txt' }],
    objects: [],
    moments: [
      { kind:'called-to-cursor', salience:.25 },
      { kind:'called-to-cursor', salience:.25 },
      { kind:'focus-completed', salience:.7 },
      { kind:'episode-start', salience:.62 }
    ],
    keepsakes: [
      { kind:'first-gift', emoji:'📎', sourceId:'f1' },
      { kind:'first-focus', emoji:'🎯', sourceId:'t1' }
    ],
    timers: [{ id:'t1', status:'done', meta:{ focus:true } }],
    episodes: [{ id:'windowsill-plant', title:'Растение на подоконнике', stageIndex:1, stageId:'planted', lastAdvancedDay:'2026-09-04', complete:false }],
    discoveries: []
  };
}

test('Web Mode first-week choice stays in parity with desktop engine', () => {
  const cases = [
    baseState(),
    { ...baseState(), identity:{ ...baseState().identity, sessions:2, activeDays:['2026-09-01'] }, files:[], moments:[], timers:[], keepsakes:[], episodes:[] },
    { ...baseState(), discoveries:[{ id:'continuity:return-hello' },{ id:'continuity:remembered-gift' }] }
  ];
  for (const state of cases) {
    assert.equal(
      Web.chooseFirstWeekMoment(structuredClone(state))?.id || null,
      FirstWeek.chooseFirstWeekMoment(structuredClone(state))?.id || null
    );
  }
});

test('Web Mode relationship derivation matches desktop engine', () => {
  const state = baseState();
  const now = new Date('2026-09-06T12:00:00.000Z').getTime();
  const web = Web.deriveRelationship(structuredClone(state), now);
  const desktop = Relationship.deriveRelationship(structuredClone(state), now);
  assert.equal(web.stage.id, desktop.stage.id);
  assert.ok(Math.abs(web.score - desktop.score) < 1e-12);
  assert.equal(web.activeDays, desktop.activeDays);
  assert.equal(web.trustedItems, desktop.trustedItems);
  assert.equal(web.timersDone, desktop.timersDone);
});

test('Web Mode Home scene matches desktop engine for equivalent public state', () => {
  const states = [
    { ...baseState(), timers:[{ id:'f', status:'active', dueAt:'2099-01-01T00:00:00.000Z', meta:{focus:true} }], episodesDetailed:[] },
    { ...baseState(), runtime:{quiet:true}, timers:[], episodesDetailed:[] },
    { ...baseState(), runtime:{quiet:false}, timers:[], episodesDetailed:[{stageNote:'Росток'}] },
    { ...baseState(), runtime:{quiet:false}, timers:[], episodesDetailed:[], files:[{id:'f1'}] },
    { ...baseState(), runtime:{quiet:false}, timers:[], episodesDetailed:[], files:[], objects:[] }
  ];
  for (const state of states) {
    const webState = structuredClone(state);
    if (state.runtime?.quiet) webState.preferences.quietUntil='2099-01-01T00:00:00.000Z';
    const web = Web.deriveHomeScene(webState, new Date('2026-09-06T12:00:00Z').getTime());
    const desktop = HomeWorld.deriveHomeScene(structuredClone(state));
    assert.deepEqual(web, desktop);
  }
});

test('Web Mode room props preserve desktop ids, slots and labels', () => {
  const state = baseState();
  const relationship = Relationship.deriveRelationship(state, new Date('2026-09-06T12:00:00Z').getTime());
  const publicState = { ...state, relationship };
  assert.deepEqual(Web.roomProps(structuredClone(publicState)), FirstWeek.roomProps(structuredClone(publicState)));
});

test('Web Mode plant progression obeys desktop one-stage-per-day rule', () => {
  const state = baseState();
  state.identity.activeDays = ['2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05'];
  state.episodes = [{
    id:'windowsill-plant',
    title:'Растение на подоконнике',
    emoji:'🌱',
    stageIndex:0,
    stageId:'seed',
    startedAt:'2026-09-02T12:00:00.000Z',
    updatedAt:'2026-09-02T12:00:00.000Z',
    lastAdvancedDay:'2026-09-02',
    complete:false
  }];
  const now = new Date('2026-09-05T12:00:00.000Z').getTime();
  const expected = evaluateEpisode(structuredClone(state), EPISODES['windowsill-plant'], now);
  Web.syncEpisode(state, now);
  assert.equal(state.episodes[0].stageIndex, expected.episode.stageIndex);
  assert.equal(state.episodes[0].stageId, expected.episode.stageId);
});
