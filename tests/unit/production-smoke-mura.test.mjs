import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('production smoke validates the canonical WEBP Mura set, not deleted PNGs',async()=>{
 const smoke=await readFile('scripts/ci/production-smoke.mjs','utf8');
 const guide=await readFile('apps/web/folkoop-guide.js','utf8');
 assert(!smoke.includes("assert.match(guide,/folkoop-guide-point-left\\.png/"));
 assert(smoke.includes('production guide WEBP pose set incomplete'));
 assert(smoke.includes("'point-left'"));
 assert(smoke.includes("'point-right'"));
 assert(smoke.includes("'point-up'"));
 assert(smoke.includes("'point-down'"));
 assert(smoke.includes("'sit-edge'"));
 assert(smoke.includes('production guide references deleted legacy PNG identity'));
 for(const legacy of ['folkoop-guide-point-left.png','folkoop-guide-point-right.png','folkoop-guide-point-up.png','folkoop-guide-point-down.png','folkoop-guide-sit-edge.png']){
  assert(!guide.includes(legacy),legacy);
 }
 for(const asset of ['folkoop-guide-confident.webp','folkoop-guide-wink.webp','folkoop-guide-inspect.webp','folkoop-guide-searching.webp','folkoop-guide-lean-in.webp','folkoop-guide-idea.webp']){
  assert(guide.includes(asset),asset);
 }
});
