import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({globalThis:{}});
context.globalThis=context;
vm.runInContext(await readFile('apps/web/network-communities.js','utf8'),context,{filename:'network-communities.js'});
const create=context.FolkoopNetworkCommunities.create;

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);

function fixture(){
 const data={
  groups:[
   {id:'g1',owner_id:'me',name:'Garden <b>group</b>',description:'Shared <script>x</script>'},
   {id:'g2',owner_id:'other',name:'Tools',description:'Share tools'}
  ],
  memberships:[
   {community_id:'g1',user_id:'me',banned:false},
   {community_id:'g2',user_id:'me',banned:false}
  ],
  posts:[
   {id:'p1',author_id:'me',body:'My <img src=x> post'},
   {id:'p2',author_id:'other',body:'Other <script>x</script> post'}
  ]
 };
 const labels=key=>({
  groups:'Communities',refresh:'Refresh',out:'Sign out',desc:'Description',
  banned:'Banned',ownerDelete:'Delete group',leave:'Leave',join:'Join',
  back:'Back',post:'Post',publish:'Publish',members:'Members',own:'You',
  by:'Participant',delete:'Delete',report:'Report',block:'Block',ban:'Ban',
  newGroup:'Create community',name:'Name',description:'Description',create:'Create',
  open:'Open',empty:'Empty'
 })[key]||key;
 const field=(name,label,value,max,area=false)=>area
   ?`<label>${escape(labels(label))}<textarea name="${name}" maxlength="${max}">${escape(value)}</textarea></label>`
   :`<label>${escape(labels(label))}<input name="${name}" maxlength="${max}" value="${escape(value)}"></label>`;
 const button=(action,key,id='')=>`<button data-net="${action}" data-id="${escape(id)}">${escape(labels(key))}</button>`;
 return {data,labels,field,button};
}

function domain(f){
 return create({
  escape,
  getData:()=>f.data,
  text:f.labels,
  field:f.field,
  button:f.button
 });
}

test('communities domain exposes only render responsibility',()=>{
 assert.deepEqual(Object.keys(domain(fixture())),['render']);
});

test('community list preserves creation form, drafts and escaped group cards',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render({id:'me'},{groupDraft:{name:'Draft <x>',description:'Draft body'}});
 assert(html.includes('id="netGroup"'));
 assert(html.includes('value="Draft &lt;x&gt;"'));
 assert(html.includes('Garden &lt;b&gt;group&lt;/b&gt;'));
 assert(html.includes('Shared &lt;script&gt;x&lt;/script&gt;'));
 assert(html.includes('data-net="open"'));
 assert(!html.includes('<script>x</script>'));
});

test('owner community preserves delete, post moderation and escaped post bodies',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render({id:'me'},{selected:'g1',postDrafts:{g1:'Unsent <b>draft</b>'}});
 assert(html.includes('data-net="back"'));
 assert(html.includes('data-net="deleteGroup"'));
 assert(html.includes('id="netPost"'));
 assert(html.includes('Unsent &lt;b&gt;draft&lt;/b&gt;'));
 assert(html.includes('data-net="deletePost"'));
 assert(html.includes('data-net="report"'));
 assert(html.includes('data-net="block"'));
 assert(html.includes('data-net="ban"'));
 assert(html.includes('My &lt;img src=x&gt; post'));
 assert(html.includes('Other &lt;script&gt;x&lt;/script&gt; post'));
 assert(!html.includes('<img src=x>'));
 assert(!html.includes('<script>x</script>'));
});

test('ordinary member can leave but cannot delete group or ban participants',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render({id:'me'},{selected:'g2'});
 assert(html.includes('data-net="leave"'));
 assert(!html.includes('data-net="deleteGroup"'));
 assert(!html.includes('data-net="ban"'));
});

test('non-member sees join action and no publication form',()=>{
 const f=fixture();
 f.data.memberships=f.data.memberships.filter(m=>m.community_id!=='g2');
 const html=domain(f).render({id:'me'},{selected:'g2'});
 assert(html.includes('data-net="join"'));
 assert(!html.includes('id="netPost"'));
});

test('banned membership renders no join/leave/post controls',()=>{
 const f=fixture();
 f.data.memberships=f.data.memberships.map(m=>m.community_id==='g2'?{...m,banned:true}:m);
 const html=domain(f).render({id:'me'},{selected:'g2'});
 assert(html.includes('Banned'));
 assert(!html.includes('data-net="join"'));
 assert(!html.includes('data-net="leave"'));
 assert(!html.includes('id="netPost"'));
});


test('Mura communities stay read-only and omit creation/moderation chrome',()=>{
 const f=fixture(),d=domain(f);
 const list=d.render({id:'me'},{guestDemo:true});
 assert(!list.includes('id="netGroup"'));
 assert(!list.includes('data-net="logout"'));
 assert(!list.includes('data-net="refresh"'));
 assert(list.includes('data-net="open"'));
 const selected=d.render({id:'me'},{selected:'g1',guestDemo:true});
 assert(!selected.includes('id="netPost"'));
 assert(!selected.includes('data-net="deleteGroup"'));
 assert(!selected.includes('data-net="deletePost"'));
 assert(selected.includes('My &lt;img src=x&gt; post'));
});
