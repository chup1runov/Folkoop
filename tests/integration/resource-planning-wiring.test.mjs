import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const clientSource=readFileSync('apps/web/network-client.js','utf8');
const UI=readFileSync('apps/web/network-ui.js','utf8');
const HTML=readFileSync('apps/web/folkoop.html','utf8');
const CONFIG=readFileSync('apps/web/network-config.js','utf8');
const ASSETS=readFileSync('scripts/build/public-assets.mjs','utf8');
const SW=readFileSync('apps/web/sw.js','utf8');
const SMOKE=readFileSync('scripts/ci/browser-smoke.sh','utf8');
const UID='11111111-1111-4111-8111-111111111111',OTHER='22222222-2222-4222-8222-222222222222';
const ID='33333333-3333-4333-8333-333333333333';
const config={enabled:true,url:'https://abcdefghijklmnopqrst.supabase.co',publishableKey:'sb_publishable_example_for_tests_only',resourcePlanningEnabled:true};
const json=(data,status=200)=>({ok:status<400,status,headers:new Headers({'content-type':'application/json'}),json:async()=>data});
function setup(extra={}){
 const box={URL,AbortController,setTimeout,clearTimeout,Headers,console};
 for(const name of ['resource-planning-core.js','resource-planning-lifecycle.js','resource-planning-transport.js'])vm.runInNewContext(readFileSync('apps/web/'+name,'utf8'),box);
 vm.runInNewContext(clientSource,box);
 let who=UID,handler=()=>json([]);const calls=[];
 const transport=async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/verify'))return json({access_token:'synthetic-test-session',expires_in:3600});
  if(url.endsWith('/user'))return json({id:who});
  if(url.endsWith('/fk_claim_pilot_invite'))return json(true);
  if(url.includes('/logout?'))return json(null,204);
  return handler(url,options);
 };
 const api=box.FolkoopNetwork.client({...config,...extra},{transport});
 return {api,calls,handle:f=>handler=f,login:async(id=UID)=>{who=id;return api.verify('synthetic@example.invalid','123456','',{termsAccepted:true,privacyAcknowledged:true});}};
}
test('direct source loads reviewed R1 modules before the existing network client',()=>{
 new vm.Script(clientSource);new vm.Script(UI);
 for(const name of ['resource-planning-core.js','resource-planning-lifecycle.js','resource-planning-transport.js','resource-planning-copy.js','resource-planning-forms.js'])assert.ok(HTML.includes('./'+name));
 assert.ok(HTML.indexOf('./resource-planning-transport.js')<HTML.indexOf('./network-client.js'));
 assert.match(UI,/data-resource-planning-panel/);
 assert.match(UI,/guestDemo\|\|\(api\?\.resourcePlanning/);
});
test('production build contains R1 assets but public feature gate is explicitly off',()=>{
 assert.match(CONFIG,/resourcePlanningEnabled:false/);
 for(const name of ['resource-planning-core.js','resource-planning-lifecycle.js','resource-planning-transport.js','resource-planning-copy.js','resource-planning-forms.js','resource-planning-forms.css']){
  assert.ok(ASSETS.includes("'"+name+"'"),name+' missing build asset');
  assert.ok(SW.includes("'"+name+"'"),name+' missing service-worker core');
 }
 assert.doesNotMatch(SMOKE,/stage-resource-planning/);
});
test('explicit flag absent or false exposes no candidate API',()=>{
 assert.equal(setup({resourcePlanningEnabled:false}).api.resourcePlanning,null);
 assert.equal(setup({resourcePlanningEnabled:undefined}).api.resourcePlanning,null);
});
test('reuses existing authenticated HTTP security options',async()=>{
 const h=setup();await h.login();h.handle(()=>json([]));await h.api.resourcePlanning.requirements(UID);
 const {options,url}=h.calls.at(-1);assert.equal(options.headers.Authorization,'Bearer synthetic-test-session');assert.match(url,/quantity::text/);
 assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');assert.equal(options.referrerPolicy,'no-referrer');assert.equal(options.redirect,'error');
});
for(const [status,code,expected] of [[409,'40001','RESOURCE_CONFLICT'],[404,'PGRST202','RESOURCE_SCHEMA_UNAVAILABLE'],[404,'PGRST205','RESOURCE_SCHEMA_UNAVAILABLE'],[400,'22023','INVALID_INPUT']])test(\`HTTP \${code} has bounded error mapping\`,async()=>{
 const h=setup();await h.login();h.handle(()=>json({code,message:'sensitive server detail'},status));
 await assert.rejects(h.api.resourcePlanning.requirements(UID),e=>e.code===expected&&!e.message.includes('sensitive'));
});
test('unknown HTTP failure does not leak raw server detail',async()=>{
 const h=setup();await h.login();h.handle(()=>json({message:'sensitive database exception'},500));
 await assert.rejects(h.api.resourcePlanning.requirements(UID),e=>e.code==='REQUEST_FAILED'&&!e.message.includes('sensitive'));
});
test('late successful response cannot cross logout',async()=>{
 const h=setup();await h.login();let release;h.handle(()=>new Promise(r=>release=r));
 const pending=h.api.resourcePlanning.requirements(UID);await h.api.logout();release(json([]));
 await assert.rejects(pending,e=>e.code==='STALE');
});
test('delayed 401 error body cannot log out a newer account',async()=>{
 const h=setup();await h.login();let started,release;const reached=new Promise(r=>started=r);
 h.handle(()=>({ok:false,status:401,headers:new Headers({'content-type':'application/json'}),json:async()=>{started();return new Promise(r=>release=r);}}));
 const pending=h.api.resourcePlanning.requirements(UID);await reached;await h.api.logout();await h.login(OTHER);release({code:'401'});
 await assert.rejects(pending,e=>e.code==='STALE');assert.equal(h.api.user().id,OTHER);
});
test('same user direct re-login also invalidates in-flight request',async()=>{
 const h=setup();await h.login();let release;h.handle(()=>new Promise(r=>release=r));
 const pending=h.api.resourcePlanning.requirements(UID);await h.login(UID);release(json([]));
 await assert.rejects(pending,e=>e.code==='STALE');assert.equal(h.api.user().id,UID);
});
test('invalid quantities never enter the HTTP adapter',async()=>{
 const h=setup();await h.login();const n=h.calls.length;
 await assert.rejects(h.api.resourcePlanning.saveRequirement({id:ID,projectId:UID,title:'Material',kind:'consumable',quantity:'1e3',unit:'kg',from:null,until:null,conditions:''},0),e=>e.code==='INVALID_QUANTITY');
 assert.equal(h.calls.length,n);
});
