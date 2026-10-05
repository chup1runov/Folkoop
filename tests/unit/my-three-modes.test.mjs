import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const ui=await readFile('apps/web/network-ui.js','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('real-user My overview exposes three equal ways to use FOLKOOP',()=>{
  for(const key of ['browseTitle','solveTitle','organizeTitle']) assert.ok(ui.includes(key),key);
  assert.match(ui,/home-use-modes/);
  assert.match(ui,/href="#\/center"/);
  assert.match(ui,/data-home="createCoop" data-kind="need"/);
  assert.match(ui,/data-home="createCoop" data-kind="offer"/);
  assert.match(ui,/data-home="createCoop" data-kind="project"/);
});

test('Mura home stays on the dedicated illustrative renderer',()=>{
  assert.match(ui,/html=guestDemo\?muraHomeDomain\.render\(u\):renderHome\(u\)/);
});

test('three-mode copy is available in all eleven production languages',()=>{
  for(const code of ['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku']){
    assert.match(ui,new RegExp('\\b'+code+':\\{browseTitle:'));
  }
});

test('three-mode cards collapse to one column on narrow screens',()=>{
  assert.match(css,/\.home-use-modes\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:860px\)\{\.home-use-modes\{grid-template-columns:1fr\}\}/);
});
