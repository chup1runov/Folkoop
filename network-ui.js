/* Accounts and shared communities. Inactive until a dedicated backend is configured. */
(() => {
'use strict';
const host=document.getElementById('networkPanel');if(!host)return;
const esc=globalThis.FolkoopCore.escape;
const en={title:'Network account',off:'The server is not connected yet. Local drafts below remain on your device.',login:'Pilot sign-in',invite:'Free pilot. For the first bootstrap, Supabase’s built-in mail can deliver only to a project-team email address. Your local drafts are never uploaded automatically. Sign-in lasts for this tab; after reload or expiry, enter a new code.',email:'Email',code:'Code from email',send:'Request code',verify:'Sign in',sent:'If this address is authorized by the current free mail setup, check its inbox. Sending a request does not guarantee delivery.',out:'Sign out',profile:'Network profile',private:'Visible only to you unless you enable the directory. Group publications are visible to that group’s members.',name:'Name or nickname',skills:'Skills',about:'About me',listed:'Show this profile to other pilot participants',save:'Save on server',saved:'Saved on server.',groups:'Communities',desc:'Any pilot participant can discover and join these communities. Publications are visible to current members. This is not a private encrypted chat.',newGroup:'Create community',description:'Description',create:'Create',join:'Join',leave:'Leave',open:'Open',back:'All communities',refresh:'Refresh',post:'New publication',publish:'Publish to members',empty:'Nothing here yet.',delete:'Delete',confirm:'Delete? This cannot be undone.',ownerDelete:'Delete my community and all its publications',report:'Report',reason:'Reason for the report (do not include sensitive personal information)',reported:'Report stored for operator review. No automatic verdict has been made.',block:'Hide this participant',ban:'Ban from my community',unblock:'Unhide',blocks:'Hidden participants',deleteProfile:'Delete my network profile',profileDeleted:'Network profile deleted. This does not delete the Auth account or past publications.',accountDelete:'Full account deletion is handled by the pilot operator until the account-deletion endpoint is implemented.',export:'Export visible records',exportNote:'Export can be limited by server row limits and access permissions; request a complete export from the operator.',loading:'Loading…',members:'Members’ publications',by:'Participant',own:'You',directory:'People who opted into discovery',banned:'Access to this community is unavailable.',busy:'Working…',auth:'Sign in again.',error:'Request failed. No successful change is confirmed. Check the connection and try again.',denied:'Access denied. Pilot access or membership may be missing.',limit:'Too many requests. Try again later.',invalid:'Check the entered values.',stale:'Session changed. Reload the section.',localTitle:'Local workspace below — separate from your network account.'};
const ru={...en,title:'Сетевой аккаунт',off:'Сервер ещё не подключён. Личные черновики ниже остаются на твоём устройстве.',login:'Вход в пилот',invite:'Бесплатный пилот. Для первого запуска встроенная почта Supabase доставляет код только на адрес участника команды проекта. Личные черновики не загружаются автоматически. Вход действует в этой вкладке; после перезагрузки или истечения сессии потребуется новый код.',email:'Электронная почта',code:'Код из письма',send:'Получить код',verify:'Войти',sent:'Если адрес разрешён текущей бесплатной почтовой настройкой, проверь почту. Принятый запрос ещё не подтверждает доставку письма.',out:'Выйти',profile:'Сетевой профиль',private:'Профиль виден только тебе, пока ты не включишь показ в каталоге. Публикации в группе видят её участники.',name:'Имя или псевдоним',skills:'Навыки',about:'О себе',listed:'Показывать профиль другим участникам пилота',save:'Сохранить на сервере',saved:'Сохранено на сервере.',groups:'Сообщества',desc:'Любой участник пилота может найти сообщество и вступить. Публикации видны действующим участникам группы. Это не закрытый зашифрованный чат.',newGroup:'Создать сообщество',description:'Описание',create:'Создать',join:'Вступить',leave:'Выйти из группы',open:'Открыть',back:'Все сообщества',refresh:'Обновить',post:'Новая публикация',publish:'Опубликовать для участников',empty:'Здесь пока пусто.',delete:'Удалить',confirm:'Удалить? Отменить это действие нельзя.',ownerDelete:'Удалить моё сообщество со всеми публикациями',report:'Пожаловаться',reason:'Причина жалобы (без чувствительных персональных данных)',reported:'Жалоба сохранена для проверки оператором. Автоматический вердикт не вынесен.',block:'Скрыть участника',ban:'Запретить доступ в мою группу',unblock:'Снять скрытие',blocks:'Скрытые участники',deleteProfile:'Удалить сетевой профиль',profileDeleted:'Сетевой профиль удалён. Аккаунт входа и прежние публикации этим не удаляются.',accountDelete:'Полное удаление аккаунта пока выполняет оператор пилота: отдельный сервис удаления ещё не подключён.',export:'Выгрузить доступные записи',exportNote:'Выгрузка ограничена правами доступа и лимитами сервера; полную копию можно запросить у оператора.',loading:'Загрузка…',members:'Публикации участников',by:'Участник',own:'Ты',directory:'Люди, включившие показ профиля',banned:'Доступ в это сообщество недоступен.',busy:'Выполняется…',auth:'Войди заново.',error:'Запрос не выполнен. Успешное изменение не подтверждено. Проверь связь и повтори.',denied:'Нет доступа. Возможно, не выдано приглашение в пилот или нет членства в группе.',limit:'Слишком много запросов. Повтори позже.',invalid:'Проверь введённые данные.',stale:'Сессия изменилась. Обнови раздел.',localTitle:'Ниже — локальная рабочая область, отдельно от сетевого аккаунта.'};
const sv={...en,title:'Nätverkskonto',off:'Servern är inte ansluten ännu. Dina lokala utkast nedan stannar på enheten.',login:'Logga in i piloten',invite:'Gratis pilot. Vid första uppstarten kan Supabase inbyggda e-post bara leverera kod till en projektmedlems e-postadress. Lokala utkast laddas aldrig upp automatiskt. Inloggningen gäller denna flik; ny kod behövs efter omladdning eller utgången session.',email:'E-post',code:'Kod från e-post',send:'Begär kod',verify:'Logga in',sent:'Om adressen är godkänd av den aktuella kostnadsfria e-postinställningen, kontrollera inkorgen. En godkänd begäran bekräftar inte leverans.',out:'Logga ut',profile:'Nätverksprofil',private:'Endast du ser profilen tills du aktiverar katalogen. Gruppinlägg visas för gruppens medlemmar.',name:'Namn eller smeknamn',skills:'Färdigheter',about:'Om mig',listed:'Visa profilen för andra pilotdeltagare',save:'Spara på servern',saved:'Sparat på servern.',groups:'Gemenskaper',desc:'Alla pilotdeltagare kan hitta och gå med i grupperna. Inlägg visas för aktuella medlemmar. Detta är inte en privat krypterad chatt.',newGroup:'Skapa grupp',description:'Beskrivning',create:'Skapa',join:'Gå med',leave:'Lämna gruppen',open:'Öppna',back:'Alla grupper',refresh:'Uppdatera',post:'Nytt inlägg',publish:'Publicera för medlemmar',empty:'Här är det tomt ännu.',delete:'Ta bort',confirm:'Ta bort? Detta går inte att ångra.',ownerDelete:'Radera min grupp och alla dess inlägg',report:'Rapportera',reason:'Orsak till rapporten (inga känsliga personuppgifter)',reported:'Rapporten sparades för granskning. Inget automatiskt beslut har fattats.',block:'Dölj deltagaren',ban:'Stäng av från min grupp',unblock:'Visa igen',blocks:'Dolda deltagare',deleteProfile:'Radera nätverksprofilen',profileDeleted:'Nätverksprofilen raderades. Inloggningskontot och tidigare inlägg raderas inte av detta.',accountDelete:'Pilotoperatören hanterar fullständig kontoradering tills en separat raderingstjänst finns.',export:'Exportera synliga poster',exportNote:'Export begränsas av behörighet och servergränser; begär en fullständig kopia från operatören.',loading:'Laddar…',members:'Medlemmarnas inlägg',by:'Deltagare',own:'Du',directory:'Personer som valt synlighet',banned:'Denna grupp är inte tillgänglig.',busy:'Arbetar…',auth:'Logga in igen.',error:'Begäran misslyckades. Ingen lyckad ändring är bekräftad. Kontrollera anslutningen och försök igen.',denied:'Åtkomst nekad. Pilotbehörighet eller medlemskap kan saknas.',limit:'För många förfrågningar. Försök senare.',invalid:'Kontrollera värdena.',stale:'Sessionen ändrades. Uppdatera delen.',localTitle:'Lokal arbetsyta nedan — separat från nätverkskontot.'};
let api,configError=false;try{api=FolkoopNetwork.client(globalThis.FolkoopNetworkConfig);}catch{configError=true;}
const chatCopy={
 en:{messagesTitle:'Messages',messagesDesc:'Direct and group conversations for pilot participants. Messages are stored on the server, use manual refresh and are not end-to-end encrypted.',direct:'Direct conversation',startDirect:'Start conversation',choosePerson:'Choose a person',groupChat:'Group conversation',newGroupChat:'Create group conversation',groupTitle:'Conversation name',chooseMembers:'Invite people',invitations:'Invitations',accept:'Accept',decline:'Decline',conversation:'Conversation',sendMessage:'Send',message:'Message',noChats:'No conversations yet.',backChats:'All conversations',invite:'Invite',leaveChat:'Leave conversation',deleteChat:'Delete group conversation',removeMember:'Remove',membersList:'Participants',manual:'Refresh',notEncrypted:'Manual refresh · not end-to-end encrypted',you:'You',reportMessage:'Report message',deletedMessage:'Message deleted.',invitePending:'Invitation pending',noPeople:'No discoverable pilot profiles are available yet.'},
 ru:{messagesTitle:'Сообщения',messagesDesc:'Личные и групповые разговоры участников пилота. Сообщения хранятся на сервере, обновляются вручную и пока не имеют сквозного шифрования.',direct:'Личный разговор',startDirect:'Начать разговор',choosePerson:'Выбери человека',groupChat:'Групповой разговор',newGroupChat:'Создать групповой разговор',groupTitle:'Название разговора',chooseMembers:'Пригласить людей',invitations:'Приглашения',accept:'Принять',decline:'Отклонить',conversation:'Разговор',sendMessage:'Отправить',message:'Сообщение',noChats:'Разговоров пока нет.',backChats:'Все разговоры',invite:'Пригласить',leaveChat:'Выйти из разговора',deleteChat:'Удалить групповой разговор',removeMember:'Удалить',membersList:'Участники',manual:'Обновить',notEncrypted:'Ручное обновление · без сквозного шифрования',you:'Ты',reportMessage:'Пожаловаться на сообщение',deletedMessage:'Сообщение удалено.',invitePending:'Ожидает ответа',noPeople:'Пока нет доступных для поиска участников пилота.'},
 sv:{messagesTitle:'Meddelanden',messagesDesc:'Direkta och gruppsamtal för pilotdeltagare. Meddelanden lagras på servern, uppdateras manuellt och är ännu inte end-to-end-krypterade.',direct:'Direktsamtal',startDirect:'Starta samtal',choosePerson:'Välj en person',groupChat:'Gruppsamtal',newGroupChat:'Skapa gruppsamtal',groupTitle:'Samtalets namn',chooseMembers:'Bjud in personer',invitations:'Inbjudningar',accept:'Acceptera',decline:'Avböj',conversation:'Samtal',sendMessage:'Skicka',message:'Meddelande',noChats:'Inga samtal ännu.',backChats:'Alla samtal',invite:'Bjud in',leaveChat:'Lämna samtalet',deleteChat:'Radera gruppsamtalet',removeMember:'Ta bort',membersList:'Deltagare',manual:'Uppdatera',notEncrypted:'Manuell uppdatering · inte end-to-end-krypterat',you:'Du',reportMessage:'Rapportera meddelande',deletedMessage:'Meddelandet raderades.',invitePending:'Väntar på svar',noPeople:'Det finns ännu inga sökbara pilotprofiler.'}
};
const lang=()=>['sv','en','ru'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const t=k=>({sv,en,ru}[lang()][k]||en[k]);
let selected=null,selectedChat=null,data={profile:{},groups:[],memberships:[],posts:[],directory:[],blocks:[],chats:[],chatMembers:[],chatInvites:[],chatProfiles:[],chatMessages:[]},notice='',busy=false,version=0,email='',profileDraft=null,groupDraft={},postDrafts={},chatDraft={title:'',members:[]},directTarget='',inviteTarget='',messageDrafts={};
const route=()=>FolkoopCore.route(location.hash);
const btn=(action,label,id='')=>`<button class="button secondary" type="button" data-net="${action}" data-id="${esc(id)}">${esc(t(label))}</button>`;
const field=(name,label,value='',max=100,area=false)=>`<label>${esc(t(label))}${area?`<textarea name="${name}" maxlength="${max}" rows="3">${esc(value)}</textarea>`:`<input name="${name}" maxlength="${max}" value="${esc(value)}"${name==='name'?' required':''}>`}</label>`;
const mt=k=>chatCopy[lang()][k]||chatCopy.en[k]||k;
const profileFor=id=>data.chatProfiles.find(p=>p.id===id)||data.directory.find(p=>p.id===id);
function chatLabel(chat,u){
 if(!chat)return mt('conversation');
 if(chat.kind==='group')return chat.title;
 const other=data.chatMembers.find(m=>m.conversation_id===chat.id&&m.user_id!==u.id);
 return profileFor(other?.user_id)?.name||mt('direct');
}
function renderMessages(u){
 const chat=data.chats.find(x=>x.id===selectedChat);
 const ownMember=chat&&data.chatMembers.find(m=>m.conversation_id===chat.id&&m.user_id===u.id);
 const ownInvite=chat&&data.chatInvites.find(i=>i.conversation_id===chat.id&&i.user_id===u.id);
 const discoverable=data.directory.filter(p=>p.id!==u.id);
 let html=`<div class="row"><div><h2>${esc(mt('messagesTitle'))}</h2><p class="meta">${esc(mt('messagesDesc'))}</p></div><div>${btn('refresh','refresh')}${btn('logout','out')}</div></div>`;
 if(chat){
  html+=`${btn('backChats','back','') }<article class="card"><h2>${esc(chatLabel(chat,u))}</h2><p class="meta">${esc(mt('notEncrypted'))}</p>`;
  if(ownInvite&&!ownMember){
   html+=`<div class="actions">${btn('acceptChat','accept',chat.id)}${btn('declineChat','decline',chat.id)}</div></article>`;
   return html;
  }
  if(!ownMember){html+=`<p>${esc(t('denied'))}</p></article>`;return html;}
  const members=data.chatMembers.filter(m=>m.conversation_id===chat.id);
  html+=`<h3>${esc(mt('membersList'))}</h3><div class="stack">${members.map(m=>{const p=profileFor(m.user_id);const name=m.user_id===u.id?mt('you'):(p?.name||m.user_id.slice(0,8));const remove=chat.kind==='group'&&chat.owner_id===u.id&&m.user_id!==u.id?btn('removeChatMember','removeMember',m.user_id):'';return `<div class="row"><span>${esc(name)}</span>${remove}</div>`;}).join('')}</div></article>`;
  if(chat.kind==='group'&&chat.owner_id===u.id){
   const existing=new Set(members.map(m=>m.user_id).concat(data.chatInvites.filter(i=>i.conversation_id===chat.id).map(i=>i.user_id)));
   const candidates=discoverable.filter(p=>!existing.has(p.id));
   html+=`<form id="netChatInvite" class="editor card"><label>${esc(mt('choosePerson'))}<select name="user" required><option value="">—</option>${candidates.map(p=>`<option value="${esc(p.id)}"${p.id===inviteTarget?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label><button class="button">${esc(mt('invite'))}</button></form>`;
  }
  html+=`<section class="chat-messages">${data.chatMessages.map(m=>{const p=profileFor(m.author_id);const mine=m.author_id===u.id;const canDelete=mine||(chat.kind==='group'&&chat.owner_id===u.id);return `<article class="card"><small>${esc(mine?mt('you'):(p?.name||m.author_id.slice(0,8)))}</small><p style="white-space:pre-wrap">${esc(m.body)}</p><p class="meta">${esc(m.created_at||'')}</p><div class="actions">${canDelete?btn('deleteMessage','delete',m.id):''}${!mine?btn('reportMessage','report',m.id)+btn('block','block',m.author_id):''}</div></article>`;}).join('')||`<div class="empty"><p>${esc(t('empty'))}</p></div>`}</section>`;
  html+=`<form id="netMessage" class="editor card"><label>${esc(mt('message'))}<textarea name="body" maxlength="4000" rows="3" required>${esc(messageDrafts[chat.id]||'')}</textarea></label><button class="button">${esc(mt('sendMessage'))}</button></form>`;
  if(chat.kind==='group')html+=`<div class="actions">${chat.owner_id===u.id?btn('deleteChat','deleteChat',chat.id):btn('leaveChat','leaveChat',chat.id)}</div>`;
  return html;
 }
 const invitations=data.chatInvites.filter(i=>i.user_id===u.id).map(i=>data.chats.find(c=>c.id===i.conversation_id)).filter(Boolean);
 html+=`<div class="profile-grid"><form id="netDirect" class="editor card"><h3>${esc(mt('direct'))}</h3><label>${esc(mt('choosePerson'))}<select name="other" required><option value="">—</option>${discoverable.map(p=>`<option value="${esc(p.id)}"${p.id===directTarget?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label><button class="button">${esc(mt('startDirect'))}</button><p class="meta">${discoverable.length?'':esc(mt('noPeople'))}</p></form><form id="netNewChat" class="editor card"><h3>${esc(mt('newGroupChat'))}</h3><label>${esc(mt('groupTitle'))}<input name="title" maxlength="80" required value="${esc(chatDraft.title||'')}"></label><fieldset><legend>${esc(mt('chooseMembers'))}</legend>${discoverable.map(p=>`<label class="checkbox"><input type="checkbox" name="members" value="${esc(p.id)}"${chatDraft.members.includes(p.id)?' checked':''}> <span>${esc(p.name)}</span></label>`).join('')||`<p class="meta">${esc(mt('noPeople'))}</p>`}</fieldset><button class="button" ${discoverable.length?'':'disabled'}>${esc(t('create'))}</button></form></div>`;
 if(invitations.length)html+=`<h3>${esc(mt('invitations'))}</h3><div class="draft-grid">${invitations.map(ch=>`<article class="card"><h3>${esc(chatLabel(ch,u))}</h3><span class="badge">${esc(mt('invitePending'))}</span><div class="actions">${btn('openChat','open',ch.id)}${btn('acceptChat','accept',ch.id)}${btn('declineChat','decline',ch.id)}</div></article>`).join('')}</div>`;
 const joined=data.chats.filter(ch=>data.chatMembers.some(m=>m.conversation_id===ch.id&&m.user_id===u.id));
 html+=`<h3>${esc(mt('conversation'))}</h3><div class="draft-grid">${joined.map(ch=>`<article class="card"><h3>${esc(chatLabel(ch,u))}</h3><p class="meta">${esc(ch.kind==='group'?mt('groupChat'):mt('direct'))}</p>${btn('openChat','open',ch.id)}</article>`).join('')||`<div class="empty"><p>${esc(mt('noChats'))}</p></div>`}</div>`;
 return html;
}

function render(){
 const r=route(),relevant=['me','people','messages'].includes(r);host.hidden=!relevant;
 document.getElementById('workspace').hidden=!!(api?.enabled&&['people','messages'].includes(r));
 if(!relevant)return;host.lang=lang();host.dir='ltr';
 if(!api?.enabled){host.innerHTML=`<aside class="notice"><strong>${esc(t('title'))}</strong><p>${esc(configError?t('error'):t('off'))}</p></aside>`;return;}
 let html='';const u=api.user();
 if(!u){html=`<h2>${esc(t('login'))}</h2><p>${esc(t('invite'))}</p><form id="netLogin" class="editor card"><label>${esc(t('email'))}<input type="email" name="email" maxlength="254" autocomplete="email" required value="${esc(email)}"></label><button name="operation" value="code" class="button">${esc(t('send'))}</button><label>${esc(t('code'))}<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="10"></label><button name="operation" value="verify" class="button secondary">${esc(t('verify'))}</button></form>`;}
 else if(r==='messages'){html=renderMessages(u);}
 else if(r==='me'){
  const p=profileDraft||data.profile;
  html=`<div class="row"><h2>${esc(t('profile'))}</h2>${btn('logout','out')}</div><p>${esc(t('private'))}</p><form id="netProfile" class="editor card">${field('name','name',p.name||'',60)}${field('skills','skills',p.skills||'',200)}${field('about','about',p.about||'',600,true)}<label class="checkbox"><input type="checkbox" name="listed"${p.listed?' checked':''}>${esc(t('listed'))}</label><button class="button">${esc(t('save'))}</button></form><div class="actions">${btn('deleteProfile','deleteProfile')}${btn('export','export')}${btn('refresh','refresh')}</div><p class="meta">${esc(t('accountDelete'))} ${esc(t('exportNote'))}</p><h3>${esc(t('blocks'))}</h3>${data.blocks.map(b=>`<p>${esc(b.target_id)} ${btn('unblock','unblock',b.target_id)}</p>`).join('')}<h3>${esc(t('localTitle'))}</h3>`;
 }else{
  const group=data.groups.find(g=>g.id===selected),membership=data.memberships.find(m=>m.community_id===selected),member=membership&&!membership.banned;
  html=`<div class="row"><h2>${esc(t('groups'))}</h2><div>${btn('refresh','refresh')}${btn('logout','out')}</div></div><p>${esc(t('desc'))}</p>`;
  if(group){
   html+=`${btn('back','back')}<article class="card"><h2>${esc(group.name)}</h2><p>${esc(group.description)}</p><div class="actions">${membership?.banned?esc(t('banned')):member?(group.owner_id===u.id?btn('deleteGroup','ownerDelete',group.id):btn('leave','leave',group.id)):btn('join','join',group.id)}</div></article>`;
   if(member){html+=`<form id="netPost" class="editor card">${field('body','post',postDrafts[selected]||'',3000,true)}<button class="button">${esc(t('publish'))}</button></form><h3>${esc(t('members'))}</h3>`+data.posts.map(p=>`<article class="card"><small>${esc(p.author_id===u.id?t('own'):t('by')+' '+p.author_id.slice(0,8))}</small><p style="white-space:pre-wrap">${esc(p.body)}</p><div class="actions">${p.author_id===u.id||group.owner_id===u.id?btn('deletePost','delete',p.id):''}${p.author_id!==u.id?btn('report','report',p.id)+btn('block','block',p.author_id)+(group.owner_id===u.id?btn('ban','ban',p.author_id):''):''}</div></article>`).join('');}
  }else{
   html+=`<form id="netGroup" class="editor card"><h3>${esc(t('newGroup'))}</h3>${field('name','name',groupDraft.name||'',80)}${field('description','description',groupDraft.description||'',1000,true)}<button class="button">${esc(t('create'))}</button></form><div class="draft-grid">${data.groups.map(g=>`<article class="card"><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p>${btn('open','open',g.id)}</article>`).join('')||esc(t('empty'))}</div><h3>${esc(t('directory'))}</h3><div class="draft-grid">${data.directory.map(p=>`<article class="card"><h3>${esc(p.name)}</h3><p>${esc(p.skills)}</p><p>${esc(p.about)}</p>${p.id!==u.id?btn('block','block',p.id):''}</article>`).join('')}</div>`;
  }
 }
 host.innerHTML=html+`<p id="netStatus" role="status" aria-live="polite">${esc(notice)}</p>`;
 host.querySelectorAll('button').forEach(b=>b.disabled=busy);
}
async function load(){
 const v=version,u=api.user();if(!u)return;
 const [profile,groups,memberships,directory,blocks,chats,chatMembers,chatInvites,chatProfiles]=await Promise.all([
  api.profile(),api.communities(),api.memberships(),api.directory(),api.blocks(),api.chats(),api.chatMembers(),api.chatInvites(),api.visibleProfiles()
 ]);
 const posts=selected&&memberships.some(m=>m.community_id===selected&&!m.banned)?await api.posts(selected):[];
 const ownChatMember=selectedChat&&chatMembers.find(m=>m.conversation_id===selectedChat&&m.user_id===u.id);
 const chatMessages=ownChatMember?await api.chatMessages(selectedChat):[];
 if(v!==version)throw Object.assign(new Error('STALE'),{code:'STALE'});
 if(ownChatMember&&chatMessages.length){
  const newest=chatMessages.at(-1)?.created_at;
  if(newest&&(!ownChatMember.last_read_at||Date.parse(newest)>Date.parse(ownChatMember.last_read_at))){
   await api.markChatRead(selectedChat);ownChatMember.last_read_at=new Date().toISOString();
  }
 }
 data={profile:profile[0]||{},groups,memberships,directory,blocks,posts,chats,chatMembers,chatInvites,chatProfiles,chatMessages};
}
async function run(fn){
 if(busy)return;busy=true;host.querySelectorAll('button').forEach(b=>b.disabled=true);
 notice=t('busy');const status=host.querySelector('#netStatus');if(status)status.textContent=notice;
 try{await fn();}catch(e){notice=t(({AUTH_REQUIRED:'auth',DENIED:'denied',RATE_LIMIT:'limit',INVALID_INPUT:'invalid',STALE:'stale'})[e.code]||'error');}
 finally{busy=false;render();}
}
host.addEventListener('input',e=>{
 const f=e.target.form;if(!f)return;const v=Object.fromEntries(new FormData(f));
 if(f.id==='netProfile')profileDraft={...v,listed:v.listed==='on'};
 if(f.id==='netGroup')groupDraft=v;
 if(f.id==='netPost')postDrafts[selected]=v.body;
 if(f.id==='netLogin')email=v.email;
 if(f.id==='netDirect')directTarget=v.other||'';
 if(f.id==='netNewChat'){const fd=new FormData(f);chatDraft={title:String(fd.get('title')||''),members:fd.getAll('members').map(String)};}
 if(f.id==='netChatInvite')inviteTarget=v.user||'';
 if(f.id==='netMessage')messageDrafts[selectedChat]=v.body||'';
});
host.addEventListener('submit',e=>{e.preventDefault();const f=e.target,values=Object.fromEntries(new FormData(f)),op=e.submitter?.value;
 run(async()=>{
  if(f.id==='netLogin'){email=values.email;if(op==='code'){await api.requestCode(email);notice=t('sent');return;}await api.verify(email,values.code);email='';await load();notice='';return;}
  if(f.id==='netDirect'){selectedChat=await api.startDirect(values.other);directTarget='';}
  if(f.id==='netNewChat'){const fd=new FormData(f);selectedChat=await api.createGroupChat(String(fd.get('title')||''),fd.getAll('members').map(String));chatDraft={title:'',members:[]};}
  if(f.id==='netChatInvite'){await api.inviteChat(selectedChat,values.user);inviteTarget='';}
  if(f.id==='netMessage'){await api.sendMessage(selectedChat,values.body);delete messageDrafts[selectedChat];}
  if(f.id==='netProfile'){await api.saveProfile({name:values.name,skills:values.skills,about:values.about,listed:values.listed==='on'});profileDraft=null;}
  if(f.id==='netGroup'){selected=await api.createCommunity(values.name,values.description);groupDraft={};}
  if(f.id==='netPost'){await api.publish(selected,values.body);delete postDrafts[selected];}
  await load();notice=t('saved');
 });
});
host.addEventListener('click',e=>{const b=e.target.closest('[data-net]');if(!b)return;const a=b.dataset.net,id=b.dataset.id;
 run(async()=>{
  if(a==='logout'){await api.logout();notice='';return;}
  if(a==='back')selected=null;if(a==='open')selected=id;
  if(a==='backChats')selectedChat=null;if(a==='openChat')selectedChat=id;
  if(a==='acceptChat')await api.acceptChat(id);
  if(a==='declineChat'){await api.declineChat(id);if(selectedChat===id)selectedChat=null;}
  if(a==='leaveChat'){if(!confirm(t('confirm')))return;await api.leaveChat(id);selectedChat=null;}
  if(a==='deleteChat'){if(!confirm(t('confirm')))return;await api.deleteChat(id);selectedChat=null;}
  if(a==='removeChatMember'){if(!confirm(t('confirm')))return;await api.removeChatMember(selectedChat,id);}
  if(a==='deleteMessage'){if(!confirm(t('confirm')))return;await api.deleteMessage(id);notice=mt('deletedMessage');}
  if(a==='reportMessage'){const reason=prompt(t('reason'));if(reason===null)return;await api.reportMessage(id,reason);notice=t('reported');}

  if(a==='join')await api.join(id);if(a==='leave')await api.leave(id);
  if(a==='deletePost'||a==='deleteGroup'||a==='deleteProfile'){
   if(!confirm(t('confirm'))){notice='';return;}
   if(a==='deletePost')await api.deletePost(id);
   if(a==='deleteGroup'){await api.deleteCommunity(id);selected=null;}
   if(a==='deleteProfile'){await api.deleteProfile();profileDraft=null;}
  }
  if(a==='block')await api.block(id);if(a==='unblock')await api.block(id,false);
  if(a==='ban'){if(!confirm(t('ban')+'?'))return;await api.ban(selected,id);}
  if(a==='report'){const reason=prompt(t('reason'));if(reason===null)return;await api.report(id,reason);notice=t('reported');return;}
  if(a==='export'){
   const result=await api.exportOwn(),url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='folkoop-network-export.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice=t('exportNote');return;
  }
  await load();notice=a==='deleteProfile'?t('profileDeleted'):'';
 });
});
api?.onChange(()=>{version++;selected=null;selectedChat=null;profileDraft=null;groupDraft={};postDrafts={};chatDraft={title:'',members:[]};directTarget='';inviteTarget='';messageDrafts={};data={profile:{},groups:[],memberships:[],posts:[],directory:[],blocks:[],chats:[],chatMembers:[],chatInvites:[],chatProfiles:[],chatMessages:[]};render();});
window.addEventListener('hashchange',()=>{version++;if(api?.user())run(async()=>{await load();notice='';});else render();});
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
})();
