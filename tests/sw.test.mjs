import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const code=await readFile(new URL('../sw.js',import.meta.url),'utf8');
function harness(){
 const listeners={},stored=new Map(),deleted=[],names=['another-project-cache','sverinav-v0.10.1','sverinav:/Sverinav/:0.10.1'];
 const ctx=vm.createContext({URL,Headers,Response,console,self:{registration:{scope:'https://host.test/Sverinav/'},clients:{claim:async()=>{}},addEventListener:(n,cb)=>listeners[n]=cb},caches:{keys:async()=>names,delete:async k=>deleted.push(k),open:async()=>({match:async r=>stored.get(typeof r==='string'?r:r.url)?.clone(),put:async(r,v)=>stored.set(typeof r==='string'?r:r.url,v),addAll:async()=>{}})},fetch:async()=>new Response('{"items":[]}',{headers:{'content-type':'application/json'}})});
 vm.runInContext(code,ctx);
 async function dispatch(url,mode='cors'){let promise=null;listeners.fetch({request:{url,method:'GET',mode},respondWith:p=>promise=p});return promise ? await promise : null;}
 return {ctx,listeners,stored,deleted,dispatch};
}
test('SW leaves unrelated apps and external coordinate requests untouched',async()=>{const h=harness();assert.equal(await h.dispatch('https://geo-netinfo.trafikverket.se/?lon=12'),null);assert.equal(await h.dispatch('https://host.test/Another/data/feed.json'),null);let done;h.listeners.activate({waitUntil:p=>done=p});await done;assert(!h.deleted.includes('another-project-cache'));assert(h.deleted.includes('sverinav-v0.10.1'));});
test('SW returns JSON 503, never HTML, on first-visit data failure',async()=>{const h=harness();h.ctx.fetch=async()=>{throw new Error('offline');};const r=await h.dispatch('https://host.test/Sverinav/data/goteborg-open-plans.json');assert.equal(r.status,503);assert.equal((await r.json()).error,'offline');});
test('SW handles HTTP 500 with explicitly marked saved public data',async()=>{const h=harness(),url='https://host.test/Sverinav/data/goteborg-open-plans.json';await h.dispatch(url);h.ctx.fetch=async()=>new Response('Server error',{status:500});const r=await h.dispatch(url);assert.equal(r.headers.get('x-sverinav-cache'),'fallback');assert.equal(r.status,200);assert.equal((await r.json()).items.length,0);});
test('SW rejects HTML 200 as data and does not poison the cache',async()=>{const h=harness();h.ctx.fetch=async()=>new Response('<html>error</html>',{headers:{'content-type':'text/html'}});const r=await h.dispatch('https://host.test/Sverinav/data/riksdagen-decisions.json');assert.equal(r.status,503);assert.equal(h.stored.size,0);});
test('SW storage denial does not discard a successful network response',async()=>{const h=harness();h.ctx.caches.open=async()=>({put:async()=>{throw new Error('quota');}});const r=await h.dispatch('https://host.test/Sverinav/data/riksdagen-decisions.json');assert.equal(r.status,200);});
