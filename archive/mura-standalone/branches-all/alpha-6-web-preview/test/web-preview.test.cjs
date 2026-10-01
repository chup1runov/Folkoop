'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'web-preview/index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'web-preview/app.js'), 'utf8');
const assetsSource = fs.readFileSync(path.join(root, 'web-preview/assets.js'), 'utf8');
const server = fs.readFileSync(path.join(root, 'web-preview/server.cjs'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(assetsSource, sandbox);
const assets = sandbox.window.MURA_WEB_ASSETS;

const requiredAssets = [
  'look-center.webp','look-left.webp','look-right.webp','look-up.webp','look-down.webp',
  'look-up-left.webp','look-up-right.webp','look-down-left.webp','look-down-right.webp',
  'waving.webp','thinking.webp','jumping.webp','inspect.webp','confident.webp','rest.webp',
  'idea.webp','wink.webp','hands-behind.webp','lean-in.webp'
];

test('browser preview is self-contained and loads assets before runtime', () => {
  const assetsScript = html.indexOf('src="./assets.js"');
  const appScript = html.indexOf('src="./app.js"');
  assert.ok(assetsScript >= 0);
  assert.ok(appScript > assetsScript);
  assert.doesNotMatch(html, /(?:src|href)="\//);
  assert.doesNotMatch(app, /\.\.\/assets\/character/);
});

test('all character assets referenced by browser preview are bundled data URIs', () => {
  assert.equal(typeof assets, 'object');
  for (const name of requiredAssets) {
    assert.equal(typeof assets[name], 'string', `missing asset: ${name}`);
    assert.match(assets[name], /^data:image\/(?:webp|gif|png);base64,/);
    assert.ok(assets[name].length > 1000, `asset looks truncated: ${name}`);
  }
});

test('every q(id) lookup in the preview runtime exists in HTML', () => {
  const ids = [...app.matchAll(/q\('([^']+)'\)/g)].map(match => match[1]);
  const unique = [...new Set(ids)];
  for (const id of unique) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing DOM id: ${id}`);
  }
});

test('preview restores pointer attention after temporary actions', () => {
  assert.match(app, /actionTimer=setTimeout\(\(\)=>\{ actionTimer=null; setCharacter\('center'\); \},ms\)/);
  assert.match(app, /if\(!actionTimer\) q\('character'\)\.src=img\(directionFor/);
  assert.match(app, /setCharacter\('center'\);\s*updateTestPanel\(\)/);
});

test('direct file opening tolerates unavailable localStorage', () => {
  assert.match(app, /try \{ localStorage\.setItem/);
  assert.match(app, /try \{ localStorage\.removeItem/);
  assert.match(app, /catch \{\}/);
});

test('dropped file contents are not read or uploaded by the browser preview', () => {
  assert.doesNotMatch(app, /FileReader/);
  assert.doesNotMatch(app, /\.arrayBuffer\(/);
  assert.doesNotMatch(app, /\.text\(/);
  assert.doesNotMatch(app, /\bfetch\s*\(/);
  assert.doesNotMatch(app, /XMLHttpRequest/);
  assert.doesNotMatch(app, /WebSocket/);
  assert.match(app, /name:f\.name,size:f\.size,type:f\.type/);
});

test('hosted preview serves local bundle with restrictive CSP', () => {
  assert.match(server, /u\.pathname==='\/assets\.js'/);
  assert.match(server, /Content-Security-Policy/);
  assert.match(server, /default-src 'self'/);
  assert.match(server, /frame-ancestors 'none'/);
});

test('preview JavaScript parses as plain browser JavaScript', () => {
  assert.doesNotThrow(() => new Function(app));
});

test('radial labels are onboarding-only to match desktop behavior', () => {
  const css = fs.readFileSync(path.join(root, 'web-preview/style.css'), 'utf8');
  assert.match(css, /\.radial button::after\{content:none/);
  assert.match(css, /data-onboarding="true"[^}]*\.radial button::after\{content:attr\(data-label\)/);
  assert.match(app, /dataset\.onboarding='true'/);
  assert.match(app, /dataset\.onboarding='false'/);
});
