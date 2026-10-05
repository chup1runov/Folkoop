import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const ui=await readFile('apps/web/network-ui.js','utf8');
const shell=await readFile('apps/web/folkoop.js','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('Together lists all five cooperation kinds in one production discovery surface',()=>{
  assert.match(ui,/allowed=projectMode\?\['project'\]:\['need','offer','purchase','resource','project'\]/);
  assert.match(ui,/data-together-card data-kind=/);
  assert.match(ui,/\['need','offer','resource','project','purchase'\]\.map\(k=>/);
  assert.match(ui,/data-together-kind="\$\{k\}"/);
});

test('Together is browse-first and creation is opened only by an explicit action',()=>{
  assert.match(ui,/coopCreateOpen=false/);
  assert.match(ui,/guestDemo\|\|\(!projectMode&&!coopCreateOpen\)\?'':/);
  assert.match(ui,/coopCreateOpen=true/);
});

test('Together provides human actions backed by existing creation paths',()=>{
  assert.match(ui,/data-home="createCoop" data-kind="need"/);
  assert.match(ui,/data-home="createCoop" data-kind="offer"/);
  assert.match(ui,/data-home="createCoop" data-kind="project"/);
  assert.match(ui,/data-home="createCoop" data-kind="resource"/);
  assert.match(ui,/data-home="createCoop" data-kind="purchase"/);
  assert.match(ui,/href="#\/people"/);
});

test('global Start delegates to signed-in network cooperation before local fallback',()=>{
  assert.match(shell,/folkoop:start-cooperation/);
  assert.match(ui,/window\.addEventListener\('folkoop:start-cooperation'/);
  assert.match(ui,/detail\.handled=true/);
});

test('global Search targets the real Together search when the network surface renders',()=>{
  assert.match(ui,/id="networkCoopSearch"/);
  assert.match(shell,/\$\('#networkCoopSearch'\)\|\|\$\('#draftSearch'\)/);
  assert.match(shell,/folkoop:network-rendered/);
});

test('Together hub keeps search and kind filters client-side and non-mutating',()=>{
  assert.match(ui,/card\.dataset\.searchMatch/);
  assert.match(ui,/card\.dataset\.kindMatch/);
  assert.match(css,/\.together-action-grid/);
  assert.match(css,/\.together-filter-row button\.active/);
});
