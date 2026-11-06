import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CITY_FEEDS,validateCityFeed,validateCityData} from '../../scripts/build/city-data.mjs';
function fixture(source){return {schemaVersion:1,sourceId:source.id,adapterVersion:'fixture-v1',fetchedAt:new Date().toISOString(),sourceUrl:'https://'+source.hosts[0]+'/',itemCount:1,items:[{title:'Synthetic QA source item',sourceUrl:'https://'+source.hosts[0]+'/fixture',deadline:'2099-12-31'}]};}
test('production data rejects missing, HTML fallback, stale, malformed and wrong-source feeds',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'folkoop-city-test-'));
 try{
  await assert.rejects(validateCityData(dir),e=>e.code==='ENOENT');
  for(const s of CITY_FEEDS)await writeFile(join(dir,s.file),JSON.stringify(fixture(s)));
  assert.equal((await validateCityData(dir)).length,2);
  await writeFile(join(dir,CITY_FEEDS[0].file),'<html>SPA fallback</html>');await assert.rejects(validateCityData(dir),SyntaxError);
  const s=CITY_FEEDS[0];assert.throws(()=>validateCityFeed({...fixture(s),fetchedAt:'2000-01-01T00:00:00Z'},s),/STALE_CITY_FEED/);
  assert.throws(()=>validateCityFeed({...fixture(s),sourceId:'other'},s),/INVALID_FEED/);
  assert.throws(()=>validateCityFeed({...fixture(s),items:[]},s),/EMPTY_DECISION_FEED/);
  const plans=CITY_FEEDS[1];assert.throws(()=>validateCityFeed({...fixture(plans),itemCount:99},plans),/INVALID_PLAN_FEED/);
  assert.throws(()=>validateCityFeed({...fixture(plans),items:[{title:'x',sourceUrl:'https://evil.example/',deadline:'2099-12-31'}]},plans),/INVALID_ITEM/);
  assert.equal(validateCityFeed({...fixture(plans),itemCount:0,items:[]},plans).items.length,0,'genuine empty consultations remain valid');
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('Cloudflare build and GitHub final artifact use the same production recipe',async()=>{
 const pkg=JSON.parse(await readFile('package.json','utf8')),workflow=await readFile('.github/workflows/pages.yml','utf8');
 assert.equal(pkg.scripts.build,'node scripts/build/build-production.mjs');assert.match(workflow,/run: npm run build/);
 assert.match(pkg.scripts['build:shell'],/--shell-only/);
});

test('full production recipe fetches, normalizes and packages JSON in an isolated synthetic build',async()=>{
 const {cp}=await import('node:fs/promises');const {spawnSync}=await import('node:child_process');
 const dir=await mkdtemp(join(tmpdir(),'folkoop-production-fixture-'));
 try{
  for(const name of ['apps','scripts','package.json','LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md'])await cp(name,join(dir,name),{recursive:true});
  const mock=join(dir,'synthetic-fetch.mjs');
  const raw={dokumentlista:{dokument:[{dok_id:'synthetic',titel:'Synthetic QA decision',beslutsdag:'2026-11-06',organ:'AU'}]}};
  const html='<h2>Planer öppna för synpunkter</h2><a href="/fixture">Synthetic consultation plan</a><p>Plan samråd. Synpunkter tas emot till och med 2099-12-31</p><h2>Byggs just nu</h2>';
  await writeFile(mock,`globalThis.fetch=async input=>{const u=new URL(input);if(u.hostname==='data.riksdagen.se')return new Response(${JSON.stringify(JSON.stringify(raw))},{headers:{'content-type':'application/json'}});if(u.hostname==='goteborg.se')return new Response(${JSON.stringify(html)},{headers:{'content-type':'text/html'}});throw Error('UNEXPECTED_NETWORK');};`);
  const run=spawnSync(process.execPath,['scripts/build/build-production.mjs'],{cwd:dir,encoding:'utf8',env:{...process.env,NODE_OPTIONS:'--import='+mock}});
  assert.equal(run.status,0,run.stderr+'\n'+run.stdout);
  const results=await validateCityData(join(dir,'_site/data'));assert.deepEqual(results.map(x=>x.count),[1,1]);
  const built=JSON.parse(await readFile(join(dir,'_site/data/goteborg-open-plans.json'),'utf8'));assert.equal(built.items[0].title,'Synthetic consultation plan');
  await rm(join(dir,'data/riksdagen-decisions.json'));
  const missing=spawnSync(process.execPath,['scripts/build/build-site.mjs'],{cwd:dir,encoding:'utf8'});assert.notEqual(missing.status,0,'direct production build cannot silently omit a feed');
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('reconciled offline shell includes every canonical precache module',async()=>{
 const {PRECACHE_PATHS}=await import('../../scripts/build/public-assets.mjs');
 const sw=await readFile('apps/web/sw.js','utf8');
 const entries=[...sw.match(/const CORE_PATHS=\[(.*?)\];/s)[1].matchAll(/'([^']*)'/g)].map(x=>x[1]);
 assert.deepEqual([...new Set(entries)].sort(),[...new Set(PRECACHE_PATHS)].sort());
});
