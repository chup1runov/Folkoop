'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRuntimeDiagnostics, formatRuntimeDiagnostics } = require('../src/platform/runtime-diagnostics.cjs');

test('runtime diagnostics are privacy-safe and platform-neutral', () => {
  const report = buildRuntimeDiagnostics({
    version: '1.0.0-alpha.5',
    platform: 'win32',
    arch: 'x64',
    osRelease: 'test-release',
    packaged: false,
    characterId: 'ksyusha.default',
    stateFileExists: true,
    shortcuts: { call: { accelerator: 'Ctrl+Shift+K', registered: true } },
    displays: [{ id: 1, width: 1920, height: 1080, scaleFactor: 1, primary: true, x: -999, y: -999 }],
    surfaceStatus: { geometryEnabled: true, attached: false, supported: true, permissionRequired: false, error: null, surfaceCount: 4, title: 'SECRET WINDOW' },
    stateFile: 'C:\\Users\\Alice\\secret\\mura-state.json'
  });

  assert.equal(report.app.version, '1.0.0-alpha.5');
  assert.equal(report.os.platform, 'win32');
  assert.equal(report.displays.length, 1);
  assert.equal(report.shortcuts.call.registered, true);
  assert.equal(report.surfaces.surfaceCount, 4);
  assert.equal(report.privacy.windowTitlesCollected, false);
  assert.equal(report.privacy.localPathsIncluded, false);

  const serialized = JSON.stringify(report);
  assert.doesNotMatch(serialized, /SECRET WINDOW/);
  assert.doesNotMatch(serialized, /Alice/);
  assert.doesNotMatch(serialized, /mura-state\.json/);
  assert.doesNotMatch(serialized, /"x"/);
  assert.doesNotMatch(serialized, /"y"/);

  const text = formatRuntimeDiagnostics(report);
  assert.match(text, /Manual macOS\/Windows desktop smoke test: REQUIRED/);
  assert.match(text, /call: OK/);
});
