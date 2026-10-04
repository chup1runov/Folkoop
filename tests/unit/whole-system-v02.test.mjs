import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile('apps/web/whole-system-v02.html','utf8');
const js=await readFile('apps/web/whole-system-v02.js','utf8');
const css=await readFile('apps/web/whole-system-v02.css','utf8');
const doc=await readFile('docs/WHOLE_SYSTEM_VISUAL_PROTOTYPE_V02.md','utf8');

test('v0.2 presents three equal human entry modes',()=>{
  for(const phrase of ['Быть среди людей','Мне нужно / я могу','Сделать что-то вместе']) assert.ok(html.includes(phrase),phrase);
});

test('v0.2 uses five global environments but keeps project access prominent',()=>{
  for(const label of ['Моё','Вместе','Город','Центр','Сообщения']) assert.ok(html.includes('>'+label+'<')||html.includes('>'+label+'</b>'),label);
  assert.ok(html.includes('Repair Day'));
  assert.ok(html.includes('data-action="open-repair-project"'));
});

test('v0.2 keeps deep tools contextual rather than global tech tabs',()=>{
  for(const label of ['Экономика','Решения','Результат']) assert.ok(html.includes(label),label);
  assert.ok(html.includes('data-workspace-tab="more"'));
  assert.ok(!html.includes('data-screen="blockchain"'));
  assert.ok(!html.includes('data-screen="sdcf"'));
});

test('v0.2 includes explicit design-only coverage of all ten components',()=>{
  for(const phrase of ['Текущий FOLKOOP','Sverinav','FOLKUNO','Кооперативная соцсеть','КООПСЕТЬ research','ГБГ Форум','Мура','SDCF','Web3/Web4','Blockchain']) assert.ok(html.includes(phrase),phrase);
  assert.ok(css.includes('body.design-mode .dev-only'));
});

test('v0.2 has interactive state for simple, social and deep journeys',()=>{
  for(const action of ['start-ladder','join-walk','open-repair-project','link-workshop','open-decisions','open-outcome']) assert.ok(js.includes(action),action);
  assert.ok(js.includes('workshopLinked'));
  assert.ok(js.includes('ladderReturned'));
});

test('v0.2 docs truth boundary excludes real external actions',()=>{
  for(const phrase of ['do not','local visual prototype state only','blockchain transaction']) assert.ok(doc.toLowerCase().includes(phrase.toLowerCase()),phrase);
});
