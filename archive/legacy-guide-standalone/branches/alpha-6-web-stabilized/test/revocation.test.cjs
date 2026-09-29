'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeRevocations, revokedPeers } = require('../src/core/revocation.cjs');

test('revocations merge as a deterministic grow-only set', () => {
  const a = [{peerId:'lost-phone',revokedBy:'laptop',revokedAt:'2026-09-17T10:00:00Z',reason:'lost'}];
  const b = [{peerId:'old-mac',revokedBy:'desktop',revokedAt:'2026-09-17T11:00:00Z',reason:'retired'}];
  assert.deepEqual(mergeRevocations(a,b), mergeRevocations(b,a));
  assert.deepEqual(revokedPeers(mergeRevocations(a,b)), ['lost-phone','old-mac']);
});
