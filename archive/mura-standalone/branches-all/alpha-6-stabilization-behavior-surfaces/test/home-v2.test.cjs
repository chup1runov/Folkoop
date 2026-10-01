'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src/home/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'src/home/home.js'), 'utf8');

test('Home v2 keeps the lived room before secondary records/settings', () => {
  const roomIndex = html.indexOf('id="room"');
  const drawerIndex = html.indexOf('id="memoryDrawer"');
  assert.notEqual(roomIndex, -1);
  assert.notEqual(drawerIndex, -1);
  assert.ok(roomIndex < drawerIndex);
  assert.match(html, /id="homeCharacter"/);
  assert.match(html, /id="roomProps"/);
  assert.match(html, /id="roomMemoryCard"/);
});

test('Home room props are interactive and memory drawer stays secondary', () => {
  assert.match(js, /renderHomeScene/);
  assert.match(js, /data-room-prop/);
  assert.match(js, /showRoomMemory/);
  assert.match(js, /roomMemoryOpen/);
  assert.doesNotMatch(html, /dashboard-grid/);
});

test('Home never renders raw file paths into the room memory card', () => {
  assert.doesNotMatch(js, /source\.path/);
  assert.doesNotMatch(js, /item\.path/);
});
