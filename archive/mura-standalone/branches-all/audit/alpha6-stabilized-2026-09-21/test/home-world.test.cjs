'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { deriveHomeScene } = require('../src/engine/home-world.cjs');

function state(overrides = {}) {
  return {
    runtime: { quiet: false },
    timers: [],
    files: [],
    objects: [],
    episodesDetailed: [],
    ...overrides
  };
}

test('focus scene has priority and moves Ksyusha to the desk', () => {
  const scene = deriveHomeScene(state({
    runtime: { quiet: true },
    timers: [{ status: 'active', meta: { focus: true } }],
    episodesDetailed: [{ stageNote: 'plant' }]
  }));
  assert.equal(scene.id, 'focus');
  assert.equal(scene.spot, 'desk');
});

test('quiet scene rests without requiring a relationship score', () => {
  const scene = deriveHomeScene(state({ runtime: { quiet: true } }));
  assert.equal(scene.id, 'quiet');
  assert.equal(scene.pose, 'rest');
});

test('episode changes where Ksyusha lives in Home', () => {
  const scene = deriveHomeScene(state({ episodesDetailed: [{ stageNote: 'Росток появился.' }] }));
  assert.equal(scene.id, 'episode');
  assert.equal(scene.spot, 'window');
  assert.equal(scene.note, 'Росток появился.');
});

test('remembered objects create a memory-oriented room scene', () => {
  const scene = deriveHomeScene(state({ files: [{ id: 'f1', name: 'x.pdf' }] }));
  assert.equal(scene.id, 'memory');
  assert.equal(scene.spot, 'shelf');
  assert.doesNotMatch(scene.note, /x\.pdf/);
});
