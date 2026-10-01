'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Memory Echo derives relationship history from the raw MemoryStore shape', () => {
  const { deriveRelationship } = require('../src/engine/relationship.cjs');
  const { eligibleEchoes } = require('../src/engine/memory-echo.cjs');

  const state = {
    preferences: { onboardingCompleted: true },
    identity: {
      sessions: 100,
      activeDays: Array.from({ length: 90 }, (_, i) => new Date(Date.UTC(2026, 0, i + 1)).toISOString()),
      metAt: '2026-01-01T00:00:00.000Z'
    },
    stats: { interactionCount: 10_000 },
    files: Array.from({ length: 40 }, (_, i) => ({ id: 'f' + i })),
    objects: [],
    timers: Array.from({ length: 80 }, () => ({ status: 'done', meta: { focus: true } })),
    moments: Array.from({ length: 80 }, () => ({ salience: 0.7 })),
    discoveries: [],
    episodes: []
  };

  assert.ok(['shared-history', 'long-term'].includes(deriveRelationship(state).stage.id));
  assert.ok(eligibleEchoes(state).some(item => item.kind === 'history'));
});

test('Memory Echo cooldown does not treat clock rollback as elapsed time', () => {
  const { daysBetween } = require('../src/engine/memory-echo.cjs');
  assert.equal(daysBetween('2026-09-20T00:00:00Z', '2026-09-19T00:00:00Z'), 0);
});

test('Quiet and Focus attentionScale actually reduce rig movement', () => {
  const { rigTargets } = require('../src/engine/rig.cjs');
  const attention = { attending: true, level: 'engaged', dx: 1, dy: 1 };
  const full = rigTargets(attention, { attentionScale: 1 });
  const quiet = rigTargets(attention, { attentionScale: 0.45 });
  const zero = rigTargets(attention, { attentionScale: 0 });

  assert.ok(quiet.eyeX < full.eyeX);
  assert.ok(quiet.headX < full.headX);
  assert.ok(quiet.bodyX < full.bodyX);
  assert.equal(zero.eyeX, 0);
  assert.equal(zero.headX, 0);
  assert.equal(zero.bodyX, 0);
});

test('surface eligibility rejects horizontally off-screen windows', () => {
  const { canLandOn } = require('../src/engine/surface-graph.cjs');
  const windowSize = { width: 252, height: 318 };
  const workArea = { x: 0, y: 0, width: 1440, height: 900 };

  assert.equal(canLandOn({ x: 10000, y: 500, width: 800, height: 300 }, windowSize, workArea), false);
  assert.equal(canLandOn({ x: -300, y: 500, width: 800, height: 300 }, windowSize, workArea), false);
  assert.equal(canLandOn({ x: 300, y: 500, width: 800, height: 300 }, windowSize, workArea), true);
});

test('display recovery only relocates a stranded companion', () => {
  const { visibleOnWorkArea, recoveryPosition } = require('../src/engine/display-recovery.cjs');
  const displays = [
    { id: 1, primary: true, workArea: { x: 0, y: 0, width: 1440, height: 900 } },
    { id: 2, primary: false, workArea: { x: 1440, y: 0, width: 1200, height: 900 } }
  ];
  const size = { width: 252, height: 318 };

  assert.equal(visibleOnWorkArea({ x: 1600, y: 400, ...size }, displays[1].workArea), true);
  assert.equal(recoveryPosition({ x: 1600, y: 400, ...size }, displays, size), null);

  const target = recoveryPosition({ x: 5000, y: 400, ...size }, displays, size, 14);
  assert.ok(target);
  assert.ok(target.x >= 0 && target.x <= 1440 - size.width);
  assert.equal(target.y, 900 - size.height - 14);
});

test('active runtime stages run then jump then landing and listens for display topology changes', () => {
  const source = fs.readFileSync(path.join(root, 'src/main/alpha5-main.cjs'), 'utf8');

  assert.doesNotMatch(source, /emitAction\('jump'\);\s*await animateWindowTo\(target, \{ landing: true \}\)/);
  assert.match(source, /emitAction\(dx >= 0 \? 'run-right' : 'run-left'\)/);
  assert.match(source, /t >= 0\.62\) \{ jumpStarted = true; emitAction\('jump'\); \}/);
  assert.match(source, /reducedMotion/);
  assert.match(source, /motionGeneration/);

  assert.match(source, /screen\.on\('display-removed'/);
  assert.match(source, /screen\.on\('display-metrics-changed'/);
  assert.match(source, /screen\.on\('display-added'/);
  assert.match(source, /recoverWindowAfterDisplayChange/);
});
