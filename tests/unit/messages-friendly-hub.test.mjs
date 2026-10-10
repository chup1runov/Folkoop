import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const messaging=await readFile('apps/web/network-messaging.js','utf8');
const ui=await readFile('apps/web/network-ui.js','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('Messages hub exposes browse-first search and explicit mode links',()=>{
  assert.match(messaging,/class="messages-hub"/);
  assert.match(messaging,/id="networkMessageSearch"/);
  assert.match(messaging,/data-subsection="messages-direct"/);
  assert.match(messaging,/data-subsection="messages-groups"/);
});

test('Messages cards preserve direct group and work-chat identity',()=>{
  assert.match(messaging,/data-message-card data-message-type="/);
  assert.match(messaging,/const messageType=link\?'work':chatItem\.kind/);
});

test('Messages search and filters only change local presentation state',()=>{
  assert.match(ui,/id!=='networkMessageSearch'/);
  assert.match(ui,/data-message-card/);
  assert.match(ui,/data-message-kind/);
  assert.match(ui,/card\.hidden=!\(matches&&kindMatch\)/);
  assert.ok(!ui.includes("folkoop:message-search-write"));
});

test('Messages hub uses the same responsive visual grammar as Together',()=>{
  assert.match(css,/\.messages-action-grid/);
  assert.match(css,/\.messages-filter-row button\.active/);
  assert.match(css,/@media\(max-width:620px\)/);
});

test('message filters announce selection and messages subsections restore focus',()=>{
  assert.match(messaging,/data-message-kind="direct" aria-pressed="false"/);
  assert.match(ui,/setAttribute\('aria-pressed','false'\)/);
  assert.match(ui,/setAttribute\('aria-pressed','true'\)/);
  assert.match(ui,/target\.focus\(\{preventScroll:true\}\)/);
});
