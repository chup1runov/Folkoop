'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseMacOSWindows, parseWindowsWindows, parseLinuxWmctrl, WindowSurfaceService } = require('../src/platform/window-surfaces.cjs');

test('parseMacOSWindows reads geometry and discards malformed rows', () => {
  const parsed = parseMacOSWindows('Finder#1\tFinder\t100\t200\t800\t600\nBad\tBad\tx\t0\t500\t400\n');
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, 'Finder#1');
  assert.equal(parsed[0].width, 800);
});

test('parseWindowsWindows accepts one object or array JSON', () => {
  assert.equal(parseWindowsWindows('{"id":"44","owner":"desktop-window","x":10,"y":20,"width":700,"height":500}').length, 1);
  assert.equal(parseWindowsWindows('[{"id":"1","x":1,"y":2,"width":300,"height":200},{"id":"2","x":1,"y":2,"width":10,"height":10}]').length, 1);
});

test('parseLinuxWmctrl discards the window title', () => {
  const parsed = parseLinuxWmctrl('0x03a00007  0  4321 100 200 800 600 host Secret document title');
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].owner, '4321');
  assert.equal(Object.hasOwn(parsed[0], 'title'), false);
});

test('WindowSurfaceService is inert while disabled', async () => {
  let called = false;
  const service = new WindowSurfaceService({ platform: 'darwin', executor: () => { called = true; } });
  const result = await service.sample(false);
  assert.equal(called, false);
  assert.equal(result.enabled, false);
  assert.deepEqual(result.surfaces, []);
});

test('mac accessibility failures are surfaced explicitly', async () => {
  const executor = (_cmd, _args, _options, callback) => callback(new Error('Not authorized to send Apple events to System Events.'), '', 'not authorized for accessibility');
  const service = new WindowSurfaceService({ platform: 'darwin', executor });
  const result = await service.sample(true);
  assert.equal(result.permissionRequired, true);
  assert.equal(result.error, 'permission-required');
});
