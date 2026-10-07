import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const ctx={document:{documentElement:{lang:'ru'}}};
ctx.globalThis=ctx;
vm.runInNewContext(readFileSync('apps/web/network-mura-life.js','utf8'),ctx);
const life=ctx.FolkoopMuraLife;
const me='mura';
const data={
 cooperations:[
  {id:'need',kind:'need',owner_id:me,status:'open',title:'Нужен плиткорез'},
  {id:'offer',kind:'offer',owner_id:me,status:'open',title:'Помогу с фото'},
  {id:'project',kind:'project',owner_id:me,status:'active',title:'Обмен растениями'},
  {id:'purchase',kind:'purchase',owner_id:'anna',status:'active',title:'Дрова вместе'},
  {id:'done',kind:'need',owner_id:me,status:'done',title:'Вернула лестницу'}
 ],
 chats:[{id:'chat',kind:'group',title:'Чат обмена растениями'}],
 localDrafts:[{id:'draft',title:'Хочу сделать полку'}]
};
test('nine chapters form an account narrative linked to real authored objects',()=>{
 const html=life.render({data,userId:me,language:'ru'});
 assert.equal((html.match(/data-mura-chapter=/g)||[]).length,9);
 assert.match(html,/Заглянуть/);
 assert.match(html,/Нужен плиткорез/);
 assert.match(html,/data-home="openCoop" data-id="project"/);
 assert.match(html,/data-net="openChat" data-id="chat"/);
 assert.match(html,/href="#\/people"/);
 assert.match(html,/href="#\/city"/);
 assert.match(html,/href="#\/me"/);
 for(const banned of ['демо','прототип','учебн','зарегистр','пилот','псевдо'])assert(!html.toLowerCase().includes(banned),banned);
 assert(!/data-net="create|data-home="create|api\/|auth\/v1/.test(html));
});
test('all eleven existing languages have complete first-person story copy',()=>{
 for(const language of ['ru','en','sv','es','uk','fi','bs','ar','fa','so','ku']){
  const copy=life.copyFor(language);
  assert.equal(copy.length,12,language);
  for(const part of copy){if(Array.isArray(part)){assert.equal(part.length,2);assert.ok(part[0].length>1,language+' heading');assert.ok(part[1].length>25,language+' personal voice');}else assert.ok(part.length>2,language);}
  const html=life.render({data,userId:me,language});
  assert.equal((html.match(/data-mura-chapter=/g)||[]).length,9,language);
 }
});
test('no orphan stories or false completed claims if linked object is missing',()=>{
 const html=life.render({data:{cooperations:[],chats:[],localDrafts:[]},userId:me,language:'ru'});
 assert.equal((html.match(/data-mura-chapter=/g)||[]).length,2);
 assert(!html.includes('data-mura-chapter="outcome"'));
 assert(!html.includes('data-mura-chapter="purchase"'));
});
test('user text and attributes are escaped at all link boundaries',()=>{
 const unsafe={...data,cooperations:[{id:'<script>',kind:'need',owner_id:me,status:'open',title:'<img src=x onerror=alert(1)>'}]};
 const html=life.render({data:unsafe,userId:me,language:'ru'});
 assert(!html.includes('<script>'));
 assert(!html.includes('<img src=x'));
 assert(html.includes('&lt;img'));
 assert(html.includes('data-id="&lt;script&gt;"'));
});
test('Mura story uses only pre-existing target kinds and never creates state',()=>{
 assert.equal(life.keys.length,9);
 assert(Object.isFrozen(life));
 const src=readFileSync('apps/web/network-mura-life.js','utf8');
 assert.doesNotMatch(src,/fetch\s*\(|localStorage|sessionStorage|sendMessage|createProject|updateCooperation|saveAvailability/);
});
