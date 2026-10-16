import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile('apps/web/whole-system-v03.html','utf8');
const js=await readFile('apps/web/whole-system-v03.js','utf8');
const css=await readFile('apps/web/whole-system-v03.css','utf8');

test('v0.3 global navigation is icon-only and Center uses canonical mark',()=>{
  const nav=html.match(/<nav class="icon-nav"[\s\S]*?<\/nav>/)?.[0]||'';
  assert.ok(nav);
  assert.match(nav,/data-screen="home"/);
  assert.match(nav,/data-screen="together"/);
  assert.match(nav,/data-screen="city"/);
  assert.match(nav,/data-screen="center"[\s\S]*?folkoop-mark\.png/);
  assert.match(nav,/data-screen="messages"/);
  assert.ok(!/>Моё</.test(nav));
  assert.ok(!/>Вместе</.test(nav));
  assert.ok(!/>Город</.test(nav));
  assert.ok(!/>Центр</.test(nav));
  assert.ok(!/>Сообщения</.test(nav));
});

test('top actions provide search, start and language without using logo as home control',()=>{
  assert.match(html,/id="searchButton"/);
  assert.match(html,/id="startButton"/);
  assert.match(html,/id="languageButton"/);
  assert.match(html,/<span class="wordmark" aria-label="FOLKOOP">FOLKOOP<\/span>/);
  assert.ok(!/class="brand"[^>]*data-go="home"/.test(html));
});

test('all eleven languages are present and RTL languages switch direction',()=>{
  for(const code of ['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku']) assert.ok(js.includes(code),code);
  assert.match(js,/new Set\(\['ar','fa'\]\)/);
  assert.match(js,/document\.documentElement\.dir=RTL\.has\(lang\)\?'rtl':'ltr'/);
});

test('translation maps have complete prototype keys via English fallback and user-facing selectors',()=>{
  for(const key of ['homeTitle','exploreTitle','solveTitle','organizeTitle','togetherTitle','cityTitle','centerTitle','messagesTitle','startTitle','searchTitle','prototypeNote']) assert.ok(js.includes(key),key);
  assert.match(html,/data-i18n-aria="center"/);
  assert.match(html,/data-i18n-placeholder="searchPlaceholder"/);
});

test('active icon state is visual and not text-dependent',()=>{
  assert.match(css,/\.icon-nav button\.active/);
  assert.match(css,/\.center-nav-button\.active img/);
  assert.match(css,/html\[dir="rtl"\]/);
});
