import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({globalThis:{},document:{documentElement:{lang:'ru'}}});
context.globalThis=context;
context.document=context.document;
context.FolkoopCore={LANGS:['sv','en','ru']};
vm.runInContext(await readFile('apps/web/network-mura-home.js','utf8'),context,{filename:'network-mura-home.js'});
const create=context.FolkoopMuraHome.create;

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);

function fixture(){
 const me={id:'me'};
 const profiles=[
  {id:'me',name:'Мура',city:'Göteborg',skills:'Фото',about:'Guide'},
  {id:'a',name:'Anna',skills:'Carpentry'},
  {id:'b',name:'Omar',skills:'Logistics'},
  {id:'c',name:'Linnea',skills:'Design'}
 ];
 const data={
  profile:profiles[0],
  directory:profiles,
  localDrafts:[
   {id:'d1',kind:'need',title:'Одолжить дрель',body:'Нужна дрель'},
   {id:'d2',kind:'offer',title:'Проверить резюме',body:'Могу помочь'}
  ],
  cooperations:[
   {id:'p',owner_id:'me',kind:'project',title:'Обмен растениями',description:'Проект',status:'active'},
   {id:'buy',owner_id:'a',kind:'purchase',title:'Дрова вместе',description:'Закупка',status:'active',unit:'m³'},
   {id:'n',owner_id:'me',kind:'need',title:'Нужен плиткорез',description:'Нужен инструмент',status:'open'},
   {id:'o',owner_id:'me',kind:'offer',title:'Помогу с фото',description:'Сфотографирую',status:'open'},
   {id:'r',owner_id:'a',kind:'resource',title:'Грузовой велосипед',description:'Ресурс',status:'open'}
  ],
  coopMembers:[
   {cooperation_id:'p',user_id:'me'},
   {cooperation_id:'p',user_id:'a'},
   {cooperation_id:'p',user_id:'c'}
  ],
  assignedTasks:[{id:'t',cooperation_id:'p',title:'Подтвердить стол',status:'todo'}],
  chatInbox:[{conversation_id:'g',unread_count:2},{conversation_id:'d',unread_count:1}],
  chats:[
   {id:'g',kind:'group',title:'Обмен растениями · чат'},
   {id:'d',kind:'direct',title:''}
  ],
  chatMembers:[
   {conversation_id:'d',user_id:'me'},
   {conversation_id:'d',user_id:'b'}
  ],
  chatMessages:[
   {conversation_id:'g',body:'Принесу инструменты'},
   {conversation_id:'d',body:'Помогу забрать дрова'}
  ],
  groups:[
   {id:'g1',name:'Соседи Olofstorp'},
   {id:'g2',name:'Языковой обмен Göteborg'}
  ],
  homePosts:[{body:'Ремонтное кафе в субботу',created_at:'2026-09-30T07:30:00Z'}],
  myConfirmations:[{cooperation_id:'buy',quantity:2}]
 };
 return {me,profiles,data};
}

function domain(f){
 return create({
  escape,
  getData:()=>f.data,
  getProfile:id=>f.profiles.find(p=>p.id===id),
  kindLabel:key=>key,
  statusLabel:key=>key,
  formatWhen:()=> 'WHEN'
 });
}

test('Mura Home is immersive, read-only and contains no registration CTA',()=>{
 const f=fixture(),html=domain(f).render(f.me);
 assert(html.includes('mura-home'));
 assert(html.includes('Маленькие идеи, которые превратились в реальные дела'));
 assert(html.includes('Обмен растениями'));
 assert(html.includes('Дрова вместе'));
 assert(html.includes('Anna'));
 assert(html.includes('Omar'));
 assert(html.includes('Одолжить дрель'));
 assert(html.includes('Проверить резюме'));
 assert(html.includes('Göteborg'));
 assert(!html.includes('register'));
 assert(!html.includes('signup'));
 assert(!html.includes('createCoop'));
 assert(!html.includes('netLogin'));
});

test('Mura Home only exposes safe deep-navigation hooks',()=>{
 const f=fixture(),html=domain(f).render(f.me);
 assert(html.includes('data-home="openCoop"'));
 assert(html.includes('data-home="openCommunity"'));
 assert(html.includes('data-net="openChat"'));
 assert(html.includes('href="#/people"'));
 assert(html.includes('href="#/messages"'));
 assert(html.includes('href="#/city"'));
 assert(html.includes('href="#/me"'));
});

test('Mura Home escapes account text at the presentation boundary',()=>{
 const f=fixture();
 f.data.profile.name='<script>x</script>';
 f.data.cooperations[0].title='<img src=x>';
 const html=domain(f).render(f.me);
 assert(!html.includes('<script>x</script>'));
 assert(!html.includes('<img src=x>'));
 assert(html.includes('&lt;script&gt;x&lt;/script&gt;'));
 assert(html.includes('&lt;img src=x&gt;'));
});
