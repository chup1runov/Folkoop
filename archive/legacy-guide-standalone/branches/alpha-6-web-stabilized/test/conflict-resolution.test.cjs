'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { mergePortableState, mergeRegister, mergeGCounter, gCounterValue, mergeOrSet, orSetValues } = require('../src/core/conflict-resolution.cjs');

test('register merge is deterministic in both orders', () => {
  const a = { value: { mood: 'calm' }, stamp: { counter: 5, replicaId: 'A' } };
  const b = { value: { mood: 'playful' }, stamp: { counter: 5, replicaId: 'A' } };
  assert.deepEqual(mergeRegister(a,b), mergeRegister(b,a));
  assert.equal(mergeRegister(a,b).conflicts.length, 1);
});

test('g-counter merge is commutative and monotonic', () => {
  const a = { A: 3, B: 1 };
  const b = { A: 2, B: 4, C: 1 };
  const merged = mergeGCounter(a,b);
  assert.deepEqual(merged, mergeGCounter(b,a));
  assert.equal(gCounterValue(merged), 8);
});

test('OR-set merge converges', () => {
  const a = { adds: { gift: ['A:1'] }, removes: {} };
  const b = { adds: { gift: ['A:1'], note: ['B:1'] }, removes: { gift: ['A:1'] } };
  const merged = mergeOrSet(a,b);
  assert.deepEqual(orSetValues(merged), ['note']);
  assert.deepEqual(merged, mergeOrSet(b,a));
});

test('portable state merge is order-independent', () => {
  const a = { counters:{sessions:{A:2}}, sets:{keepsakes:{adds:{x:['A:1']},removes:{}}}, registers:{name:{value:'Mura',stamp:{counter:1,replicaId:'A'}}} };
  const b = { counters:{sessions:{B:3}}, sets:{keepsakes:{adds:{y:['B:1']},removes:{}}}, registers:{name:{value:'Mura',stamp:{counter:1,replicaId:'A'}}} };
  assert.deepEqual(mergePortableState(a,b), mergePortableState(b,a));
});
