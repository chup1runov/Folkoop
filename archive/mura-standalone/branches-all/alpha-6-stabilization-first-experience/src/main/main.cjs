'use strict';

const path = require('node:path');
const { app, BrowserWindow, ipcMain, screen, globalShortcut, nativeImage, Tray, Menu } = require('electron');
const { AttentionController } = require('../engine/attention.cjs');
const { RigController } = require('../engine/rig.cjs');
const { BehaviorEngine } = require('../engine/behavior.cjs');
const { MemoryStore } = require('../engine/memory-store.cjs');
const { loadCharacterPack } = require('../engine/character-pack.cjs');
const { floorPosition } = require('../engine/surface-physics.cjs');
const { SurfaceGraph } = require('../engine/surface-graph.cjs');
const { WindowSurfaceService } = require('../platform/window-surfaces.cjs');

const WINDOW = Object.freeze({ width: 252, height: 318, margin: 14 });
const CHARACTER_ROOT = path.join(__dirname, '../../assets/character');
const attention = new AttentionController();
const rig = new RigController();

let win = null;
let tray = null;
let memory = null;
let pack = null;
let behavior = null;
let interactive = false;
let presenceTimer = null;
let idleTimer = null;
let surfaceTimer = null;
let surfaceService = null;
let surfaceGraph = new SurfaceGraph();
let surfaceGeometryEnabled = false;
let surfaceAttachment = null;
let surfaceStatus = { enabled: false, supported: true, permissionRequired: false, error: null };

function stateFile() { return path.join(app.getPath('userData'), 'mura-state.json'); }

function surfacePublicStatus() {
  return {
    enabled: surfaceStatus.enabled,
    supported: surfaceStatus.supported,
    permissionRequired: surfaceStatus.permissionRequired,
    error: surfaceStatus.error,
    geometryEnabled: surfaceGeometryEnabled,
    attached: Boolean(surfaceAttachment),
    ...surfaceGraph.publicSummary()
  };
}

function publicState() {
  const state = memory.snapshot();
  state.files = (state.files || []).map(({ path: _path, ...safe }) => safe);
  state.runtime = { interactive, characterId: pack.characterId, surface: surfacePublicStatus() };
  return state;
}

function broadcastState() {
  if (win && !win.isDestroyed()) win.webContents.send('memory:changed', publicState());
}

function rebuildTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Позвать Ксюшу', click: callToCursor },
    { label: interactive ? 'Выключить взаимодействие' : 'Включить взаимодействие', click: () => setInteractive(!interactive) },
    { type: 'separator' },
    {
      label: 'Поверхности окон',
      submenu: [
        { label: 'Разрешить локальную геометрию окон', type: 'checkbox', checked: surfaceGeometryEnabled, click: item => { void setSurfaceGeometry(item.checked, { announce: true }); } },
        { label: 'Сесть на ближайшее окно', enabled: surfaceGeometryEnabled && surfaceStatus.supported !== false, click: () => { void attachToNearestSurface({ announce: true }); } },
        { label: 'Сойти с окна', enabled: Boolean(surfaceAttachment), click: leaveSurface },
        { type: 'separator' },
        { label: surfaceMessage(), enabled: false }
      ]
    },
    { type: 'separator' },
    { label: 'Выход', click: () => app.quit() }
  ]));
}

function setInteractive(value) {
  interactive = Boolean(value);
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(!interactive, { forward: true });
    win.setFocusable(interactive);
  }
  memory.setPreference('interactionMode', interactive);
  rebuildTrayMenu();
  broadcastState();
  return interactive;
}

function currentWorkArea(point = screen.getCursorScreenPoint()) { return screen.getDisplayNearestPoint(point).workArea; }

function defaultPosition() {
  const area = screen.getPrimaryDisplay().workArea;
  const saved = memory.getPreference('lastWindowPosition', null);
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return floorPosition(currentWorkArea(saved), WINDOW, saved.x, WINDOW.margin);
  return floorPosition(area, WINDOW, area.x + area.width - WINDOW.width - WINDOW.margin, WINDOW.margin);
}

function persistPosition() {
  if (!win || win.isDestroyed()) return;
  const { x, y } = win.getBounds();
  memory.setWindowPosition({ x, y });
}

function detachSurface({ persist = true } = {}) {
  const wasAttached = Boolean(surfaceAttachment);
  surfaceAttachment = null;
  if (wasAttached && persist) persistPosition();
  if (wasAttached) { rebuildTrayMenu(); broadcastState(); }
  return wasAttached;
}

function callToCursor() {
  if (!win || win.isDestroyed()) return false;
  detachSurface({ persist: false });
  const cursor = screen.getCursorScreenPoint();
  const target = floorPosition(currentWorkArea(cursor), WINDOW, cursor.x - WINDOW.width / 2, WINDOW.margin);
  win.setPosition(target.x, target.y, true);
  win.showInactive();
  attention.reset();
  rig.reset();
  memory.incrementInteraction('called-to-cursor');
  persistPosition();
  broadcastState();
  return true;
}

function emitAction(action, message = null) {
  if (win && !win.isDestroyed()) win.webContents.send('character:action', { action, message, at: Date.now() });
}

function scheduleIdle() {
  clearTimeout(idleTimer);
  if (!behavior || !win || win.isDestroyed()) return;
  idleTimer = setTimeout(() => {
    if (!interactive) {
      const action = behavior.chooseAction({ userActive: true, interactive: false, moving: false, surfaceAvailable: surfaceGeometryEnabled && surfaceGraph.surfaces.length > 0 });
      if (action === 'perch') void attachToNearestSurface({ announce: false });
      else emitAction(action);
    }
    scheduleIdle();
  }, behavior.nextDelayMs());
}

function presenceTick() {
  if (!win || win.isDestroyed()) return;
  const cursor = screen.getCursorScreenPoint();
  const attentionState = attention.update(cursor, win.getBounds(), Date.now());
  const rigState = rig.update(attentionState, Date.now(), { reducedMotion: memory.getPreference('reducedMotion', false) === true });
  win.webContents.send('presence:attention', { attention: attentionState, rig: rigState });
  presenceTimer = setTimeout(presenceTick, attentionState.cursorSpeed > 700 ? 33 : 55);
}

function surfaceMessage(status = surfaceStatus) {
  if (!surfaceGeometryEnabled || !status.enabled) return 'Геометрия окон выключена.';
  if (status.permissionRequired) return 'Нужен системный доступ к геометрии окон.';
  if (status.supported === false) return 'Адаптер окон недоступен на этой системе.';
  if (status.error) return 'Не удалось получить геометрию окон.';
  if (!surfaceGraph.surfaces.length) return 'Подходящих окон пока не вижу.';
  return `Доступно поверхностей: ${surfaceGraph.surfaces.length}`;
}

function currentCharacterCenter() {
  if (!win || win.isDestroyed()) return null;
  const bounds = win.getBounds();
  return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height };
}

function followSurfaceAttachment() {
  if (!surfaceAttachment || !win || win.isDestroyed()) return false;
  const surface = surfaceGraph.get(surfaceAttachment.surfaceId);
  if (!surface) { surfaceAttachment = null; rebuildTrayMenu(); broadcastState(); return false; }
  const preferredCenterX = surface.x + Math.max(0, Math.min(1, surfaceAttachment.relativeCenterX)) * surface.width;
  const target = surfaceGraph.landing(surface.id, WINDOW, preferredCenterX);
  if (!target) return false;
  const display = screen.getDisplayNearestPoint({ x: surface.x + surface.width / 2, y: surface.y });
  if (target.y < display.workArea.y - 2) { surfaceAttachment = null; rebuildTrayMenu(); broadcastState(); return false; }
  const current = win.getBounds();
  if (Math.abs(current.x - target.x) > 1 || Math.abs(current.y - target.y) > 1) {
    win.setPosition(target.x, target.y, false);
    attention.reset();
    rig.reset();
  }
  return true;
}

async function refreshSurfaceGraph({ announce = false } = {}) {
  if (!surfaceService) return surfaceStatus;
  const result = await surfaceService.sample(surfaceGeometryEnabled);
  surfaceStatus = { enabled: result.enabled, supported: result.supported, permissionRequired: result.permissionRequired, error: result.error };
  surfaceGraph.update(result.surfaces || []);
  if (surfaceAttachment) followSurfaceAttachment();
  if (announce) emitAction(result.permissionRequired ? 'rest' : 'inspect', surfaceMessage(result));
  rebuildTrayMenu();
  broadcastState();
  return result;
}

function scheduleSurfaceLoop(delayMs = 750) {
  clearTimeout(surfaceTimer);
  if (!surfaceGeometryEnabled || !surfaceService) return;
  surfaceTimer = setTimeout(async () => {
    await refreshSurfaceGraph();
    scheduleSurfaceLoop(surfaceAttachment ? 280 : 800);
  }, delayMs);
}

async function setSurfaceGeometry(enabled, { announce = false } = {}) {
  surfaceGeometryEnabled = Boolean(enabled);
  memory.setPreference('surfaceGeometryEnabled', surfaceGeometryEnabled);
  if (!surfaceGeometryEnabled) {
    clearTimeout(surfaceTimer);
    surfaceStatus = { enabled: false, supported: true, permissionRequired: false, error: null };
    surfaceGraph.update([]);
    detachSurface({ persist: true });
    rebuildTrayMenu();
    broadcastState();
    return { ok: true, enabled: false, status: surfacePublicStatus() };
  }
  const result = await refreshSurfaceGraph({ announce });
  scheduleSurfaceLoop(500);
  return { ok: !result.error, enabled: true, status: surfacePublicStatus() };
}

async function attachToNearestSurface({ announce = false } = {}) {
  if (!win || win.isDestroyed()) return { ok: false, error: 'companion-window-unavailable' };
  if (!surfaceGeometryEnabled) {
    if (announce) emitAction('rest', 'Сначала разреши локальную геометрию окон в меню Mura.');
    return { ok: false, error: 'geometry-disabled' };
  }
  await refreshSurfaceGraph();
  if (surfaceStatus.permissionRequired || surfaceStatus.supported === false || surfaceStatus.error) {
    if (announce) emitAction('rest', surfaceMessage());
    return { ok: false, error: surfaceStatus.error || 'surface-adapter-unavailable' };
  }
  const center = currentCharacterCenter();
  const area = currentWorkArea(center);
  const surface = surfaceGraph.nearestTop(center, WINDOW, area);
  if (!surface) {
    if (announce) emitAction('inspect', 'Не нашла подходящее окно, на которое можно сесть.');
    return { ok: false, error: 'no-usable-surface' };
  }
  const preferredCenterX = Math.max(surface.x + 30, Math.min(surface.x + surface.width - 30, center.x));
  const target = surfaceGraph.landing(surface.id, WINDOW, preferredCenterX);
  if (!target) return { ok: false, error: 'landing-unavailable' };
  surfaceAttachment = { surfaceId: surface.id, relativeCenterX: Math.max(0, Math.min(1, (preferredCenterX - surface.x) / surface.width)) };
  win.setPosition(target.x, target.y, true);
  attention.reset();
  rig.reset();
  persistPosition();
  rebuildTrayMenu();
  broadcastState();
  if (announce) emitAction('confident', 'Устроилась на окне.');
  return { ok: true, surfaceId: surface.id };
}

function leaveSurface() {
  if (!surfaceAttachment || !win || win.isDestroyed()) return false;
  const bounds = win.getBounds();
  surfaceAttachment = null;
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const target = floorPosition(currentWorkArea(center), WINDOW, bounds.x, WINDOW.margin);
  win.setPosition(target.x, target.y, true);
  persistPosition();
  attention.reset();
  rig.reset();
  rebuildTrayMenu();
  broadcastState();
  return true;
}

function createWindow() {
  const pos = defaultPosition();
  win = new BrowserWindow({
    width: WINDOW.width, height: WINDOW.height, x: pos.x, y: pos.y,
    transparent: true, frame: false, resizable: false, show: false, skipTaskbar: true,
    hasShadow: false, alwaysOnTop: true, focusable: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(!interactive, { forward: true });
  win.setFocusable(interactive);
  win.loadFile(path.join(__dirname, '../renderer/index.html'));
  win.once('ready-to-show', () => {
    win.showInactive();
    presenceTick();
    scheduleIdle();
    if (surfaceGeometryEnabled) scheduleSurfaceLoop(350);
  });
  win.on('moved', () => { if (!surfaceAttachment) persistPosition(); });
  win.on('closed', () => {
    win = null;
    clearTimeout(presenceTimer);
    clearTimeout(idleTimer);
    clearTimeout(surfaceTimer);
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/tray.png')).resize({ width: 18, height: 18 });
  tray = new Tray(icon);
  tray.setToolTip('Mura Companion');
  rebuildTrayMenu();
}

function registerIpc() {
  ipcMain.handle('character:get-pack', () => pack);
  ipcMain.handle('memory:get-state', () => publicState());
  ipcMain.handle('interaction:toggle', () => setInteractive(!interactive));
  ipcMain.handle('character:call', () => ({ ok: callToCursor() }));
  ipcMain.handle('character:perform', (_event, action) => {
    const allowed = new Set(['wave', 'thinking', 'jump', 'rest', 'inspect', 'confident', 'shy', 'idea']);
    if (!allowed.has(action)) return { ok: false, error: 'Unsupported action.' };
    memory.incrementInteraction(`action:${action}`);
    emitAction(action);
    broadcastState();
    return { ok: true };
  });
  ipcMain.handle('object:remember-file', (_event, filePath) => {
    try {
      const item = memory.rememberFile(filePath);
      emitAction('confident', `Запомнила: ${item.name}`);
      broadcastState();
      const { path: _path, ...safe } = item;
      return { ok: true, item: safe };
    } catch (error) { return { ok: false, error: error.message }; }
  });
  ipcMain.handle('surface:set-enabled', (_event, enabled) => setSurfaceGeometry(Boolean(enabled), { announce: true }));
  ipcMain.handle('surface:attach-nearest', () => attachToNearestSurface({ announce: true }));
  ipcMain.handle('surface:leave', () => ({ ok: leaveSurface() }));
  ipcMain.handle('surface:get-status', () => surfacePublicStatus());
  ipcMain.handle('app:get-capabilities', () => ({
    version: app.getVersion(), screenCapture: false, microphone: false, networkBackend: false,
    globalCursor: true, dragDropFiles: true, attentionSectors: 16,
    windowGeometry: 'opt-in-native-adapter', windowGeometryEnabled: surfaceGeometryEnabled,
    corePlatform: '1.0-alpha'
  }));
}

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  pack = loadCharacterPack(CHARACTER_ROOT);
  memory = new MemoryStore(stateFile());
  memory.beginSession();
  behavior = new BehaviorEngine({ mode: memory.getPreference('behaviorMode', 'companion') });
  interactive = memory.getPreference('interactionMode', false) === true;
  surfaceGeometryEnabled = memory.getPreference('surfaceGeometryEnabled', false) === true;
  surfaceService = new WindowSurfaceService({ platform: process.platform, ownNames: [app.getName(), 'Mura Companion', 'Ksyusha', pack.displayName], ownPids: [process.pid] });
  registerIpc();
  createWindow();
  createTray();
  globalShortcut.register('CommandOrControl+Shift+K', callToCursor);
  globalShortcut.register('CommandOrControl+Shift+I', () => setInteractive(!interactive));
});

app.on('will-quit', () => {
  clearTimeout(presenceTimer);
  clearTimeout(idleTimer);
  clearTimeout(surfaceTimer);
  if (!surfaceAttachment) persistPosition();
  globalShortcut.unregisterAll();
  memory?.touch();
});

app.on('window-all-closed', () => {});
