import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

test('first installation does not interrupt entry; an existing controller reloads once per update',async()=>{
 const code=await readFile('apps/web/sw-register.js','utf8');
 for(const existing of [false,true]){
  let changed,reloads=0;
  runInNewContext(code,{navigator:{serviceWorker:{controller:existing?{}:null,addEventListener:(_,fn)=>{changed=fn;}}},window:{addEventListener:()=>{}},location:{reload:()=>reloads++}});
  changed();changed();
  assert.equal(reloads,existing?1:0);
 }
});

test('PWA registration forces a network update check and activates waiting releases',async()=>{
 const code=await readFile('apps/web/sw-register.js','utf8');
 assert.match(code,/updateViaCache:'none'/);
 assert.match(code,/registration\.update\(\)/);
 assert.match(code,/SKIP_WAITING/);
 assert.match(code,/controllerchange/);
 assert.match(code,/location\.reload\(\)/);
});

test('service worker accepts only the release activation message',async()=>{
 const sw=await readFile('apps/web/sw.js','utf8');
 assert.match(sw,/event\.data\?\.type==='SKIP_WAITING'/);
 assert.match(sw,/self\.skipWaiting\(\)/);
});

test('both public shells use the shared update-aware registration runtime',async()=>{
 const [city,folkoop]=await Promise.all([readFile('apps/web/index.html','utf8'),readFile('apps/web/folkoop.html','utf8')]);
 assert.match(city,/\.\/sw-register\.js/);
 assert.match(folkoop,/\.\/sw-register\.js/);
 assert.doesNotMatch(city,/navigator\.serviceWorker\.register/);
 assert.doesNotMatch(folkoop,/navigator\.serviceWorker\.register/);
});


test('service-worker cache version matches the packaged release version',async()=>{
 const [sw,pkg]=await Promise.all([readFile('apps/web/sw.js','utf8'),readFile('package.json','utf8')]);
 const version=JSON.parse(pkg).version;
 assert(sw.includes("const VERSION='"+version+"'"));
});
