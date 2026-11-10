import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=await readFile('apps/web/network-view.js','utf8');
const runtime=await readFile('apps/web/network-ui.js','utf8');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function create(locale='en'){
 const ctx={};
 runInNewContext(source,ctx,{timeout:1000});
 return ctx.FolkoopNetworkView.create({
  escape,accountText:key=>({name:'Name',note:'Note'})[key]||key,
  cooperationText:key=>({empty:'Empty'})[key]||key,
  locale:()=>locale
 });
}

test('view helper module has explicit dependencies and no rendering side effects',()=>{
 const ctx={};
 runInNewContext(source,ctx,{timeout:1000});
 assert(Object.isFrozen(ctx.FolkoopNetworkView));
 assert.throws(()=>ctx.FolkoopNetworkView.create(),/explicit functions/);
 const tools=create();
 assert(Object.isFrozen(tools));
 assert.deepEqual(Object.keys(tools).sort(),['btn','field','localDateTime','formatWhen','coopDisclosure','projectSearch'].sort());
 for(const value of Object.values(tools))assert.equal(typeof value,'function');
});

test('button, fields and disclosure retain escaped untrusted strings',()=>{
 const view=create();
 assert.equal(view.btn('open','name','a&b'),'<button class="button secondary" type="button" data-net="open" data-id="a&amp;b">Name</button>');
 assert(view.field('name','name','<img src=x>',42).includes('value="&lt;img src=x&gt;" required'));
 assert(view.field('note','note','<script>',100,true).includes('&lt;script&gt;</textarea>'));
 const markup=view.coopDisclosure('x<y','Hello & goodbye',0,'<em>Trusted generated contents</em>',true);
 assert(markup.includes('data-coop-section="x&lt;y" open'));
 assert(markup.includes('Hello &amp; goodbye'));
 assert(markup.includes('<span class="coop-section-count">0</span>'));
 assert(markup.includes('<em>Trusted generated contents</em>'));
 assert(!view.coopDisclosure('x','t','',null,false).includes('coop-section-count'));
});

test('project search labels are intact across all 11 locales',()=>{
 const labels={en:'Search',sv:'Sök',ru:'Поиск',uk:'Пошук',fi:'Haku',bs:'Pretraga',ar:'بحث',fa:'جستجو',so:'Raadi',ku:'Lêgerîn',es:'Buscar'};
 for(const [locale,label] of Object.entries(labels)){
  const html=create(locale).projectSearch();
  assert(html.includes('<span>'+label+'</span>'),locale);
  assert(html.includes('id="networkProjectSearch"'));
  assert(html.includes('Empty'));
 }
 assert(create('xx').projectSearch().includes('<span>Search</span>'));
});

test('date functions preserve invalid-input handling and localized display',()=>{
 const view=create('sv');
 for(const invalid of ['',null,'not-a-date']){
  assert.equal(view.localDateTime(invalid),'');
  assert.equal(view.formatWhen(invalid),'');
 }
 const iso='2026-11-10T12:45:00Z';
 assert.match(view.localDateTime(iso),/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
 assert(view.formatWhen(iso).length>0);
});

test('UI controller consumes view module without retaining duplicate helper implementations',()=>{
 assert.match(runtime,/const viewTools=globalThis\.FolkoopNetworkView\?\.create/);
 assert.match(runtime,/const \{btn,field,localDateTime,formatWhen,coopDisclosure,projectSearch\}=viewTools;/);
 for(const name of ['localDateTime','formatWhen','coopDisclosure','projectSearch']){
  assert(!runtime.includes('function '+name+'('),name+' still defined in UI');
 }
});
