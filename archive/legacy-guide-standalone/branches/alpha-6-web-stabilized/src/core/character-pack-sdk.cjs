'use strict';

const path = require('node:path');

const SDK_VERSION = 1;
const ALLOWED_CAPABILITIES = new Set([
  'presence.attention',
  'presence.locmotion',
  'presence.rig',
  'world.home',
  'actions.object-handoff',
  'social.live-visit'
]);

function safeRelativeAsset(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const raw = value.trim();
  if (/[\u0000-\u001f\u007f]/.test(raw)) return false;
  const slash = raw.replaceAll('\\', '/');
  if (/^[a-z]:\//i.test(slash) || slash.startsWith('//')) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(slash)) return false;

  const normalized = path.posix.normalize(slash);
  if (normalized === '.' || normalized === '..') return false;
  if (normalized.startsWith('../') || path.posix.isAbsolute(normalized) || normalized.includes('/../')) return false;
  return true;
}

function validateCharacterPack(manifest = {}) {
  const errors = [];
  if (manifest.sdkVersion !== SDK_VERSION) errors.push(`sdkVersion must be ${SDK_VERSION}`);
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/i.test(String(manifest.characterId || ''))) errors.push('characterId is invalid');
  if (!String(manifest.displayName || '').trim()) errors.push('displayName is required');
  const caps = Array.isArray(manifest.capabilities) ? manifest.capabilities : [];
  for (const cap of caps) if (!ALLOWED_CAPABILITIES.has(cap)) errors.push(`unsupported capability: ${cap}`);
  const assets = manifest.assets && typeof manifest.assets === 'object' ? manifest.assets : {};
  for (const [name, asset] of Object.entries(assets)) if (!safeRelativeAsset(asset)) errors.push(`unsafe asset path: ${name}`);
  const modes = Array.isArray(manifest.presenceModes) ? manifest.presenceModes : [];
  if (!modes.length) errors.push('at least one presenceMode is required');
  return { ok: errors.length === 0, errors };
}

function publicCharacterDescriptor(manifest) {
  const result = validateCharacterPack(manifest);
  if (!result.ok) throw new Error(result.errors.join('; '));
  return {
    sdkVersion: SDK_VERSION,
    characterId: manifest.characterId,
    displayName: manifest.displayName,
    capabilities: [...(Array.isArray(manifest.capabilities) ? manifest.capabilities : [])].sort(),
    presenceModes: [...manifest.presenceModes],
    metadata: { ...(manifest.metadata || {}) }
  };
}

module.exports = { SDK_VERSION, ALLOWED_CAPABILITIES, safeRelativeAsset, validateCharacterPack, publicCharacterDescriptor };
