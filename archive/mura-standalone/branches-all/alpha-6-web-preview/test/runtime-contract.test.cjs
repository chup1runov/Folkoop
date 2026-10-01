'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function runtimeSource() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(typeof pkg.main, 'string');
  const entry = path.join(root, pkg.main);
  assert.equal(fs.existsSync(entry), true, `Runtime entry does not exist: ${pkg.main}`);
  return fs.readFileSync(entry, 'utf8');
}

test('configured desktop runtime exists and keeps renderer sandboxed', () => {
  const main = runtimeSource();
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

test('first-party manifest satisfies the runtime schema independently of asset restoration', () => {
  const { validateCharacterPack } = require('../src/engine/character-pack.cjs');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/character/manifest.json'), 'utf8'));
  assert.deepEqual(validateCharacterPack(manifest), []);
  assert.equal(manifest.characterId, 'ksyusha.default');
});

test('native window geometry is opt-in and exposed through narrow surface IPC', () => {
  const main = runtimeSource();
  const preload = fs.readFileSync(path.join(root, 'src/main/preload.cjs'), 'utf8');
  assert.match(main, /surfaceGeometryEnabled\s*=\s*memory\.getPreference\('surfaceGeometryEnabled',\s*false\)\s*===\s*true/);
  assert.match(main, /surface:set-enabled/);
  assert.match(main, /surface:attach-nearest/);
  assert.match(preload, /setSurfaceGeometry/);
  assert.match(preload, /attachNearestSurface/);
  assert.doesNotMatch(preload, /WindowSurfaceService/);
});

test('Alpha 4 handoff requires inspection before persistence', () => {
  const preload = fs.readFileSync(path.join(root, 'src/main/preload.cjs'), 'utf8');
  assert.match(preload, /inspectDroppedFile/);
  assert.match(preload, /object:inspect-file/);
  assert.match(preload, /rememberHandoff/);
  assert.match(preload, /object:remember/);
  assert.doesNotMatch(preload, /rememberFileFromDrop/);
  assert.doesNotMatch(preload, /object:remember-file/);
});


test('first-run onboarding is local, narrow and returns to click-through mode', () => {
  const main = runtimeSource();
  const preload = fs.readFileSync(path.join(root, 'src/main/preload.cjs'), 'utf8');
  assert.match(main, /onboarding:complete/);
  assert.match(main, /onboardingCompleted/);
  assert.match(main, /onboardingVersion/);
  assert.match(preload, /completeOnboarding/);
  assert.doesNotMatch(preload, /exposeInMainWorld\([^,]+,\s*ipcRenderer/);
});

test('first-week continuity is bounded and does not require cloud or screen capture', () => {
  const main = runtimeSource();
  assert.match(main, /chooseFirstWeekMoment/);
  assert.doesNotMatch(main, /capturePage\(/);
  assert.doesNotMatch(main, /desktopCapturer/);
});
