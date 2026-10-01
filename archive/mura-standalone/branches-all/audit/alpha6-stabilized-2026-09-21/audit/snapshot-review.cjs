'use strict';
// Audit-only: no changes to user data, source files, system settings or permissions.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { execFileSync, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const req = p => require(path.join(root, p));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'mura-audit-'));
const results = [];
let storeIndex = 0;
function makeStore(extra = {}) {
  const { MemoryStore } = req('src/engine/memory-store.cjs');
  const store = new MemoryStore(path.join(temp, `state-${++storeIndex}.json`));
  Object.assign(store.state, extra);
  return store;
}
async function probe(id, title, method, fn) {
  try { await fn(); results.push({ id, title, method, status: 'PASS' }); }
  catch (error) { results.push({ id, title, method, status: 'FAIL', detail: String(error.message).slice(0, 1600) }); }
  const r = results.at(-1);
  console.log(`${r.status} ${r.id}: ${r.title}${r.detail ? ' | ' + r.detail.replaceAll('\n', ' ') : ''}`);
}
function mainHarness(store, options = {}) {
  const mainPath = path.join(root, JSON.parse(read('package.json')).main);
  const localRequire = createRequire(mainPath);
  const sent = [], handlers = new Map();
  const area = { x: 0, y: 0, width: 1440, height: 900 };
  const electron = {
    app: { setName() {}, on() {}, whenReady: () => ({ then() {} }), getVersion: () => 'audit', getPath: () => temp },
    ipcMain: { handle: (channel, callback) => handlers.set(channel, callback) },
    screen: { getCursorScreenPoint: () => ({ x: 600, y: 600 }), getPrimaryDisplay: () => ({ id: 1, workArea: area }), getDisplayNearestPoint: () => ({ workArea: area }), getAllDisplays: () => [] },
    shell: { openExternal: async () => { throw new Error('Audit must not open external targets'); } }
  };
  const win = { isDestroyed: () => false, isVisible: () => true, webContents: { send: (...args) => sent.push(args) }, setIgnoreMouseEvents() {}, setFocusable() {}, getBounds: () => ({ x: 500, y: 400, width: 252, height: 318 }) };
  const context = { require: p => p === 'electron' ? electron : localRequire(p), module: { exports: {} }, __dirname: path.dirname(mainPath), process, console, Buffer, setTimeout: () => 1, clearTimeout() {}, storeForAudit: store, winForAudit: win, optionsForAudit: options };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(mainPath, 'utf8') + '\nmemory=storeForAudit;win=winForAudit;interactive=!!optionsForAudit.interactive;moving=!!optionsForAudit.moving;pack={characterId:"ksyusha.default"};episodes={describe:()=>[],evaluate:()=>[]};module.exports={inspectText,registerIpc,maybeAnnounceFirstWeekContinuity,publicState};', context, { timeout: 3000 });
  return { ...context.module.exports, sent, handlers };
}
async function rendererHarness() {
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, { id, hidden: true, dataset: {}, style: { setProperty() {} }, handlers: {}, textContent: '', src: '', querySelector: selector => node(id + selector), addEventListener(type, fn) { this.handlers[type] = fn; }, replaceChildren() {}, contains: () => false });
    return nodes.get(id);
  }
  const state = { preferences: { onboardingCompleted: false }, runtime: { interactive: true } };
  const pack = { actions: { idle: { asset: 'idle.webp' }, inspect: { asset: 'inspect.webp', durationMs: 3200 }, wave: { asset: 'waving.webp', durationMs: 1900 } }, attention: { assets: { center: 'look-center.webp' } } };
  const api = { getCharacterPack: async () => pack, getState: async () => state, onPresence() {}, onAction() {}, onMode() {}, onStateChanged() {}, inspectDroppedFile: async () => ({ ok: true, token: 'synthetic', descriptor: { name: 'audit.txt', kind: 'file', size: 1 } }) };
  const context = { window: { mura: api, addEventListener() {} }, document: { getElementById: node, createElement: () => ({ dataset: {} }) }, console, setTimeout: () => 1, clearTimeout() {}, module: { exports: {} } };
  vm.createContext(context);
  vm.runInContext(read('src/renderer/alpha4.js') + '\nmodule.exports={showOnboarding,getStep:()=>onboardingStep};', context, { timeout: 3000 });
  await new Promise(resolve => setImmediate(resolve));
  return { ...context.module.exports, node };
}
async function run() {
  await probe('CTRL-01', 'All 16 attention sectors are reachable', 'executable pure function', () => {
    const { sector16FromAngle } = req('src/engine/attention.cjs');
    assert.equal(new Set(Array.from({ length: 360 }, (_, i) => sector16FromAngle(i))).size, 16);
  });
  await probe('CTRL-02', 'Character manifest assets resolve through the bundle loader', 'executable pack validator', () => {
    const { loadCharacterPack, validateCharacterPack } = req('src/engine/character-pack.cjs');
    const base = path.join(root, 'assets/character');
    assert.deepEqual(validateCharacterPack(loadCharacterPack(base), base), []);
  });
  await probe('CTRL-03', 'Inspect alone does not persist a file', 'real MemoryStore in temporary directory', () => {
    const store = makeStore(); const file = path.join(temp, 'audit.txt'); fs.writeFileSync(file, 'synthetic');
    const before = JSON.stringify(store.snapshot()); store.inspectFile(file);
    assert.equal(JSON.stringify(store.snapshot()), before);
  });
  await probe('CTRL-04', 'Normal activity budget suppresses autonomous activity during Quiet', 'executable pure function', () => {
    const { presenceBudget } = req('src/engine/activity-budget.cjs');
    assert.equal(presenceBudget({ preferences: { quietUntil: new Date(Date.now() + 3600000).toISOString() } }).allowAutonomous, false);
  });
  await probe('A01', 'Home idle image exists at its literal HTML path', 'filesystem asset resolution', () => {
    const html = read('src/home/index.html');
    const tag = html.match(/<img[^>]*id="homeCharacter"[^>]*>/)?.[0];
    assert.ok(tag, 'Home character tag missing');
    const src = tag.match(/src="([^"]+)"/)[1];
    assert.ok(fs.existsSync(path.resolve(root, 'src/home', src)), `Missing Home image: ${src}`);
  });
  await probe('A02', 'Home scene poses resolve through the Character Pack asset resolver', 'executable pack + Home scene resolution', () => {
    const { loadCharacterPack } = req('src/engine/character-pack.cjs');
    const { deriveHomeScene } = req('src/engine/home-world.cjs');
    const packRoot = path.join(root, 'assets/character');
    const pack = loadCharacterPack(packRoot);
    for (const state of [{ runtime: { quiet: true } }, { timers: [{ status: 'active', meta: { focus: true }, dueAt: new Date(Date.now() + 60000).toISOString() }] }, { episodesDetailed: [{ stageNote: 'synthetic' }] }, { files: [{ id: 'synthetic' }] }]) {
      const { pose } = deriveHomeScene(state);
      const spec = pack.actions?.[pose] || pack.actions?.idle;
      const asset = spec?.asset || pack.rig?.baseAsset || pack.attention?.assets?.center;
      assert.ok(asset, `No Character Pack asset declared for Home pose: ${pose}`);
      assert.ok(pack.assetData?.[asset] || fs.existsSync(path.join(packRoot, asset)), `Home pose cannot resolve through Character Pack: ${pose} -> ${asset}`);
    }
    const home = read('src/home/home.js');
    assert.match(home, /api\.getCharacterPack\(\)/);
    assert.match(home, /pack\?\.assetData/);
  });
  await probe('A03', 'Windows adapter avoids assigning the reserved PID variable', process.platform === 'win32' ? 'PowerShell synthetic assignment plus source inspection' : 'source inspection; native assignment tested by Windows job', () => {
    const { WINDOWS_SCRIPT } = req('src/platform/window-surfaces.cjs');
    if (/\$pid\s*=/i.test(WINDOWS_SCRIPT) && process.platform === 'win32') {
      const p = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "$ErrorActionPreference='Stop'; $pid=0"], { encoding: 'utf8', timeout: 15000, windowsHide: true });
      assert.equal(p.status, 0, `Reserved PID assignment failed: ${(p.stderr || p.error || '').toString().slice(0, 600)}`);
    }
    assert.doesNotMatch(WINDOWS_SCRIPT, /\$pid\s*=/i);
  });
  await probe('A04', 'Dropping a file during onboarding reveals handoff instead of leaving the coach over it', 'renderer JavaScript with mocked DOM and IPC', async () => {
    const h = await rendererHarness(); h.showOnboarding(3);
    await h.node('stage').handlers.drop({ preventDefault() {}, dataTransfer: { files: [{}] } });
    assert.equal(h.node('handoff').hidden, false);
    assert.equal(h.node('onboarding').hidden, true, `Coach remains visible; internal step=${h.getStep()} while its old Next text belongs to step 3`);
  });
  await probe('A05', 'First-week startup announcement respects Quiet', 'actual main callback in Electron VM harness', () => {
    const store = makeStore(); store.state.identity.sessions = 2;
    store.state.preferences.onboardingCompleted = true; store.state.preferences.quietUntil = new Date(Date.now() + 3600000).toISOString();
    const h = mainHarness(store); h.maybeAnnounceFirstWeekContinuity();
    assert.equal(h.sent.filter(([c]) => c === 'character:action').length, 0, 'Startup continuity bypasses normal Quiet budget');
  });
  await probe('A06', 'Hinted link inspection refuses non-web schemes', 'actual main inspectText, no OS action', () => {
    const h = mainHarness(makeStore()); let result;
    try { result = h.inspectText('file:///synthetic-audit-target', 'link'); } catch { return; }
    assert.equal(result.descriptor.canOpen, false, 'A link hint turns a non-http(s) target into an openable link');
  });
  await probe('A07', 'IPC state handler rejects an untrusted sender', 'registered actual IPC handler with synthetic sender', () => {
    const h = mainHarness(makeStore()); h.registerIpc();
    let state;
    try { state = h.handlers.get('memory:get-state')({ senderFrame: { url: 'https://untrusted.invalid/', origin: 'https://untrusted.invalid' } }); } catch { return; }
    assert.ok(!state || !state.identity, 'Untrusted sender received synthetic identity/state; no sender validation');
  });
  await probe('A08', 'Forgetting a file removes objectId-indexed notes and read moments too', 'real MemoryStore persistence', () => {
    const store = makeStore(); const p = path.join(temp, 'forget.txt'); fs.writeFileSync(p, 'synthetic');
    const file = store.rememberFile(p); store.annotateObject(file.id, 'synthetic note'); store.setObjectContentIndex(file.id, { text: 'synthetic' }); store.forgetFile(file.id);
    assert.equal(store.state.moments.filter(m => m.data?.objectId === file.id || m.data?.fileId === file.id).length, 0);
  });
  await probe('A09', 'Corrupt state is preserved instead of silently overwritten on beginSession', 'temporary corrupt file and real MemoryStore', () => {
    const dir = fs.mkdtempSync(path.join(temp, 'corrupt-')); const p = path.join(dir, 'mura-state.json'); const raw = '{ synthetic broken state'; fs.writeFileSync(p, raw);
    const { MemoryStore } = req('src/engine/memory-store.cjs'); new MemoryStore(p).beginSession();
    assert.ok(fs.readdirSync(dir).some(n => fs.statSync(path.join(dir, n)).isFile() && fs.readFileSync(path.join(dir, n), 'utf8') === raw), 'Original corrupt bytes were replaced without a recovery copy');
  });
  await probe('A10', 'SDK rejects parent-only and Windows-drive asset paths', 'executable SDK validator', () => {
    const { safeRelativeAsset } = req('src/core/character-pack-sdk.cjs');
    for (const p of ['..', 'C:/outside.png', 'C:\\outside.png']) assert.equal(safeRelativeAsset(p), false, `Accepted unsafe path: ${p}`);
  });
  await probe('A11', 'A manifest accepted by SDK can always produce its public descriptor', 'executable SDK contract', () => {
    const sdk = req('src/core/character-pack-sdk.cjs'); const pack = { sdkVersion: 1, characterId: 'audit.pack', displayName: 'Audit', assets: {}, presenceModes: ['ambient'] };
    assert.equal(sdk.validateCharacterPack(pack).ok, true); assert.doesNotThrow(() => sdk.publicCharacterDescriptor(pack));
  });
  await probe('A12', 'MemoryEcho derives shared-history eligibility from the raw store actually passed by main', 'executable relationship and echo integration', () => {
    const { deriveRelationship } = req('src/engine/relationship.cjs'); const { eligibleEchoes } = req('src/engine/memory-echo.cjs');
    const state = { preferences: { onboardingCompleted: true }, identity: { sessions: 100, activeDays: Array.from({ length: 90 }, (_, i) => new Date(Date.UTC(2026, 0, i + 1)).toISOString()), metAt: '2026-01-01' }, stats: { interactionCount: 10000 }, files: Array.from({ length: 40 }, (_, i) => ({ id: 'f' + i })), objects: [], timers: Array.from({ length: 80 }, () => ({ status: 'done', meta: { focus: true } })), moments: Array.from({ length: 80 }, () => ({ salience: .7 })), discoveries: [] };
    assert.ok(['shared-history', 'long-term'].includes(deriveRelationship(state).stage.id));
    assert.ok(eligibleEchoes(state).some(e => e.kind === 'history'), 'History echo requires state.relationship, but MemoryStore.snapshot has no derived relationship');
  });
  await probe('A13', 'Rig applies the attentionScale passed by Quiet/Focus budget', 'executable RigController comparison', () => {
    const { RigController } = req('src/engine/rig.cjs');
    const a = { attending: true, level: 'engaged', dx: 1, dy: 1 };
    const x = new RigController({ rng: () => .5 }); const y = new RigController({ rng: () => .5 }); x.reset(0); y.reset(0);
    assert.ok(y.update(a, 1000, { attentionScale: .45 }).headX < x.update(a, 1000, { attentionScale: 1 }).headX, 'attentionScale does not affect rig output');
  });
  await probe('A14', 'Surface eligibility excludes horizontally off-screen windows', 'executable SurfaceGraph geometry', () => {
    const { canLandOn } = req('src/engine/surface-graph.cjs');
    assert.equal(canLandOn({ x: 10000, y: 400, width: 800, height: 400 }, { width: 252, height: 318 }, { x: 0, y: 0, width: 1440, height: 900 }), false);
  });
  await probe('A15', 'Character locomotion starts run before jump rather than immediately overriding jump', 'actual main animation ordering source inspection', () => {
    const source = read('src/main/alpha5-main.cjs');
    assert.doesNotMatch(source, /emitAction\('jump'\);\s*await animateWindowTo\(target, \{ landing: true \}\)/, 'attachNearest emits jump immediately before animateWindowTo emits run');
  });
  await probe('A16', 'Window topology changes have recovery event handlers', 'source integration inspection (not native monitor test)', () => {
    const source = read('src/main/alpha5-main.cjs'); assert.match(source, /display-removed/, 'No display-removed subscription exists in active main');
  });
  await probe('A17', 'Object reader reports truncation at the character cap', 'real bounded text read with synthetic fixture', () => {
    const p = path.join(temp, 'large.txt'); fs.writeFileSync(p, 'a'.repeat(90000)); const r = req('src/engine/object-intelligence.cjs').readLocalText(p);
    assert.equal(r.text.length, 80000); assert.equal(r.truncated, true);
  });
  await probe('A18', 'Revocation merge is order independent even with differing signature fields', 'executable future-platform primitive', () => {
    const { mergeRevocations } = req('src/core/revocation.cjs'); const a = { peerId: 'peer', revokedBy: 'owner', revokedAt: '2026-01-01T00:00:00Z', signature: 'a' }; const b = { ...a, signature: 'b' };
    assert.deepEqual(mergeRevocations([a], [b]), mergeRevocations([b], [a]));
  });
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const inventory = tracked.map(p => { const bytes = fs.readFileSync(path.join(root, p)); return { path: p, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }; });
  const counts = { pass: results.filter(r => r.status === 'PASS').length, fail: results.filter(r => r.status === 'FAIL').length };
  const out = path.join(root, '.audit-results'); fs.mkdirSync(out, { recursive: true });
  const report = { reviewedRuntimeCommit: 'f60b9a29d3a34102539b81d2a0415b240d646baa', executionCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), platform: process.platform, node: process.version, generatedAt: new Date().toISOString(), counts, results };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2)); fs.writeFileSync(path.join(out, 'source-inventory.json'), JSON.stringify(inventory, null, 2));
  console.log('AUDIT_COUNTS ' + JSON.stringify({ ...counts, trackedFiles: tracked.length }));
  process.exitCode = counts.fail ? 1 : 0;
}
run().catch(error => { console.error(error); process.exitCode = 2; }).finally(() => fs.rmSync(temp, { recursive: true, force: true }));
