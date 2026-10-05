import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const today=await readFile('apps/web/today.js','utf8');
const css=await readFile('apps/web/compact.css','utf8');
const app=await readFile('apps/web/app.js','utf8');

test('City Today exposes four human entry actions backed by existing civic routes',()=>{
  for(const route of ['ansvar','rapportera','nara','beslut']) assert.ok(today.includes('data-screen="'+route+'"'),route);
  for(const key of ['responsibility','report','near','decisions']) assert.ok(today.includes("helpers.t('"+key+"')"),key);
});

test('City entry reuses existing eleven-language civic copy instead of creating a second translation source',()=>{
  assert.match(today,/helpers\.t\('responsibilitySub'\)/);
  assert.match(today,/helpers\.t\('reportSub'\)/);
  assert.match(today,/helpers\.t\('nearSub'\)/);
  assert.match(today,/helpers\.t\('decisionsSub'\)/);
  assert.match(app,/const supportedLanguages = \['sv', 'en', 'ar', 'so', 'fa', 'fi', 'bs', 'ku', 'es', 'ru', 'uk'\]/);
});

test('City entry does not alter official handoff or source-truth behavior',()=>{
  assert.match(app,/data-folkoop-handoff/);
  assert.match(app,/type:'folkoop:city-handoff'/);
  assert.match(app,/sourceId:item\.sourceId \|\| 'goteborg_open_plans'/);
  assert.match(app,/sourceId:item\.sourceId \|\| 'riksdagen_open_data'/);
  assert.ok(!today.includes('data-folkoop-handoff'));
});

test('City entry remains touch-friendly and compact on narrow screens',()=>{
  assert.match(css,/\.city-entry-card\{[^}]*min-height:74px/);
  assert.match(css,/@media\(max-width:430px\)\{\.city-entry-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
