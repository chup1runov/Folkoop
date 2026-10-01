'use strict';

const path = require('node:path');
const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  globalShortcut,
  nativeImage,
  Tray,
  Menu
} = require('electron');

const { AttentionController } = require('../engine/attention.cjs');
const { RigController } = require('../engine/rig.cjs');
const { BehaviorEngine } = require('../engine/behavior.cjs');
const { MemoryStore } = require('../engine/memory-store.cjs');
const { loadCharacterPack } = require('../engine/character-pack.cjs');
const { floorPosition } = require('../engine/surface-physics.cjs');

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

function stateFile() {
  return path.join(app.getPath('userData'), 'mura-state.json');
}

function publicState() {
  const state = memory.snapshot();
  state.files = (state.files || []).map(({ path: _path, ...safe }) => safe);
  state.runtime = { interactive, characterId: pack.characterId };
  return state;
}

function broadcastState() {
  if (win && !win.isDestroyed()) win.webContents.send('memory:changed', publicState());
}

function setInteractive(value) {
  interactive = Boolean(value);
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(!interactive, { forward: true });
    win.setFocusable(interactive);
  }
  memory.setPreference('interactionMode', interactive);
  broadcastState();
  return interactive;
}

function currentWorkArea(point = screen.getCursorScreenPoint()) {
  return screen.getDisplayNearestPoint(point).workArea;
}

function defaultPosition() {
  const area = screen.getPrimaryDisplay().workArea;
  const saved = memory.getPreference('lastWindowPosition', null);
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
    return floorPosition(currentWorkArea(saved), WINDOW, saved.x, WINDOW.margin);
  }
  return floorPosition(area, WINDOW, area.x + area.width - WINDOW.width - WINDOW.margin, WINDOW.margin);
}

function persistPosition() {
  if (!win || win.isDestroyed()) return;
  const { x, y } = win.getBounds();
  memory.setWindowPosition({ x, y });
}

function callToCursor() {
  if (!win || win.isDestroyed()) return false;
  const cursor = screen.getCursorScreenPoint();
  const area = currentWorkArea(cursor);
  const target = floorPosition(area, WINDOW, cursor.x - WINDOW.width / 2, WINDOW.margin);
  win.setPosition(target.x, target.y, true);
  win.showInactive();
  attention.reset();
  rig.reset();
  memory.incrementInteraction('called-to-cursor');
  broadcastState();
  return true;
}

function emitAction(action, message = null) {
  if (!win || win.isDestroyed()) return;
  win.webContents.send('character:action', { action, message, at: Date.now() });
}

function scheduleIdle() {
  clearTimeout(idleTimer);
  if (!behavior || !win || win.isDestroyed()) return;
  idleTimer = setTimeout(() => {
    if (!interactive) {
      const action = behavior.chooseAction({ userActive: true, interactive: false, moving: false });
      emitAction(action);
    }
    scheduleIdle();
  }, behavior.nextDelayMs());
}

function presenceTick() {
  if (!win || win.isDestroyed()) return;
  const cursor = screen.getCursorScreenPoint();
  const bounds = win.getBounds();
  const attentionState = attention.update(cursor, bounds, Date.now());
  const rigState = rig.update(attentionState, Date.now(), {
    reducedMotion: memory.getPreference('reducedMotion', false) === true
  });
  win.webContents.send('presence:attention', { attention: attentionState, rig: rigState });
  presenceTimer = setTimeout(presenceTick, attentionState.cursorSpeed > 700 ? 33 : 55);
}

function createWindow() {
  const pos = defaultPosition();
  win = new BrowserWindow({
    width: WINDOW.width,
    height: WINDOW.height,
    x: pos.x,
    y: pos.y,
    transparent: true,
    frame: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    hasShadow: false,
    alwaysOnTop: true,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile(path.join(__dirname, '../renderer/index.html'));
  win.once('ready-to-show', () => {
    win.showInactive();
    presenceTick();
    scheduleIdle();
  });
  win.on('moved', persistPosition);
  win.on('closed', () => {
    win = null;
    clearTimeout(presenceTimer);
    clearTimeout(idleTimer);
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/tray.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 });
  tray = new Tray(icon);
  tray.setToolTip('Mura Companion');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Позвать Ксюшу', click: callToCursor },
    { label: interactive ? 'Выключить взаимодействие' : 'Включить взаимодействие', click: () => setInteractive(!interactive) },
    { type: 'separator' },
    { label: 'Выход', click: () => app.quit() }
  ]));
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
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
  ipcMain.handle('app:get-capabilities', () => ({
    version: app.getVersion(),
    screenCapture: false,
    microphone: false,
    networkBackend: false,
    globalCursor: true,
    dragDropFiles: true,
    attentionSectors: 16,
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
  registerIpc();
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+K', callToCursor);
  globalShortcut.register('CommandOrControl+Shift+I', () => setInteractive(!interactive));
});

app.on('will-quit', () => {
  clearTimeout(presenceTimer);
  clearTimeout(idleTimer);
  persistPosition();
  globalShortcut.unregisterAll();
  memory?.touch();
});

app.on('window-all-closed', () => {});
