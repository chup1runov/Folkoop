import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

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
