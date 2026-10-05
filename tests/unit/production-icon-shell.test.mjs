import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const js=await readFile('apps/web/folkoop.js','utf8');
const html=await readFile('apps/web/folkoop.html','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('production shell uses five semantic primary spaces',()=>{
  assert.match(js,/const NAV_ORDER=\['home','together','city','center','messages'\]/);
  assert.match(js,/\['people','communities','projects'\]\.includes\(route\)\?'together'/);
});

test('Center primary navigation uses canonical FOLKOOP mark',()=>{
  assert.match(js,/k==='center'\)return '<img class="primary-mark" src="\.\/folkoop-mark\.png"/);
  assert.ok(!js.includes("route==='center'?'city'"));
});

test('primary navigation is icon-only with localized accessible names',()=>{
  assert.match(js,/aria-label="'+esc\(label\)/);
  assert.match(js,/<span class="sr-only">/);
  assert.match(css,/#nav a\{width:54px;height:54px/);
  assert.match(css,/\.mobile-primary-nav a\{font-size:0/);
});

test('top shell has search and start actions without duplicate logo-home control',()=>{
  assert.match(html,/id="shellSearch"/);
  assert.match(html,/id="shellStart"/);
  assert.match(html,/<span class="brand brand-wordmark" id="brandHome"><span>FOLKOOP<\/span><\/span>/);
  assert.ok(!html.includes('href="#/home" class="brand" id="brandHome"'));
});

test('search and start preserve existing production routes rather than fake external actions',()=>{
  assert.match(js,/function goTogetherSearch\(\)/);
  assert.match(js,/current='together'/);
  assert.match(js,/\$\('#draftSearch'\)\?\.focus/);
  assert.match(js,/function goTogetherStart\(\)/);
});
