'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('Home scene assets resolve through the Character Pack instead of nonexistent loose pose files', () => {
  const { loadCharacterPack } = require('../src/engine/character-pack.cjs');
  const { deriveHomeScene } = require('../src/engine/home-world.cjs');
  const packRoot = path.join(root, 'assets/character');
  const pack = loadCharacterPack(packRoot);

  const states = [
    {},
    { runtime: { quiet: true } },
    { timers: [{ status: 'active', meta: { focus: true }, dueAt: new Date(Date.now() + 60_000).toISOString() }] },
    { episodesDetailed: [{ stageNote: 'synthetic' }] },
    { files: [{ id: 'synthetic' }] }
  ];

  for (const state of states) {
    const scene = deriveHomeScene(state);
    const spec = pack.actions?.[scene.pose] || pack.actions?.idle;
    const asset = spec?.asset || pack.rig?.baseAsset || pack.attention?.assets?.center;
    assert.ok(asset, `no asset declared for Home pose ${scene.pose}`);
    assert.ok(pack.assetData?.[asset] || fs.existsSync(path.join(packRoot, asset)), `Home pose cannot resolve via pack: ${scene.pose} -> ${asset}`);
  }

  const homeSource = read('src/home/home.js');
  assert.match(homeSource, /api\.getCharacterPack\(\)/);
  assert.match(homeSource, /pack\?\.assetData/);
  assert.doesNotMatch(homeSource, /assets\/character\/idle\.gif/);
  assert.doesNotMatch(homeSource, /assets\/character\/\$\{scene\.pose\}\.webp/);
  assert.doesNotMatch(homeSource, /look-center\.png/);
});

test('Home literal fallback image exists and stays hidden until pack resolution finishes', () => {
  const html = read('src/home/index.html');
  const tag = html.match(/<img[^>]*id="homeCharacter"[^>]*>/)?.[0];
  assert.ok(tag, 'Home character tag missing');
  const src = tag.match(/src="([^"]+)"/)?.[1];
  assert.ok(src, 'Home fallback src missing');
  assert.ok(fs.existsSync(path.resolve(root, 'src/home', src)), `Home fallback does not exist: ${src}`);
  assert.match(tag, /\shidden(?:\s|\/?>)/);
});

test('common autonomous delivery gate suppresses Quiet Focus interaction movement and hidden windows', () => {
  const { autonomousDeliveryAllowed } = require('../src/engine/activity-budget.cjs');
  const future = new Date(Date.now() + 60_000).toISOString();
  const focus = { status: 'active', meta: { focus: true }, dueAt: future };

  assert.equal(autonomousDeliveryAllowed({ preferences: {} }, { visible: true }), true);
  assert.equal(autonomousDeliveryAllowed({ preferences: { quietUntil: future } }, { visible: true }), false);
  assert.equal(autonomousDeliveryAllowed({ preferences: {}, timers: [focus] }, { visible: true }), false);
  assert.equal(autonomousDeliveryAllowed({ preferences: {} }, { visible: true, interactive: true }), false);
  assert.equal(autonomousDeliveryAllowed({ preferences: {} }, { visible: true, moving: true }), false);
  assert.equal(autonomousDeliveryAllowed({ preferences: {} }, { visible: false }), false);
});

function rendererHarness() {
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) {
      nodes.set(id, {
        id,
        hidden: true,
        dataset: {},
        style: { setProperty() {} },
        handlers: {},
        textContent: '',
        src: '',
        querySelector: selector => node(id + selector),
        addEventListener(type, fn) { this.handlers[type] = fn; },
        replaceChildren() {},
        contains: () => false,
        closest: () => null
      });
    }
    return nodes.get(id);
  }

  const state = { preferences: { onboardingCompleted: false }, runtime: { interactive: true } };
  const pack = {
    actions: {
      idle: { asset: 'look-center.webp' },
      inspect: { asset: 'inspect.webp', durationMs: 3200 },
      wave: { asset: 'waving.webp', durationMs: 1900 }
    },
    rig: { baseAsset: 'look-center.webp' },
    attention: { assets: { center: 'look-center.webp' } },
    assetData: {
      'look-center.webp': 'data:image/webp;base64,AA==',
      'inspect.webp': 'data:image/webp;base64,AA==',
      'waving.webp': 'data:image/webp;base64,AA=='
    }
  };
  const api = {
    getCharacterPack: async () => pack,
    getState: async () => state,
    onPresence() {}, onAction() {}, onMode() {}, onStateChanged() {},
    inspectDroppedFile: async () => ({ ok: true, token: 'synthetic', descriptor: { name: 'audit.txt', kind: 'file', size: 1 } }),
    inspectDroppedText: async () => ({ ok: false }),
    completeOnboarding: async () => ({ ok: true })
  };
  const context = {
    window: { mura: api, addEventListener() {} },
    document: {
      getElementById: node,
      createElement: () => ({ dataset: {}, addEventListener() {} })
    },
    console,
    setTimeout: () => 1,
    clearTimeout() {},
    module: { exports: {} }
  };
  vm.createContext(context);
  vm.runInContext(read('src/renderer/alpha4.js') + '\nmodule.exports={showOnboarding,getStep:()=>onboardingStep};', context, { timeout: 3000 });
  return { ...context.module.exports, node };
}

test('dropping a file during onboarding hides the coach while the consent handoff is visible', async () => {
  const h = rendererHarness();
  h.showOnboarding(3);
  await new Promise(resolve => setImmediate(resolve));
  await h.node('stage').handlers.drop({
    preventDefault() {},
    dataTransfer: { files: [{}] }
  });
  assert.equal(h.node('handoff').hidden, false);
  assert.equal(h.node('onboarding').hidden, true);
  assert.equal(h.getStep(), 3, 'onboarding stays paused at its source step until handoff resolves');
});
