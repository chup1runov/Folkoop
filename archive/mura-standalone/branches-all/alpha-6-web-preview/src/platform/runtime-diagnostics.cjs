'use strict';

const os = require('node:os');

function normalizeShortcuts(shortcuts = {}) {
  return Object.fromEntries(Object.entries(shortcuts).map(([key, value]) => [
    String(key),
    {
      accelerator: String(value?.accelerator || ''),
      registered: value?.registered === true
    }
  ]));
}

function normalizeDisplays(displays = []) {
  return (Array.isArray(displays) ? displays : []).map(item => ({
    id: String(item?.id ?? ''),
    width: Number.isFinite(Number(item?.width)) ? Number(item.width) : null,
    height: Number.isFinite(Number(item?.height)) ? Number(item.height) : null,
    scaleFactor: Number.isFinite(Number(item?.scaleFactor)) ? Number(item.scaleFactor) : null,
    primary: item?.primary === true
  }));
}

function normalizeSurface(status = {}) {
  return {
    geometryEnabled: status.geometryEnabled === true,
    attached: status.attached === true,
    supported: status.supported !== false,
    permissionRequired: status.permissionRequired === true,
    error: status.error ? String(status.error) : null,
    surfaceCount: Number.isFinite(Number(status.surfaceCount)) ? Number(status.surfaceCount) : 0
  };
}

function buildRuntimeDiagnostics(input = {}) {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    app: {
      version: String(input.version || ''),
      packaged: input.packaged === true
    },
    os: {
      platform: String(input.platform || process.platform),
      arch: String(input.arch || process.arch),
      release: String(input.osRelease || os.release())
    },
    character: {
      id: input.characterId ? String(input.characterId) : null
    },
    privacy: {
      screenCapture: false,
      microphone: false,
      windowTitlesCollected: false,
      localPathsIncluded: false
    },
    state: {
      fileExists: input.stateFileExists === true
    },
    shortcuts: normalizeShortcuts(input.shortcuts),
    displays: normalizeDisplays(input.displays),
    surfaces: normalizeSurface(input.surfaceStatus),
    acceptance: {
      manualDesktopSmokeTestRequired: true
    }
  };
}

function formatRuntimeDiagnostics(report) {
  const shortcuts = Object.entries(report.shortcuts || {})
    .map(([key, item]) => `${key}: ${item.registered ? 'OK' : 'FAILED'} (${item.accelerator})`)
    .join('\n') || 'none';
  const surface = report.surfaces || {};
  return [
    `Mura Companion ${report.app?.version || '?'}`,
    `OS: ${report.os?.platform || '?'} ${report.os?.release || ''} · ${report.os?.arch || '?'}`,
    `Packaged: ${report.app?.packaged ? 'yes' : 'no'}`,
    `Character: ${report.character?.id || 'unknown'}`,
    `Displays: ${report.displays?.length || 0}`,
    `State file: ${report.state?.fileExists ? 'present' : 'new/not written yet'}`,
    `Surfaces: enabled=${surface.geometryEnabled ? 'yes' : 'no'}, supported=${surface.supported ? 'yes' : 'no'}, permission=${surface.permissionRequired ? 'required' : 'ok'}, attached=${surface.attached ? 'yes' : 'no'}, count=${surface.surfaceCount || 0}, error=${surface.error || 'none'}`,
    'Shortcuts:',
    shortcuts,
    'Privacy: no screen capture, no microphone, no window titles, no local paths in this report.',
    'Manual macOS/Windows desktop smoke test: REQUIRED.'
  ].join('\n');
}

module.exports = { normalizeShortcuts, normalizeDisplays, normalizeSurface, buildRuntimeDiagnostics, formatRuntimeDiagnostics };
