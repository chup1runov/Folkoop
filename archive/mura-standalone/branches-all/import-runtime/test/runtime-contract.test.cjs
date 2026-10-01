'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('desktop runtime exists and keeps renderer sandboxed', () => {
  const main = fs.readFileSync(path.join(root, 'src/main/main.cjs'), 'utf8');
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /sandbox:\s*true/);
  assert.match(main, /setIgnoreMouseEvents/);
  assert.doesNotMatch(main, /capturePage\(/);
});

test('preload exposes the mura bridge, not raw ipcRenderer', () => {
  const preload = fs.readFileSync(path.join(root, 'src/main/preload.cjs'), 'utf8');
  assert.match(preload, /exposeInMainWorld\('mura'/);
  assert.doesNotMatch(preload, /exposeInMainWorld\([^,]+,\s*ipcRenderer/);
});

test('minimal first-party character pack validates against local runtime validator', () => {
  const { loadCharacterPack } = require('../src/engine/character-pack.cjs');
  const pack = loadCharacterPack(path.join(root, 'assets/character'));
  assert.equal(pack.characterId, 'ksyusha.default');
});
