'use strict';

const fs = require('node:fs');
const path = require('node:path');

function loadAssetBundles(rootDir, manifest) {
  const data = {};
  for (const file of manifest.bundles || []) {
    if (typeof file !== 'string' || path.isAbsolute(file) || file.includes('..')) throw new Error(`Unsafe bundle path: ${file}`);
    const full = path.join(rootDir, file);
    if (!fs.existsSync(full)) throw new Error(`Missing asset bundle: ${file}`);
    const resolved = require.resolve(full);
    delete require.cache[resolved];
    const bundle = require(resolved);
    if (!bundle || typeof bundle !== 'object') throw new Error(`Invalid asset bundle: ${file}`);
    for (const [name, value] of Object.entries(bundle)) {
      if (typeof name !== 'string' || name.includes('..') || path.isAbsolute(name)) throw new Error(`Unsafe bundled asset path: ${name}`);
      if (typeof value !== 'string' || !value.startsWith('data:image/')) throw new Error(`Invalid bundled asset payload: ${name}`);
      data[name] = value;
    }
  }
  return data;
}

function collectReferencedAssets(manifest) {
  const referenced = [];
  for (const action of Object.values(manifest.actions ?? {})) if (action?.asset) referenced.push(action.asset);
  for (const asset of Object.values(manifest.attention?.assets ?? {})) if (asset) referenced.push(asset);
  if (manifest.rig?.baseAsset) referenced.push(manifest.rig.baseAsset);
  if (manifest.rig?.blinkAsset) referenced.push(manifest.rig.blinkAsset);
  return [...new Set(referenced)];
}

function validateClip(clip, name, errors) {
  if (!clip || typeof clip !== 'object') { errors.push(`${name} is required.`); return; }
  for (const key of ['top', 'right', 'bottom', 'left']) {
    const value = Number(clip[key]);
    if (!Number.isFinite(value) || value < 0 || value > 100) errors.push(`${name}.${key} must be a percentage from 0 to 100.`);
  }
}

function validateCharacterPack(manifest, rootDir = null) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['Manifest must be an object.'];
  if (!manifest.characterId) errors.push('characterId is required.');
  if (!manifest.displayName) errors.push('displayName is required.');
  if (!manifest.canvas?.width || !manifest.canvas?.height) errors.push('canvas width/height are required.');
  if (!manifest.actions?.idle?.asset) errors.push('actions.idle.asset is required.');
  if (!manifest.attention?.assets?.center) errors.push('attention.assets.center is required.');

  if (manifest.rig) {
    if (!['layered-sprite-v1'].includes(manifest.rig.strategy)) errors.push(`Unsupported rig strategy: ${manifest.rig.strategy}`);
    if (!manifest.rig.baseAsset) errors.push('rig.baseAsset is required.');
    validateClip(manifest.rig.headClip, 'rig.headClip', errors);
    validateClip(manifest.rig.eyeClip, 'rig.eyeClip', errors);
    validateClip(manifest.rig.bodyClip, 'rig.bodyClip', errors);
  }

  for (const file of collectReferencedAssets(manifest)) {
    if (path.isAbsolute(file) || file.includes('..')) errors.push(`Unsafe asset path: ${file}`);
    if (rootDir && !fs.existsSync(path.join(rootDir, file)) && !manifest.assetData?.[file]) errors.push(`Missing asset: ${file}`);
  }
  return [...new Set(errors)];
}

function loadCharacterPack(rootDir) {
  const manifestPath = path.join(rootDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.assetData = loadAssetBundles(rootDir, manifest);
  const errors = validateCharacterPack(manifest, rootDir);
  if (errors.length) throw new Error(`Invalid character pack:\n- ${errors.join('\n- ')}`);
  return manifest;
}

module.exports = { loadAssetBundles, collectReferencedAssets, validateCharacterPack, loadCharacterPack };
