/* Messaging presentation domain for the network UI.
   RPC execution, authorization and state ownership stay in network-ui.js. */
(() => {
'use strict';
const labels={
 ru:['Контакты','Звонки','Чаты','Звонки пока не подключены','Здесь появятся голосовые и видеозвонки. Пока можно написать в чат.','Открыть чаты','Люди из доступных профилей и переписок. Контакты телефона не импортируются.'],
 en:['Contacts','Calls','Chats','Calls are not connected yet','Voice and video calls will appear here. For now, send a chat message.','Open chats','People from available profiles and conversations. Phone contacts are not imported.'],
 sv:['Kontakter','Samtal','Chattar','Samtal är inte anslutna ännu','Röst- och videosamtal kommer att finnas här. Tills vidare kan du skriva i chatten.','Öppna chattar','Personer från tillgängliga profiler och konversationer. Telefonkontakter importeras inte.'],
 uk:['Контакти','Дзвінки','Чати','Дзвінки ще не підключені','Тут з’являться голосові та відеодзвінки. Поки можна написати в чат.','Відкрити чати','Люди з доступних профілів і листування. Контакти телефона не імпортуються.'],
 es:['Contactos','Llamadas','Chats','Las llamadas aún no están conectadas','Aquí habrá llamadas de voz y vídeo. Por ahora, puedes escribir en el chat.','Abrir chats','Personas de perfiles y conversaciones disponibles. No se importan contactos del teléfono.'],
 fi:['Yhteystiedot','Puhelut','Keskustelut','Puhelut eivät ole vielä käytössä','Ääni- ja videopuhelut tulevat tänne. Nyt voit lähettää viestin keskustelussa.','Avaa keskustelut','Ihmisiä saatavilla olevista profiileista ja keskusteluista. Puhelimen yhteystietoja ei tuoda.'],
 bs:['Kontakti','Pozivi','Razgovori','Pozivi još nisu povezani','Ovdje će biti glasovni i video pozivi. Za sada možete poslati poruku.','Otvori razgovore','Ljudi iz dostupnih profila i razgovora. Telefonski kontakti se ne uvoze.'],
 ar:['جهات الاتصال','المكالمات','المحادثات','المكالمات غير متصلة بعد','ستظهر هنا مكالمات الصوت والفيديو. يمكنك الآن إرسال رسالة في المحادثة.','فتح المحادثات','أشخاص من الملفات والمحادثات المتاحة. لا يتم استيراد جهات اتصال الهاتف.'],
 fa:['مخاطبان','تماس‌ها','گفت‌وگوها','تماس‌ها هنوز متصل نیستند','تماس‌های صوتی و تصویری اینجا خواهند بود. فعلاً می‌توانید در گفت‌وگو پیام بفرستید.','باز کردن گفت‌وگوها','افراد از نمایه‌ها و گفت‌وگوهای در دسترس. مخاطبان تلفن وارد نمی‌شوند.'],
 so:['Xiriirrada','Wicitaannada','Wadahadallo','Wicitaannadu weli ma shaqeeyaan','Wicitaannada codka iyo muuqaalka ayaa halkan iman doona. Hadda farriin ku dir wada hadalka.','Fur wadahadallada','Dadka ka socda bogagga iyo wada hadallada la heli karo. Xiriirrada taleefanka lama soo dejiyo.'],
 ku:['Têkilî','Bang','Peyamdan','Bang hîn ne girêdayî ne','Bangên deng û vîdyoyê dê li vir bin. Niha dikarî peyamekê bişînî.','Peyamdanê veke','Kesên ji profîl û axaftinên berdest. Têkiliyên telefonê nayên împortkirin.']
};
const olderLabels={
 sv:'Ladda tidigare meddelanden',en:'Load older messages',ru:'Загрузить предыдущие сообщения',
 uk:'Завантажити попередні повідомлення',es:'Cargar mensajes anteriores',
 fi:'Lataa vanhemmat viestit',bs:'Učitaj starije poruke',
 ar:'تحميل الرسائل السابقة',fa:'بارگذاری پیام‌های قدیمی‌تر',
 so:'Soo qaad farriimihii hore',ku:'Peyamên kevntir bar bike'
};
const copy=lang=>labels[lang]||labels.en;

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
      chatHasOlder=false,
      directTarget='',
      chatDraft={title:'',members:[]},
      inviteTarget='',
      messageDrafts={},
      guestDemo=false,
      language='en',
      view='messages-chats'
    }=state;

    const chat=chats.find(item=>item.id===selectedChat);
    const ownMember=chat&&chatMembers.find(member=>member.conversation_id===chat.id&&member.user_id===user.id);
    const ownInvite=chat&&chatInvites.find(invite=>invite.conversation_id===chat.id&&invite.user_id===user.id);
    const linked=chat&&coopChats.find(item=>item.conversation_id===chat.id);
    const discoverable=directory.filter(profile=>profile.id!==user.id);
    const text=copy(language);
    const initials=name=>escape(Array.from(String(name||'?').trim())[0]||'?');

    if(!chat&&view==='messages-calls')return `<section class="messages-empty-call"><span class="messages-call-symbol" aria-hidden="true">☎</span><h2>${escape(text[1])}</h2><h3>${escape(text[3])}</h3><p>${escape(text[4])}</p><a class="button" href="#/messages" data-subsection="messages-chats">${escape(text[5])}</a></section>`;
    if(!chat&&view==='messages-contacts'){
      const ids=new Set(discoverable.map(p=>p.id));
      for(const member of chatMembers)if(member.user_id!==user.id&&chatMembers.some(own=>own.user_id===user.id&&own.conversation_id===member.conversation_id))ids.add(member.user_id);
      const contacts=[...ids].map(id=>getProfile(id)||directory.find(p=>p.id===id)).filter(Boolean).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),language));
      return `<section class="messages-contacts"><h2>${escape(text[0])}</h2><p class="meta">${escape(text[6])}</p><label class="messages-contact-search">${escape(text[0])}<input id="networkContactSearch" type="search" autocomplete="off"></label><div class="messenger-contact-list">${contacts.map(person=>{
        const direct=chats.find(c=>c.kind==='direct'&&chatMembers.some(m=>m.conversation_id===c.id&&m.user_id===user.id)&&chatMembers.some(m=>m.conversation_id===c.id&&m.user_id===person.id));
        return `<article class="messenger-contact" data-contact-card><span class="messenger-avatar" aria-hidden="true">${initials(person.name)}</span><div><h3>${escape(person.name||'—')}</h3><p class="meta">${escape(person.skills||'')}</p></div>${direct?`<button type="button" class="messenger-open" data-net="openChat" data-id="${escape(direct.id)}" aria-label="${escape(chatText('conversation')+' · '+person.name)}"><span aria-hidden="true">›</span></button>`:guestDemo?'':`<a class="text-button" href="#/messages" data-subsection="messages-direct" data-contact-id="${escape(person.id)}">${escape(chatText('startDirect'))}</a>`}</article>`;
      }).join('')||`<p class="empty">${escape(chatText('noPeople'))}</p>`}</div></section>`;
    }

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

      if(!guestDemo&&chatHasOlder)html+=`<div class="actions"><button type="button" class="button secondary" data-net="olderChatMessages">${escape(olderLabels[language]||olderLabels.en)}</button></div>`;
      html+=`<section class="chat-messages">${chatMessages.map(message=>{
        const profile=getProfile(message.author_id);
        const mine=message.author_id===user.id;
        const canDelete=mine||(chat.kind==='group'&&chat.owner_id===user.id);
        return `<article class="card messenger-bubble${mine?' is-mine':''}"><small>${escape(mine?chatText('you'):(profile?.name||message.author_id.slice(0,8)))}</small><p style="white-space:pre-wrap">${escape(message.body)}</p><p class="meta">${escape(formatWhen(message.created_at))}</p><div class="actions">${canDelete?networkButton('deleteMessage','delete',message.id):''}${!mine?networkButton('reportMessage','report',message.id)+networkButton('block','block',message.author_id):''}</div></article>`;
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

    const invitationView=`<h3 id="messagesInvitationHeading">${escape(chatText('invitations'))}</h3><div class="draft-grid">${invitations.map(chatItem=>`<article class="card"><h3>${escape(chatLabel(chatItem,user))}</h3><span class="badge">${escape(chatText('invitePending'))}</span><div class="actions">${networkButton('openChat','open',chatItem.id)}${networkButton('acceptChat','accept',chatItem.id)}${networkButton('declineChat','decline',chatItem.id)}</div></article>`).join('')||`<div class="empty"><p>${escape(chatText('noChats'))}</p></div>`}</div>`;

    const messagesHub=guestDemo?`<nav class="messages-filter-row" aria-label="${escape(text[2])}"><a href="#/messages" data-subsection="messages-chats">${escape(text[2])}</a><a href="#/messages" data-subsection="messages-direct">${escape(chatText('direct'))}</a><a href="#/messages" data-subsection="messages-groups">${escape(chatText('groupChat'))}</a></nav>`:`<section class="messages-hub" aria-labelledby="messagesHubTitle">
      <div class="messages-hub-head"><p class="eyebrow">FOLKOOP</p><h3 id="messagesHubTitle">${escape(chatText('messagesTitle'))}</h3><p>${escape(chatText('messagesDesc'))}</p></div>
      <div class="messages-action-grid">
        <a href="#/messages" data-subsection="messages-direct"><span aria-hidden="true">👤</span><strong>${escape(chatText('direct'))}</strong><small>${escape(chatText('startDirect'))}</small></a>
        <a href="#/messages" data-subsection="messages-groups"><span aria-hidden="true">👥</span><strong>${escape(chatText('groupChat'))}</strong><small>${escape(chatText('newGroupChat'))}</small></a>
        ${invitations.length?`<a href="#/messages" data-subsection="messages-invites"><span aria-hidden="true">✉</span><strong>${escape(chatText('invitations'))}</strong><small>${escape(String(invitations.length))}</small></a>`:''}
      </div>
      <div class="messages-discovery-bar">
        <label><span class="sr-only">${escape(chatText('conversation'))}</span><input id="networkMessageSearch" type="search" autocomplete="off" placeholder="${escape(chatText('conversation'))}"></label>
        <div class="messages-filter-row" role="group" aria-label="${escape(chatText('conversation'))}">
          <button type="button" data-message-kind="direct" aria-pressed="false">${escape(chatText('direct'))}</button>
          <button type="button" data-message-kind="group" aria-pressed="false">${escape(chatText('groupChat'))}</button>
          <button type="button" data-message-kind="work" aria-pressed="false">${escape(activityText('workChat'))}</button>
        </div>
      </div>
    </section>`;

    const cards=list=>`${guestDemo?'':`<h3>${escape(chatText('conversation'))}</h3>`}<div class="draft-grid mura-chat-grid">${list.map(chatItem=>{
      const unread=Number(chatInbox.find(item=>item.conversation_id===chatItem.id)?.unread_count||0);
      const link=coopChats.find(item=>item.conversation_id===chatItem.id);
      const preview=[...chatMessages].filter(message=>message.conversation_id===chatItem.id).sort((a,b)=>Date.parse(b.created_at||0)-Date.parse(a.created_at||0))[0];
      const messageType=link?'work':chatItem.kind;
      return `<article class="card mura-chat-card" data-message-card data-message-type="${escape(messageType)}"${guestDemo&&link?' data-demo-story="chat"':''}><span class="messenger-avatar" aria-hidden="true">${initials(chatLabel(chatItem,user))}</span><div class="messenger-chat-copy"><div class="row"><h3>${escape(chatLabel(chatItem,user))}</h3>${unread?`<span class="net-count">${escape(String(unread))}</span>`:''}</div><p class="meta">${escape(link?activityText('linkedChat'):(chatItem.kind==='group'?chatText('groupChat'):chatText('direct')))}</p>${preview?`<p class="mura-chat-preview">${escape(preview.body)}</p>`:''}</div><button type="button" class="messenger-open" data-net="openChat" data-id="${escape(chatItem.id)}" aria-label="${escape(chatText('conversation')+' · '+chatLabel(chatItem,user))}"><span aria-hidden="true">›</span></button></article>`;
    }).join('')||`<div class="empty"><p>${escape(chatText('noChats'))}</p></div>`}</div>`;

    if(guestDemo){
      html+=messagesHub;
      if(view==='messages-direct')html+=cards(joined.filter(chatItem=>chatItem.kind==='direct'));
      else if(view==='messages-groups')html+=cards(joined.filter(chatItem=>chatItem.kind==='group'));
      else html+=cards(joined);
    }else if(view==='messages-direct')html+=`<div class="profile-grid">${directForm}</div>`+cards(joined.filter(chatItem=>chatItem.kind==='direct'));
    else if(view==='messages-groups')html+=`<div class="profile-grid">${groupForm}</div>`+cards(joined.filter(chatItem=>chatItem.kind==='group'));
    else if(view==='messages-invites')html+=invitationView;
    else html+=messagesHub+(invitations.length?invitationView:'')+cards(joined);
    return html;
  }

  return Object.freeze({chatLabel,render});
}

globalThis.FolkoopNetworkMessaging=Object.freeze({create,copy});
})();
