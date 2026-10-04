/* Messaging presentation domain for the network UI.
   RPC execution, authorization and state ownership stay in network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  getProfile,
  generalText,
  chatText,
  activityText,
  formatWhen,
  networkButton,
  activityButton
}){
  if(typeof escape!=='function'||typeof getData!=='function'||typeof getProfile!=='function'){
    throw new Error('FOLKOOP_NETWORK_MESSAGING_DEPENDENCIES');
  }

  function chatLabel(chat,user){
    if(!chat)return chatText('conversation');
    if(chat.kind==='group')return chat.title;
    const data=getData()||{};
    const members=Array.isArray(data.chatMembers)?data.chatMembers:[];
    const other=members.find(member=>member.conversation_id===chat.id&&member.user_id!==user?.id);
    return getProfile(other?.user_id)?.name||chatText('direct');
  }

  function render(user,state={}){
    const data=getData()||{};
    const chats=Array.isArray(data.chats)?data.chats:[];
    const chatMembers=Array.isArray(data.chatMembers)?data.chatMembers:[];
    const chatInvites=Array.isArray(data.chatInvites)?data.chatInvites:[];
    const coopChats=Array.isArray(data.coopChats)?data.coopChats:[];
    const directory=Array.isArray(data.directory)?data.directory:[];
    const chatMessages=Array.isArray(data.chatMessages)?data.chatMessages:[];
    const chatInbox=Array.isArray(data.chatInbox)?data.chatInbox:[];
    const {
      selectedChat=null,
      directTarget='',
      chatDraft={title:'',members:[]},
      inviteTarget='',
      messageDrafts={},
      guestDemo=false,
      view='messages-chats'
    }=state;

    const chat=chats.find(item=>item.id===selectedChat);
    const ownMember=chat&&chatMembers.find(member=>member.conversation_id===chat.id&&member.user_id===user.id);
    const ownInvite=chat&&chatInvites.find(invite=>invite.conversation_id===chat.id&&invite.user_id===user.id);
    const linked=chat&&coopChats.find(item=>item.conversation_id===chat.id);
    const discoverable=directory.filter(profile=>profile.id!==user.id);

    let html=`<div class="row"><div><h2>${escape(chatText('messagesTitle'))}</h2><p class="meta">${escape(chatText('messagesDesc'))}</p></div>${guestDemo?'':`<div>${networkButton('refresh','refresh')}${networkButton('logout','out')}</div>`}</div>`;

    if(chat){
      html+=`<button class="button secondary" type="button" data-net="backChats">${escape(chatText('conversation'))}</button><article class="card"><div class="row"><h2>${escape(chatLabel(chat,user))}</h2>${linked?`<span class="badge">${escape(activityText('workChat'))}</span>`:''}</div>${!guestDemo&&chatText('notEncrypted')?`<p class="meta">${escape(chatText('notEncrypted'))}</p>`:''}`;
      if(linked)html+=`${guestDemo?'':`<p class="meta">${escape(activityText('managedChat'))}</p>`}<div class="actions">${activityButton('openNotify','openActivity',linked.cooperation_id)}</div>`;
      if(ownInvite&&!ownMember){
        html+=`<div class="actions">${networkButton('acceptChat','accept',chat.id)}${networkButton('declineChat','decline',chat.id)}</div></article>`;
        return html;
      }
      if(!ownMember){
        html+=`<p>${escape(generalText('denied'))}</p></article>`;
        return html;
      }

      const members=chatMembers.filter(member=>member.conversation_id===chat.id);
      html+=`<h3>${escape(chatText('membersList'))}</h3><div class="stack">${members.map(member=>{
        const profile=getProfile(member.user_id);
        const name=member.user_id===user.id?chatText('you'):(profile?.name||member.user_id.slice(0,8));
        const remove=!linked&&chat.kind==='group'&&chat.owner_id===user.id&&member.user_id!==user.id
          ?networkButton('removeChatMember','removeMember',member.user_id):'';
        return `<div class="row"><span>${escape(name)}</span>${remove}</div>`;
      }).join('')}</div></article>`;

      if(!guestDemo&&!linked&&chat.kind==='group'&&chat.owner_id===user.id){
        const existing=new Set(members.map(member=>member.user_id).concat(
          chatInvites.filter(invite=>invite.conversation_id===chat.id).map(invite=>invite.user_id)
        ));
        const candidates=discoverable.filter(profile=>!existing.has(profile.id));
        html+=`<form id="netChatInvite" class="editor card"><label>${escape(chatText('choosePerson'))}<select name="user" required><option value="">—</option>${candidates.map(profile=>`<option value="${escape(profile.id)}"${profile.id===inviteTarget?' selected':''}>${escape(profile.name)}</option>`).join('')}</select></label><button class="button">${escape(chatText('invite'))}</button></form>`;
      }

      html+=`<section class="chat-messages">${chatMessages.map(message=>{
        const profile=getProfile(message.author_id);
        const mine=message.author_id===user.id;
        const canDelete=mine||(chat.kind==='group'&&chat.owner_id===user.id);
        return `<article class="card"><small>${escape(mine?chatText('you'):(profile?.name||message.author_id.slice(0,8)))}</small><p style="white-space:pre-wrap">${escape(message.body)}</p><p class="meta">${escape(formatWhen(message.created_at))}</p><div class="actions">${canDelete?networkButton('deleteMessage','delete',message.id):''}${!mine?networkButton('reportMessage','report',message.id)+networkButton('block','block',message.author_id):''}</div></article>`;
      }).join('')||`<div class="empty"><p>${escape(generalText('empty'))}</p></div>`}</section>`;

      if(!guestDemo)html+=`<form id="netMessage" class="editor card"><label>${escape(chatText('message'))}<textarea name="body" maxlength="4000" rows="3" required>${escape(messageDrafts[chat.id]||'')}</textarea></label><button class="button">${escape(chatText('sendMessage'))}</button></form>`;
      if(!guestDemo&&!linked&&chat.kind==='group'){
        html+=`<div class="actions">${chat.owner_id===user.id?networkButton('deleteChat','deleteChat',chat.id):networkButton('leaveChat','leaveChat',chat.id)}</div>`;
      }
      return html;
    }

    const invitations=chatInvites
      .filter(invite=>invite.user_id===user.id)
      .map(invite=>chats.find(chatItem=>chatItem.id===invite.conversation_id))
      .filter(Boolean);
    const joined=chats.filter(chatItem=>chatMembers.some(member=>member.conversation_id===chatItem.id&&member.user_id===user.id));

    const directForm=`<form id="netDirect" class="editor card"><h3>${escape(chatText('direct'))}</h3><label>${escape(chatText('choosePerson'))}<select name="other" required><option value="">—</option>${discoverable.map(profile=>`<option value="${escape(profile.id)}"${profile.id===directTarget?' selected':''}>${escape(profile.name)}</option>`).join('')}</select></label><button class="button">${escape(chatText('startDirect'))}</button><p class="meta">${discoverable.length?'':escape(chatText('noPeople'))}</p></form>`;

    const groupForm=`<form id="netNewChat" class="editor card"><h3>${escape(chatText('newGroupChat'))}</h3><label>${escape(chatText('groupTitle'))}<input name="title" maxlength="80" required value="${escape(chatDraft.title||'')}"></label><fieldset><legend>${escape(chatText('chooseMembers'))}</legend>${discoverable.map(profile=>`<label class="checkbox"><input type="checkbox" name="members" value="${escape(profile.id)}"${(chatDraft.members||[]).includes(profile.id)?' checked':''}> <span>${escape(profile.name)}</span></label>`).join('')||`<p class="meta">${escape(chatText('noPeople'))}</p>`}</fieldset><button class="button" ${discoverable.length?'':'disabled'}>${escape(generalText('create'))}</button></form>`;

    const invitationView=`<h3>${escape(chatText('invitations'))}</h3><div class="draft-grid">${invitations.map(chatItem=>`<article class="card"><h3>${escape(chatLabel(chatItem,user))}</h3><span class="badge">${escape(chatText('invitePending'))}</span><div class="actions">${networkButton('openChat','open',chatItem.id)}${networkButton('acceptChat','accept',chatItem.id)}${networkButton('declineChat','decline',chatItem.id)}</div></article>`).join('')||`<div class="empty"><p>${escape(chatText('noChats'))}</p></div>`}</div>`;

    const cards=list=>`${guestDemo?'':`<h3>${escape(chatText('conversation'))}</h3>`}<div class="draft-grid mura-chat-grid">${list.map(chatItem=>{
      const unread=Number(chatInbox.find(item=>item.conversation_id===chatItem.id)?.unread_count||0);
      const link=coopChats.find(item=>item.conversation_id===chatItem.id);
      const preview=[...chatMessages].filter(message=>message.conversation_id===chatItem.id).sort((a,b)=>Date.parse(b.created_at||0)-Date.parse(a.created_at||0))[0];
      return `<article class="card mura-chat-card"${guestDemo&&link?' data-demo-story="chat"':''}><div class="row"><h3>${escape(chatLabel(chatItem,user))}</h3>${unread?`<span class="net-count">${escape(String(unread))}</span>`:''}</div><p class="meta">${escape(link?activityText('linkedChat'):(chatItem.kind==='group'?chatText('groupChat'):chatText('direct')))}</p>${guestDemo&&preview?`<p class="mura-chat-preview">${escape(preview.body)}</p>`:''}${networkButton('openChat','open',chatItem.id)}</article>`;
    }).join('')||`<div class="empty"><p>${escape(chatText('noChats'))}</p></div>`}</div>`;

    if(guestDemo){
      if(view==='messages-direct')html+=cards(joined.filter(chatItem=>chatItem.kind==='direct'));
      else if(view==='messages-groups')html+=cards(joined.filter(chatItem=>chatItem.kind==='group'));
      else html+=cards(joined);
    }else if(view==='messages-direct')html+=`<div class="profile-grid">${directForm}</div>`+cards(joined.filter(chatItem=>chatItem.kind==='direct'));
    else if(view==='messages-groups')html+=`<div class="profile-grid">${groupForm}</div>`+cards(joined.filter(chatItem=>chatItem.kind==='group'));
    else if(view==='messages-invites')html+=invitationView;
    else html+=`<div class="profile-grid">${directForm}${groupForm}</div>`+(invitations.length?invitationView:'')+cards(joined);
    return html;
  }

  return Object.freeze({chatLabel,render});
}

globalThis.FolkoopNetworkMessaging=Object.freeze({create});
})();
