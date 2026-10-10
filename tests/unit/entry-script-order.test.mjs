import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile('apps/web/folkoop.html','utf8');
const tags=[...html.matchAll(/<script\b([^>]*\bsrc="\.\/([^"]+)"[^>]*)>/g)];
const scripts=tags.map(match=>match[2]);
function before(provider,consumer){
 assert.equal(scripts.filter(path=>path===provider).length,1,provider+' must load exactly once');
 assert.equal(scripts.filter(path=>path===consumer).length,1,consumer+' must load exactly once');
 assert(scripts.indexOf(provider)<scripts.indexOf(consumer),provider+' must run before '+consumer);
}
test('entry shell waits for first-contact and network copy providers',()=>{
 for(const source of ['folkoop-core.js','folkoop-copy.js','first-contact-preview.js','network-ui.js']){
  before(source,'folkoop.js');
 }
 before('network-client.js','network-ui.js');
 before('network-mura-home.js','network-ui.js');
 before('folkoop.js','home-welcome.js');
 before('folkoop.js','sw-register.js');
});
test('entry dependencies execute once as ordered classic defer scripts',()=>{
 assert.equal(new Set(scripts).size,scripts.length);
 for(const tag of tags){
  assert.match(tag[1],/\bdefer\b/);
  assert.doesNotMatch(tag[1],/\basync\b/);
 }
 assert.match(html,/script-src 'self'/);
 assert.doesNotMatch(html,/unsafe-eval/);
});
test('entry order release bumps matching service-worker cache version',async()=>{
 const pkg=JSON.parse(await readFile('package.json','utf8'));
 const lock=JSON.parse(await readFile('package-lock.json','utf8'));
 const sw=await readFile('apps/web/sw.js','utf8');
 assert.equal(lock.version,pkg.version);
 assert.equal(lock.packages[''].version,pkg.version);
 assert(sw.includes("const VERSION='"+pkg.version+"'"));
});
