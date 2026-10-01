import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const ctx=vm.createContext({});
vm.runInContext(await readFile('apps/web/folkoop-core.js','utf8'),ctx);
vm.runInContext(await readFile('apps/web/folkoop-i18n-extra.js','utf8'),ctx);
vm.runInContext(await readFile('apps/web/folkoop-copy.js','utf8'),ctx);
const C=ctx.FolkoopCore,I=ctx.FolkoopCopy;
const memory=()=>{const values=new Map();return{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),values};};
const item={id:'safe-123',kind:'project',title:'Together',body:'Build a workshop'};
test('expanded social navigation includes Profile, Home, social, cooperation and utility sections',()=>{for(const k of ['me','home','messages','people','communities','together','projects','city','center','settings','about'])assert(C.ROUTES.includes(k));assert(!C.ROUTES.includes('core'));assert.equal(I.COPY.ru.me,'Профиль');assert.equal(I.COPY.ru.communities,'Сообщества');assert.equal(I.COPY.ru.settings,'Настройки');assert.equal(I.COPY.ru.aboutPage,'О нас');});
test('routes reject unknown paths and executable values',()=>{assert.equal(C.route('#/projects'),'projects');assert.equal(C.route('#javascript:alert(1)'),'home');assert.equal(C.route('#/constructor'),'home');});
test('eleven existing language choices and native navigation labels are retained',()=>{assert.equal(C.LANGS.length,11);for(const lang of C.LANGS)for(const k of ['home','messages','people','communities','together','projects','city','center','me','settings','aboutPage','partial'])assert(I.COPY[lang][k]);});
test('all eleven shell translations are complete',()=>{assert.equal(I.FULL.length,11);const keys=Object.keys(I.COPY.en).sort();for(const lang of C.LANGS){assert.deepEqual(Object.keys(I.COPY[lang]).sort(),keys,lang);for(const key of keys)assert.equal(typeof I.COPY[lang][key]==='string'&&I.COPY[lang][key].trim().length>0,true,lang+':'+key);}});
test('local workspace never writes before consent',()=>{const s=memory(),w=C.workspace(s);w.profile({name:'Test'});w.add(item);assert.equal(s.values.size,0);assert.equal(w.get().drafts.length,1);assert.equal(w.isPersistent(),false);});
test('consented data persists and reloads',()=>{const s=memory(),w=C.workspace(s);w.add(item);assert(w.remember(true));assert.equal(C.workspace(s).get().drafts[0].title,'Together');});
test('revoking persistence removes only the FOLKOOP key, retains in-memory work',()=>{const s=memory(),w=C.workspace(s);s.setItem('unrelated','keep');w.add(item);w.remember(true);assert(w.remember(false));assert.equal(s.getItem(C.KEY),null);assert.equal(s.getItem('unrelated'),'keep');assert.equal(w.get().drafts.length,1);});
test('blocked and malformed storage do not prevent use',()=>{const w=C.workspace({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});assert.equal(w.get().drafts.length,0);assert.equal(w.remember(true),false);assert(w.add(item).ok);const s=memory();s.setItem(C.KEY,'{bad');assert.equal(C.workspace(s).get().drafts.length,0);});
test('unsupported schema versions are not silently overwritten',()=>{const s=memory();s.setItem(C.KEY,'{"version":9,"drafts":[]}');const w=C.workspace(s);assert.equal(w.isPersistent(),false);w.add(item);assert.equal(s.getItem(C.KEY),'{"version":9,"drafts":[]}');});
test('stored data is allowlisted and length-bounded',()=>{const v=C.clean({profile:{name:'x'.repeat(100),city:'Göteborg'.repeat(30),coordinates:[1,2],secret:'no'},drafts:[{...item,id:'<svg onload=x>'}]});assert.equal(v.profile.name.length,60);assert.equal(v.profile.city.length,120);assert.equal(v.profile.secret,undefined);assert.equal(v.drafts.length,0);});
test('draft IDs cannot inject attributes',()=>{const w=C.workspace();assert.equal(w.add({...item,id:'x" onclick="alert(1)'}).ok,false);});
test('content escaping protects render paths',()=>{assert.equal(C.escape('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');});
test('own completion toggles and deletion work without publishing',()=>{const w=C.workspace();w.add(item);w.toggle(item.id);assert(w.get().drafts[0].done);w.remove(item.id);assert.equal(w.get().drafts.length,0);});
test('duplicate IDs and over-limit drafts are rejected',()=>{const w=C.workspace();w.add(item);assert.equal(w.add(item).ok,false);for(let i=1;i<100;i++)assert(w.add({...item,id:'id-'+i}).ok);assert.equal(w.add({...item,id:'extra'}).ok,false);});
test('storage failure after consent returns failure while preserving in-memory edit',()=>{const s=memory(),w=C.workspace(s);w.remember(true);s.setItem=()=>{throw Error('quota');};assert.equal(w.profile({name:'Latest',city:'Göteborg'}),false);assert.equal(w.get().profile.name,'Latest');assert.equal(w.get().profile.city,'Göteborg');});
test('returned snapshots cannot mutate live state',()=>{const w=C.workspace();w.add(item);w.get().drafts[0].title='changed';assert.equal(w.get().drafts[0].title,'Together');});
test('erase resets profile, drafts and consent without clearing unrelated preferences',()=>{const s=memory(),w=C.workspace(s);s.setItem('folkoop-language','ru');w.profile({name:'Test'});w.add(item);w.remember(true);assert(w.clear());assert.equal(w.get().drafts.length,0);assert.equal(w.get().profile.name,'');assert.equal(w.isPersistent(),false);assert.equal(s.getItem('folkoop-language'),'ru');});
test('new shell has no third-party network calls or payment simulation',async()=>{const s=await readFile('apps/web/folkoop.js','utf8');assert(!/\bfetch\(/.test(s));assert(!/WebSocket|sendBeacon/.test(s));assert(s.includes("e.origin!==location.origin"));assert(s.includes("e.source!==frame.contentWindow"));});

test('Mura presence is local-only and keeps one authored canonical identity',async()=>{
 const guide=await readFile('apps/web/folkoop-guide.js','utf8');
 assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(guide));
 for(const asset of ['folkoop-guide-please.webp','folkoop-guide-confident.webp','folkoop-guide-idea.webp','folkoop-guide-wink.webp'])assert((await readFile('apps/web/'+asset)).length>1000,asset);
 for(const asset of ['folkoop-guide-point-left.png','folkoop-guide-point-right.png','folkoop-guide-point-up.png','folkoop-guide-point-down.png','folkoop-guide-sit-edge.png'])assert((await readFile('apps/web/'+asset)).length>20_000,asset);
 assert(!/transparentAsset|getContext\(|toDataURL\(|folkoop-guide-pointer|point-angle|point-length/.test(guide));
 for(const pose of ['point-left','point-right','point-up','point-down','sit-edge'])assert(guide.includes(pose));
 const shell=await readFile('apps/web/folkoop.js','utf8');
 assert(shell.includes("folkoop-onboarding-v3"));
 assert(shell.includes("folkoop-language-choice-v1"));
 assert(shell.includes("target:'[data-intent=\\\"need\\\"]'")||shell.includes("target:'[data-intent=\"need\"]'"));
 assert(guide.includes("const CANONICAL_MURA='./folkoop-guide-please.webp'"));
});


test('public About exposes the future architecture as planned, not shipped',async()=>{
 const shell=await readFile('apps/web/folkoop.js','utf8');
 for(const key of ['futureArchitectureTitle','trustLayerTitle','agentLayerTitle','networkLayerTitle','physicalLayerTitle','futureArchitectureNote','futureArchitectureLink']){
  for(const lang of C.LANGS)assert.equal(typeof I.COPY[lang][key],'string',lang+':'+key);
 }
 assert(shell.includes("TRUST_IDENTITY_WEB4_ARCHITECTURE.md"));
 assert(shell.includes("futureArchitectureTitle"));
 assert(I.COPY.en.futureArchitectureNote.includes('not crypto-first'));
 assert(I.COPY.sv.futureArchitectureText.includes('piloten'));
 assert(I.COPY.ru.futureArchitectureText.includes('пилот'));
 assert(!I.COPY.en.futureArchitectureNote.includes('FOLKOOP Coin is'));
});


test('first contact explains the cooperation purpose instead of only naming modules',()=>{
 for(const lang of C.LANGS){
  assert.equal(typeof I.COPY[lang].hero,'string',lang+':hero');
  assert.equal(typeof I.COPY[lang].intro,'string',lang+':intro');
  assert.equal(typeof I.COPY[lang].aboutText,'string',lang+':aboutText');
 }
 assert(I.COPY.en.intro.includes('group chat'));
 assert(I.COPY.ru.intro.includes('Групповой чат'));
 assert(I.COPY.sv.intro.includes('gruppchatt'));
 assert(I.COPY.en.aboutText.includes('cooperation network'));
 assert(I.COPY.ru.aboutText.includes('сеть кооперации'));
});


test('My Place identity choices are bounded, local and allowlisted',()=>{
 const cleaned=C.clean({profile:{name:'Ada',motto:'Build useful things',accent:'purple',unknown:'no'}});
 assert.equal(cleaned.profile.motto,'Build useful things');
 assert.equal(cleaned.profile.accent,'purple');
 assert.equal(cleaned.profile.unknown,undefined);
 assert.equal(C.clean({profile:{accent:'javascript:red'}}).profile.accent,'coral');
 assert.deepEqual(Array.from(C.ACCENTS),['coral','blue','green','purple']);
});

test('My Place renders authored identity and truthful local activity rather than social scoring',async()=>{
 const shell=await readFile('apps/web/folkoop.js','utf8');
 for(const token of ['my-place-hero','my-place-life','createdByMe','completedByMe','myKinds'])assert(shell.includes(token),token);
 for(const forbidden of ['follower-count','social-score','leaderboard','login-streak'])assert(!shell.includes(forbidden),forbidden);
});
