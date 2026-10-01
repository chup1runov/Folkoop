'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');
const listeners = new Map();
function on(channel, callback) {
  const wrapped = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, wrapped);
  const token = Symbol(channel);
  listeners.set(token, [channel, wrapped]);
  return () => {
    const item = listeners.get(token);
    if (!item) return;
    ipcRenderer.removeListener(item[0], item[1]);
    listeners.delete(token);
  };
}

contextBridge.exposeInMainWorld('mura', Object.freeze({
  getPack: () => ipcRenderer.invoke('character:get-pack'),
  getState: () => ipcRenderer.invoke('memory:get-state'),
  getCapabilities: () => ipcRenderer.invoke('app:get-capabilities'),
  toggleInteraction: () => ipcRenderer.invoke('interaction:toggle'),
  callToCursor: () => ipcRenderer.invoke('character:call'),
  perform: action => ipcRenderer.invoke('character:perform', action),
  rememberFileFromDrop: file => ipcRenderer.invoke('object:remember-file', webUtils.getPathForFile(file)),
  setWindowGeometry: enabled => ipcRenderer.invoke('surface:set-enabled', Boolean(enabled)),
  getSurfaceStatus: () => ipcRenderer.invoke('surface:get-status'),
  attachNearestSurface: () => ipcRenderer.invoke('surface:attach-nearest'),
  leaveSurface: () => ipcRenderer.invoke('surface:leave'),
  onAttention: callback => on('presence:attention', callback),
  onAction: callback => on('character:action', callback),
  onState: callback => on('memory:changed', callback)
}));
