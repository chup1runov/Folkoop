import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const code=await readFile('apps/web/sw-register.js','utf8');
function harness({controller=true,confirmResult=true,withCityFrame=false}={}){
 const listeners={},windowListeners={},nodes=[],messages=[],calls={reload:0,update:0,register:0,confirm:0};
 const worker={state:'installed',listeners:{},postMessage:value=>messages.push(value),addEventListener(name,fn){this.listeners[name]=fn;}};
 const reg={waiting:worker,installing:null,listeners:{},
  addEventListener(name,fn){this.listeners[name]=fn;},
  async update(){calls.update++;}};
 function element(tag){
  const e={tag,hidden:false,attributes:{},events:{},children:[],textContent:'',
   setAttribute(k,v){this.attributes[k]=v;},
   append(...items){this.children.push(...items);},
   addEventListener(k,fn){this.events[k]=fn;},
   click(){this.events.click?.();}};
  nodes.push(e);return e;
 }
 const body={children:[],append(node){this.children.push(node);}};
 const cityListeners={};
 const cityDoc={addEventListener:(k,cb)=>{cityListeners[k]=cb;}};
 const cityFrame={id:'cityFrame',contentDocument:cityDoc};
 const doc={documentElement:{lang:'ru'},body,addEventListener:(k,cb)=>listeners[k]=cb,
  getElementById:id=>(id==='cityFrame'&&withCityFrame?cityFrame:null),
  createElement:element};
 const sw={controller:controller?{}:null,
  addEventListener:(k,cb)=>listeners[k]=cb,
  async register(_,options){calls.register++;assert.equal(options.updateViaCache,'none');return reg;}};
 const win={addEventListener:(k,cb)=>windowListeners[k]=cb,
  confirm(){calls.confirm++;return confirmResult;}};
 const ctx={navigator:{serviceWorker:sw},window:win,document:doc,
  location:{reload(){calls.reload++;}},
  MutationObserver:class {observe(){}},console};
 runInNewContext(code,ctx);
 return {calls,messages,reg,worker,body,doc,cityListeners,listeners,windowListeners,nodes,
  setConfirm:yes=>{win.confirm=()=>{calls.confirm++;return yes;};},
  setController:value=>{sw.controller=value;},
  async open(){await windowListeners.load?.();},
  banner(){return body.children[0];},
  updateButton(){return body.children[0]?.children[2];},
  laterButton(){return body.children[0]?.children[3];}};
}

test('first install never shows an update prompt or triggers reload',async()=>{
 const h=harness({controller:false});
 await h.open();
 h.listeners.controllerchange?.();
 assert.equal(h.calls.register,1);
 assert.equal(h.calls.update,1);
 assert.equal(h.calls.reload,0);
 assert.equal(h.messages.length,0);
 assert.equal(h.body.children.length,0);
});

test('existing clients see a passive notice, not an automatic activation/reload',async()=>{
 const h=harness();
 await h.open();
 assert.equal(h.calls.update,1);
 assert.equal(h.calls.reload,0);
 assert.equal(h.messages.length,0);
 assert.equal(h.banner().attributes.role,'status');
 assert.equal(h.banner().hidden,false);
 assert.match(h.banner().children[0].textContent,/обновлен/i);
 // Activation initiated by another tab also cannot reload local drafts.
 h.listeners.controllerchange?.();
 assert.equal(h.calls.reload,0);
 assert.equal(h.banner().hidden,false);
 h.laterButton().click();
 assert.equal(h.banner().hidden,true);
});

test('dirty form denies update until participant confirms, then reloads only once',async()=>{
 const h=harness({confirmResult:false});await h.open();
 const field={matches:selector=>selector.includes('input'),closest:()=>null};
 h.listeners.input({isTrusted:true,target:field});
 h.updateButton().click();
 assert.equal(h.calls.confirm,1);
 assert.equal(h.messages.length,0);
 assert.equal(h.calls.reload,0);
 h.setConfirm(true);
 h.updateButton().click();
 assert.equal(h.messages.length,1);
 assert.equal(h.messages[0].type,'SKIP_WAITING');
 assert.equal(h.calls.reload,0,'controller change must complete before reload');
 h.listeners.controllerchange();
 h.listeners.controllerchange();
 assert.equal(h.calls.reload,1);
});

test('typing in embedded City non-form report controls blocks silent update',async()=>{
 const h=harness({confirmResult:false,withCityFrame:true});await h.open();
 assert.equal(typeof h.cityListeners.input,'function');
 h.cityListeners.input({isTrusted:true,target:{matches:()=>true,closest:()=>null}});
 h.updateButton().click();
 assert.equal(h.calls.confirm,1);
 assert.equal(h.messages.length,0);
 assert.equal(h.calls.reload,0);
});

test('notice refreshes its language without persisting user input',async()=>{
 const h=harness();await h.open();
 h.doc.documentElement.lang='en';
 h.listeners.controllerchange?.();
 assert.match(h.banner().children[0].textContent,/update/i);
 assert.doesNotMatch(code,/localStorage|sessionStorage|indexedDB/);
});

test('PWA registration checks for network updates without forcing waiting workers',()=>{
 assert.match(code,/updateViaCache:'none'/);
 assert.match(code,/registration\.update\(\)/);
 assert.match(code,/SKIP_WAITING/);
 assert.match(code,/controllerchange/);
 assert.match(code,/location\.reload\(\)/);
 assert.doesNotMatch(code,/registration\.waiting\.postMessage\(/);
});

test('service worker accepts only the release activation message',async()=>{
 const sw=await readFile('apps/web/sw.js','utf8');
 assert.match(sw,/event\.data\?\.type==='SKIP_WAITING'/);
 assert.match(sw,/self\.skipWaiting\(\)/);
});

test('both public shells use the shared update-aware registration runtime',async()=>{
 const [city,folkoop]=await Promise.all([
  readFile('apps/web/index.html','utf8'),readFile('apps/web/folkoop.html','utf8')
 ]);
 assert.match(city,/\.\/sw-register\.js/);
 assert.match(folkoop,/\.\/sw-register\.js/);
 assert.doesNotMatch(city,/navigator\.serviceWorker\.register/);
 assert.doesNotMatch(folkoop,/navigator\.serviceWorker\.register/);
 for(const path of ['apps/web/folkoop.css','apps/web/styles.css']){
  assert.match(await readFile(path,'utf8'),/\.folkoop-update-notice:not\(\[hidden\]\)/);
  assert.match(await readFile(path,'utf8'),/\.folkoop-update-notice \.button\.secondary\{color:#fff;/);
 }
});

test('service-worker cache version matches the packaged release version',async()=>{
 const [sw,pkg]=await Promise.all([readFile('apps/web/sw.js','utf8'),readFile('package.json','utf8')]);
 assert(sw.includes("const VERSION='"+JSON.parse(pkg).version+"'"));
});

test('all eleven supported languages have a readable passive update action',async()=>{
 const h=harness();await h.open();
 for(const lang of ['sv','en','ru','uk','es','fi','bs','ar','fa','so','ku']){
  h.doc.documentElement.lang=lang;
  h.listeners.controllerchange?.(); // another-tab update, no forced reload
  const words=h.banner().children.map(x=>x.textContent);
  assert.equal(words.length,4);
  assert(words.every(x=>typeof x==='string'&&x.length>=4),lang);
  assert.equal(h.calls.reload,0);
 }
});

test('a tab kept open after first install still receives its second update',async()=>{
 const h=harness({controller:false});await h.open();
 assert.equal(h.body.children.length,0);
 h.setController({});
 h.listeners.controllerchange(); // silent initial control claim
 assert.equal(h.calls.reload,0);
 h.reg.installing=h.worker;
 h.reg.listeners.updatefound(); // next release becomes installed in same tab
 assert.equal(h.banner().hidden,false);
 assert.equal(h.calls.reload,0);
 h.updateButton().click();
 assert.equal(h.messages.length,1);
 h.listeners.controllerchange();
 assert.equal(h.calls.reload,1);
});
