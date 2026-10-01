'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { BlindRelayStore } = require('../src/core/blind-relay-store.cjs');

test('blind relay stores opaque capsules by route and consumes on pull', () => {
  let now = Date.parse('2026-09-17T10:00:00Z');
  const store = new BlindRelayStore({ now: () => now, maxBytes: 1024 });
  const route = 'opaque-route-token-1234';
  const body = Buffer.from('ciphertext').toString('base64');
  assert.equal(store.put({routeToken:route,messageId:'m1',ciphertext:body,expiresAt:'2026-09-17T11:00:00Z'}).accepted, true);
  assert.equal(store.put({routeToken:route,messageId:'m1',ciphertext:body,expiresAt:'2026-09-17T11:00:00Z'}).duplicate, true);
  assert.equal(store.pull(route).length, 1);
  assert.equal(store.pull(route).length, 0);
});

test('expired capsules are never delivered', () => {
  let now = Date.parse('2026-09-17T10:00:00Z');
  const store = new BlindRelayStore({ now: () => now });
  const route = 'opaque-route-token-5678';
  store.put({routeToken:route,messageId:'m2',ciphertext:Buffer.from('x').toString('base64'),expiresAt:'2026-09-17T10:01:00Z'});
  now = Date.parse('2026-09-17T10:02:00Z');
  assert.equal(store.pull(route).length, 0);
});
