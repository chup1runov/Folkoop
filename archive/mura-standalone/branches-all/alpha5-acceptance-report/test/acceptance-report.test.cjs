'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('acceptance report can be saved without exposing raw paths through preload', () => {
  const main = fs.readFileSync(path.join(root, 'src/main/alpha5-main.cjs'), 'utf8');
  const preload = fs.readFileSync(path.join(root, 'src/main/preload.cjs'), 'utf8');
  assert.match(main, /saveDiagnosticsReport/);
  assert.match(main, /app:save-diagnostics/);
  assert.match(preload, /saveDiagnostics/);
  assert.doesNotMatch(preload, /stateFile\(/);
});
