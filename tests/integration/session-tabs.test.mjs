import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('apps/web/network-client.js','utf8');
const uid='11111111-1111-4111-8111-111111111111';
const config={enabled:true,serverSession:true,url:'https://abcdefghijklmnopqrst.supabase.co',publishableKey:'sb_publishable_testonly_example'};
function world({fallback=false}={}){
 const channels=[],windows=[],signals=[],timers=new Map();let time=1000,n=0;
 function tab(transport=async()=>Response.json({id:uid,expiresAt:61000}),cfg=config){
  const handlers={},storage=new Map([['local-draft','keep']]);
  const win={addEventListener:(name,fn)=>(handlers[name]??=[]).push(fn),localStorage:{setItem(k,v){storage.set(k,v);signals.push(v);for(const w of windows)if(w!==win)w.fire('storage',{key:k,newValue:v});},removeItem:k=>storage.delete(k)},fire(name,e){for(const fn of handlers[name]||[])fn(e);}};windows.push(win);
  class Channel{constructor(){if(fallback)throw Error('unsupported');channels.push(this);}postMessage(data){signals.push(data);for(const c of channels)if(c!==this)c.onmessage?.({data});}}
  const ctx=vm.createContext({window:win,BroadcastChannel:Channel,URL,crypto:globalThis.crypto,AbortController,setTimeout:(fn,ms)=>{timers.set(++n,{fn,at:time+ms});return n;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(source,ctx);const api=ctx.FolkoopNetwork.client(cfg,{transport,clock:()=>time});return {api,win,storage};
 }
 return {tab,signals,advance(ms){time+=ms;for(const [id,t] of [...timers])if(t.at<=time){timers.delete(id);t.fn();}}};
}
test('cookie logout clears both tabs before DELETE completes, signals carry no identity and drafts survive',async()=>{
 const w=world();let finish;const a=w.tab(async(_,o)=>o.method==='DELETE'?new Promise(r=>finish=()=>r(Response.json({ok:true}))):Response.json({id:uid,expiresAt:61000})),b=w.tab();await a.api.restore();await b.api.restore();
 let cleared=0;b.api.onChange(u=>{if(!u)cleared++;});const out=a.api.logout();assert.equal(a.api.user(),null);assert.equal(b.api.user(),null);assert.equal(cleared,1);finish();await out;
 assert(w.signals.every(s=>JSON.stringify(s)==='{"type":"signed-out"}'));assert.equal(b.storage.get('local-draft'),'keep');
});
test('storage fallback removes only its transient marker and invalidates another tab',async()=>{
 const w=world({fallback:true}),a=w.tab(),b=w.tab();await a.api.restore();await b.api.restore();await a.api.logout();assert.equal(b.api.user(),null);assert.equal(a.storage.size,1);assert.equal(b.storage.get('local-draft'),'keep');assert(w.signals.every(s=>/^[a-f0-9-]{36}$/.test(s)));
});
test('timer expires an idle session and reports the reason once',async()=>{
 const w=world(),a=w.tab();await a.api.restore();const reasons=[];a.api.onChange((u,r)=>reasons.push([u,r]));w.advance(60000);assert.equal(a.api.user(),null);assert.deepEqual(reasons,[[null,'expired']]);
});
test('late restore and private reads cannot resurrect a remotely cleared account',async()=>{
 const w=world();let finish;const a=w.tab(),b=w.tab(async()=>new Promise(r=>finish=r));const pending=b.api.restore();await a.api.restore();await a.api.logout();finish(Response.json({id:uid,expiresAt:61000}));await assert.rejects(pending,e=>e.code==='STALE');assert.equal(b.api.user(),null);
 let release;const c=w.tab(async(_,o)=>o.method==='GET'?Response.json({id:uid,expiresAt:61000}):Response.json({ok:true}));await c.api.restore();
 const d=w.tab(async url=>url.includes('/rest/')?new Promise(r=>release=r):Response.json({id:uid,expiresAt:61000}));await d.api.restore();const read=d.api.profile();await c.api.logout();release(Response.json([{id:uid,name:'private'}]));await assert.rejects(read,e=>e.code==='STALE');
});
test('failed server logout still clears displays but does not claim revocation success',async()=>{
 const w=world(),a=w.tab(async(_,o)=>Response.json(o.method==='DELETE'?{}:{id:uid,expiresAt:61000},{status:o.method==='DELETE'?503:200})),b=w.tab();await a.api.restore();await b.api.restore();await assert.rejects(a.api.logout(),e=>e.code==='AUTH_SERVER');assert.equal(b.api.user(),null);
});
test('static independent clients do not join the shared-cookie channel',async()=>{
 const w=world(),a=w.tab(),b=w.tab(async url=>Response.json(url.endsWith('/user')?{id:uid}:true),{...config,serverSession:false});await b.api.completeOAuth('synthetic-access-token-long',3600,'',{termsAccepted:true,privacyAcknowledged:true});await a.api.restore();await a.api.logout();assert.equal(b.api.user().id,uid);
});

test('late 401 body cannot clear a newly restored account',async()=>{
 const w=world();let release,started;const bodyStarted=new Promise(r=>started=r);const a=w.tab(async url=>url.includes('/rest/')?{ok:false,status:401,headers:new Headers({'content-type':'application/json'}),json:()=>new Promise(r=>{release=r;started();})}:Response.json({id:uid,expiresAt:61000}));await a.api.restore();const read=a.api.profile();await bodyStarted;await a.api.logout();await a.api.restore();release({});await assert.rejects(read,e=>e.code==='STALE');assert.equal(a.api.user().id,uid);
});
