import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({globalThis:{}});
context.globalThis=context;
vm.runInContext(await readFile('apps/web/network-profile.js','utf8'),context,{filename:'network-profile.js'});
const create=context.FolkoopNetworkProfile.create;

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);

function fixture(){
 const data={
  profile:{name:'Alice <b>x</b>',city:'Göteborg',skills:'Design <script>x</script>',about:'About <img src=x>',listed:true},
  localDrafts:[{id:'d1',kind:'need',title:'Borrow <b>drill</b>',body:'Need <script>x</script>',done:false}],
  blocks:[{target_id:'blocked-user'}]
 };
 const labels=key=>({
  profile:'Network profile',out:'Sign out',private:'Private profile',name:'Name',skills:'Skills',about:'About me',
  listed:'Listed',save:'Save',deleteProfile:'Delete profile',export:'Export',refresh:'Refresh',
  accountDelete:'Account deletion note',exportNote:'Export note',blocks:'Hidden participants',
  unblock:'Unblock',localTitle:'Local workspace'
 })[key]||key;
 const home=key=>({demoBadge:"Mura's place · learning example",demoCta:'Create my own place'})[key]||key;
 const shell=key=>({cityProfile:'My city',drafts:'My drafts',need:'Need',local:'Private draft'})[key]||key;
 const field=(name,label,value,max,area=false)=>area
  ?`<label>${escape(labels(label))}<textarea name="${name}" maxlength="${max}">${escape(value)}</textarea></label>`
  :`<label>${escape(labels(label))}<input name="${name}" maxlength="${max}" value="${escape(value)}"></label>`;
 const button=(action,key,id='')=>`<button data-net="${action}" data-id="${escape(id)}">${escape(labels(key))}</button>`;
 const renderActivityNotifications=()=>'<section data-activity>ACTIVITY</section>';
 return {data,labels,home,shell,field,button,renderActivityNotifications};
}

function domain(f){
 return create({
  escape,
  getData:()=>f.data,
  text:f.labels,
  homeText:f.home,
  shellText:f.shell,
  field:f.field,
  button:f.button,
  renderActivityNotifications:f.renderActivityNotifications
 });
}

test('profile domain exposes only render responsibility',()=>{
 assert.deepEqual(Object.keys(domain(fixture())),['render']);
});

test('signed-in profile rendering preserves form/action hooks and escapes profile text',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render({id:'me'});
 assert(html.includes('id="netProfile"'));
 assert(html.includes('name="listed" checked'));
 assert(html.includes('data-net="deleteProfile"'));
 assert(html.includes('data-net="export"'));
 assert(html.includes('data-net="refresh"'));
 assert(html.includes('data-net="unblock"'));
 assert(html.includes('data-id="blocked-user"'));
 assert(html.includes('data-activity'));
 assert(!html.includes('<script>x</script>'));
 assert(!html.includes('<img src=x>'));
 assert(html.includes('Alice &lt;b&gt;x&lt;/b&gt;'));
 assert(html.includes('Design &lt;script&gt;x&lt;/script&gt;'));
});

test('profile draft overrides loaded profile without mutating source state',()=>{
 const f=fixture(),d=domain(f);
 const draft={name:'Draft user',skills:'Draft skill',about:'Draft about',listed:false};
 const html=d.render({id:'me'},{profileDraft:draft});
 assert(html.includes('value="Draft user"'));
 assert(!html.includes('name="listed" checked'));
 assert.equal(f.data.profile.name,'Alice <b>x</b>');
});

test('guest profile renders the learning card without server mutation controls',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render({id:'demo'},{guestDemo:true});
 assert(html.includes('demo-profile-card'));
 assert(html.includes('Mura&#39;s place · learning example'));
 assert(!html.includes('data-demo="register"'));
 assert(html.includes('data-net="logout"'));
 assert(html.includes('data-activity'));
 assert(html.includes('My city'));
 assert(html.includes('Göteborg'));
 assert(html.includes('My drafts'));
 assert(html.includes('Borrow &lt;b&gt;drill&lt;/b&gt;'));
 assert(html.includes('Need &lt;script&gt;x&lt;/script&gt;'));
 assert(!html.includes('id="netProfile"'));
 assert(!html.includes('data-net="deleteProfile"'));
 assert(!html.includes('data-net="export"'));
 assert(!html.includes('data-net="unblock"'));
});

test('empty block list remains valid and does not invent placeholders',()=>{
 const f=fixture();f.data.blocks=[];
 const html=domain(f).render({id:'me'});
 assert(html.includes('Hidden participants'));
 assert(!html.includes('data-net="unblock"'));
});
