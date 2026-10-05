import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const js=await readFile('apps/web/folkoop.js','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('Center uses the canonical FOLKOOP mark as its visual anchor',()=>{
  assert.match(js,/class="center-home-hero"><img src="\.\/folkoop-mark\.png"/);
});

test('Center keeps current community and people routes prominent',()=>{
  assert.match(js,/routeCard\('communities'/);
  assert.match(js,/routeCard\('people'/);
  assert.match(js,/routeCard\('city'/);
  assert.match(js,/data-center-route="action"/);
});

test('Center keeps local Göteborg context separate from planned Host and physical place layers',()=>{
  assert.match(js,/data-center-story="local"/);
  assert.match(js,/centerHostTitle/);
  assert.match(js,/centerPhysicalTitle/);
  assert.match(js,/center-future-card/);
  assert.match(js,/future=mura\?'':/);
});

test('Center styling visually separates live and future layers',()=>{
  assert.match(css,/\.center-live-card\{border-top:4px solid var\(--accent\)\}/);
  assert.match(css,/\.center-future-card\{background:var\(--paper\);border-style:dashed\}/);
  assert.match(css,/@media\(max-width:760px\)/);
});
