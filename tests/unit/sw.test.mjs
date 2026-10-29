import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const code=await readFile(new URL('../../apps/web/sw.js',import.meta.url),'utf8');
function harness(scope='https://host.test/FOLKOOP/'){
 const retired='sveri'+'nav',legacyScoped=retired+':/legacy/:0.10.1',legacyVersion=retired+'-v0.10.1';
 const listeners={},stored=new Map(),deleted=[],names=['another-project-cache','folkoop:/FOLKOOP/:0.10.1',legacyScoped,legacyVersion];
 const ctx=vm.createContext({URL,Headers,Response,Request,console,self:{registration:{scope},clients:{claim:async()=>{}},addEventListener:(n,cb)=>listeners[n]=cb},caches:{keys:async()=>names,delete:async k=>deleted.push(k),open:async()=>({match:async r=>stored.get(typeof r==='string'?r:r.url)?.clone(),put:async(r,v)=>stored.set(typeof r==='string'?r:r.url,v),addAll:async()=>{}})},fetch:async()=>new Response('{"items":[]}',{headers:{'content-type':'application/json'}})});
 vm.runInContext(code,ctx);
 async function dispatch(url,mode='cors'){let promise=null;listeners.fetch({request:{url,method:'GET',mode},respondWith:p=>promise=p});return promise ? await promise : null;}
 return {ctx,listeners,stored,deleted,legacyScoped,legacyVersion,dispatch};
}
test('SW leaves unrelated apps and external coordinate requests untouched',async()=>{const h=harness();assert.equal(await h.dispatch('https://geo-netinfo.trafikverket.se/?lon=12'),null);assert.equal(await h.dispatch('https://host.test/Another/data/feed.json'),null);let done;h.listeners.activate({waitUntil:p=>done=p});await done;assert(!h.deleted.includes('another-project-cache'));assert(h.deleted.includes('folkoop:/FOLKOOP/:0.10.1'));assert(h.deleted.includes(h.legacyScoped));assert(h.deleted.includes(h.legacyVersion));});
test('SW returns JSON 503, never HTML, on first-visit data failure',async()=>{const h=harness();h.ctx.fetch=async()=>{throw new Error('offline');};const r=await h.dispatch('https://host.test/FOLKOOP/data/goteborg-open-plans.json');assert.equal(r.status,503);assert.equal((await r.json()).error,'offline');});
test('SW handles HTTP 500 with explicitly marked saved public data',async()=>{const h=harness(),url='https://host.test/FOLKOOP/data/goteborg-open-plans.json';await h.dispatch(url);h.ctx.fetch=async()=>new Response('Server error',{status:500});const r=await h.dispatch(url);assert.equal(r.headers.get('x-folkoop-cache'),'fallback');assert.equal(r.status,200);assert.equal((await r.json()).items.length,0);});
test('SW rejects HTML 200 as data and does not poison the cache',async()=>{const h=harness();h.ctx.fetch=async()=>new Response('<html>error</html>',{headers:{'content-type':'text/html'}});const r=await h.dispatch('https://host.test/FOLKOOP/data/riksdagen-decisions.json');assert.equal(r.status,503);assert.equal(h.stored.size,0);});
test('SW storage denial does not discard a successful network response',async()=>{const h=harness();h.ctx.caches.open=async()=>({put:async()=>{throw new Error('quota');}});const r=await h.dispatch('https://host.test/FOLKOOP/data/riksdagen-decisions.json');assert.equal(r.status,200);});

// Exercise real followed-redirect metadata (Response.clone preserves it).
import {createServer} from 'node:http';
test('redirected cached HTML can serve navigation at root and project subpath',async()=>{
 const server=createServer((req,res)=>{
  if(req.url.endsWith('.html')){res.writeHead(301,{location:req.url.replace(/index\.html$/,'').replace(/\.html$/,'')});res.end();return;}
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','x-shell-proof':'kept'});res.end('<h1>Public shell</h1>');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  for(const path of ['/','/FOLKOOP/']){
   const scope=`http://127.0.0.1:${server.address().port}${path}`,h=harness(scope);
   for(const file of ['index.html','city.html']){
    const response=await fetch(scope+file);assert.equal(response.redirected,true);
    h.stored.set(scope+file,response);
   }
   h.ctx.fetch=async()=>{throw new Error('offline');};
   for(const url of [scope,scope+'index.html',scope+'city.html?embedded=1&mura=1']){
    const response=await h.dispatch(url,'navigate');
    assert.equal(response.redirected,false,'navigation must not replay followed-redirect metadata');
    assert.equal(response.status,200);assert.equal(response.headers.get('x-shell-proof'),'kept');
    assert.match(response.headers.get('content-type'),/text\/html/);assert.equal(await response.text(),'<h1>Public shell</h1>');
   }
   // An evicted City cache falls back to a followed network redirect too.
   h.stored.delete(scope+'city.html');h.ctx.fetch=fetch;
   const response=await h.dispatch(scope+'city.html?embedded=1','navigate');
   assert.equal(response.redirected,false);assert.equal(await response.text(),'<h1>Public shell</h1>');
  }
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('navigation preserves ordinary responses and real redirect instructions',async()=>{
 const h=harness(),plain=new Response('plain',{status:200,headers:{'content-type':'text/html'}});
 h.ctx.fetch=async()=>plain;
 assert.equal(await h.dispatch('https://host.test/FOLKOOP/city.html','navigate'),plain);
 const redirect=Response.redirect('https://host.test/FOLKOOP/city',302);h.ctx.fetch=async()=>redirect;
 assert.equal(await h.dispatch('https://host.test/FOLKOOP/city.html','navigate'),redirect);
});
