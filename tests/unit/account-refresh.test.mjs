import {test} from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const source=readFileSync('apps/web/network-ui.js','utf8');
function harness(){let loads=0,renders=0,release;const ctx={guestDemo:false,currentUser:()=>({id:'one'}),busy:false,routeLoadPending:false,loadCurrentRoute:()=>{},version:0,Date:{now:()=>60000},document:{visibilityState:'visible',activeElement:{matches:()=>false},querySelector:()=>null},navigator:{onLine:true},host:{contains:()=>false,querySelector:()=>null},load:async()=>{loads++;},render:()=>renders++};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('let liveRefreshAt='),source.indexOf('setInterval(refreshAccount')),ctx);return {ctx,run:()=>ctx.refreshAccount(),loads:()=>loads,renders:()=>renders};}
test('visible idle account refreshes once within throttle interval',async()=>{const h=harness();await h.run();await h.run();assert.equal(h.loads(),1);assert.equal(h.renders(),1);});
test('hidden/offline/Mura/busy/editing/dialog sessions do not poll',async()=>{for(const change of [c=>c.guestDemo=true,c=>c.busy=true,c=>c.document.visibilityState='hidden',c=>c.navigator.onLine=false,c=>{c.host.contains=()=>true;c.document.activeElement.matches=()=>true;},c=>c.document.querySelector=()=>({})]){const h=harness();change(h.ctx);await h.run();assert.equal(h.loads(),0);}});
test('overlapping refresh is suppressed and rejected load is visible',async()=>{const h=harness();let reject;h.ctx.load=()=>new Promise((_,r)=>reject=r);const pending=h.run();assert.equal(h.ctx.busy,true);await h.run();reject(new Error('offline'));await pending;assert.equal(h.ctx.busy,false);assert.equal(h.renders(),1);assert.equal(vm.runInContext('liveRefreshError',h.ctx),true);});
test('navigation during refresh discards stale render',async()=>{const h=harness();h.ctx.load=async()=>{h.ctx.version++;};await h.run();assert.equal(h.renders(),0);});

test('navigation queued during refresh is loaded after releasing busy state',async()=>{const h=harness();let queued=0;h.ctx.load=async()=>{h.ctx.version++;h.ctx.routeLoadPending=true;};h.ctx.loadCurrentRoute=()=>{assert.equal(h.ctx.busy,false);queued++;};await h.run();assert.equal(h.renders(),0);assert.equal(queued,1);});

test('success and failure render only after releasing the busy restriction',async()=>{
 for(const fail of [false,true]){const h=harness();let renders=0;h.ctx.render=()=>{assert.equal(h.ctx.busy,false);renders++;};if(fail)h.ctx.load=async()=>{throw new Error('temporary');};await h.run();assert.equal(renders,1);}
});
