'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeRect, topEdge, sideEdges, landingPosition, canLandOn, SurfaceGraph } = require('../src/engine/surface-graph.cjs');

test('normalizeRect rejects tiny/non-finite windows', () => {
  assert.equal(normalizeRect({ x: 0, y: 0, width: 20, height: 20 }), null);
  assert.equal(normalizeRect({ x: 'x', y: 0, width: 300, height: 200 }), null);
});

test('surface edges are derived from one normalized rectangle', () => {
  const surface = normalizeRect({ id: 'a', x: 100, y: 300, width: 600, height: 400 });
  assert.equal(topEdge(surface).kind, 'top');
  const sides = sideEdges(surface);
  assert.equal(sides.length, 2);
  assert.equal(sides[0].kind, 'left');
  assert.equal(sides[1].kind, 'right');
});

test('landingPosition keeps companion within host top edge', () => {
  const surface = { id: 'a', x: 200, y: 500, width: 400, height: 300 };
  const size = { width: 252, height: 318 };
  const left = landingPosition(surface, size, -1000);
  const right = landingPosition(surface, size, 9999);
  assert.ok(left.x >= surface.x - size.width / 2);
  assert.ok(right.x <= surface.x + surface.width - size.width / 2);
  assert.equal(left.y, 189);
});

test('canLandOn rejects surfaces too high for the companion', () => {
  const size = { width: 252, height: 318 };
  const workArea = { x: 0, y: 0, width: 1440, height: 900 };
  assert.equal(canLandOn({ x: 200, y: 120, width: 500, height: 500 }, size, workArea), false);
  assert.equal(canLandOn({ x: 200, y: 520, width: 500, height: 300 }, size, workArea), true);
});

test('SurfaceGraph picks nearest viable top surface', () => {
  const graph = new SurfaceGraph([{ id: 'near', x: 300, y: 520, width: 500, height: 300 }, { id: 'far', x: 1000, y: 600, width: 350, height: 250 }]);
  const surface = graph.nearestTop({ x: 520, y: 600 }, { width: 252, height: 318 }, { x: 0, y: 0, width: 1440, height: 900 });
  assert.equal(surface.id, 'near');
  assert.deepEqual(graph.publicSummary(), { surfaceCount: 2, edgeCount: 6 });
});
