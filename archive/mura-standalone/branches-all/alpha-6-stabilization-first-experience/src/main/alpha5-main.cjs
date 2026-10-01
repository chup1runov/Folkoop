'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  app, BrowserWindow, ipcMain, screen, globalShortcut,
  nativeImage, Tray, Menu, shell, dialog
} = require('electron');
const { AttentionController } = require('../engine/attention.cjs');
const { RigController } = require('../engine/rig.cjs');
const { BehaviorEngine, MODES } = require('../engine/behavior.cjs');
const { MemoryStore } = require('../engine/memory-store.cjs');
const { TimerService } = require('../engine/timer-service.cjs');
const { loadCharacterPack } = require('../engine/character-pack.cjs');
const { floorPosition, edgePeekPosition, wanderTarget } = require('../engine/surface-physics.cjs');
const { SurfaceGraph } = require('../engine/surface-graph.cjs');
const { WindowSurfaceService } = require('../platform/window-surfaces.cjs');
const { deriveRelationship } = require('../engine/relationship.cjs');
const { EpisodeEngine } = require('../engine/episode-engine.cjs');
const { RareEventEngine } = require('../engine/rare-events.cjs');
const { MemoryEchoEngine } = require('../engine/memory-echo.cjs');
const { normalizeWebUrl } = require('../engine/external-url.cjs');
const { localFilePath, isTrustedRendererEvent } = require('./ipc-trust.cjs');
const { chooseFirstWeekMoment, roomProps } = require('../engine/first-week.cjs');
const { deriveHomeScene } = require('../engine/home-world.cjs');
const { isQuietUntil, presenceBudget, autonomousDeliveryAllowed } = require('../engine/activity-budget.cjs');
const { buildRuntimeDiagnostics, formatRuntimeDiagnostics } = require('../platform/runtime-diagnostics.cjs');

const WINDOW = Object.freeze({ width: 252, height: 318, margin: 14 });
const HOME = Object.freeze({ width: 1000, height: 790 });
const CHARACTER_ROOT = path.join(__dirname, '../../assets/character');

app.setName('Mura Companion');

let win = null;
let homeWin = null;
let tray = null;
let memory = null;
let timers = null;
let pack = null;
let behavior = null;
let episodes = null;
let rareEvents = null;
let memoryEchoes = null;
let interactive = false;
let behaviorMode = 'companion';
let moving = false;
let cursorTimer = null;
let behaviorTimer = null;
let surfaceTimer = null;
let surfaceService = null;
let surfaceGraph = new SurfaceGraph();
let surfaceGeometryEnabled = false;
let surfaceAttachment = null;
let surfaceStatus = { enabled: false, supported: true, permissionRequired: false, error: null };
const pendingHandoffs = new Map();
const attention = new AttentionController();
const rig = new RigController();
const shortcutStatus = Object.create(null);

function stateFile() { return path.join(app.getPath('userData'), 'mura-state.json'); }
function registerGlobalShortcut(key, accelerator, callback) {
  let registered = false;
  try { registered = globalShortcut.register(accelerator, callback) === true; } catch { registered = false; }
  shortcutStatus[key] = { accelerator, registered };
  return registered;
}
function runtimeDiagnostics() {
  const primary = screen.getPrimaryDisplay();
  return buildRuntimeDiagnostics({
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    packaged: app.isPackaged,
    characterId: pack?.characterId || null,
    stateFileExists: fs.existsSync(stateFile()),
    surfaceStatus: surfaceSummary(),
    shortcuts: shortcutStatus,
    displays: screen.getAllDisplays().map(display => ({
      id: String(display.id),
      width: display.workArea.width,
      height: display.workArea.height,
      scaleFactor: display.scaleFactor,
      primary: display.id === primary.id
    }))
  });
}
async function showDiagnostics() {
  const report = runtimeDiagnostics();
  await dialog.showMessageBox({
    type: 'info',
    title: 'Mura Companion · Диагностика',
    message: 'Desktop Acceptance diagnostics',
    detail: formatRuntimeDiagnostics(report),
    buttons: ['OK']
  });
  return report;
}
function workArea(point = screen.getCursorScreenPoint()) { return screen.getDisplayNearestPoint(point).workArea; }
function emitAction(action, message = null, extra = {}) {
  if (win && !win.isDestroyed()) win.webContents.send('character:action', { action, message, at: Date.now(), ...extra });
}
const TRUSTED_RENDERER_FILES = Object.freeze([
  path.join(__dirname, '../renderer/alpha4.html'),
  path.join(__dirname, '../home/index.html')
]);
function trustedIpcEvent(event) {
  return isTrustedRendererEvent(event, {
    windows: [win, homeWin],
    allowedFiles: TRUSTED_RENDERER_FILES
  });
}
function registerTrustedHandler(channel, handler) {
  ipcMain.handle(channel, (event, ...args) => {
    if (!trustedIpcEvent(event)) throw new Error('Unauthorized IPC sender.');
    return handler(event, ...args);
  });
}
function lockLocalNavigation(browserWindow, entryFile) {
  const expected = path.resolve(entryFile);
  browserWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  browserWindow.webContents.on('will-navigate', (event, targetUrl) => {
    if (localFilePath(targetUrl) !== expected) event.preventDefault();
  });
}
function surfaceSummary() {
  return {
    ...surfaceStatus,
    geometryEnabled: surfaceGeometryEnabled,
    attached: Boolean(surfaceAttachment),
    ...surfaceGraph.publicSummary()
  };
}
function publicState() {
  const state = memory.snapshot();
  state.files = (state.files || []).map(({ path: _path, ...item }) => item);
  state.objects = (state.objects || []).map(({ value: _value, ...item }) => item);
  state.relationship = deriveRelationship(state);
  state.episodesDetailed = episodes?.describe(state) || [];
  state.meaningfulMoments = memory.meaningfulMoments(12);
  state.roomProps = roomProps(state);
  const budget = presenceBudget(state, { interactive });
  state.runtime = {
    interactive,
    behaviorMode,
    quiet: budget.quiet,
    focus: budget.focus,
    characterId: pack?.characterId,
    surfaceGeometryEnabled,
    surfaceAttached: Boolean(surfaceAttachment),
    surfaceStatus: surfaceSummary()
  };
  state.homeScene = deriveHomeScene(state);
  return state;
}
function broadcast() {
  const state = publicState();
  if (win && !win.isDestroyed()) win.webContents.send('memory:changed', state);
  if (homeWin && !homeWin.isDestroyed()) homeWin.webContents.send('memory:changed', state);
}
function persistPosition() {
  if (!win || win.isDestroyed()) return;
  const { x, y } = win.getBounds();
  memory.setWindowPosition({ x, y });
}
function defaultPosition() {
  const area = screen.getPrimaryDisplay().workArea;
  const saved = memory.getPreference('lastWindowPosition', null);
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return floorPosition(workArea(saved), WINDOW, saved.x, WINDOW.margin);
  return floorPosition(area, WINDOW, area.x + area.width - WINDOW.width - WINDOW.margin, WINDOW.margin);
}
function setInteractive(value) {
  interactive = Boolean(value);
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(!interactive, { forward: true });
    win.setFocusable(interactive);
    win.webContents.send('interaction:mode', interactive);
  }
  memory.setPreference('interactionMode', interactive);
  rebuildTray(); broadcast();
  return interactive;
}
function setBehaviorMode(mode) {
  if (!MODES[mode]) return { ok: false, error: 'unknown-mode' };
  behaviorMode = mode; behavior.setMode(mode); memory.setPreference('behaviorMode', mode);
  if (win && !win.isDestroyed()) win.webContents.send('behavior:mode', mode);
  scheduleBehavior(); broadcast(); return { ok: true, mode };
}
function setQuiet(durationMs) {
  const until = durationMs ? new Date(Date.now() + Math.min(Math.max(durationMs, 60_000), 8 * 60 * 60_000)).toISOString() : null;
  memory.setPreference('quietUntil', until); scheduleBehavior(); broadcast();
  return until;
}

function maybeAnnounceFirstWeekContinuity() {
  if (memory.getPreference('onboardingCompleted', false) !== true) return null;
  if (!win || win.isDestroyed()) return null;
  const state = memory.snapshot();
  const context = { interactive, moving, visible: Boolean(win.isVisible()) };
  if (!autonomousDeliveryAllowed(state, context)) return null;
  const moment = chooseFirstWeekMoment(state);
  if (!moment) return null;
  memory.recordDiscovery(moment.id, { source: 'first-week' });
  memory.recordMoment('continuity-return', { salience: 0.58, data: { eventId: moment.id } });
  emitAction(moment.action, moment.message, { autonomous: true, continuity: true });
  broadcast();
  return moment;
}

function syncProgression({ announce = false } = {}) {
  const changes = episodes.evaluate();
  const state = memory.snapshot();
  const rel = deriveRelationship(state);
  if (rel.stage.id !== 'meeting') {
    const kind = `relationship:${rel.stage.id}`;
    if (!state.keepsakes.some(item => item.kind === kind)) memory.addKeepsake({ kind, title: rel.stage.label, emoji: rel.stage.id.includes('history') ? '💫' : '✦', sourceId: rel.stage.id });
  }
  if (announce && changes[0] && win && !win.isDestroyed()) {
    const deliveryState = memory.snapshot();
    const context = { interactive, moving, visible: Boolean(win.isVisible()) };
    if (autonomousDeliveryAllowed(deliveryState, context)) emitAction('idea', changes[0].stage.note, { autonomous: true, continuity: true });
  }
  return changes;
}

function surfaceMessage() {
  if (!surfaceGeometryEnabled || !surfaceStatus.enabled) return 'Геометрия окон выключена.';
  if (surfaceStatus.permissionRequired) return 'Нужен системный доступ к геометрии окон.';
  if (surfaceStatus.supported === false) return 'Адаптер окон недоступен.';
  if (surfaceStatus.error) return 'Не удалось получить геометрию окон.';
  if (!surfaceGraph.surfaces.length) return 'Подходящих окон пока не вижу.';
  return `Поверхностей: ${surfaceGraph.surfaces.length}`;
}
async function refreshSurfaces({ announce = false } = {}) {
  if (!surfaceService) return surfaceStatus;
  const result = await surfaceService.sample(surfaceGeometryEnabled);
  surfaceStatus = { enabled: result.enabled, supported: result.supported, permissionRequired: result.permissionRequired, error: result.error };
  surfaceGraph.update(result.surfaces || []);
  if (surfaceAttachment) followSurface();
  if (announce) emitAction(result.permissionRequired ? 'concerned' : 'inspect', surfaceMessage());
  rebuildTray(); broadcast(); return result;
}
function scheduleSurfaces(ms = 700) {
  clearTimeout(surfaceTimer);
  if (!surfaceGeometryEnabled) return;
  surfaceTimer = setTimeout(async () => { await refreshSurfaces(); scheduleSurfaces(surfaceAttachment ? 260 : 800); }, ms);
}
async function setSurfaceGeometry(enabled, announce = true) {
  surfaceGeometryEnabled = Boolean(enabled); memory.setPreference('surfaceGeometryEnabled', surfaceGeometryEnabled);
  if (!surfaceGeometryEnabled) { clearTimeout(surfaceTimer); surfaceGraph.update([]); surfaceAttachment = null; surfaceStatus = { enabled: false, supported: true, permissionRequired: false, error: null }; rebuildTray(); broadcast(); return { ok: true, status: surfaceSummary() }; }
  const result = await refreshSurfaces({ announce }); scheduleSurfaces(400); return { ok: !result.error, status: surfaceSummary() };
}
function followSurface() {
  if (!surfaceAttachment || !win || win.isDestroyed() || moving) return false;
  const surface = surfaceGraph.get(surfaceAttachment.surfaceId); if (!surface) { surfaceAttachment = null; broadcast(); return false; }
  const cx = surface.x + surfaceAttachment.relativeCenterX * surface.width;
  const target = surfaceGraph.landing(surface.id, WINDOW, cx); if (!target) return false;
  const b = win.getBounds(); if (Math.abs(b.x - target.x) > 1 || Math.abs(b.y - target.y) > 1) win.setPosition(target.x, target.y, false);
  return true;
}
function animateWindowTo(target, { landing = false } = {}) {
  if (!win || win.isDestroyed()) return Promise.resolve(false);
  const start = win.getBounds(); const dx = target.x - start.x; const dy = target.y - start.y;
  const duration = Math.max(260, Math.min(900, Math.hypot(dx, dy) * 1.5)); const began = Date.now(); moving = true;
  emitAction(dx >= 0 ? 'run-right' : 'run-left');
  return new Promise(resolve => {
    const tick = () => {
      if (!win || win.isDestroyed()) { moving = false; return resolve(false); }
      const t = Math.min(1, (Date.now() - began) / duration); const eased = 1 - Math.pow(1 - t, 3);
      const arc = landing ? Math.sin(Math.PI * t) * Math.min(52, Math.abs(dy) + 26) : 0;
      win.setPosition(Math.round(start.x + dx * eased), Math.round(start.y + dy * eased - arc), false);
      if (t < 1) return setTimeout(tick, 16);
      moving = false; attention.reset(); rig.reset(); emitAction(landing ? 'confident' : 'idle'); persistPosition(); broadcast(); resolve(true);
    }; tick();
  });
}
async function attachNearest(announce = true) {
  if (!surfaceGeometryEnabled) return { ok: false, error: 'geometry-disabled' };
  await refreshSurfaces(); if (surfaceStatus.error || surfaceStatus.permissionRequired) return { ok: false, error: surfaceStatus.error || 'permission-required' };
  const b = win.getBounds(); const point = { x: b.x + b.width / 2, y: b.y + b.height };
  const surface = surfaceGraph.nearestTop(point, WINDOW, workArea(point)); if (!surface) return { ok: false, error: 'no-usable-surface' };
  const centerX = Math.max(surface.x + 30, Math.min(surface.x + surface.width - 30, point.x));
  const target = surfaceGraph.landing(surface.id, WINDOW, centerX); if (!target) return { ok: false, error: 'landing-unavailable' };
  surfaceAttachment = { surfaceId: surface.id, relativeCenterX: (centerX - surface.x) / surface.width };
  emitAction('jump'); await animateWindowTo(target, { landing: true }); if (announce) emitAction('confident', 'Устроилась на окне.'); rebuildTray(); return { ok: true };
}
function leaveSurface() {
  if (!surfaceAttachment || !win) return false; surfaceAttachment = null;
  const b = win.getBounds(); const target = floorPosition(workArea({ x: b.x, y: b.y }), WINDOW, b.x, WINDOW.margin); void animateWindowTo(target); rebuildTray(); broadcast(); return true;
}
function callToCursor() {
  if (!win) return false; surfaceAttachment = null; const cursor = screen.getCursorScreenPoint(); const target = floorPosition(workArea(cursor), WINDOW, cursor.x - WINDOW.width / 2, WINDOW.margin);
  void animateWindowTo(target); memory.incrementInteraction('called-to-cursor'); win.showInactive(); return true;
}

function presenceTick() {
  if (!win || win.isDestroyed()) return;
  const cursor = screen.getCursorScreenPoint(); const state = memory.snapshot(); const budget = presenceBudget(state, { interactive, moving, userActive: true, cursorSpeed: 0 });
  const a = attention.update(cursor, win.getBounds(), Date.now()); const r = rig.update(a, Date.now(), { reducedMotion: memory.getPreference('reducedMotion', false), attentionScale: budget.attentionScale });
  win.webContents.send('presence:update', { attention: a, rig: r, budget });
  cursorTimer = setTimeout(presenceTick, a.cursorSpeed > 700 ? 33 : a.cursorSpeed > 40 ? 50 : budget.pollMs || 100);
}
function scheduleBehavior() {
  clearTimeout(behaviorTimer); if (!behavior) return;
  behaviorTimer = setTimeout(async () => {
    const state = memory.snapshot();
    const deliveryContext = { interactive, moving, visible: Boolean(win?.isVisible()) };
    const budget = presenceBudget(state, deliveryContext);
    if (autonomousDeliveryAllowed(state, deliveryContext)) {
      const context = { quiet: budget.quiet, focus: budget.focus, interactive, moving };
      const echo = memoryEchoes?.maybePick(context);
      if (echo) emitAction(echo.action, echo.message, { autonomous: true, continuity: true, memoryEcho: echo.kind });
      else {
        const rare = rareEvents.maybePick(context);
        if (rare) emitAction(rare.action, rare.message, { autonomous: true });
        else {
          const action = behavior.chooseAction({ userActive: true, interactive, moving, surfaceAvailable: surfaceGeometryEnabled && surfaceGraph.surfaces.length > 0 });
        if (action === 'perch') await attachNearest(false);
        else if (action === 'wander' && win) { const target = wanderTarget(workArea(), WINDOW, win.getBounds().x, WINDOW.margin); await animateWindowTo(target); }
          else if (action === 'peek' && win) { const side = Math.random() > .5 ? 'left' : 'right'; await animateWindowTo(edgePeekPosition(workArea(), WINDOW, side)); }
          else emitAction(action, null, { autonomous: true });
        }
      }
    }
    scheduleBehavior();
  }, behavior.nextDelayMs());
}

function showHome() {
  if (homeWin && !homeWin.isDestroyed()) { homeWin.show(); homeWin.focus(); return; }
  homeWin = new BrowserWindow({ width: HOME.width, height: HOME.height, minWidth: 720, minHeight: 620, title: 'Дом Ксюши · Mura Companion', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  const homeEntry = path.join(__dirname, '../home/index.html');
  lockLocalNavigation(homeWin, homeEntry);
  homeWin.loadFile(homeEntry); homeWin.on('closed', () => { homeWin = null; });
}
function createWindow() {
  const pos = defaultPosition();
  win = new BrowserWindow({ width: WINDOW.width, height: WINDOW.height, x: pos.x, y: pos.y, transparent: true, frame: false, resizable: false, show: false, skipTaskbar: true, hasShadow: false, alwaysOnTop: true, focusable: false, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  win.setAlwaysOnTop(true, 'floating'); win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); win.setIgnoreMouseEvents(!interactive, { forward: true });
  const rendererEntry = path.join(__dirname, '../renderer/alpha4.html');
  lockLocalNavigation(win, rendererEntry);
  win.loadFile(rendererEntry);
  win.once('ready-to-show', () => {
    win.showInactive();
    presenceTick();
    scheduleBehavior();
    if (surfaceGeometryEnabled) scheduleSurfaces(300);
    syncProgression({ announce: true });
    if (memory.getPreference('onboardingCompleted', false) === true) setTimeout(maybeAnnounceFirstWeekContinuity, 2600);
  });
  win.on('moved', () => { if (!surfaceAttachment && !moving) persistPosition(); });
  win.on('closed', () => { win = null; clearTimeout(cursorTimer); clearTimeout(behaviorTimer); clearTimeout(surfaceTimer); });
}
function rebuildTray() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Позвать Ксюшу', click: callToCursor }, { label: 'Дом Ксюши', click: showHome }, { label: 'Диагностика', click: () => void showDiagnostics() },
    { label: interactive ? 'Выключить взаимодействие' : 'Включить взаимодействие', click: () => setInteractive(!interactive) },
    { type: 'separator' },
    { label: 'Поверхности окон', submenu: [
      { label: 'Разрешить локальную геометрию', type: 'checkbox', checked: surfaceGeometryEnabled, click: item => void setSurfaceGeometry(item.checked) },
      { label: 'Сесть на ближайшее окно', enabled: surfaceGeometryEnabled, click: () => void attachNearest(true) },
      { label: 'Сойти с окна', enabled: Boolean(surfaceAttachment), click: leaveSurface }, { type: 'separator' }, { label: surfaceMessage(), enabled: false }
    ]},
    { type: 'separator' }, { label: 'Выход', click: () => app.quit() }
  ]));
}
function createTray() { tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '../../assets/tray.png')).resize({ width: 18, height: 18 })); tray.setToolTip('Mura Companion'); rebuildTray(); }

function cleanupHandoffs() { const cutoff = Date.now() - 5 * 60_000; for (const [key, item] of pendingHandoffs) if (item.createdAt < cutoff) pendingHandoffs.delete(key); }
function makeToken() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function inspectFile(filePath) { cleanupHandoffs(); if (!filePath || !fs.existsSync(filePath)) throw new Error('Файл недоступен.'); const token = makeToken(); const d = memory.inspectFile(filePath); pendingHandoffs.set(token, { kind: 'file', filePath, createdAt: Date.now() }); return { token, descriptor: { ...d, path: undefined, canOpen: true, canReveal: true } }; }
function inspectText(value, hinted = 'text') { cleanupHandoffs(); const raw = String(value || '').trim(); if (!raw) throw new Error('Пустой объект.'); const webUrl = normalizeWebUrl(raw); const kind = webUrl ? 'link' : 'text'; const token = makeToken(); const safe = kind === 'link' ? webUrl : raw.slice(0, 20000); pendingHandoffs.set(token, { kind, value: safe, title: kind === 'link' ? safe : safe.replace(/\s+/g, ' ').slice(0, 80), createdAt: Date.now() }); return { token, descriptor: { kind, name: kind === 'link' ? safe : 'Фрагмент текста', preview: safe.slice(0, 160), size: safe.length, canOpen: kind === 'link', canReveal: false } }; }
function fileById(id) { return memory.state.files.find(item => item.id === id); }
function objectById(id) { return memory.state.objects.find(item => item.id === id); }
async function saveShareCard(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,') || dataUrl.length > 10_000_000) return { ok: false, error: 'Некорректная карточка.' };
  const result = await dialog.showSaveDialog({ title: 'Сохранить момент Mura Companion', defaultPath: `mura-ksyusha-${new Date().toISOString().slice(0,10)}.png`, filters: [{ name: 'PNG', extensions: ['png'] }] });
  if (result.canceled || !result.filePath) return { ok: false, cancelled: true };
  fs.writeFileSync(result.filePath, Buffer.from(dataUrl.split(',')[1], 'base64')); memory.recordMoment('share-card-saved', { salience: .42, data: { name: path.basename(result.filePath) } }); broadcast(); return { ok: true, name: path.basename(result.filePath) };
}
function createTimer(minutes, focus = false) { const m = Number(minutes); if (![5,15,25,50].includes(m) && !(m > 0 && m <= 120)) return null; const timer = timers.create(m * 60_000, focus ? `Фокус ${m} мин` : `Таймер ${m} мин`, { focus }); broadcast(); scheduleBehavior(); return timer; }
function handleTimer(timer) { emitAction(timer.meta?.focus ? 'confident' : 'jump', timer.meta?.focus ? '🎯 Фокус завершён.' : `⏱ ${timer.label} — готово.`); syncProgression(); scheduleBehavior(); broadcast(); }

function registerIpc() {
  registerTrustedHandler('character:get-pack', () => pack);
  registerTrustedHandler('memory:get-state', () => publicState());
  registerTrustedHandler('app:get-capabilities', () => ({ version: app.getVersion(), privacyTier: 0, screenCapture: false, microphone: false, networkBackend: false, attentionSectors: 16, home: true, focus: true, explicitHandoffConsent: true, windowGeometry: 'opt-in-native-adapter' }));
  registerTrustedHandler('app:get-diagnostics', () => runtimeDiagnostics());
  registerTrustedHandler('onboarding:complete', (_e, outcome) => {
    const normalized = outcome === 'skip' ? 'skip' : 'done';
    memory.setPreference('onboardingCompleted', true);
    memory.setPreference('onboardingVersion', 1);
    memory.recordMoment('onboarding-completed', { salience: 0.34, data: { outcome: normalized } });
    setInteractive(false);
    return { ok: true, outcome: normalized, interactionMode: false };
  });
  registerTrustedHandler('interaction:toggle', () => setInteractive(!interactive));
  registerTrustedHandler('behavior:set-mode', (_e, mode) => setBehaviorMode(mode));
  registerTrustedHandler('world:open-home', () => { showHome(); return true; });
  registerTrustedHandler('quiet:set', (_e, ms) => ({ ok: true, until: setQuiet(Number(ms) || null) }));
  registerTrustedHandler('quiet:clear', () => ({ ok: true, until: setQuiet(null) }));
  registerTrustedHandler('accessibility:reduced-motion', (_e, v) => { memory.setPreference('reducedMotion', Boolean(v)); broadcast(); return { ok: true }; });
  registerTrustedHandler('share:save-card', (_e, data) => saveShareCard(data));
  registerTrustedHandler('character:perform', async (_e, action) => { if (action === 'call') callToCursor(); else if (action === 'home') showHome(); else if (action === 'perch') return attachNearest(true); else if (action === 'leave-surface') return { ok: leaveSurface() }; else emitAction(action); memory.incrementInteraction(`action:${action}`); broadcast(); return { ok: true }; });
  registerTrustedHandler('surface:set-enabled', (_e, v) => setSurfaceGeometry(Boolean(v))); registerTrustedHandler('surface:attach-nearest', () => attachNearest(true)); registerTrustedHandler('surface:leave', () => ({ ok: leaveSurface() })); registerTrustedHandler('surface:get-status', () => surfaceSummary());
  registerTrustedHandler('object:inspect-file', (_e, p) => { try { return { ok: true, ...inspectFile(p) }; } catch (err) { return { ok: false, error: err.message }; } });
  registerTrustedHandler('object:inspect-text', (_e, value, kind) => { try { return { ok: true, ...inspectText(value, kind) }; } catch (err) { return { ok: false, error: err.message }; } });
  registerTrustedHandler('object:remember', (_e, token) => { const h = pendingHandoffs.get(token); if (!h) return { ok: false, error: 'Передача устарела.' }; let item; try { item = h.kind === 'file' ? memory.rememberFile(h.filePath) : memory.rememberObject(h.kind, h.value, h.title); pendingHandoffs.delete(token); syncProgression(); emitAction('confident', `Запомнила: ${item.name || item.title}`); broadcast(); const { path: _p, value: _v, ...safe } = item; return { ok: true, item: safe }; } catch (err) { return { ok: false, error: err.message }; } });
  registerTrustedHandler('object:open', async (_e, id, source='handoff', kind='file') => { let target = null; let external = false; if (source === 'handoff') { const h = pendingHandoffs.get(id); if (!h) return { ok:false,error:'Передача устарела.' }; if (h.kind === 'link') { target=h.value; external=true; } else if (h.kind==='file') target=h.filePath; } else if (kind==='link') { target=objectById(id)?.value; external=true; } else target=fileById(id)?.path; if (!target) return { ok:false,error:'Объект недоступен.' }; if (external) { const safeTarget = normalizeWebUrl(target); if (!safeTarget) return {ok:false,error:'Ссылка недоступна или небезопасна.'}; await shell.openExternal(safeTarget); return {ok:true}; } if (!fs.existsSync(target)) return {ok:false,error:'Файл недоступен.'}; const err=await shell.openPath(target); return err?{ok:false,error:err}:{ok:true}; });
  registerTrustedHandler('object:reveal', (_e,id,source='handoff') => { const h=source==='handoff'?pendingHandoffs.get(id):null; const p=source==='memory'?fileById(id)?.path:h?.filePath; if(!p||!fs.existsSync(p))return{ok:false,error:'Файл недоступен.'}; shell.showItemInFolder(p); return{ok:true}; });
  registerTrustedHandler('memory:forget-file', (_e,id)=>{const ok=memory.forgetFile(id); if(ok)broadcast(); return{ok};}); registerTrustedHandler('memory:forget-object',(_e,id)=>{const ok=memory.forgetObject(id); if(ok)broadcast(); return{ok};});
  registerTrustedHandler('timer:create',(_e,m)=>{const timer=createTimer(m,false); return timer?{ok:true,timer}:{ok:false,error:'Некорректная длительность.'};}); registerTrustedHandler('focus:create',(_e,m)=>{const timer=createTimer(m,true); return timer?{ok:true,timer}:{ok:false,error:'Некорректная длительность.'};}); registerTrustedHandler('timer:cancel',(_e,id)=>{const ok=timers.cancel(id); if(ok)broadcast(); return{ok};});
}

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  pack = loadCharacterPack(CHARACTER_ROOT); memory = new MemoryStore(stateFile()); memory.beginSession();
  behaviorMode = MODES[memory.getPreference('behaviorMode','companion')] ? memory.getPreference('behaviorMode','companion') : 'companion';
  behavior = new BehaviorEngine({ mode: behaviorMode, drives: { curiosity: pack.temperament?.curiosity, sociability: pack.temperament?.warmth, playfulness: pack.temperament?.playfulness } });
  const onboardingCompleted = memory.getPreference('onboardingCompleted', false) === true;
  interactive = onboardingCompleted ? memory.getPreference('interactionMode', false) === true : true;
  if (!onboardingCompleted) memory.setPreference('interactionMode', true);
  surfaceGeometryEnabled = memory.getPreference('surfaceGeometryEnabled', false) === true;
  episodes = new EpisodeEngine(memory);
  rareEvents = new RareEventEngine(memory);
  memoryEchoes = new MemoryEchoEngine(memory);
  timers = new TimerService(memory, handleTimer);
  surfaceService = new WindowSurfaceService({ platform: process.platform, ownNames: [app.getName(), 'Mura Companion', 'Ksyusha', pack.displayName] });
  registerIpc(); createWindow(); createTray(); timers.restore(); if (surfaceGeometryEnabled) void setSurfaceGeometry(true, false);
  registerGlobalShortcut('call', 'CommandOrControl+Shift+K', callToCursor); registerGlobalShortcut('interaction', 'CommandOrControl+Shift+I', () => setInteractive(!interactive)); registerGlobalShortcut('home', 'CommandOrControl+Shift+H', showHome);
});
app.on('activate', () => { if (!win || win.isDestroyed()) createWindow(); else win.showInactive(); });
app.on('will-quit', () => { clearTimeout(cursorTimer); clearTimeout(behaviorTimer); clearTimeout(surfaceTimer); persistPosition(); timers?.dispose(); globalShortcut.unregisterAll(); memory?.touch(); });
app.on('window-all-closed', () => {});
