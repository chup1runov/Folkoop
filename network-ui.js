/* Accounts and shared communities. Inactive until a dedicated backend is configured. */
(() => {
'use strict';
const host=document.getElementById('networkPanel');if(!host)return;
const esc=globalThis.FolkoopCore.escape;
const en={title:'Network account',off:'The server is not connected yet. Local drafts below remain on your device.',login:'Pilot sign-in',invite:'Invitation-only pilot. Your local drafts are never uploaded automatically. Sign-in lasts for this tab; after reload or expiry, enter a new code.',email:'Email',code:'Code from email',send:'Request code',verify:'Sign in',sent:'If this address is invited, check its inbox. Sending a request does not guarantee delivery.',out:'Sign out',profile:'Network profile',private:'Visible only to you unless you enable the directory. Group publications are visible to that group’s members.',name:'Name or nickname',skills:'Skills',about:'About me',listed:'Show this profile to other pilot participants',save:'Save on server',saved:'Saved on server.',groups:'Communities',desc:'Any pilot participant can discover and join these communities. Publications are visible to current members. This is not a private encrypted chat.',newGroup:'Create community',description:'Description',create:'Create',join:'Join',leave:'Leave',open:'Open',back:'All communities',refresh:'Refresh',post:'New publication',publish:'Publish to members',empty:'Nothing here yet.',delete:'Delete',confirm:'Delete? This cannot be undone.',ownerDelete:'Delete my community and all its publications',report:'Report',reason:'Reason for the report (do not include sensitive personal information)',reported:'Report stored for operator review. No automatic verdict has been made.',block:'Hide this participant',ban:'Ban from my community',unblock:'Unhide',blocks:'Hidden participants',deleteProfile:'Delete my network profile',profileDeleted:'Network profile deleted. This does not delete the Auth account or past publications.',accountDelete:'Full account deletion is handled by the pilot operator until the account-deletion endpoint is implemented.',export:'Export visible records',exportNote:'Export can be limited by server row limits and access permissions; request a complete export from the operator.',loading:'Loading…',members:'Members’ publications',by:'Participant',own:'You',directory:'People who opted into discovery',banned:'Access to this community is unavailable.',busy:'Working…',auth:'Sign in again.',error:'Request failed. No successful change is confirmed. Check the connection and try again.',denied:'Access denied. Pilot access or membership may be missing.',limit:'Too many requests. Try again later.',invalid:'Check the entered values.',stale:'Session changed. Reload the section.',localTitle:'Local workspace below — separate from your network account.'};
const ru={...en,title:'Сетевой аккаунт',off:'Сервер ещё не подключён. Личные черновики ниже остаются на твоём устройстве.',login:'Вход в пилот',invite:'Пилот по приглашениям. Личные черновики не загружаются автоматически. Вход действует в этой вкладке; после перезагрузки или истечения сессии потребуется новый код.',email:'Электронная почта',code:'Код из письма',send:'Получить код',verify:'Войти',sent:'Если адрес приглашён в пилот, проверь почту. Принятый запрос ещё не подтверждает доставку письма.',out:'Выйти',profile:'Сетевой профиль',private:'Профиль виден только тебе, пока ты не включишь показ в каталоге. Публикации в группе видят её участники.',name:'Имя или псевдоним',skills:'Навыки',about:'О себе',listed:'Показывать профиль другим участникам пилота',save:'Сохранить на сервере',saved:'Сохранено на сервере.',groups:'Сообщества',desc:'Любой участник пилота может найти сообщество и вступить. Публикации видны действующим участникам группы. Это не закрытый зашифрованный чат.',newGroup:'Создать сообщество',description:'Описание',create:'Создать',join:'Вступить',leave:'Выйти из группы',open:'Открыть',back:'Все сообщества',refresh:'Обновить',post:'Новая публикация',publish:'Опубликовать для участников',empty:'Здесь пока пусто.',delete:'Удалить',confirm:'Удалить? Отменить это действие нельзя.',ownerDelete:'Удалить моё сообщество со всеми публикациями',report:'Пожаловаться',reason:'Причина жалобы (без чувствительных персональных данных)',reported:'Жалоба сохранена для проверки оператором. Автоматический вердикт не вынесен.',block:'Скрыть участника',ban:'Запретить доступ в мою группу',unblock:'Снять скрытие',blocks:'Скрытые участники',deleteProfile:'Удалить сетевой профиль',profileDeleted:'Сетевой профиль удалён. Аккаунт входа и прежние публикации этим не удаляются.',accountDelete:'Полное удаление аккаунта пока выполняет оператор пилота: отдельный сервис удаления ещё не подключён.',export:'Выгрузить доступные записи',exportNote:'Выгрузка ограничена правами доступа и лимитами сервера; полную копию можно запросить у оператора.',loading:'Загрузка…',members:'Публикации участников',by:'Участник',own:'Ты',directory:'Люди, включившие показ профиля',banned:'Доступ в это сообщество недоступен.',busy:'Выполняется…',auth:'Войди заново.',error:'Запрос не выполнен. Успешное изменение не подтверждено. Проверь связь и повтори.',denied:'Нет доступа. Возможно, не выдано приглашение в пилот или нет членства в группе.',limit:'Слишком много запросов. Повтори позже.',invalid:'Проверь введённые данные.',stale:'Сессия изменилась. Обнови раздел.',localTitle:'Ниже — локальная рабочая область, отдельно от сетевого аккаунта.'};
const sv={...en,title:'Nätverkskonto',off:'Servern är inte ansluten ännu. Dina lokala utkast nedan stannar på enheten.',login:'Logga in i piloten',invite:'Pilot med inbjudan. Lokala utkast laddas aldrig upp automatiskt. Inloggningen gäller denna flik; ny kod behövs efter omladdning eller utgången session.',email:'E-post',code:'Kod från e-post',send:'Begär kod',verify:'Logga in',sent:'Om adressen är inbjuden, kontrollera inkorgen. En godkänd begäran bekräftar inte leverans.',out:'Logga ut',profile:'Nätverksprofil',private:'Endast du ser profilen tills du aktiverar katalogen. Gruppinlägg visas för gruppens medlemmar.',name:'Namn eller smeknamn',skills:'Färdigheter',about:'Om mig',listed:'Visa profilen för andra pilotdeltagare',save:'Spara på servern',saved:'Sparat på servern.',groups:'Gemenskaper',desc:'Alla pilotdeltagare kan hitta och gå med i grupperna. Inlägg visas för aktuella medlemmar. Detta är inte en privat krypterad chatt.',newGroup:'Skapa grupp',description:'Beskrivning',create:'Skapa',join:'Gå med',leave:'Lämna gruppen',open:'Öppna',back:'Alla grupper',refresh:'Uppdatera',post:'Nytt inlägg',publish:'Publicera för medlemmar',empty:'Här är det tomt ännu.',delete:'Ta bort',confirm:'Ta bort? Detta går inte att ångra.',ownerDelete:'Radera min grupp och alla dess inlägg',report:'Rapportera',reason:'Orsak till rapporten (inga känsliga personuppgifter)',reported:'Rapporten sparades för granskning. Inget automatiskt beslut har fattats.',block:'Dölj deltagaren',ban:'Stäng av från min grupp',unblock:'Visa igen',blocks:'Dolda deltagare',deleteProfile:'Radera nätverksprofilen',profileDeleted:'Nätverksprofilen raderades. Inloggningskontot och tidigare inlägg raderas inte av detta.',accountDelete:'Pilotoperatören hanterar fullständig kontoradering tills en separat raderingstjänst finns.',export:'Exportera synliga poster',exportNote:'Export begränsas av behörighet och servergränser; begär en fullständig kopia från operatören.',loading:'Laddar…',members:'Medlemmarnas inlägg',by:'Deltagare',own:'Du',directory:'Personer som valt synlighet',banned:'Denna grupp är inte tillgänglig.',busy:'Arbetar…',auth:'Logga in igen.',error:'Begäran misslyckades. Ingen lyckad ändring är bekräftad. Kontrollera anslutningen och försök igen.',denied:'Åtkomst nekad. Pilotbehörighet eller medlemskap kan saknas.',limit:'För många förfrågningar. Försök senare.',invalid:'Kontrollera värdena.',stale:'Sessionen ändrades. Uppdatera delen.',localTitle:'Lokal arbetsyta nedan — separat från nätverkskontot.'};
let api,configError=false;try{api=FolkoopNetwork.client(globalThis.FolkoopNetworkConfig);}catch{configError=true;}
const lang=()=>['sv','en','ru'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
const t=k=>({sv,en,ru}[lang()][k]||en[k]);
let selected=null,data={profile:{},groups:[],memberships:[],posts:[],directory:[],blocks:[]},notice='',busy=false,version=0,email='',profileDraft=null,groupDraft={},postDrafts={};
const route=()=>FolkoopCore.route(location.hash);
const btn=(action,label,id='')=>`<button class="button secondary" type="button" data-net="${action}" data-id="${esc(id)}">${esc(t(label))}</button>`;
const field=(name,label,value='',max=100,area=false)=>`<label>${esc(t(label))}${area?`<textarea name="${name}" maxlength="${max}" rows="3">${esc(value)}</textarea>`:`<input name="${name}" maxlength="${max}" value="${esc(value)}"${name==='name'?' required':''}>`}</label>`;
function render(){
 const r=route(),relevant=['me','people'].includes(r);host.hidden=!relevant;
 document.getElementById('workspace').hidden=!!(api?.enabled&&r==='people');
 if(!relevant)return;host.lang=lang();host.dir='ltr';
 if(!api?.enabled){host.innerHTML=`<aside class="notice"><strong>${esc(t('title'))}</strong><p>${esc(configError?t('error'):t('off'))}</p></aside>`;return;}
 let html='';const u=api.user();
 if(!u){html=`<h2>${esc(t('login'))}</h2><p>${esc(t('invite'))}</p><form id="netLogin" class="editor card"><label>${esc(t('email'))}<input type="email" name="email" maxlength="254" autocomplete="email" required value="${esc(email)}"></label><button name="operation" value="code" class="button">${esc(t('send'))}</button><label>${esc(t('code'))}<input name="code" inputmode="numeric" autocomplete="one-time-code" minlength="6" maxlength="10"></label><button name="operation" value="verify" class="button secondary">${esc(t('verify'))}</button></form>`;}
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
 const v=version;if(!api.user())return;
 const [profile,groups,memberships,directory,blocks]=await Promise.all([api.profile(),api.communities(),api.memberships(),api.directory(),api.blocks()]);
 const posts=selected&&memberships.some(m=>m.community_id===selected&&!m.banned)?await api.posts(selected):[];
 if(v!==version)throw Object.assign(new Error('STALE'),{code:'STALE'});
 data={profile:profile[0]||{},groups,memberships,directory,blocks,posts};
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
});
host.addEventListener('submit',e=>{e.preventDefault();const f=e.target,values=Object.fromEntries(new FormData(f)),op=e.submitter?.value;
 run(async()=>{
  if(f.id==='netLogin'){email=values.email;if(op==='code'){await api.requestCode(email);notice=t('sent');return;}await api.verify(email,values.code);email='';await load();notice='';return;}
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
api?.onChange(()=>{version++;selected=null;profileDraft=null;groupDraft={};postDrafts={};data={profile:{},groups:[],memberships:[],posts:[],directory:[],blocks:[]};render();});
window.addEventListener('hashchange',render);
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
})();
