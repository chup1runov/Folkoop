import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile('apps/web/whole-system-lab.html','utf8');
const css=await readFile('apps/web/whole-system-lab.css','utf8');
const js=await readFile('apps/web/whole-system-lab.js','utf8');

test('whole-system lab uses the canonical FOLKOOP mark',()=>{
  assert.match(html,/\.\/folkoop-mark\.png/);
  assert(!/data:image\//.test(html));
});

test('whole-system lab presents one product through five human-facing surfaces',()=>{
  for(const label of ['Мой FOLKOOP','Вместе','Город','Центр','Сообщения']) assert(html.includes(label),label);
  assert(html.includes('Что вы хотите сделать?'));
  for(const label of ['Мне что-то нужно','Я могу помочь','Хочу сделать вместе','Что есть рядом?']) assert(html.includes(label),label);
});

test('future depth is visible without pretending it is live',()=>{
  for(const state of ['РАБОТАЕТ','ПРОТОТИП','ПЛАН']) assert(html.includes(state),state);
  assert(html.includes('SDCF'));
  assert(html.includes('Web3/Web4'));
  assert(html.includes('blockchain'));
});

test('lab is isolated from production shell and contains its own interaction code',()=>{
  assert(html.includes('./whole-system-lab.css'));
  assert(html.includes('./whole-system-lab.js'));
  assert(css.includes('.screen.active'));
  assert(js.includes('data-jump'));
});