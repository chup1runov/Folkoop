import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({globalThis:{}});
context.globalThis=context;
vm.runInContext(await readFile('apps/web/network-home.js','utf8'),context,{filename:'network-home.js'});
const create=context.FolkoopNetworkHome.create;

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);

function fixture(view='home'){
 const data={
  chatInbox:[{unread_count:2}],
  chatInvites:[{user_id:'me'}],
  myConfirmations:[],
  allProcesses:[],
  cooperations:[
   {id:'c1',kind:'need',title:'Need <b>x</b>',status:'active',location_text:'Göteborg <script>x</script>',created_at:'2026-10-01T10:00:00Z',updated_at:'2026-10-02T10:00:00Z'}
  ],
  assignedTasks:[{id:'t1',cooperation_id:'c1',title:'Task <img src=x>',status:'todo'}],
  activityInbox:[{cooperation_id:'c1',cooperation_title:'Need <b>x</b>',unread_count:3,last_activity_at:'2026-10-03T10:00:00Z',last_actor_id:'other',last_event_type:'task_updated',last_label:'todo'}],
  coopMembers:[{cooperation_id:'c1',user_id:'me'}],
  homePosts:[{id:'p1',community_id:'g1',author_id:'other',body:'Post <script>x</script>',created_at:'2026-10-03T09:00:00Z'}],
  groups:[{id:'g1',name:'Group <b>x</b>'}]
 };
 const profiles={other:{id:'other',name:'Bob <script>x</script>'}};
 const homeText=key=>({
  deadline:'Deadline',messages:'Messages',invitations:'Invitations',activity:'Activity',task:'Task',
  confirmation:'Confirmation',open:'Open',daily:'Daily',caughtUp:'Caught up',why:'Why',
  nextStep:'Next step',communityPost:'Community post',from:'From',title:'Home',
  subtitle:'Do the next useful thing',myWork:'My work',noFeed:'Nothing here',
  attention:'Attention',nothingUrgent:'Nothing urgent',quick:'Quick actions',need:'Need',
  offer:'Offer',purchase:'Purchase',project:'Project',community:'Community',city:'City',
  feed:'Feed',feedEnd:'End of feed'
 })[key]||key;
 const domain=create({
  escape,
  getData:()=>data,
  getProfile:id=>profiles[id],
  generalText:key=>({by:'Participant',groups:'Communities',refresh:'Refresh'})[key]||key,
  cooperationText:key=>({todo:'To do'})[key]||key,
  homeText,
  activityLabel:()=> 'Bob updated task',
  kindLabel:key=>key==='need'?'Need':key,
  statusLabel:key=>key==='active'?'Active':key,
  formatWhen:()=> 'WHEN',
  button:(action,key)=>`<button data-net="${action}">${key}</button>`,
  getView:()=>view
 });
 return {data,domain};
}

test('signed-in home domain exposes only render responsibility',()=>{
 assert.deepEqual(Object.keys(fixture().domain),['render']);
});

test('overview preserves attention priority, cooperation hooks and escaping',()=>{
 const html=fixture('home').domain.render({id:'me'});
 assert(html.includes('data-home-view="home"'));
 assert(html.includes('data-net="refresh"'));
 assert(html.includes('data-home="openCoop"'));
 assert(html.includes('Task &lt;img src=x&gt;'));
 assert(!html.includes('<img src=x>'));
 assert(!html.includes('<script>x</script>'));
 assert(html.includes('Need &lt;b&gt;x&lt;/b&gt;'));
});

test('attention view renders message and invite routes without inventing server actions',()=>{
 const html=fixture('home-attention').domain.render({id:'me'});
 assert(html.includes('data-home-view="home-attention"'));
 assert(html.includes('href="#/messages"'));
 assert(html.includes('Messages · 2'));
 assert(html.includes('Invitations · 1'));
});

test('quick actions preserve established cooperation and navigation hooks',()=>{
 const html=fixture('home-actions').domain.render({id:'me'});
 for(const kind of ['need','offer','purchase','project'])assert(html.includes(`data-kind="${kind}"`));
 assert(html.includes('href="#/communities"'));
 assert(html.includes('href="#/city"'));
});

test('feed escapes community and post data and keeps activity/community navigation',()=>{
 const html=fixture('home-feed').domain.render({id:'me'});
 assert(html.includes('data-home="openCommunity"'));
 assert(html.includes('data-home="openCoop"'));
 assert(html.includes('Group &lt;b&gt;x&lt;/b&gt;'));
 assert(html.includes('Post &lt;script&gt;x&lt;/script&gt;'));
 assert(!html.includes('<script>x</script>'));
 assert(html.includes('Bob updated task'));
});

test('empty home remains a valid caught-up state',()=>{
 const f=fixture('home');
 for(const key of ['chatInbox','chatInvites','myConfirmations','allProcesses','cooperations','assignedTasks','activityInbox','coopMembers','homePosts','groups'])f.data[key]=[];
 const html=f.domain.render({id:'me'});
 assert(html.includes('Caught up'));
 assert(html.includes('Nothing here'));
});
