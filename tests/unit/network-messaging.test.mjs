import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({globalThis:{}});
context.globalThis=context;
vm.runInContext(await readFile('apps/web/network-messaging.js','utf8'),context,{filename:'network-messaging.js'});
const create=context.FolkoopNetworkMessaging.create;

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[ch]);

function fixture(){
 const user={id:'me'};
 const other={id:'other',name:'Bob <img src=x>'};
 const group={id:'g1',kind:'group',title:'Group <b>X</b>',owner_id:'me'};
 const direct={id:'d1',kind:'direct',title:'',owner_id:'me'};
 const linked={id:'w1',kind:'group',title:'Work',owner_id:'me'};
 const data={
  chats:[group,direct,linked],
  chatMembers:[
   {conversation_id:'g1',user_id:'me'},{conversation_id:'g1',user_id:'other'},
   {conversation_id:'d1',user_id:'me'},{conversation_id:'d1',user_id:'other'},
   {conversation_id:'w1',user_id:'me'},{conversation_id:'w1',user_id:'other'}
  ],
  chatInvites:[{conversation_id:'g1',user_id:'third'}],
  coopChats:[{conversation_id:'w1',cooperation_id:'coop1'}],
  directory:[user,other,{id:'third',name:'Cara'}],
  chatMessages:[
   {id:'m1',author_id:'other',body:'Hello <script>x</script>',created_at:'2026-10-02T10:00:00Z'}
  ],
  chatInbox:[
   {conversation_id:'g1',unread_count:2},
   {conversation_id:'d1',unread_count:1},
   {conversation_id:'w1',unread_count:3}
  ]
 };
 const profiles=new Map(data.directory.map(p=>[p.id,p]));
 const general=key=>({refresh:'Refresh',out:'Sign out',denied:'Denied',empty:'Empty',create:'Create',open:'Open',accept:'Accept',decline:'Decline',delete:'Delete',report:'Report',block:'Block',back:'Back'})[key]||key;
 const chat=key=>({
  messagesTitle:'Messages',messagesDesc:'Desc',conversation:'Conversation',direct:'Direct',
  groupChat:'Group chat',choosePerson:'Choose person',startDirect:'Start direct',
  newGroupChat:'New group',groupTitle:'Group title',chooseMembers:'Choose members',
  invitations:'Invitations',invitePending:'Pending',noChats:'No chats',noPeople:'No people',
  membersList:'Participants',you:'You',removeMember:'Remove member',invite:'Invite',
  message:'Message',sendMessage:'Send',notEncrypted:'Not encrypted',deleteChat:'Delete chat',
  leaveChat:'Leave chat'
 })[key]||key;
 const activity=key=>({workChat:'Work chat',managedChat:'Managed chat',openActivity:'Open activity',linkedChat:'Linked chat'})[key]||key;
 const networkButton=(action,key,id='')=>`<button data-net="${action}" data-id="${escape(id)}">${escape(general(key)||chat(key))}</button>`;
 const activityButton=(action,key,id='')=>`<button data-coop="${action}" data-id="${escape(id)}">${escape(activity(key))}</button>`;
 return {user,data,profiles,general,chat,activity,networkButton,activityButton};
}

function domain(f){
 return create({
  escape,
  getData:()=>f.data,
  getProfile:id=>f.profiles.get(id),
  generalText:f.general,
  chatText:f.chat,
  activityText:f.activity,
  formatWhen:()=> 'WHEN',
  networkButton:f.networkButton,
  activityButton:f.activityButton
 });
}

test('messaging domain exposes only label and render responsibilities',()=>{
 const d=domain(fixture());
 assert.deepEqual(Object.keys(d).sort(),['chatLabel','render']);
});

test('direct chat label resolves the other participant without mutating state',()=>{
 const f=fixture(),d=domain(f);
 assert.equal(d.chatLabel(f.data.chats.find(x=>x.id==='d1'),f.user),'Bob <img src=x>');
 assert.equal(f.data.chatMembers.length,6);
});

test('chat rendering preserves action hooks and escapes user/server text',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render(f.user,{
  selectedChat:'g1',
  messageDrafts:{g1:'Draft <b>text</b>'},
  inviteTarget:'third',
  guestDemo:false
 });
 assert(html.includes('data-net="backChats"'));
 assert(html.includes('data-net="removeChatMember"'));
 assert(html.includes('data-net="deleteMessage"')||html.includes('data-net="reportMessage"'));
 assert(!html.includes('<script>x</script>'));
 assert(!html.includes('Group <b>X</b>'));
 assert(html.includes('Group &lt;b&gt;X&lt;/b&gt;'));
 assert(html.includes('Hello &lt;script&gt;x&lt;/script&gt;'));
 assert(html.includes('Draft &lt;b&gt;text&lt;/b&gt;'));
});

test('linked work chat remains visibly linked and cannot render membership management controls',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render(f.user,{selectedChat:'w1'});
 assert(html.includes('Work chat'));
 assert(html.includes('Managed chat'));
 assert(html.includes('data-coop="openNotify"'));
 assert(!html.includes('data-net="removeChatMember"'));
 assert(!html.includes('id="netChatInvite"'));
});

test('default Messages view is browse-first and keeps creation behind explicit modes',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render(f.user,{view:'messages-chats'});
 assert(html.includes('class="messages-hub"'));
 assert(html.includes('id="networkMessageSearch"'));
 assert(html.includes('data-message-kind="direct"'));
 assert(html.includes('data-message-kind="group"'));
 assert(html.includes('data-message-kind="work"'));
 assert(!html.includes('id="netDirect"'));
 assert(!html.includes('id="netNewChat"'));
 assert(html.includes('data-subsection="messages-direct"'));
 assert(html.includes('data-subsection="messages-groups"'));
});

test('message cards expose direct group and linked-work types without changing chat ownership',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render(f.user,{view:'messages-chats'});
 assert(html.includes('data-message-type="direct"'));
 assert(html.includes('data-message-type="group"'));
 assert(html.includes('data-message-type="work"'));
 assert(html.includes('Linked chat'));
});

test('message subsection rendering preserves direct/groups/invitations separation',()=>{
 const f=fixture(),d=domain(f);
 const direct=d.render(f.user,{view:'messages-direct',directTarget:'other'});
 const groups=d.render(f.user,{view:'messages-groups',chatDraft:{title:'Draft group',members:['other']}});
 const invites=d.render(f.user,{view:'messages-invites'});
 assert(direct.includes('id="netDirect"'));
 assert(!direct.includes('id="netNewChat"'));
 assert(groups.includes('id="netNewChat"'));
 assert(!groups.includes('id="netDirect"'));
 assert(invites.includes('Invitations'));
 assert(!invites.includes('id="netDirect"'));
 assert(!invites.includes('id="netNewChat"'));
});

test('guest demo marker stays limited to linked cooperation chats',()=>{
 const f=fixture(),d=domain(f);
 const html=d.render(f.user,{view:'messages-chats',guestDemo:true});
 const matches=[...html.matchAll(/data-demo-story="chat"/g)];
 assert.equal(matches.length,1);
});


test('Mura messaging omits technical and creation chrome while keeping conversations explorable',()=>{
 const f=fixture(),d=domain(f);
 const list=d.render(f.user,{view:'messages-chats',guestDemo:true});
 assert(!list.includes('id="netDirect"'));
 assert(!list.includes('id="netNewChat"'));
 assert(!list.includes('Not encrypted'));
 assert(list.includes('data-net="openChat"'));
 const chat=d.render(f.user,{selectedChat:'w1',guestDemo:true});
 assert(!chat.includes('Not encrypted'));
 assert(!chat.includes('Managed chat'));
 assert(!chat.includes('id="netMessage"'));
 assert(chat.includes('data-coop="openNotify"'));
});

test('one joined conversation produces one overview card even if linked to work',()=>{
 const f=fixture(),html=domain(f).render(f.user,{view:'messages-chats'});
 const types=[...html.matchAll(/data-message-card data-message-type="([^"]+)"/g)].map(match=>match[1]).sort();
 assert.deepEqual(types,['direct','group','work']);
 assert.equal((html.match(/data-net="openChat"/g)||[]).length,3);
 assert(!html.includes('id="netDirect"'));
 assert(!html.includes('id="netNewChat"'));
});

test('invitations heading has stable focus target for keyboard navigation',()=>{
 const f=fixture(),html=domain(f).render(f.user,{view:'messages-invites'});
 assert(html.includes('<h3 id="messagesInvitationHeading">'));
 assert(!html.includes('id="netDirect"'));
 assert(!html.includes('id="netNewChat"'));
});
