'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('Character Pack SDK rejects parent, absolute, drive, UNC, URL and control asset paths', () => {
  const { safeRelativeAsset } = require('../src/core/character-pack-sdk.cjs');
  const unsafe = [
    '..',
    '../a.png',
    'a/../../b.png',
    '/absolute/a.png',
    'C:/outside.png',
    'C:\\outside.png',
    '\\\\server\\share\\a.png',
    '//server/share/a.png',
    'file:///tmp/a.png',
    'https://example.com/a.png',
    'a\u0000b.png'
  ];
  for (const value of unsafe) assert.equal(safeRelativeAsset(value), false, value);

  for (const value of ['images/a.png', './images/a.png', 'poses/idle.webp']) {
    assert.equal(safeRelativeAsset(value), true, value);
  }
});

test('SDK descriptor works when optional capabilities are omitted', () => {
  const sdk = require('../src/core/character-pack-sdk.cjs');
  const pack = {
    sdkVersion: 1,
    characterId: 'audit.pack',
    displayName: 'Audit',
    assets: {},
    presenceModes: ['ambient']
  };
  assert.equal(sdk.validateCharacterPack(pack).ok, true);
  const descriptor = sdk.publicCharacterDescriptor(pack);
  assert.deepEqual(descriptor.capabilities, []);
  assert.deepEqual(descriptor.presenceModes, ['ambient']);
});

test('bounded local reader reports truncation at the character cap', () => {
  const { readLocalText, MAX_READ_BYTES } = require('../src/engine/object-intelligence.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mura-object-reader-'));
  try {
    const file = path.join(dir, 'large.txt');
    fs.writeFileSync(file, 'a'.repeat(90_000), 'utf8');
    const result = readLocalText(file);
    assert.equal(result.text.length, 80_000);
    assert.equal(result.truncated, true);
    assert.ok(result.bytesRead <= MAX_READ_BYTES);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('revocation merge is order-independent when equivalent records carry different signatures', () => {
  const { mergeRevocations } = require('../src/core/revocation.cjs');
  const a = {
    peerId: 'peer',
    revokedBy: 'owner',
    revokedAt: '2026-01-01T00:00:00Z',
    reason: 'test',
    signature: 'b-signature'
  };
  const b = { ...a, signature: 'a-signature' };

  const ab = mergeRevocations([a], [b]);
  const ba = mergeRevocations([b], [a]);
  assert.deepEqual(ab, ba);
  assert.equal(ab.length, 1);
  assert.equal(ab[0].signature, 'a-signature');
});

test('revocation merge prefers a signed representation over an otherwise identical unsigned one', () => {
  const { mergeRevocations } = require('../src/core/revocation.cjs');
  const unsigned = {
    peerId: 'peer',
    revokedBy: 'owner',
    revokedAt: '2026-01-01T00:00:00Z',
    reason: 'test'
  };
  const signed = { ...unsigned, signature: 'sig' };

  assert.deepEqual(mergeRevocations([unsigned], [signed]), mergeRevocations([signed], [unsigned]));
  assert.equal(mergeRevocations([unsigned], [signed])[0].signature, 'sig');
});
