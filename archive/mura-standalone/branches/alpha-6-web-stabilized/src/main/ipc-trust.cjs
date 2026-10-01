'use strict';

const path = require('node:path');
const { fileURLToPath } = require('node:url');

function localFilePath(value) {
  try {
    const url = new URL(String(value || ''));
    if (url.protocol !== 'file:') return null;
    return path.resolve(fileURLToPath(url));
  } catch {
    return null;
  }
}

function isTrustedRendererEvent(event, options = {}) {
  const sender = event?.sender;
  const frame = event?.senderFrame;
  if (!sender || !frame) return false;

  const windows = Array.isArray(options.windows) ? options.windows : [];
  const knownSender = windows.some(window => {
    if (!window || window.isDestroyed?.()) return false;
    return window.webContents === sender;
  });
  if (!knownSender) return false;

  if (sender.mainFrame && frame !== sender.mainFrame) return false;

  const actualPath = localFilePath(frame.url);
  if (!actualPath) return false;

  const allowedFiles = Array.isArray(options.allowedFiles) ? options.allowedFiles : [];
  return allowedFiles.some(file => path.resolve(file) === actualPath);
}

module.exports = { localFilePath, isTrustedRendererEvent };
