// Local draft tests. Not executed during the code-only implementation.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const setup=(lang='ru')=>{const c={document:{documentElement:{lang}}};vm.runInNewContext(readFileSync('apps/web/network-for-you.js','utf8'),c);return c.FolkoopForYou;};
const items=[
 {id:'a',kind:'project',status:'open',title:'Svenska tillsammans',description:'Språkcafé',created_at:'2026-10-19'},
 {id:'b',kind:'need',status:'active',title:'Помощь с садом',description:'Посадить цветы',created_at:'2026-10-18'},
 {id:'c',kind:'project',status:'done',title:'Swedish',description:'Past'},
 {id:'d',kind:'project',status:'open',title:'Знакомство за чаем',description:'Встреча',created_at:'2026-10-17'}
];
test('intent filters do not return closed or unrelated listings',()=>{
 const f=setup();
 assert.equal(f.select(items,'swedish','u',[]).map(x=>x.id).join(','),'a');
 assert.equal(f.select(items,'help','u',[]).map(x=>x.id).join(','),'b');
 assert.equal(f.select(items,'social','u',[]).map(x=>x.id).join(','),'d');
});
test('unjoined opportunities first, bounded output, inputs not mutated',()=>{
 const f=setup(),before=JSON.stringify(items);
 const rows=f.select(items,'browse','u',[{user_id:'u',cooperation_id:'a'}]);
 assert.equal(rows.at(-1).id,'a');assert.equal(rows.at(-1).joined,true);
 assert.equal(f.select(Array.from({length:10},(_,i)=>({...items[0],id:String(i)})),'browse','u',[]).length,6);
 assert.equal(JSON.stringify(items),before);
});
test('cards escape content, explain matching and only open conditions',()=>{
 const html=setup().render({items:[{...items[0],title:'<script>',description:'<img>'}],members:[],user:'u',loadedAt:10,now:10,kindLabel:x=>x,refreshLabel:'Обновить'});
 assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;img&gt;/);
 assert.match(html,/data-home="openCoop"/);assert.doesNotMatch(html,/data-coop="join"/);
 assert.match(html,/aria-label="Обновить"/);
});
test('empty results differ from stale or offline data',()=>{
 const f=setup(),args={items:[],members:[],user:'u',loadedAt:10,now:10,kindLabel:x=>x};
 assert.match(f.render(args),/Пока нет совпадений/);
 for(const extra of [{now:60010},{online:false}]){
  const html=f.render({...args,...extra});assert.match(html,/данные устарели/);assert.doesNotMatch(html,/Пока нет совпадений/);
 }
});
test('all supported locale strings exist',()=>{
 for(const lang of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku'])for(let i=0;i<23;i++)assert.ok(setup(lang).text(i),`${lang}:${i}`);
});
