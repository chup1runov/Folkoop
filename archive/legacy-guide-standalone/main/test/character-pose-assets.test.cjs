'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadCharacterPack } = require('../src/engine/character-pack.cjs');

const root = path.join(__dirname, '../assets/character');
const names = ['point-left.png','point-right.png','point-up.png','point-down.png','sit-edge.png'];

function pngMeta(buffer) {
  assert.equal(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(buffer.subarray(12, 16).toString('ascii'), 'IHDR');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25]
  };
}

for (const name of names) test(`${name} is a 192x208 8-bit RGBA source asset`, () => {
  const file = fs.readFileSync(path.join(root, name));
  const meta = pngMeta(file);
  assert.deepEqual(meta, { width: 192, height: 208, bitDepth: 8, colorType: 6 });
  assert(file.length > 20_000 && file.length < 50_000, `unexpected payload for ${name}: ${file.length}`);
});

test('pose expansion is declared and bundled byte-for-byte', () => {
  const pack = loadCharacterPack(root);
  const expected = {
    'point-left': 'point-left.png',
    'point-right': 'point-right.png',
    'point-up': 'point-up.png',
    'point-down': 'point-down.png',
    'sit-edge': 'sit-edge.png'
  };
  for (const [action, name] of Object.entries(expected)) {
    assert.equal(pack.actions[action]?.asset, name);
    const uri = pack.assetData[name];
    assert.match(uri, /^data:image\/png;base64,/);
    const bundled = Buffer.from(uri.slice(uri.indexOf(',') + 1), 'base64');
    assert.deepEqual(bundled, fs.readFileSync(path.join(root, name)), `${name} bundle differs from source`);
  }
});
