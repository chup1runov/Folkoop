import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({globalThis:{}});
context.globalThis=context;
vm.runInContext(await readFile('apps/web/network-activity.js','utf8'),context,{filename:'network-activity.js'});
const create=context.FolkoopNetworkActivity.create;

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);

function fixture(){
 const data={
  chatInbox:[{unread_count:2},{unread_count:'1'}],
  chatInvites:[{user_id:'me'},{user_id:'other'}],
  activityInbox:[
   {cooperation_id:'n1',cooperation_kind:'need',cooperation_title:'Need <b>x</b>',unread_count:3,last_activity_at:'2026-10-02T10:00:00Z',last_event_type:'task_updated',last_actor_id:'other',last_label:'todo'},
   {cooperation_id:'p1',cooperation_kind:'project',cooperation_title:'Project',unread_count:4,last_activity_at:'2026-10-02T11:00:00Z',last_event_type:'confirmation_changed',last_actor_id:'me',last_label:'confirmed'}
  ]
 };
 const profiles={other:{id:'other',name:'Bob <script>x</script>'}};
 const labels={
  activity:key=>({notifications:'Activity notifications',recentActivity:'Recent activity',noActivity:'No activity',unread:'unread',task_updated:'updated task',confirmation_changed:'changed confirmation',activity:'Activity'})[key]||key,
  lifecycle:key=>({confirmed:'Confirmed',collected:'Collected',notCollected:'Not collected'})[key]||key,
  chat:key=>({you:'You'})[key]||key,
  cooperation:key=>({noProfile:'Participant'})[key]||key
 };
 return {data,profiles,labels};
}

test('activity domain exposes a narrow explicit API and computes badge counts',()=>{
 const {data,profiles,labels}=fixture();
 const domain=create({
  escape,
  getData:()=>data,
  getCurrentUser:()=>({id:'me'}),
  getProfile:id=>profiles[id],
  activityText:labels.activity,
  lifecycleText:labels.lifecycle,
  chatText:labels.chat,
  cooperationText:labels.cooperation,
  kindLabel:key=>key,
  formatWhen:()=> 'WHEN',
  button:()=>'<button>Open</button>',
  documentRef:{}
 });
 assert.deepEqual(JSON.parse(JSON.stringify(domain.counts())),{messages:4,together:3,projects:4});
 assert.deepEqual(Object.keys(domain).sort(),['activityLabel','counts','renderNotifications','syncBadges']);
});

test('activity labels preserve actor and lifecycle semantics',()=>{
 const {data,profiles,labels}=fixture();
 const domain=create({
  escape,getData:()=>data,getCurrentUser:()=>({id:'me'}),getProfile:id=>profiles[id],
  activityText:labels.activity,lifecycleText:labels.lifecycle,chatText:labels.chat,
  cooperationText:labels.cooperation,kindLabel:key=>key,formatWhen:()=> 'WHEN',
  button:()=>'<button>Open</button>',documentRef:{}
 });
 assert.equal(
  domain.activityLabel({actor_id:'me',event_type:'confirmation_changed',label:'confirmed'}),
  'You changed confirmation · Confirmed'
 );
 assert.equal(
  domain.activityLabel({actor_id:'other',event_type:'collection_changed',label:'collected'}),
  'Bob <script>x</script> collection_changed · Collected'
 );
});

test('activity renderer escapes server text and keeps the existing action hook',()=>{
 const {data,profiles,labels}=fixture();
 const domain=create({
  escape,getData:()=>data,getCurrentUser:()=>({id:'me'}),getProfile:id=>profiles[id],
  activityText:labels.activity,lifecycleText:labels.lifecycle,chatText:labels.chat,
  cooperationText:labels.cooperation,kindLabel:key=>key,formatWhen:()=> 'WHEN',
  button:(action,key,id)=>`<button data-coop="${action}" data-id="${id}">${key}</button>`,
  documentRef:{}
 });
 const html=domain.renderNotifications({id:'me'});
 assert(!html.includes('<script>x</script>'));
 assert(!html.includes('Need <b>x</b>'));
 assert(html.includes('Bob &lt;script&gt;x&lt;/script&gt;'));
 assert(html.includes('Need &lt;b&gt;x&lt;/b&gt;'));
 assert(html.includes('data-coop="openNotify"'));
 assert(html.includes('data-id="n1"'));
});

test('badge sync writes only the four established navigation badges',()=>{
 const {data,profiles,labels}=fixture();
 const made=[];
 const element=()=>({
  badges:[],
  querySelectorAll(){return this.badges;},
  append(node){this.badges.push(node);}
 });
 const messageLink=element(),messages=element(),together=element(),projects=element();
 const documentRef={
  createElement(){const node={className:'',textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v;},remove(){}};made.push(node);return node;},
  getElementById(id){return id==='messageLink'?messageLink:null;},
  querySelector(selector){
   return selector.includes('messages')?messages:selector.includes('together')?together:selector.includes('projects')?projects:null;
  }
 };
 const domain=create({
  escape,getData:()=>data,getCurrentUser:()=>({id:'me'}),getProfile:id=>profiles[id],
  activityText:labels.activity,lifecycleText:labels.lifecycle,chatText:labels.chat,
  cooperationText:labels.cooperation,kindLabel:key=>key,formatWhen:()=> 'WHEN',
  button:()=>'',documentRef
 });
 const counts=domain.syncBadges();
 assert.equal(counts.messages,4);
 assert.equal(messageLink.badges[0].textContent,'4');
 assert.equal(messages.badges[0].textContent,'4');
 assert.equal(together.badges[0].textContent,'3');
 assert.equal(projects.badges[0].textContent,'4');
 assert.equal(made.length,4);
});
