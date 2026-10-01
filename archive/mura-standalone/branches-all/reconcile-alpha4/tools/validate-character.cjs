'use strict';

const path = require('node:path');
const { loadCharacterPack, collectReferencedAssets } = require('../src/engine/character-pack.cjs');

const root = path.join(__dirname, '../assets/character');
const pack = loadCharacterPack(root);
const assets = collectReferencedAssets(pack);

for (const name of assets) {
  if (!pack.assetData?.[name]) {
    const fs = require('node:fs');
    if (!fs.existsSync(path.join(root, name))) throw new Error(`Referenced asset unavailable: ${name}`);
  }
}

console.log(`Character Pack OK: ${pack.characterId} · ${assets.length} referenced assets · schema ${pack.schemaVersion || 1}`);
