import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const city=await readFile('apps/web/app.js','utf8');
const shell=await readFile('apps/web/folkoop.js','utf8');

test('embedded City exposes an explicit secondary FOLKOOP handoff for source-backed items',()=>{
  assert(city.includes("const EMBEDDED_MODE = params.get('embedded') === '1'"));
  assert(city.includes('data-folkoop-handoff'));
  assert(city.includes("type:'folkoop:city-handoff'"));
  assert(city.includes("kind:'planning'"));
  assert(city.includes("sourceId:item.sourceId || 'goteborg_open_plans'"));
  assert(city.includes("kind:'decision'"));
  assert(city.includes("sourceId:item.sourceId || 'riksdagen_open_data'"));
  assert(city.includes("parent.postMessage"));
  assert(city.includes("}, location.origin)"));
});

test('City handoff payload is minimal and excludes private/report/location fields',()=>{
  const marker="type:'folkoop:city-handoff'";
  const i=city.indexOf(marker);
  assert(i>=0);
  const block=city.slice(i,i+600);
  for(const key of ['kind','title','sourceId','sourceName','sourceUrl'])assert(block.includes(key),key);
  for(const forbidden of ['description','reportDescription','reportPlace','coordinates','body','email','user_id'])assert(!block.includes(forbidden),forbidden);
});

test('parent validates City source identity and hostname instead of trusting iframe labels',()=>{
  assert(shell.includes("goteborg_open_plans:Object.freeze({kind:'planning',name:'Göteborgs Stad'"));
  assert(shell.includes("hosts:Object.freeze(['goteborg.se','www.goteborg.se'])"));
  assert(shell.includes("riksdagen_open_data:Object.freeze({kind:'decision',name:'Sveriges riksdag'"));
  assert(shell.includes("hosts:Object.freeze(['data.riksdagen.se'])"));
  assert(shell.includes("url.protocol!=='https:'"));
  assert(shell.includes('url.username||url.password'));
  assert(shell.includes('source.hosts.includes(url.hostname)'));
  assert(shell.includes('sourceName:source.name'));
});

test('accepted handoff is session-memory navigation only and never auto-publishes',()=>{
  assert(shell.includes('let current=C.route(location.hash)'));
  assert(shell.includes('cityHandoff=null'));
  assert(shell.includes("e.data?.type==='folkoop:city-handoff'"));
  assert(shell.includes('cityHandoff=handoff'));
  assert(shell.includes("current='center'"));
  assert(shell.includes("history.replaceState(null,'','#/center')"));
  assert(shell.includes('data-center-story="city-handoff"'));
  const normalize=shell.slice(shell.indexOf('function normalizeCityHandoff'),shell.indexOf('const navText'));
  assert(!/localStorage|sessionStorage|store\.|fetch\(|createCooperation|rpc\(/.test(normalize));
  const handler=shell.slice(shell.indexOf("window.addEventListener('message'"),shell.indexOf("$('#skip')"));
  assert(!/store\.add|createCooperation|fetch\(|rpc\(/.test(handler));
});

test('Göteborg-local source context cannot be surfaced under another selected city',()=>{
  assert(shell.includes("!cityHandoff.sourceId.includes('goteborg_')||goteborg"));
});
