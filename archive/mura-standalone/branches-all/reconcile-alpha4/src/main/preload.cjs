'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

function subscribe(channel, callback) {
  const handler = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

const api = {
  onPresence: callback => subscribe('presence:update', callback),
  onAction: callback => subscribe('character:action', callback),
  onMode: callback => subscribe('interaction:mode', callback),
  onBehaviorMode: callback => subscribe('behavior:mode', callback),
  onStateChanged: callback => subscribe('memory:changed', callback),

  getCharacterPack: () => ipcRenderer.invoke('character:get-pack'),
  getState: () => ipcRenderer.invoke('memory:get-state'),
  getCapabilities: () => ipcRenderer.invoke('app:get-capabilities'),
  toggleInteraction: () => ipcRenderer.invoke('interaction:toggle'),
  setBehaviorMode: mode => ipcRenderer.invoke('behavior:set-mode', mode),
  perform: action => ipcRenderer.invoke('character:perform', action),
  openHome: () => ipcRenderer.invoke('world:open-home'),
  setQuiet: durationMs => ipcRenderer.invoke('quiet:set', durationMs),
  clearQuiet: () => ipcRenderer.invoke('quiet:clear'),
  setReducedMotion: value => ipcRenderer.invoke('accessibility:reduced-motion', value),
  saveShareCard: dataUrl => ipcRenderer.invoke('share:save-card', dataUrl),

  setSurfaceGeometry: enabled => ipcRenderer.invoke('surface:set-enabled', enabled),
  attachNearestSurface: () => ipcRenderer.invoke('surface:attach-nearest'),
  leaveSurface: () => ipcRenderer.invoke('surface:leave'),
  getSurfaceStatus: () => ipcRenderer.invoke('surface:get-status'),

  inspectDroppedFile: file => {
    const filePath = webUtils.getPathForFile(file);
    return ipcRenderer.invoke('object:inspect-file', filePath);
  },
  inspectDroppedText: (value, kind = 'text') => ipcRenderer.invoke('object:inspect-text', value, kind),
  rememberHandoff: token => ipcRenderer.invoke('object:remember', token),
  openHandoff: token => ipcRenderer.invoke('object:open', token, 'handoff'),
  revealHandoff: token => ipcRenderer.invoke('object:reveal', token, 'handoff'),
  openMemoryFile: id => ipcRenderer.invoke('object:open', id, 'memory', 'file'),
  openMemoryLink: id => ipcRenderer.invoke('object:open', id, 'memory', 'link'),
  revealMemoryFile: id => ipcRenderer.invoke('object:reveal', id, 'memory'),
  forgetMemoryFile: id => ipcRenderer.invoke('memory:forget-file', id),
  forgetMemoryObject: id => ipcRenderer.invoke('memory:forget-object', id),

  createTimer: minutes => ipcRenderer.invoke('timer:create', minutes),
  createFocus: minutes => ipcRenderer.invoke('focus:create', minutes),
  cancelTimer: id => ipcRenderer.invoke('timer:cancel', id)
};

contextBridge.exposeInMainWorld('mura', api);
contextBridge.exposeInMainWorld('ksyusha', api);
