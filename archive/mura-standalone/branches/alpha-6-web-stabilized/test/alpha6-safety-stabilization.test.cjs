'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');

test('Windows surface adapter avoids the reserved PowerShell PID variable', () => {
  const { WINDOWS_SCRIPT } = require('../src/platform/window-surfaces.cjs');
  assert.doesNotMatch(WINDOWS_SCRIPT, /\$pid\s*=/i);
  assert.match(WINDOWS_SCRIPT, /\$windowProcessId/i);

  if (process.platform === 'win32') {
    const probe = spawnSync('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-Command',
      "$ErrorActionPreference='Stop'; [uint32]$windowProcessId=0; $windowProcessId=42; if($windowProcessId -ne 42){exit 3}"
    ], { encoding: 'utf8', timeout: 15000, windowsHide: true });
    assert.equal(probe.status, 0, probe.stderr || probe.error?.message);
  }
});

test('external URL boundary accepts only normal http and https links', () => {
  const { normalizeWebUrl } = require('../src/engine/external-url.cjs');

  assert.equal(normalizeWebUrl('https://example.com/a b'), 'https://example.com/a%20b');
  assert.equal(normalizeWebUrl('http://example.com/'), 'http://example.com/');
  for (const value of [
    'file:///tmp/private',
    'javascript:alert(1)',
    'data:text/html,hello',
    'mailto:test@example.com',
    'ftp://example.com/file',
    'https://user:secret@example.com/',
    'not a url'
  ]) assert.equal(normalizeWebUrl(value), null, value);
});

test('IPC trust requires a known BrowserWindow main frame at an exact local entry file', () => {
  const { isTrustedRendererEvent } = require('../src/main/ipc-trust.cjs');

  const webContents = {};
  const mainFrame = {};
  webContents.mainFrame = mainFrame;
  const win = { isDestroyed: () => false, webContents };
  const rendererFile = path.join(root, 'src/renderer/alpha4.html');
  const trustedFrame = { url: pathToFileURL(rendererFile).href };
  webContents.mainFrame = trustedFrame;

  assert.equal(isTrustedRendererEvent(
    { sender: webContents, senderFrame: trustedFrame },
    { windows: [win], allowedFiles: [rendererFile] }
  ), true);

  assert.equal(isTrustedRendererEvent(
    { sender: {}, senderFrame: trustedFrame },
    { windows: [win], allowedFiles: [rendererFile] }
  ), false);

  assert.equal(isTrustedRendererEvent(
    { sender: webContents, senderFrame: { url: 'https://untrusted.invalid/' } },
    { windows: [win], allowedFiles: [rendererFile] }
  ), false);

  const subframe = { url: pathToFileURL(rendererFile).href };
  assert.equal(isTrustedRendererEvent(
    { sender: webContents, senderFrame: subframe },
    { windows: [win], allowedFiles: [rendererFile] }
  ), false);

  assert.equal(isTrustedRendererEvent(
    { sender: webContents, senderFrame: trustedFrame },
    { windows: [win], allowedFiles: [path.join(root, 'src/home/index.html')] }
  ), false);
});

test('active main registers IPC through the trusted wrapper', () => {
  const source = fs.readFileSync(path.join(root, 'src/main/alpha5-main.cjs'), 'utf8');
  assert.match(source, /registerTrustedHandler\('memory:get-state'/);
  assert.match(source, /isTrustedRendererEvent/);
  assert.equal((source.match(/ipcMain\.handle\(/g) || []).length, 1, 'raw ipcMain.handle should exist only inside the trusted wrapper');
  assert.match(source, /normalizeWebUrl\(target\)/);
  assert.match(source, /setWindowOpenHandler\(\(\) => \(\{ action: 'deny' \}\)\)/);
  assert.match(source, /will-navigate/);
  assert.match(source, /localFilePath\(targetUrl\)/);
});

test('forgetFile removes fileId and objectId traces plus keepsakes permissions and discoveries', () => {
  const { MemoryStore } = require('../src/engine/memory-store.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mura-forget-file-'));
  try {
    const statePath = path.join(dir, 'state.json');
    const filePath = path.join(dir, 'private.txt');
    fs.writeFileSync(filePath, 'private');
    const store = new MemoryStore(statePath);
    const item = store.rememberFile(filePath);
    store.annotateObject(item.id, 'note');
    store.setObjectContentIndex(item.id, { text: 'indexed' });
    store.state.permissions[item.id] = { synthetic: true };
    store.state.discoveries.push({ id: 'synthetic', metadata: { objectId: item.id } });
    store.save();

    assert.equal(store.forgetFile(item.id), true);
    assert.equal(store.state.files.some(x => x.id === item.id), false);
    assert.equal(store.state.moments.some(m => m.data?.fileId === item.id || m.data?.objectId === item.id || m.data?.sourceId === item.id), false);
    assert.equal(store.state.keepsakes.some(k => k.sourceId === item.id), false);
    assert.equal(store.state.discoveries.some(d => d.metadata?.fileId === item.id || d.metadata?.objectId === item.id || d.metadata?.sourceId === item.id), false);
    assert.equal(Object.prototype.hasOwnProperty.call(store.state.permissions, item.id), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('forgetObject applies the same reference cleanup contract', () => {
  const { MemoryStore } = require('../src/engine/memory-store.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mura-forget-object-'));
  try {
    const store = new MemoryStore(path.join(dir, 'state.json'));
    const item = store.rememberObject('text', 'private note', 'private');
    store.annotateObject(item.id, 'annotation');
    store.state.permissions[item.id] = { synthetic: true };
    store.state.discoveries.push({ id: 'synthetic', metadata: { sourceId: item.id } });
    store.save();

    assert.equal(store.forgetObject(item.id), true);
    assert.equal(store.state.objects.some(x => x.id === item.id), false);
    assert.equal(store.state.moments.some(m => m.data?.fileId === item.id || m.data?.objectId === item.id || m.data?.sourceId === item.id), false);
    assert.equal(store.state.keepsakes.some(k => k.sourceId === item.id), false);
    assert.equal(store.state.discoveries.some(d => d.metadata?.fileId === item.id || d.metadata?.objectId === item.id || d.metadata?.sourceId === item.id), false);
    assert.equal(Object.prototype.hasOwnProperty.call(store.state.permissions, item.id), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('malformed persisted state is backed up byte-for-byte before a fresh session overwrites the primary file', () => {
  const { MemoryStore } = require('../src/engine/memory-store.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mura-corrupt-state-'));
  try {
    const statePath = path.join(dir, 'mura-state.json');
    const raw = Buffer.from([0x7b,0x20,0x22,0x78,0x22,0x3a,0xff,0x00,0x7d]);
    fs.writeFileSync(statePath, raw);

    const store = new MemoryStore(statePath);
    assert.ok(store.recoveryBackupPath, 'recovery backup path should be recorded');
    assert.deepEqual(fs.readFileSync(store.recoveryBackupPath), raw);

    store.beginSession();
    assert.notDeepEqual(fs.readFileSync(statePath), raw);
    assert.deepEqual(fs.readFileSync(store.recoveryBackupPath), raw, 'backup must survive the primary-state rewrite');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('valid JSON with an invalid state root is also preserved before reset', () => {
  const { MemoryStore } = require('../src/engine/memory-store.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mura-invalid-root-'));
  try {
    const statePath = path.join(dir, 'mura-state.json');
    const raw = Buffer.from('[]');
    fs.writeFileSync(statePath, raw);
    const store = new MemoryStore(statePath);
    assert.ok(store.recoveryBackupPath);
    assert.deepEqual(fs.readFileSync(store.recoveryBackupPath), raw);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
