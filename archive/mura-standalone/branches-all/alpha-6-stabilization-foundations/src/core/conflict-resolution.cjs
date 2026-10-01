'use strict';

const { canonicalJson, stableHash } = require('./canonical.cjs');

function normalizeStamp(stamp = {}) {
  const counter = Number.isSafeInteger(stamp.counter) && stamp.counter >= 0 ? stamp.counter : 0;
  const replicaId = String(stamp.replicaId || '');
  return { counter, replicaId };
}

function compareStamp(a, b) {
  const x = normalizeStamp(a);
  const y = normalizeStamp(b);
  if (x.counter !== y.counter) return x.counter < y.counter ? -1 : 1;
  return x.replicaId.localeCompare(y.replicaId);
}

function mergeRegister(left, right, field = 'value') {
  if (!left) return { value: right, conflicts: [] };
  if (!right) return { value: left, conflicts: [] };
  const cmp = compareStamp(left.stamp, right.stamp);
  if (cmp > 0) return { value: left, conflicts: [] };
  if (cmp < 0) return { value: right, conflicts: [] };
  if (canonicalJson(left.value) === canonicalJson(right.value)) return { value: left, conflicts: [] };

  const leftHash = stableHash(left.value);
  const rightHash = stableHash(right.value);
  const winner = leftHash <= rightHash ? left : right;
  const loser = winner === left ? right : left;
  return {
    value: winner,
    conflicts: [{
      kind: 'concurrent-register',
      field,
      stamp: normalizeStamp(winner.stamp),
      winnerHash: stableHash(winner.value),
      alternativeHash: stableHash(loser.value),
      alternative: loser.value
    }]
  };
}

function mergeGCounter(a = {}, b = {}) {
  const result = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    result[key] = Math.max(Number(a[key] || 0), Number(b[key] || 0));
  }
  return result;
}

function gCounterValue(counter = {}) {
  return Object.values(counter).reduce((sum, value) => sum + Number(value || 0), 0);
}

function mergeOrSet(a = { adds: {}, removes: {} }, b = { adds: {}, removes: {} }) {
  const result = { adds: {}, removes: {} };
  for (const [id, tags] of Object.entries(a.adds || {})) result.adds[id] = [...new Set(tags || [])].sort();
  for (const [id, tags] of Object.entries(b.adds || {})) result.adds[id] = [...new Set([...(result.adds[id] || []), ...(tags || [])])].sort();
  for (const [id, tags] of Object.entries(a.removes || {})) result.removes[id] = [...new Set(tags || [])].sort();
  for (const [id, tags] of Object.entries(b.removes || {})) result.removes[id] = [...new Set([...(result.removes[id] || []), ...(tags || [])])].sort();
  return result;
}

function orSetValues(set = { adds: {}, removes: {} }) {
  const live = [];
  for (const [id, addTags] of Object.entries(set.adds || {})) {
    const removed = new Set(set.removes?.[id] || []);
    if ((addTags || []).some(tag => !removed.has(tag))) live.push(id);
  }
  return live.sort();
}

function mergePortableState(left = {}, right = {}) {
  const conflicts = [];
  const merged = {
    version: Math.max(Number(left.version || 1), Number(right.version || 1)),
    counters: {},
    sets: {},
    registers: {}
  };

  for (const key of new Set([...Object.keys(left.counters || {}), ...Object.keys(right.counters || {})])) {
    merged.counters[key] = mergeGCounter(left.counters?.[key], right.counters?.[key]);
  }
  for (const key of new Set([...Object.keys(left.sets || {}), ...Object.keys(right.sets || {})])) {
    merged.sets[key] = mergeOrSet(left.sets?.[key], right.sets?.[key]);
  }
  for (const key of new Set([...Object.keys(left.registers || {}), ...Object.keys(right.registers || {})])) {
    const result = mergeRegister(left.registers?.[key], right.registers?.[key], key);
    merged.registers[key] = result.value;
    conflicts.push(...result.conflicts);
  }
  return { state: merged, conflicts };
}

module.exports = {
  normalizeStamp,
  compareStamp,
  mergeRegister,
  mergeGCounter,
  gCounterValue,
  mergeOrSet,
  orSetValues,
  mergePortableState
};
