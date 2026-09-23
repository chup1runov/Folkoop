import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {releaseVersion} from '../scripts/release-version.mjs';
test('release stamp has one authoritative package version',()=>{
 assert.equal(releaseVersion("const APP_VERSION = '0.11.0';",'0.12.0'),"const APP_VERSION = '0.12.0';");
 assert.throws(()=>releaseVersion('no marker','0.12.0'));
 assert.throws(()=>releaseVersion("const APP_VERSION = '1'; const APP_VERSION = '2';",'0.12.0'));
 assert.throws(()=>releaseVersion("const APP_VERSION = '1';","0';alert(1)"));
});
test('Compact contains complete short copy for all existing languages',async()=>{
 const ctx=vm.createContext({console});vm.runInContext(await readFile('today.js','utf8'),ctx);
 const t=ctx.SverinavToday;
 assert.deepEqual(Object.keys(t.COMPACT_COPY).sort(),Object.keys(t.COPY).sort());
 for(const values of Object.values(t.COMPACT_COPY)){
  assert.equal(values.length,t.COMPACT_KEYS.length);
  assert(values.every(v=>typeof v==='string'&&v.trim().length>0));
 }
});
test('built app uses release version and includes its compact assets',async()=>{
 const {execFileSync}=await import('node:child_process');
 execFileSync(process.execPath,['scripts/build-site.mjs']);
 const pkg=JSON.parse(await readFile('package.json','utf8'));
 const built=await readFile('_site/app.js','utf8');
 assert.equal(built.match(/const APP_VERSION = '([^']+)'/)[1],pkg.version);
 assert((await readFile('_site/index.html','utf8')).includes('./compact.css'));
 assert((await readFile('_site/sw.js','utf8')).includes("'compact.css'"));
});
