// Bounded intent selection and evidence-based contribution loop.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const setup=(lang='ru')=>{const c={document:{documentElement:{lang}}};vm.runInNewContext(readFileSync('apps/web/network-discovery.js','utf8'),c);vm.runInNewContext(readFileSync('apps/web/network-shared-progress.js','utf8'),c);vm.runInNewContext(readFileSync('apps/web/network-for-you.js','utf8'),c);return c.FolkoopForYou;};
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
 assert.equal(f.select(Array.from({length:10},(_,i)=>({...items[0],id:String(i)})),'browse','u',[]).length,3);
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

test('continuations trust server unread count even if the latest event is own',()=>{
 const f=setup(),row={cooperation_id:'a',unread_count:1,last_actor_id:'other',last_activity_at:'2026-11-09'};
 const inbox=[row,{...row,cooperation_id:'b'},{...row,last_actor_id:'u'},{...row,unread_count:0},{...row,last_actor_id:null}];
 assert.equal(f.continuations(inbox,[{cooperation_id:'a',user_id:'u'}],'u').length,3);
});
test('result comes only from own project update; later update is not called consent',()=>{
 const f=setup(),coop=items[0],args={coop,user:'u',member:true,loadedAt:10,now:10,updates:[]};
 assert.match(f.journey(args),/netForYouContribution/);
 const own={cooperation_id:'a',author_id:'u',body:'<idea>',created_at:'2026-11-09T10:00:00Z'};
 assert.match(f.journey({...args,updates:[own]}),/Твоё предложение в проекте/);
 assert.match(f.journey({...args,updates:[own]}),/&lt;idea&gt;/);
 assert.match(f.journey({...args,updates:[own]}),/ещё не согласие/);
 assert.doesNotMatch(f.journey({...args,updates:[{...own,author_id:'else'}]}),/Твоё предложение в проекте/);
 assert.doesNotMatch(f.journey({...args,updates:[{...own,cooperation_id:'b'}]}),/Твоё предложение в проекте/);
 const reply={...own,author_id:'other',body:'<reply>',created_at:'2026-11-09T11:00:00Z'};
 assert.match(f.journey({...args,updates:[own,reply]}),/&lt;reply&gt;/);
 for(const override of [{member:false},{online:false},{pending:true},{now:60010},{coop:{...coop,status:'done'}}])assert.doesNotMatch(f.journey({...args,...override}),/netForYouContribution/);
});
test('Mura practice is labelled, local and never offers a network form',()=>{
 for(let sample=0;sample<3;sample++){
  const html=setup().journey({coop:items[0],user:'u',member:true,demo:true,sample});
  assert.match(html,/ничего не отправляется/);assert.doesNotMatch(html,/<form|data-coop="join"/);
 }
});
test('partial discovery data is not presented as an empty catalogue',()=>{
 const html=setup().render({items:[],members:[],user:'u',loadedAt:10,now:10,available:false,kindLabel:x=>x});
 assert.match(html,/данные устарели/);assert.doesNotMatch(html,/Пока нет совпадений/);
});
test('all loop labels exist across eleven locales',()=>{
 for(const lang of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku'])for(let i=0;i<24;i++)assert.ok(setup(lang).flowText(i),`${lang}:${i}`);
});

test('a later task or membership event is also a continuation',()=>{
 const f=setup(),coop=items[0],own={cooperation_id:'a',author_id:'u',body:'idea',created_at:'2026-11-09T10:00:00Z'};
 const event={cooperation_id:'a',actor_id:'other',label:'New task',created_at:'2026-11-09T11:00:00Z'};
 const html=f.journey({coop,user:'u',member:true,updates:[own],activity:[event],loadedAt:10,now:10});
 assert.match(html,/New task/);assert.match(html,/aria-current="step">Продолжение/);
 assert.equal(f.progress({coop,user:'u',updates:[own],activity:[{...event,actor_id:'u'}]}).event,undefined);
});

test('continuation gives a milestone reason only for an unread other-person event',()=>{
 const f=setup(),event={cooperation_id:'a',cooperation_title:'Swedish',unread_count:1,last_actor_id:'other',last_event_type:'task_verified'},args={items:[],members:[{cooperation_id:'a',user_id:'u'}],user:'u',loadedAt:10,now:10,kindLabel:x=>x,inbox:[event]};
 assert.match(f.render(args),/Подтверждён результат задачи/);
 for(const override of [{last_actor_id:'u'},{unread_count:0},{cooperation_id:'else'}])assert.doesNotMatch(f.render({...args,inbox:[{...event,...override}]}),/Подтверждён результат задачи/);
 assert.ok(f.render({...args,inbox:[{...event,last_actor_id:'u'}]}).includes(f.flowText(22)));
});
