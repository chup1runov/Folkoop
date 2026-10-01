'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCharacterPack, publicCharacterDescriptor } = require('../src/core/character-pack-sdk.cjs');

const valid = {
  sdkVersion: 1,
  characterId: 'mura.default',
  displayName: 'Mura',
  capabilities: ['presence.attention','presence.rig','world.home'],
  presenceModes: ['ambient','companion','active'],
  assets: { idle: 'character/idle.webp' }
};

test('valid pack produces a stable public descriptor', () => {
  assert.equal(validateCharacterPack(valid).ok, true);
  assert.equal(publicCharacterDescriptor(valid).characterId, 'mura.default');
});

test('SDK rejects traversal and undeclared capabilities', () => {
  const bad = {...valid, capabilities:['screen.spy'], assets:{idle:'../secret.png'}};
  const result = validateCharacterPack(bad);
  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 2);
});
