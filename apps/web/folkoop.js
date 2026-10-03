/* FOLKOOP shell: local drafts and profile, with the preserved City module. */
(() => {
'use strict';
const C=globalThis.FolkoopCore, I=globalThis.FolkoopCopy, $=s=>document.querySelector(s), esc=C.escape;
let storage;try{storage=localStorage;}catch{/* Memory-only mode. */}
const store=C.workspace(storage);
let lang='sv';try{const saved=storage?.getItem('folkoop-language');lang=C.LANGS.includes(saved)?saved:(navigator.language||'sv').split('-')[0];}catch{}
if(!C.LANGS.includes(lang))lang='sv';
let current=C.route(location.hash), formKind=null, scratch={}, profileScratch=null, query='', frame=null;
const reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const NAV_ORDER=['home','together','projects','city','messages','me'];
const ONBOARDING_KEY='folkoop-onboarding-v3';
const LANGUAGE_KEY='folkoop-language-choice-v1';
const ENTRY_KEY='folkoop-entry-mode-v1';
const introParam=new URL(location.href).searchParams.get('intro');
const onboardingSuppressed=introParam==='0'||(navigator.webdriver&&introParam!=='1');
let onboardingOpen=false,onboardingStep=0,menuOpen=false,helperOpen=false,firstVisitFlow=false,languageOnlyFlow=false,muraPracticeStep=0,muraPracticeXp=0,tourReturnMode=null,entryGateAfterMuraExit=false;
const onboardingSteps=[
 {id:'welcome',route:'me',target:'.demo-profile-card h2',motion:'point',pose:'wink'},
 {id:'home',route:'me',target:'.demo-profile-card h2',motion:'point',pose:'inspect'},
 {id:'together',route:'together',target:'[data-demo-story="need"] h3',motion:'point',pose:'point'},
 {id:'projects',route:'together',target:'[data-demo-story="offer"] h3',motion:'point',pose:'idea'},
 {id:'people',route:'projects',target:'[data-demo-story="project"] h3',motion:'point',pose:'lean-in'},
 {id:'city',route:'people',target:'[data-demo-story="person"] h3',motion:'point',pose:'searching'},
 {id:'center',route:'messages',target:'[data-demo-story="chat"] h3',motion:'point',pose:'point'},
 {id:'quick',route:'me',target:'.demo-profile-card h2',motion:'point',pose:'confident'}
];

const legacyRoutes=['ansvar','rapportera','nara','beslut','om'];
let initialCityHash=legacyRoutes.includes(location.hash.slice(1))?location.hash.slice(1):'home';
if(initialCityHash!=='home'){current='city';history.replaceState(null,'','#/city');}
const actionIcons={need:'M12 3v18M3 12h18',offer:'M12 21V3M5 10l7-7 7 7',project:'M4 19V5h16v14H4Zm4-7h8M12 8v8',purchase:'M4 6h2l2 9h9l2-6H8M10 20h.01M17 20h.01',resource:'M5 7h14v12H5V7Zm3 0V4h8v3'};
const icons={home:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M15 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9',communities:'M4 19v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M8 7a4 4 0 1 0 8 0',together:'m8 12 3 3 5-6M4 5h16v14H4Z',projects:'M3 7h18v14H3ZM8 7V3h8v4M3 12h18',city:'M3 21V9h6v12M9 21V3h6v18M15 21V7h6v14',center:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-7h6v7',me:'M4 21v-2a8 8 0 0 1 16 0v2',messages:'M3 3h18v14H9l-6 4Z',settings:'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8M4 12h2M18 12h2M12 4v2M12 18v2',about:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M12 11v5M12 8h.01',arrow:'M5 12h14m-6-6 6 6-6 6',plus:'M12 5v14M5 12h14'};
function icon(k){const path=actionIcons[k]||icons[k]||icons.plus;return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"/>${k==='people'?'<circle cx="9" cy="7" r="4"/>':k==='me'?'<circle cx="12" cy="7" r="4"/>':''}</svg>`;}
const t=k=>I.COPY[lang][k]||I.COPY.en[k]||k;
const selectedCity=()=>{try{if(sessionStorage.getItem(ENTRY_KEY)==='guest')return 'Göteborg';}catch{}return store.get().profile.city||'';};
const citySupported=city=>/^(göteborg|goteborg|gothenburg)$/i.test((city||'').trim());
const navText=k=>k==='city'&&selectedCity()?t('city')+' · '+selectedCity():(k==='about'?t('aboutPage'):t(k));
const MOBILE_PRIMARY=NAV_ORDER;
const MOBILE_CONTEXT={
 home:['home-overview','home-attention','home-feed','home-actions'],
 together:['together','people','communities'],
 projects:['projects-overview','projects-mine','projects-tasks','projects-updates'],
 city:['city','center'],
 messages:['messages-chats','messages-direct','messages-groups','messages-invites'],
 me:['me','settings','about']
};
const mobilePrimaryFor=route=>['people','communities'].includes(route)?'together':route==='center'?'city':['settings','about'].includes(route)?'me':route;
const SUBSECTION_KEY='folkoop-subsection-v1';
let subsection='';
try{subsection=sessionStorage.getItem(SUBSECTION_KEY)||'';}catch{}
document.documentElement.dataset.folkoopSubsection=subsection;
const subsectionParent=k=>k?.startsWith('home-')?'home':k?.startsWith('projects-')?'projects':k?.startsWith('messages-')?'messages':'';
const SUBNAV_LABELS={
 en:{'home-overview':'Overview','home-attention':'Needs attention','home-feed':'What is happening','home-actions':'Quick actions','projects-overview':'Projects','projects-mine':'Mine','projects-tasks':'Tasks','projects-updates':'Updates','messages-chats':'Chats','messages-direct':'Direct','messages-groups':'Groups','messages-invites':'Invitations'},
 sv:{'home-overview':'Översikt','home-attention':'Behöver uppmärksamhet','home-feed':'Vad händer','home-actions':'Snabbåtgärder','projects-overview':'Projekt','projects-mine':'Mina','projects-tasks':'Uppgifter','projects-updates':'Uppdateringar','messages-chats':'Chattar','messages-direct':'Direkt','messages-groups':'Grupper','messages-invites':'Inbjudningar'},
 ru:{'home-overview':'Обзор','home-attention':'Требует внимания','home-feed':'Что происходит','home-actions':'Быстрые действия','projects-overview':'Проекты','projects-mine':'Мои','projects-tasks':'Задачи','projects-updates':'Обновления','messages-chats':'Чаты','messages-direct':'Личные','messages-groups':'Групповые','messages-invites':'Приглашения'},
 es:{'home-overview':'Resumen','home-attention':'Requiere atención','home-feed':'Qué ocurre','home-actions':'Acciones rápidas','projects-overview':'Proyectos','projects-mine':'Míos','projects-tasks':'Tareas','projects-updates':'Actualizaciones','messages-chats':'Chats','messages-direct':'Directos','messages-groups':'Grupos','messages-invites':'Invitaciones'},
 uk:{'home-overview':'Огляд','home-attention':'Потребує уваги','home-feed':'Що відбувається','home-actions':'Швидкі дії','projects-overview':'Проєкти','projects-mine':'Мої','projects-tasks':'Завдання','projects-updates':'Оновлення','messages-chats':'Чати','messages-direct':'Особисті','messages-groups':'Групові','messages-invites':'Запрошення'},
 fi:{'home-overview':'Yleiskuva','home-attention':'Vaatii huomiota','home-feed':'Mitä tapahtuu','home-actions':'Pikatoiminnot','projects-overview':'Projektit','projects-mine':'Omat','projects-tasks':'Tehtävät','projects-updates':'Päivitykset','messages-chats':'Keskustelut','messages-direct':'Yksityiset','messages-groups':'Ryhmät','messages-invites':'Kutsut'},
 bs:{'home-overview':'Pregled','home-attention':'Traži pažnju','home-feed':'Šta se dešava','home-actions':'Brze radnje','projects-overview':'Projekti','projects-mine':'Moji','projects-tasks':'Zadaci','projects-updates':'Ažuriranja','messages-chats':'Razgovori','messages-direct':'Direktno','messages-groups':'Grupe','messages-invites':'Pozivi'},
 ar:{'home-overview':'نظرة عامة','home-attention':'يحتاج انتباهًا','home-feed':'ما الذي يحدث','home-actions':'إجراءات سريعة','projects-overview':'المشاريع','projects-mine':'مشاريعي','projects-tasks':'المهام','projects-updates':'التحديثات','messages-chats':'المحادثات','messages-direct':'مباشر','messages-groups':'المجموعات','messages-invites':'الدعوات'},
 fa:{'home-overview':'نمای کلی','home-attention':'نیازمند توجه','home-feed':'چه خبر است','home-actions':'کارهای سریع','projects-overview':'پروژه‌ها','projects-mine':'پروژه‌های من','projects-tasks':'وظایف','projects-updates':'به‌روزرسانی‌ها','messages-chats':'گفت‌وگوها','messages-direct':'مستقیم','messages-groups':'گروه‌ها','messages-invites':'دعوت‌ها'},
 so:{'home-overview':'Dulmar','home-attention':'U baahan fiiro','home-feed':'Waxa dhacaya','home-actions':'Tallaabooyin degdeg ah','projects-overview':'Mashaariic','projects-mine':'Kuweyga','projects-tasks':'Hawlo','projects-updates':'Cusboonaysiin','messages-chats':'Wadahadallo','messages-direct':'Toos','messages-groups':'Kooxo','messages-invites':'Casuumado'},
 ku:{'home-overview':'Nêrîna giştî','home-attention':'Pêdivî bi baldarî ye','home-feed':'Çi diqewime','home-actions':'Kiryarên bilez','projects-overview':'Proje','projects-mine':'Yên min','projects-tasks':'Kar','projects-updates':'Nûvekirin','messages-chats':'Peyamdan','messages-direct':'Rasterast','messages-groups':'Kom','messages-invites':'Dawet'}
};
const defaultSubsection={home:'home-overview',projects:'projects-overview',messages:'messages-chats'};

const entryModeNow=()=>{try{return sessionStorage.getItem(ENTRY_KEY)||'';}catch{return '';}};
const isMuraVisit=()=>entryModeNow()==='guest'||document.body.classList.contains('guest-preview-open');
function renderMobileChrome(){
 const primary=$('#mobilePrimaryNav'),dock=$('#mobileContextDock');if(!primary||!dock)return;
 const active=mobilePrimaryFor(current);
 if(defaultSubsection[active]&&subsectionParent(subsection)!==active){subsection=defaultSubsection[active];try{sessionStorage.setItem(SUBSECTION_KEY,subsection);}catch{}}
 document.documentElement.dataset.folkoopSubsection=subsection;
 primary.dataset.activeSection=active;
 primary.innerHTML=MOBILE_PRIMARY.map(k=>'<a href="#/'+k+'" data-mobile-nav="'+k+'" data-section="'+k+'"'+(active===k?' aria-current="page"':'')+'>'+icon(k)+'<span>'+esc(k==='city'?t('city'):k==='me'?t('me'):t(k))+'</span></a>').join('');
 const guest=isMuraVisit();
 const guestContext={
  home:[],
  together:['together','people','communities'],
  projects:['projects-overview','projects-tasks','projects-updates'],
  city:['city'],
  messages:['messages-chats','messages-direct','messages-groups'],
  me:[]
 };
 const context=guest?(guestContext[active]||[]):(MOBILE_CONTEXT[active]||[]);
 dock.dataset.parentSection=active;
 const subLabel=k=>SUBNAV_LABELS[lang]?.[k]||SUBNAV_LABELS.en[k]||t(k==='about'?'aboutPage':k);
 const virtualTarget=k=>k.startsWith('home-')?'home':k.startsWith('projects-')?'projects':k.startsWith('messages-')?'messages':k;
 const items=context.map(k=>{const target=virtualTarget(k);const selected=(target===current&&subsection===k);return '<a href="#/'+target+'" data-mobile-subnav="'+k+'" data-subsection="'+k+'" data-section="'+active+'"'+(selected?' aria-current="page"':'')+'><span>'+esc(subLabel(k))+'</span></a>';}).join('');
 const language=active==='me'?'<button type="button" data-mobile-action="language">'+icon('settings')+'<span>'+esc(t('language'))+'</span></button>':'';
 const demo=guest?'<button class="mobile-demo-chip" type="button" data-mobile-action="demo" aria-expanded="false"><span class="demo-dot" aria-hidden="true"></span><span>Mura</span></button>':'';
 const exitText=lang==='ru'?'Выйти из аккаунта Муры':lang==='sv'?'Lämna Muras konto':'Leave Mura\'s account';
 const muraPopover=lang==='ru'?'Ты внутри моего FOLKOOP. Смотри мои дела, людей, переписки, черновики и город — здесь ничего не нужно создавать.':lang==='sv'?'Du är inne i mitt FOLKOOP. Utforska mina saker, människor, samtal, utkast och staden — du behöver inte skapa något här.':"You're inside my FOLKOOP. Explore my things, people, conversations, drafts and city — you don't need to create anything here.";
 const popover=guest?'<aside class="mobile-demo-popover" hidden><strong>Mura</strong><p>'+esc(muraPopover)+'</p><button class="button secondary" type="button" data-mobile-action="exitmura">'+esc(exitText)+'</button></aside>':'';
 dock.innerHTML=demo+items+language+popover;
 dock.hidden=!(guest||context.length);
 document.body.classList.toggle('mobile-context-visible',!dock.hidden);
}
function closeMobileDemo(){
 const dock=$('#mobileContextDock'),pop=dock?.querySelector('.mobile-demo-popover'),button=dock?.querySelector('[data-mobile-action="demo"]');
 if(pop)pop.hidden=true;if(button)button.setAttribute('aria-expanded','false');
}

const a=(route,label,cls='button')=>`<a class="${cls}" href="#/${route}">${esc(t(label))}${icon('arrow')}</a>`;
const button=(kind,key,cls='button')=>`<button class="${cls} intent-action intent-${kind}" type="button" data-create="${kind}" data-intent="${kind}">${icon(kind)}<span>${esc(t(key))}</span></button>`;
function head(title,body){return `<header class="section-head"><p class="eyebrow">FOLKOOP / ${esc(navText(current))}</p><h1 tabindex="-1">${esc(t(title))}</h1><p>${esc(t(body))}</p></header>`;}
function capture(){
 const f=$('#draftForm');if(f)scratch={...Object.fromEntries(new FormData(f)),kind:f.elements.kind.value};
 const p=$('#profileForm');if(p)profileScratch=Object.fromEntries(new FormData(p));
}
function status(ok=true){$('#status').textContent=t(ok?(store.isPersistent()?'savedDevice':'savedMemory'):'failed');}
function drafts(kinds){
 const items=store.get().drafts.filter(d=>(!kinds||kinds.includes(d.kind))&&(!query||(d.title+' '+d.body).toLocaleLowerCase().includes(query.toLocaleLowerCase())));
 if(!items.length)return `<div class="empty"><span class="empty-icon">${icon(current)}</span><h2>${esc(t(query?'noMatch':'noDrafts'))}</h2><p>${esc(t('noDraftsText'))}</p></div>`;
 return `<div class="draft-grid">${items.map(d=>`<article class="card draft ${d.done?'complete':''}"><span class="badge">${esc(t(d.kind))}</span><h2>${esc(d.title)}</h2><p class="draft-body">${esc(d.body)}</p><p class="meta">${esc(t(d.done?'marked':'local'))}</p><div class="row"><button type="button" class="text-button" data-toggle="${d.id}">${esc(t(d.done?'undo':'done'))}</button><button type="button" class="text-button danger" data-delete="${d.id}">${esc(t('remove'))}</button></div></article>`).join('')}</div>`;
}
function form(){
 if(!formKind)return '';
 const value=scratch.kind||formKind;
 return `<form id="draftForm" class="card editor"><div class="row"><h2>${esc(t(value))}</h2><button class="text-button" type="button" data-action="cancel">${esc(t('cancel'))}</button></div><p class="meta">${esc(t('local'))}</p><label>${esc(t('kind'))}<select name="kind">${C.KINDS.map(k=>`<option value="${k}"${k===value?' selected':''}>${esc(t(k))}</option>`).join('')}</select></label><label>${esc(t('title'))}<input name="title" required maxlength="100" value="${esc(scratch.title||'')}"></label><label>${esc(t('body'))}<textarea name="body" rows="4" maxlength="1500">${esc(scratch.body||'')}</textarea></label><button class="button" type="submit">${esc(t('create'))}${icon('arrow')}</button><p class="meta">${esc(t(store.isPersistent()?'device':'memory'))}</p></form>`;
}
function firstActions(){
 return `<section class="first-actions" aria-labelledby="firstActionsTitle"><div class="first-actions-copy"><p class="eyebrow">FOLKOOP</p><h2 id="firstActionsTitle">${esc(t('next'))}</h2><p>${esc(t('aboutText'))}</p></div><div class="first-actions-grid">${button('need','need','first-action')}${button('offer','offer','first-action')}${button('project','newProject','first-action')}</div></section>`;
}
function home(){
 return `<section class="hero"><div><p class="eyebrow">${esc(selectedCity()?selectedCity().toUpperCase()+' · FOLKOOP':'FOLKOOP')}</p><h1 tabindex="-1">${esc(t('hero')).replace('\n','<br>')}</h1><p>${esc(t('intro'))}</p></div><div class="hero-symbol" aria-hidden="true"><img src="./folkoop-mark.png" alt=""></div></section>${firstActions()}<section class="start secondary-actions"><div class="row"><h2>${esc(t('together'))}</h2><span class="muted">${esc(t('tagline'))}</span></div><div class="quick-grid">${['purchase','resource'].map(k=>button(k,k,'quick')).join('')}</div></section><div class="feature-grid"><article class="card city-card"><span class="small-icon">${icon('city')}</span><h2>${esc(t('city'))}</h2><p>${esc(t('cityText'))}</p>${a('city','openCity','text-link')}</article><article class="card"><span class="small-icon">${icon('projects')}</span><h2>${esc(t('projects'))}</h2><p>${esc(t('projectsText'))}</p>${a('projects','projects','text-link')}</article></div><section class="mission"><h2>${esc(t('mission'))}</h2><p>${esc(t('missionBody'))}</p></section>`;
}
function myPage(){
 const p=profileScratch||store.get().profile,draftsNow=store.get().drafts;
 const done=draftsNow.filter(d=>d.done).length;
 const kinds=[...new Set(draftsNow.map(d=>d.kind))];
 const accent=C.ACCENTS.includes(p.accent)?p.accent:'coral';
 const displayName=p.name||t('me');
 const identity=p.motto||p.about||p.skills||t('emptyProfile');
 const kindChips=kinds.length?kinds.map(k=>`<span class="my-place-chip intent-${k}">${icon(k)}<span>${esc(t(k))}</span></span>`).join(''):`<span class="muted">${esc(t('noDrafts'))}</span>`;
 return head('myPlace','myPlaceIntro')+`<section class="my-place-hero my-place-${accent}" aria-labelledby="myPlaceName"><div class="my-place-avatar" aria-hidden="true">${icon('me')}</div><div class="my-place-identity"><p class="eyebrow">${esc(t('myPlace'))}</p><h2 id="myPlaceName">${esc(displayName)}</h2><p class="my-place-motto">${esc(identity)}</p><p class="meta">${esc(p.city||'FOLKOOP')}</p></div><button class="button secondary" type="button" data-action="toggle-my-place-editor" aria-expanded="false">${esc(t('editMyPlace'))}</button></section>
 ${draftsNow.length?`<section class="my-place-life" aria-labelledby="myActivityTitle"><div class="row"><h2 id="myActivityTitle">${esc(t('myActivity'))}</h2><span class="muted">${esc(t('local'))}</span></div><div class="my-place-stats"><article><strong>${draftsNow.length}</strong><span>${esc(t('createdByMe'))}</span></article><article><strong>${done}</strong><span>${esc(t('completedByMe'))}</span></article></div><div class="my-place-kinds"><h3>${esc(t('myKinds'))}</h3><div class="my-place-chips">${kindChips}</div></div></section>`:`<section class="my-place-empty"><div class="my-place-empty-mark" aria-hidden="true">${icon('me')}</div><div><h2>${esc(t('makeItYours'))}</h2><p>${esc(t('makeItYoursText'))}</p></div><button class="button secondary" type="button" data-action="toggle-my-place-editor" aria-expanded="false">${esc(t('editMyPlace'))}</button></section>`}
 <div id="myPlaceEditorPanel" class="profile-grid" hidden><form id="profileForm" class="card editor" data-my-place-editor><span id="myPlaceEditor" class="anchor-target" aria-hidden="true"></span><h2>${esc(t('editMyPlace'))}</h2><div class="profile-avatar" aria-hidden="true">${icon('me')}</div><label>${esc(t('name'))}<input name="name" maxlength="60" autocomplete="nickname" value="${esc(p.name||'')}"></label><label>${esc(t('motto'))}<input name="motto" maxlength="100" value="${esc(p.motto||'')}"></label><fieldset class="my-place-accent"><legend>${esc(t('accent'))}</legend>${C.ACCENTS.map(a=>`<label class="accent-choice accent-${a}"><input type="radio" name="accent" value="${a}"${a===accent?' checked':''}><span aria-hidden="true"></span>${esc(t('accent'+a[0].toUpperCase()+a.slice(1)))}</label>`).join('')}</fieldset><label>${esc(t('cityProfile'))}<input name="city" maxlength="120" autocomplete="address-level2" value="${esc(p.city||'')}"></label><p class="meta">${esc(t('cityHelp'))}</p><label>${esc(t('skills'))}<input name="skills" maxlength="200" value="${esc(p.skills||'')}"></label><label>${esc(t('about'))}<textarea name="about" rows="4" maxlength="600">${esc(p.about||'')}</textarea></label><p class="meta">${esc(t('privacy'))}</p><button class="button" type="submit">${esc(t('saveProfile'))}</button></form><aside><div class="card"><h2>${esc(t('profileSaved'))}</h2><p>${esc(t('myText'))}</p><label class="checkbox"><input id="remember" type="checkbox"${store.isPersistent()?' checked':''}> <span>${esc(t('remember'))}</span></label><p class="meta">${esc(t(store.isPersistent()?'device':'memory'))}</p><div class="stack"><button class="button secondary" type="button" data-action="export">${esc(t('export'))}</button><button class="text-button danger" type="button" data-action="clear">${esc(t('clear'))}</button></div></div></aside></div><h2>${esc(t('drafts'))}</h2>${drafts()}`;
}
function center(){return head('centerTitle','centerText')+`<div class="feature-grid">${[1,2,3].map(n=>`<article class="card"><span class="small-icon">${icon(['','people','together','center'][n])}</span><h2>${esc(t('centerCard'+n))}</h2><p>${esc(t('centerCard'+n+'Text'))}</p><span class="badge muted-badge">${esc(t('future'))}</span></article>`).join('')}</div><div class="actions">${a('communities','communities','button secondary')}${a('people','people','text-link')}</div>`;}

function settingsPage(){
 return head('settingsTitle','settingsText')+`<div class="feature-grid"><article class="card"><span class="small-icon">${icon('settings')}</span><h2>${esc(t('language'))}</h2><p>${esc(I.NAMES[lang]||lang)}</p></article><article class="card"><span class="small-icon">${icon('me')}</span><h2>${esc(t('cityProfile'))}</h2><p>${esc(selectedCity()||t('cityMissingText'))}</p>${a('me','profileLink','text-link')}</article><article class="card"><span class="small-icon">${icon('about')}</span><h2>${esc(t('repeatTutorial'))}</h2><button class="button secondary" type="button" data-action="tutorial">${esc(t('repeatTutorial'))}</button></article></div>`;
}
function aboutPage(){
 const architectureUrl='https://github.com/chup1runov/Folkoop/blob/main/docs/architecture/TRUST_IDENTITY_WEB4_ARCHITECTURE.md';
 return head('aboutTitle','aboutText')+`<section class="mission"><h2>${esc(t('mission'))}</h2><p>${esc(t('missionBody'))}</p></section><section class="future-architecture" aria-labelledby="futureArchitectureTitle"><div class="row"><div><h2 id="futureArchitectureTitle">${esc(t('futureArchitectureTitle'))}</h2><p class="muted">${esc(t('futureArchitectureText'))}</p></div><span class="badge muted-badge">${esc(t('future'))}</span></div><div class="feature-grid"><article class="card"><span class="small-icon">${icon('me')}</span><h2>${esc(t('trustLayerTitle'))}</h2><p>${esc(t('trustLayerText'))}</p></article><article class="card"><span class="small-icon">${icon('together')}</span><h2>${esc(t('agentLayerTitle'))}</h2><p>${esc(t('agentLayerText'))}</p></article><article class="card"><span class="small-icon">${icon('city')}</span><h2>${esc(t('networkLayerTitle'))}</h2><p>${esc(t('networkLayerText'))}</p></article><article class="card"><span class="small-icon">${icon('center')}</span><h2>${esc(t('physicalLayerTitle'))}</h2><p>${esc(t('physicalLayerText'))}</p></article></div><aside class="notice"><p>${esc(t('futureArchitectureNote'))}</p></aside><p><a class="text-link" href="${architectureUrl}" target="_blank" rel="noopener noreferrer">${esc(t('futureArchitectureLink'))} ↗</a></p></section><div class="card"><p><strong>FOLKOOP</strong></p><p class="meta">${esc(t('tagline'))}</p></div>`;
}
function cityShell(){
 const city=selectedCity();
 if(!city)return head('cityMissingTitle','cityMissingText')+`<div class="actions">${a('me','profileLink')}</div>`;
 if(!citySupported(city))return head('cityUnsupportedTitle','cityUnsupportedText')+`<article class="card"><h2>${esc(city)}</h2><p>${esc(t('cityUnsupportedText'))}</p><div class="actions">${a('me','profileLink','button secondary')}</div></article>`;
 return head('city','cityText')+`<a class="text-link" href="./city.html?embedded=1" target="_blank" rel="noopener">${esc(t('cityFull'))} ↗</a>`;
}

const tutorialCopy={
 en:{
  welcome:"Hi! I'm Mura. Let me show you FOLKOOP through my own examples — it is quicker than reading a long manual.",
  home:"This is my place. It shows who I am, what I can offer and what I am already doing. Your place starts empty and grows from real things you do.",
  together:"Look: I need a tile cutter for one weekend. I say what I need and where, and FOLKOOP helps me find a person or resource for the next step.",
  projects:"And I can help too. I know a little photography, so I can offer to photograph an item, a small event or a neighbour's project.",
  people:"Here is my plant-and-seed exchange. A simple idea can gain people, tasks and a work chat instead of getting lost among unrelated messages.",
  city:"When I need someone, I am not looking for followers. I look for a practical connection — gardening, cycling, repairs or helping nearby.",
  center:"Once we have found each other, Messages is where we arrange the actual work. City gives local information; Center is a future physical place.",
  quick:"That's the important part. Now make your place yours: start with one real thing you need, can offer or want to do together."
 },
 ru:{
  welcome:"Привет! Я Мура. Давай я покажу всё на своих примерах — так быстрее понять FOLKOOP, чем читать длинную инструкцию.",
  home:"Это моё место. Здесь видно, кто я, чем могу помочь и что уже делаю. Твоё место начнётся пустым и будет расти из твоих настоящих дел.",
  together:"Смотри: мне на выходные нужен плиткорез. Я описываю, что нужно и где, а FOLKOOP помогает найти человека или ресурс для следующего шага.",
  projects:"А здесь наоборот: я могу помочь сама. Я немного фотографирую, поэтому могу предложить соседу снять вещь, событие или небольшой проект.",
  people:"Вот мой обмен растениями и семенами. Простая идея здесь может получить участников, задачи и рабочий чат — и не потеряться среди случайных сообщений.",
  city:"Когда нужен человек, я ищу не подписчиков, а тех, с кем есть практическое пересечение: сад, велосипед, ремонт или помощь рядом.",
  center:"Когда мы уже нашли друг друга, переходим в Сообщения и договариваемся о деле. Город даёт местную информацию; Центр пока только будущая физическая точка.",
  quick:"Вот и всё главное. Теперь твоё место: начни с одной настоящей вещи — что тебе нужно, чем можешь помочь или что хочешь сделать вместе."
 },
 sv:{
  welcome:"Hej! Jag är Mura. Jag visar FOLKOOP med mina egna exempel — det går snabbare än att läsa en lång instruktion.",
  home:"Det här är min plats. Här syns vem jag är, vad jag kan erbjuda och vad jag redan gör. Din plats börjar tom och växer med verkliga saker du gör.",
  together:"Titta: jag behöver en kakelskärare över en helg. Jag säger vad jag behöver och var, så hjälper FOLKOOP mig hitta en person eller resurs för nästa steg.",
  projects:"Och jag kan hjälpa till själv. Jag kan lite fotografering och kan erbjuda mig att fotografera en sak, ett litet evenemang eller en grannes projekt.",
  people:"Här är mitt växt- och fröbyte. En enkel idé kan få deltagare, uppgifter och en arbetschatt i stället för att försvinna bland andra meddelanden.",
  city:"När jag behöver någon letar jag inte efter följare. Jag letar efter en praktisk koppling — odling, cykling, reparationer eller hjälp i närheten.",
  center:"När vi väl har hittat varandra använder vi Meddelanden för att komma överens om arbetet. Stad ger lokal information; Center är en framtida fysisk plats.",
  quick:"Det var det viktigaste. Nu är det din tur: börja med en verklig sak du behöver, kan erbjuda eller vill göra tillsammans."
 }
};
const tutorialTitles={
 en:{welcome:"Hi, I'm Mura",home:'This is my place',together:'A tool I need',projects:'What I can offer',people:'A project I started',city:'How I find people',center:'Where we coordinate',quick:'Now make your place yours'},
 ru:{welcome:'Привет, я Мура',home:'Это моё место',together:'Что мне понадобилось',projects:'Чем я могу помочь',people:'Проект, который я начала',city:'Как я нахожу людей',center:'Где мы договариваемся',quick:'Теперь сделай своё место своим'},
 sv:{welcome:'Hej, jag är Mura',home:'Det här är min plats',together:'Ett verktyg jag behöver',projects:'Det jag kan erbjuda',people:'Ett projekt jag startade',city:'Så hittar jag människor',center:'Där vi samordnar',quick:'Gör nu din plats till din'}
};
const entryCopy={
 en:{title:"Hi, I'm Mura",body:"I'm the FOLKOOP guide. FOLKOOP helps turn “I need”, “I can offer” or “I want to do” into relevant people, resources and a concrete next step. Come visit my place and I'll show you how it works — or sign in if you're ready to make your own place.",email:'Sign in / register',guest:"Come visit Mura",guestNote:"Mura's place is a guided learning space. The people and activities you meet there are examples used to teach FOLKOOP, not claims about real participants.",language:'Choose language'},
 ru:{title:'Привет! Я Мура',body:'Я помощница FOLKOOP. Здесь «мне нужно», «я могу предложить» или «я хочу что-то сделать» превращается в людей, ресурсы и конкретный следующий шаг. Заходи ко мне в гости — я покажу, как всё устроено. Или войди, если уже готов создать своё место.',email:'Войти / зарегистрироваться',guest:'Зайти к Муре в гости',guestNote:'Место Муры — учебное пространство. Люди и действия, которые встретятся в гостях, используются как примеры, чтобы познакомить тебя с FOLKOOP.',language:'Выбери язык'},
 sv:{title:'Hej! Jag är Mura',body:'Jag är FOLKOOP-guiden. Här kan ”jag behöver”, ”jag kan erbjuda” eller ”jag vill göra” bli människor, resurser och ett konkret nästa steg. Kom hem till mig så visar jag hur det fungerar — eller logga in om du är redo att skapa din egen plats.',email:'Logga in / registrera dig',guest:'Hälsa på hos Mura',guestNote:'Muras plats är en guidad lärmiljö. Personer och aktiviteter du möter där är exempel som visar hur FOLKOOP fungerar, inte påståenden om verkliga deltagare.',language:'Välj språk'},
 es:{title:'¡Hola! Soy Mura',body:'Soy la guía de FOLKOOP. Aquí «necesito», «puedo ofrecer» o «quiero hacer» puede convertirse en personas, recursos y un siguiente paso concreto. Ven a visitarme y te enseñaré cómo funciona, o inicia sesión para crear tu propio espacio.',email:'Entrar / registrarse',guest:'Visitar a Mura',guestNote:'El espacio de Mura es un entorno guiado de aprendizaje. Las personas y actividades que aparecen son ejemplos para explicar FOLKOOP, no afirmaciones sobre participantes reales.',language:'Elige idioma'},
 uk:{title:'Привіт! Я Мура',body:'Я помічниця FOLKOOP. Тут «мені потрібно», «я можу запропонувати» або «я хочу щось зробити» перетворюється на людей, ресурси та конкретний наступний крок. Заходь до мене в гості — я покажу, як усе працює, або увійди, щоб створити своє місце.',email:'Увійти / зареєструватися',guest:'Зайти до Мури в гості',guestNote:'Місце Мури — навчальний простір. Люди й дії тут є прикладами для знайомства з FOLKOOP, а не твердженнями про реальних учасників.',language:'Обери мову'},
 fi:{title:'Hei! Olen Mura',body:'Olen FOLKOOP-opas. Täällä ”tarvitsen”, ”voin tarjota” tai ”haluan tehdä” voi johtaa sopiviin ihmisiin, resursseihin ja konkreettiseen seuraavaan askeleeseen. Tule käymään luonani, niin näytän miten tämä toimii — tai kirjaudu luomaan oma paikkasi.',email:'Kirjaudu / rekisteröidy',guest:'Tule Muran luo kylään',guestNote:'Muran paikka on ohjattu oppimisympäristö. Siellä näkyvät ihmiset ja toiminta ovat esimerkkejä FOLKOOPin opetteluun, eivät väitteitä oikeista osallistujista.',language:'Valitse kieli'},
 bs:{title:'Zdravo! Ja sam Mura',body:'Ja sam FOLKOOP vodič. Ovdje se „treba mi“, „mogu ponuditi“ ili „želim uraditi“ može pretvoriti u ljude, resurse i konkretan sljedeći korak. Dođi mi u goste da ti pokažem kako radi, ili se prijavi da napraviš svoje mjesto.',email:'Prijava / registracija',guest:'Dođi Muri u goste',guestNote:'Murino mjesto je vođeni prostor za učenje. Ljudi i aktivnosti koje vidiš služe kao primjeri za upoznavanje FOLKOOP-a, a nisu tvrdnje o stvarnim učesnicima.',language:'Izaberi jezik'},
 ar:{title:'مرحباً! أنا مورا',body:'أنا مرشدة FOLKOOP. هنا يمكن أن تتحول «أحتاج» أو «أستطيع أن أقدم» أو «أريد أن أفعل» إلى أشخاص وموارد وخطوة تالية واضحة. تعال لزيارتي وسأريك كيف يعمل FOLKOOP، أو سجّل الدخول لإنشاء مساحتك.',email:'تسجيل الدخول / التسجيل',guest:'زيارة مورا',guestNote:'مساحة مورا بيئة تعليمية موجهة. الأشخاص والأنشطة فيها أمثلة لشرح FOLKOOP وليست ادعاءات عن مشاركين حقيقيين.',language:'اختر اللغة'},
 fa:{title:'سلام! من مورا هستم',body:'من راهنمای FOLKOOP هستم. اینجا «نیاز دارم»، «می‌توانم ارائه کنم» یا «می‌خواهم انجام دهم» می‌تواند به آدم‌ها، منابع و یک گام بعدی مشخص برسد. به دیدنم بیا تا نشان بدهم چگونه کار می‌کند، یا وارد شو و جای خودت را بساز.',email:'ورود / ثبت‌نام',guest:'به دیدن مورا برو',guestNote:'جای مورا یک فضای آموزشی هدایت‌شده است. افراد و فعالیت‌های آن نمونه‌هایی برای آشنایی با FOLKOOP هستند، نه ادعا دربارهٔ شرکت‌کنندگان واقعی.',language:'زبان را انتخاب کن'},
 so:{title:'Salaan! Waxaan ahay Mura',body:'Waxaan ahay hagaha FOLKOOP. Halkan “waxaan u baahanahay”, “waan bixin karaa” ama “waxaan rabaa inaan sameeyo” waxay kuu horseedi karaan dad, kheyraad iyo tallaabo xigta oo cad. I soo booqo si aan kuu tuso sida ay u shaqeyso, ama soo gal si aad meeshaada u samaysato.',email:'Soo gal / isdiiwaangeli',guest:'Booqo Mura',guestNote:'Meesha Mura waa goob waxbarasho oo la hago. Dadka iyo hawlaha halkaas ka muuqda waa tusaalooyin lagu baranayo FOLKOOP, ma aha sheegashooyin ku saabsan ka-qaybgalayaal dhab ah.',language:'Dooro luqad'},
 ku:{title:'Silav! Ez Mura me',body:'Ez rêbera FOLKOOP im. Li vir “pêdiviya min heye”, “ez dikarim pêşkêş bikim” an “ez dixwazim bikim” dikare bibe mirov, çavkanî û gaveke paşîn a zelal. Were mêvanê min da ku ez nîşan bidim çawa dixebite, an têkevî û cihê xwe çêke.',email:'Têketin / qeydkirin',guest:'Were mêvanê Mura',guestNote:'Cihê Mura cihê hînbûnê yê rêberkirî ye. Mirov û çalakiyên li wir nimûne ne ji bo nasîna FOLKOOP, ne îdiayên derbarê beşdarên rastîn.',language:'Ziman hilbijêre'}
};
const muraEntryCopy={
 en:{title:"Hi! I'm Mura",body:"Come in. I'll show you my FOLKOOP from the inside — the people I know, things I'm trying to do, conversations, projects and unfinished ideas.",guest:"Enter Mura's account",note:"Mura and her circle are an interactive story created to explore how FOLKOOP works.",language:"Choose language",exitTitle:"Want a FOLKOOP of your own?",exitBody:"You've seen how I use mine. Now you can sign in or create your own account — or go back and keep exploring.",exitNote:"Your account starts with your own people, ideas and things to do.",email:"Sign in / register",back:"Go back to Mura"},
 sv:{title:"Hej! Jag är Mura",body:"Kom in. Jag visar mitt FOLKOOP inifrån — människorna jag känner, saker jag försöker göra, samtal, projekt och idéer jag ännu inte hunnit med.",guest:"Gå in i Muras konto",note:"Mura och hennes omgivning är en interaktiv berättelse skapad för att utforska hur FOLKOOP fungerar.",language:"Välj språk",exitTitle:"Vill du ha ett eget FOLKOOP?",exitBody:"Du har sett hur jag använder mitt. Nu kan du logga in eller skapa ditt eget konto — eller gå tillbaka och fortsätta utforska mitt.",exitNote:"Ditt konto börjar med dina människor, idéer och verkliga saker att göra.",email:"Logga in / registrera dig",back:"Tillbaka till Mura"},
 ru:{title:"Привет! Я Мура",body:"Заходи. Я покажу свой FOLKOOP изнутри — людей, с которыми общаюсь, дела, переписки, проекты и идеи, до которых ещё не дошли руки.",guest:"Зайти в аккаунт Муры",note:"Мура и её окружение — интерактивная история, созданная для знакомства с FOLKOOP.",language:"Выбери язык",exitTitle:"Хочешь такой FOLKOOP для себя?",exitBody:"Ты уже увидел, как я пользуюсь своим. Теперь можно войти или создать собственный аккаунт — либо вернуться и продолжить смотреть мой.",exitNote:"Твой аккаунт начнётся с твоих людей, идей и реальных дел.",email:"Войти / зарегистрироваться",back:"Вернуться к Муре"},
 es:{title:"¡Hola! Soy Mura",body:"Entra. Te enseñaré mi FOLKOOP desde dentro: la gente que conozco, cosas que intento hacer, conversaciones, proyectos e ideas pendientes.",guest:"Entrar en la cuenta de Mura",note:"Mura y su entorno forman una historia interactiva creada para explorar cómo funciona FOLKOOP.",language:"Elige idioma",exitTitle:"¿Quieres un FOLKOOP propio?",exitBody:"Ya has visto cómo uso el mío. Ahora puedes iniciar sesión o crear tu cuenta, o volver y seguir explorando.",exitNote:"Tu cuenta empieza con tu propia gente, ideas y cosas reales por hacer.",email:"Entrar / registrarse",back:"Volver con Mura"},
 uk:{title:"Привіт! Я Мура",body:"Заходь. Я покажу свій FOLKOOP зсередини — людей, яких знаю, справи, розмови, проєкти та ідеї, до яких ще не дійшли руки.",guest:"Зайти в акаунт Мури",note:"Мура та її оточення — інтерактивна історія, створена для знайомства з FOLKOOP.",language:"Обери мову",exitTitle:"Хочеш власний FOLKOOP?",exitBody:"Ти вже побачив, як я користуюся своїм. Тепер можна увійти або створити власний акаунт — чи повернутися й досліджувати далі.",exitNote:"Твій акаунт почнеться з твоїх людей, ідей і реальних справ.",email:"Увійти / зареєструватися",back:"Повернутися до Мури"},
 fi:{title:"Hei! Olen Mura",body:"Tule sisään. Näytän FOLKOOPini sisältäpäin — tuntemani ihmiset, tekemiseni, keskustelut, projektit ja keskeneräiset ideat.",guest:"Siirry Muran tilille",note:"Mura ja hänen ympärillään oleva maailma ovat interaktiivinen tarina, jonka avulla voi tutkia FOLKOOPin toimintaa.",language:"Valitse kieli",exitTitle:"Haluatko oman FOLKOOPin?",exitBody:"Olet nähnyt, miten käytän omaani. Nyt voit kirjautua tai luoda oman tilin — tai palata jatkamaan tutkimista.",exitNote:"Oma tilisi alkaa omista ihmisistäsi, ideoistasi ja oikeista tekemisistäsi.",email:"Kirjaudu / rekisteröidy",back:"Takaisin Muran luo"},
 bs:{title:"Zdravo! Ja sam Mura",body:"Uđi. Pokazat ću ti svoj FOLKOOP iznutra — ljude koje poznajem, stvari koje pokušavam uraditi, razgovore, projekte i nedovršene ideje.",guest:"Uđi u Murin račun",note:"Mura i njen krug su interaktivna priča napravljena za istraživanje načina na koji FOLKOOP radi.",language:"Izaberi jezik",exitTitle:"Želiš svoj FOLKOOP?",exitBody:"Vidio/la si kako koristim svoj. Sada se možeš prijaviti ili napraviti svoj račun — ili se vratiti i nastaviti istraživati.",exitNote:"Tvoj račun počinje tvojim ljudima, idejama i stvarnim stvarima koje želiš uraditi.",email:"Prijava / registracija",back:"Nazad kod Mure"},
 ar:{title:"مرحباً! أنا مورا",body:"تفضل بالدخول. سأريك FOLKOOP الخاص بي من الداخل — الأشخاص الذين أعرفهم، ما أحاول إنجازه، المحادثات والمشاريع والأفكار التي لم أبدأ بها بعد.",guest:"ادخل إلى حساب مورا",note:"مورا ومحيطها قصة تفاعلية صُممت لاستكشاف طريقة عمل FOLKOOP.",language:"اختر اللغة",exitTitle:"هل تريد FOLKOOP خاصاً بك؟",exitBody:"لقد رأيت كيف أستخدم حسابي. يمكنك الآن تسجيل الدخول أو إنشاء حسابك، أو العودة ومواصلة الاستكشاف.",exitNote:"يبدأ حسابك بأشخاصك وأفكارك والأشياء الحقيقية التي تريد إنجازها.",email:"تسجيل الدخول / التسجيل",back:"العودة إلى مورا"},
 fa:{title:"سلام! من مورا هستم",body:"بیا داخل. FOLKOOP خودم را از درون نشانت می‌دهم — آدم‌هایی که می‌شناسم، کارهایی که دنبال می‌کنم، گفت‌وگوها، پروژه‌ها و ایده‌های نیمه‌تمام.",guest:"ورود به حساب مورا",note:"مورا و دنیای اطرافش یک داستان تعاملی برای شناخت نحوهٔ کار FOLKOOP است.",language:"زبان را انتخاب کن",exitTitle:"FOLKOOP خودت را می‌خواهی؟",exitBody:"دیدی که من چطور از حسابم استفاده می‌کنم. حالا می‌توانی وارد شوی یا حساب خودت را بسازی، یا برگردی و بیشتر بگردی.",exitNote:"حساب تو با آدم‌ها، ایده‌ها و کارهای واقعی خودت شروع می‌شود.",email:"ورود / ثبت‌نام",back:"بازگشت به مورا"},
 so:{title:"Salaan! Waxaan ahay Mura",body:"Soo gal. Waxaan ku tusayaa FOLKOOP-kayga gudaha — dadka aan aqaan, waxyaabaha aan qabanayo, wada sheekaysiga, mashaariicda iyo fikradaha aan wali dhammayn.",guest:"Gal akoonka Mura",note:"Mura iyo dadka ku xeeran waa sheeko is-dhexgal ah oo lagu sahaminayo sida FOLKOOP u shaqeeyo.",language:"Dooro luqad",exitTitle:"Ma rabtaa FOLKOOP kuu gaar ah?",exitBody:"Waxaad aragtay sida aan kayga u isticmaalo. Hadda waad geli kartaa ama samaysan kartaa akoonkaaga — ama dib ayaad ugu noqon kartaa si aad u sii sahmiso.",exitNote:"Akoonkaagu wuxuu ka bilaabmaa dadkaaga, fikradahaaga iyo waxyaabaha dhabta ah ee aad rabto inaad qabato.",email:"Soo gal / isdiiwaangeli",back:"Ku noqo Mura"},
 ku:{title:"Silav! Ez Mura me",body:"Were hundir. Ez ê FOLKOOP-a xwe ji hundir ve nîşan bidim — mirovên ku nas dikim, karên ku dixwazim bikim, axaftin, proje û ramanên ku hîn neqediyayî ne.",guest:"Bikeve hesabê Mura",note:"Mura û derdora wê çîrokeke têkildar e ku ji bo keşfkirina awayê xebata FOLKOOP hatiye çêkirin.",language:"Ziman hilbijêre",exitTitle:"FOLKOOP-a xwe dixwazî?",exitBody:"Te dît ez çawa ya xwe bikar tînim. Niha dikarî têkevî an hesabê xwe çêkî — an vegerî û keşfê bidomînî.",exitNote:"Hesabê te bi mirov, raman û karên rastîn ên te dest pê dike.",email:"Têketin / qeydkirin",back:"Vegere Mura"}
};
const muraEntrySource=()=>muraEntryCopy[lang]||muraEntryCopy.en;
const entrySource=()=>entryCopy[lang]||entryCopy.en;
function ensureEntryGate(){
 let gate=document.getElementById('folkoopEntryGate');
 if(gate)return gate;
 gate=document.createElement('section');
 gate.id='folkoopEntryGate';gate.className='entry-gate';gate.hidden=true;
 gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-labelledby','entryGateTitle');
 gate.innerHTML='<div class="entry-gate-backdrop"></div><div class="entry-gate-card entry-welcome-card"><div class="entry-mura"><img src="./folkoop-guide-please.webp" alt="" width="192" height="208"></div><div class="entry-welcome-copy"><p class="eyebrow">FOLKOOP</p><h1 id="entryGateTitle"></h1><p id="entryGateBody" class="entry-gate-body"></p><p id="entryLanguageLabel" class="entry-language-label"></p><div id="entryLanguageChoices" class="entry-language-choices"></div><div class="entry-gate-actions"><button type="button" class="button" data-entry="guest"></button><button type="button" class="button secondary" data-entry="email"></button></div><p id="entryGateNote" class="meta entry-learning-note"></p></div></div>';
 document.body.append(gate);return gate;
}
function showEntryGate(noteOverride='',afterMuraExit=entryGateAfterMuraExit){
 const gate=ensureEntryGate(),x=muraEntrySource(),choices=gate.querySelector('#entryLanguageChoices');
 const emailButton=gate.querySelector('[data-entry="email"]'),guestButton=gate.querySelector('[data-entry="guest"]');
 gate.querySelector('#entryGateTitle').textContent=afterMuraExit?x.exitTitle:x.title;
 gate.querySelector('#entryGateBody').textContent=afterMuraExit?x.exitBody:x.body;
 gate.querySelector('#entryGateNote').textContent=noteOverride||(afterMuraExit?x.exitNote:x.note);
 gate.querySelector('#entryLanguageLabel').textContent=x.language;
 emailButton.textContent=x.email;emailButton.hidden=!afterMuraExit;
 guestButton.textContent=afterMuraExit?x.back:x.guest;
 guestButton.className=afterMuraExit?'button secondary':'button';
 emailButton.className='button';
 choices.innerHTML=C.LANGS.map(code=>'<button type="button" class="entry-language-choice'+(code===lang?' is-current':'')+'" data-entry-language="'+code+'" aria-pressed="'+String(code===lang)+'"><strong>'+esc(I.NAMES[code])+'</strong><span>'+code.toUpperCase()+'</span></button>').join('');
 gate.dir=['ar','fa'].includes(lang)?'rtl':'ltr';
 gate.hidden=false;document.body.classList.add('entry-gate-open');
 globalThis.FolkoopGuide?.element?.().setAttribute('hidden','');globalThis.FolkoopGuide?.syncModal?.();
}
function hideEntryGate(){
 const gate=ensureEntryGate();gate.hidden=true;document.body.classList.remove('entry-gate-open');globalThis.FolkoopGuide?.syncModal?.();
 globalThis.FolkoopGuide?.element?.().removeAttribute('hidden');
}
function setEntryMode(mode){
 entryGateAfterMuraExit=false;
 try{sessionStorage.setItem(ENTRY_KEY,mode);}catch{}
 hideEntryGate();
 window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:mode==='guest',target:mode==='guest'?'tour':mode}}));
 if(mode==='guest'){muraPracticeStep=0;muraPracticeXp=0;location.hash='#/me';setTimeout(()=>showOnboarding(0),260);}
 else {location.hash='#/me';setTimeout(()=>document.querySelector('#netLogin [name="email"]')?.focus(),80);}
}
const helperCopy={
 en:{name:'Mura',label:'FOLKOOP helper',open:'Open FOLKOOP guide',close:'Close',tour:'Show the full introduction again',intro:'I live here to explain what this part of FOLKOOP is for.',tips:{
  me:'Fill in only what helps cooperation: a name or nickname, city, skills and a short introduction. Directory visibility remains your choice.',
  home:'Home is the action-first overview. Start from something you need, can offer or want to build instead of scrolling for content.',
  messages:'Messages contains direct, group and cooperation work chats. The current pilot messaging is server-backed but not end-to-end encrypted.',
  people:'People helps you discover pilot participants who deliberately made their network profile visible.',
  communities:'Communities are longer-lived groups for people who want to coordinate around a place, interest or common activity.',
  together:'Together is the core cooperation area: needs, offers, shared resources and joint purchases.',
  projects:'Projects turns an idea into a team, tasks, roles, updates and a linked work chat.',
  city:'City connects you to civic information and official routes. FOLKOOP does not pretend to be the authority itself.',
  center:'Center is the future physical layer: meetings, learning, equipment and human help in real life.',
  settings:'Settings contains language and the button to replay the introduction.',
  about:'About explains the purpose, boundaries, current pilot state and the future architecture direction of FOLKOOP.'
 }},
 ru:{name:'Mura',label:'помощник FOLKOOP',open:'Открыть Муру',close:'Закрыть',tour:'Показать всю инструкцию ещё раз',intro:'Я живу здесь, чтобы объяснять, зачем нужен текущий раздел FOLKOOP.',tips:{
  me:'Заполни только то, что помогает кооперации: имя или ник, город, навыки и коротко о себе. Видимость сетевого профиля остаётся твоим выбором.',
  home:'Главная — обзор действий, а не лента. Начни с того, что тебе нужно, что ты можешь предложить или что хочешь сделать.',
  messages:'Сообщения — личные, групповые и рабочие чаты коопераций. В пилоте сообщения уже серверные, но пока не имеют сквозного шифрования.',
  people:'Люди помогают находить участников пилота, которые сами включили видимость своего сетевого профиля.',
  communities:'Сообщества — более постоянные группы вокруг места, интереса или общего дела.',
  together:'Вместе — ядро кооперации: потребности, предложения, общие ресурсы и совместные покупки.',
  projects:'Проекты превращают идею в команду, задачи, роли, обновления и связанный рабочий чат.',
  city:'Город связывает тебя с городской информацией и официальными маршрутами. FOLKOOP не выдаёт себя за муниципалитет или ведомство.',
  center:'Центр — будущий физический слой: встречи, обучение, оборудование и помощь людей в реальном мире.',
  settings:'В Настройках меняется язык и можно заново запустить эту инструкцию.',
  about:'О нас объясняет идею FOLKOOP, границы продукта, текущее состояние пилота и направление будущей архитектуры.'
 }},
 sv:{name:'Mura',label:'FOLKOOP-hjälp',open:'Öppna FOLKOOP guide',close:'Stäng',tour:'Visa hela introduktionen igen',intro:'Jag finns här för att förklara vad den aktuella delen av FOLKOOP är till för.',tips:{
  me:'Fyll bara i sådant som hjälper samarbete: namn eller smeknamn, stad, färdigheter och en kort presentation. Synlighet i nätverkskatalogen är ditt val.',
  home:'Hem är en handlingsöversikt, inte ett oändligt flöde. Börja med något du behöver, kan erbjuda eller vill bygga.',
  messages:'Meddelanden innehåller direkt-, grupp- och arbetschattar. Pilotens meddelanden är serverbaserade men ännu inte end-to-end-krypterade.',
  people:'Människor hjälper dig hitta pilotdeltagare som själva valt att visa sin nätverksprofil.',
  communities:'Gemenskaper är mer långvariga grupper kring en plats, ett intresse eller en gemensam aktivitet.',
  together:'Tillsammans är kärnan för samarbete: behov, erbjudanden, delade resurser och gemensamma köp.',
  projects:'Projekt gör en idé till team, uppgifter, roller, uppdateringar och en kopplad arbetschatt.',
  city:'Stad kopplar dig till samhällsinformation och officiella vägar utan att låtsas vara myndigheten.',
  center:'Center är det framtida fysiska lagret: möten, lärande, utrustning och mänsklig hjälp i verkligheten.',
  settings:'I Inställningar byter du språk och kan starta introduktionen igen.',
  about:'Om oss förklarar FOLKOOPs syfte, gränser, pilotens nuvarande läge och riktningen för den framtida arkitekturen.'
 }}
};
const muraTutorialCopy={
 en:{welcome:"Come in — this is my FOLKOOP. I'll show you what is happening in my life here, then you can roam around on your own.",home:"This is my profile and my unfinished thoughts. Some things are public, some are still private drafts. They are all part of the same place.",together:"I need a tile cutter for one weekend. Instead of posting into a void, I keep the need as a concrete thing that can connect to a person or resource.",projects:"I can help too. Photography is one of the things I offer when a neighbour or project needs it.",people:"This plant-and-seed exchange started as one small idea. Now it has people, tasks, updates and its own work chat.",city:"These are people around me. I don't need followers — I need people whose skills, interests or location cross with something I'm doing.",center:"Here are my conversations. Some are personal; some exist because a project needs somewhere to coordinate.",quick:"That's enough instruction. Now just look around my account: open anything that catches your eye and follow the connections."},
 ru:{welcome:"Заходи — это мой FOLKOOP. Я покажу, что здесь происходит в моей жизни, а потом просто походишь сама или сам и посмотришь всё, что захочется.",home:"Это мой профиль и мои незаконченные мысли. Что-то уже стало общим делом, а что-то пока лежит в личных черновиках — всё это живёт в одном месте.",together:"Мне на выходные нужен плиткорез. Вместо сообщения в пустоту я держу потребность как конкретное дело, которое может связаться с человеком или ресурсом.",projects:"А здесь наоборот — я могу помочь сама. Фотография — одна из вещей, которые я предлагаю, когда она нужна соседу или проекту.",people:"Этот обмен растениями начался с маленькой идеи. Теперь здесь есть люди, задачи, обновления и свой рабочий чат.",city:"Это люди вокруг меня. Мне не нужны подписчики — мне нужны те, чьи навыки, интересы или район пересекаются с тем, что я делаю.",center:"А это мои переписки. Одни личные, другие появились потому, что проекту понадобилось место, где можно договориться.",quick:"На этом инструкция заканчивается. Теперь просто походи по моему аккаунту: открывай всё, что цепляет, и смотри, куда ведут связи."},
 sv:{welcome:"Kom in — det här är mitt FOLKOOP. Jag visar vad som händer i mitt liv här, sedan kan du bara gå runt och utforska själv.",home:"Det här är min profil och mina ofärdiga tankar. Vissa saker är redan gemensamma, andra ligger fortfarande som privata utkast — allt hör ihop på samma plats.",together:"Jag behöver en kakelskärare över en helg. I stället för att skriva ut i tomma intet håller jag behovet som en konkret sak som kan kopplas till en person eller resurs.",projects:"Och jag kan hjälpa till själv. Fotografering är en av sakerna jag erbjuder när en granne eller ett projekt behöver det.",people:"Det här växt- och fröbytet började som en liten idé. Nu finns människor, uppgifter, uppdateringar och en egen arbetschatt.",city:"Det här är människor runt mig. Jag behöver inte följare — jag behöver personer vars färdigheter, intressen eller område korsar något jag gör.",center:"Här är mina samtal. Några är personliga, andra finns för att ett projekt behöver en plats att samordna på.",quick:"Det räcker som introduktion. Gå nu bara runt i mitt konto: öppna det som fångar dig och följ sambanden."}
};
const muraTutorialTitles={
 en:{welcome:"Welcome to my place",home:"What I keep here",together:"Something I need",projects:"Something I can offer",people:"An idea that grew",city:"People around me",center:"Where we coordinate",quick:"Now explore on your own"},
 ru:{welcome:"Добро пожаловать ко мне",home:"Что я храню здесь",together:"Что мне понадобилось",projects:"Чем я могу помочь",people:"Идея, которая выросла",city:"Люди вокруг меня",center:"Где мы договариваемся",quick:"Теперь исследуй сам"},
 sv:{welcome:"Välkommen hem till mig",home:"Det jag har här",together:"Något jag behöver",projects:"Något jag kan erbjuda",people:"En idé som växte",city:"Människor runt mig",center:"Där vi samordnar",quick:"Utforska nu själv"}
};
const muraHelperCopy={
 en:{name:"Mura",label:"from my account",open:"Open Mura",close:"Close",tour:"Walk through my account again",intro:"Ask what this part means in my own life.",tips:{home:"This is my overview. I can jump from here into the plant exchange, the firewood purchase, people I know, chats, drafts and Göteborg.",me:"This is me — Göteborg, what I can help with, things I am thinking about and activity connected to my work.",together:"This is where I keep concrete needs, offers, shared resources and things we buy together.",projects:"Projects are where an idea grows legs: people, tasks, updates and a work chat.",people:"These are people I know through something concrete. Open their connections rather than treating them as followers.",communities:"These are places I return to: neighbours, language exchange, repair and other shared interests.",messages:"Omar and I are sorting out the firewood pickup; the plant-exchange chat is where that project keeps moving.",city:"Göteborg is part of my account. I can move from a local project into useful official city information without leaving the context."}},
 ru:{name:"Мура",label:"из моего аккаунта",open:"Открыть Муру",close:"Закрыть",tour:"Ещё раз пройтись по моему аккаунту",intro:"Если что-то непонятно — я расскажу, зачем это нужно именно в моей жизни.",tips:{home:"Это мой обзор. Отсюда я прыгаю в обмен растениями, закупку дров, людей, переписки, черновики и Göteborg.",me:"Это я: Göteborg, чем могу помочь, о чём думаю и что сейчас происходит вокруг моих дел.",together:"Здесь лежат мои конкретные потребности, предложения, общие ресурсы и совместные покупки.",projects:"В проекте идея обрастает людьми, задачами, обновлениями и рабочим чатом.",people:"Это люди, с которыми меня уже что-то связывает. Мне интереснее смотреть на связи, чем собирать подписчиков.",communities:"Это места, куда я возвращаюсь: соседи, языковой обмен, ремонт и другие общие интересы.",messages:"С Omar мы сейчас разбираемся с получением дров, а чат обмена растениями двигает мой проект дальше.",city:"Göteborg — часть моего аккаунта. Из местного дела я могу сразу перейти к полезной официальной городской информации."}},
 sv:{name:"Mura",label:"från mitt konto",open:"Öppna Mura",close:"Stäng",tour:"Gå igenom mitt konto igen",intro:"Om något är oklart berättar jag varför det finns i mitt eget liv.",tips:{home:"Det här är min översikt. Härifrån går jag till växtbytet, vedköpet, människor, samtal, utkast och Göteborg.",me:"Det här är jag: Göteborg, vad jag kan hjälpa med, vad jag funderar på och vad som händer kring mina saker.",together:"Här finns mina konkreta behov, erbjudanden, delade resurser och gemensamma köp.",projects:"I projekt får en idé människor, uppgifter, uppdateringar och en arbetschatt.",people:"Det här är människor jag redan har en konkret koppling till. Sambanden är viktigare än följare.",communities:"Det här är platser jag återkommer till: grannar, språkutbyte, reparation och andra gemensamma intressen.",messages:"Omar och jag försöker lösa hämtningen av veden; chatten för växtbytet driver projektet vidare.",city:"Göteborg är en del av mitt konto. Från ett lokalt projekt kan jag gå direkt till användbar officiell stadsinformation."}}
};
const extraCopy=globalThis.FolkoopExtraCopy?.languages||{};
for(const code of C.LANGS){
 const x=extraCopy[code];
 if(x?.tutorial)tutorialCopy[code]=x.tutorial;
 if(x?.tutorialTitles)tutorialTitles[code]=x.tutorialTitles;
 if(x?.helper)helperCopy[code]=x.helper;
}
function tutorialSource(){if(isMuraVisit()||tourReturnMode!==null)return muraTutorialCopy[lang]||muraTutorialCopy.en;return tutorialCopy[lang]||tutorialCopy.en;}
function tutorialTitle(step){
 const titles=(isMuraVisit()||tourReturnMode!==null)?(muraTutorialTitles[lang]||muraTutorialTitles.en):(tutorialTitles[lang]||tutorialTitles.en);
 return titles[step.id]||navText(step.route);
}
function tutorialText(step){
 const source=tutorialSource();
 return source[step.id]||source[step.route]||tutorialCopy.en[step.id]||tutorialCopy.en[step.route]||'';
}
function helperSource(){if(isMuraVisit())return muraHelperCopy[lang]||muraHelperCopy.en;return helperCopy[lang]||helperCopy.en;}
function helperTip(route=current){
 const source=helperSource();
 return source.tips[route]||helperCopy.en.tips[route]||source.intro;
}
function ensureHelper(){
 let shell=document.getElementById('folkoopHelperShell');
 if(shell)return shell;
 shell=document.createElement('div');
 shell.id='folkoopHelperShell';
 shell.className='folkoop-helper-shell';
 shell.innerHTML='<section id="folkoopHelperPanel" class="folkoop-helper-panel" role="dialog" aria-modal="false" aria-labelledby="folkoopHelperTitle" hidden><div class="folkoop-helper-head"><div><strong id="folkoopHelperTitle"></strong><span id="folkoopHelperLabel"></span></div><button type="button" class="text-button" data-helper="close" id="folkoopHelperClose"></button></div><p id="folkoopHelperIntro" class="meta"></p><p id="folkoopHelperBody"></p><button type="button" class="button secondary" data-helper="tour" id="folkoopHelperTour"></button></section>';
 document.body.append(shell);
 return shell;
}
function updateHelper(){
 const shell=ensureHelper(),source=helperSource(),panel=shell.querySelector('#folkoopHelperPanel');
 panel.hidden=!helperOpen;
 globalThis.FolkoopGuide?.setExpanded(helperOpen);
 shell.querySelector('#folkoopHelperTitle').textContent=source.name;
 shell.querySelector('#folkoopHelperLabel').textContent=source.label;
 shell.querySelector('#folkoopHelperClose').textContent=source.close;
 shell.querySelector('#folkoopHelperTour').textContent=source.tour;
 shell.querySelector('#folkoopHelperIntro').textContent=source.intro;
 shell.querySelector('#folkoopHelperBody').textContent=helperTip();
}
function ensureOnboarding(){
 let dialog=document.getElementById('onboarding');
 if(dialog)return dialog;
 dialog=document.createElement('div');
 dialog.id='onboarding';
 dialog.className='onboarding';
 dialog.hidden=true;
 dialog.innerHTML='<div class="onboarding-backdrop"></div><div id="onboardingSpotlight" class="onboarding-spotlight" aria-hidden="true"></div><section class="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle"><div class="onboarding-head"><div class="onboarding-guide"><span class="onboarding-guide-mark" aria-hidden="true">M</span><span id="onboardingGuideName"></span></div><button type="button" class="text-button" data-onboarding="skip"></button></div><h2 id="onboardingTitle"></h2><div class="onboarding-copy" id="onboardingCopy"><p id="onboardingBody"></p><div class="onboarding-scroll-cue" id="onboardingScrollCue" aria-hidden="true"><span>⌄</span></div></div><div id="muraPractice" class="mura-practice" hidden><span id="muraPracticeStars" aria-label="Mura tour progress">○ ○ ○</span><strong id="muraPracticeXp">0 / 3</strong></div><div class="onboarding-actions"><button type="button" class="button secondary" data-onboarding="back"></button><span id="onboardingProgress" class="onboarding-progress"></span><button type="button" class="button" data-onboarding="next"></button></div></section>';
 document.body.append(dialog);
 return dialog;
}
function onboardingTarget(step){
 const mobile=$('#mobilePrimaryNav')&&getComputedStyle($('#mobilePrimaryNav')).display!=='none';
 if(step.id==='helper')globalThis.FolkoopGuide?.home({instant:true,pose:step.pose||'wink'});
 // The final "start with one real thing" step used to target the Home quick grid.
 // On a narrow screen that grid can sit far below the fold while the modal tour
 // intentionally locks page scrolling. Point at the always-visible Together
 // destination instead: it is the mobile entry point for Need/Offer/Resource/
 // Shared Purchase and preserves the same user action without off-screen geometry.
 if(mobile&&step.id==='quick'){
  return document.querySelector('#mobilePrimaryNav [data-mobile-nav="together"]');
 }
 if(mobile&&step.target.startsWith('#nav')){
  const primary=mobilePrimaryFor(step.route);
  return document.querySelector(step.route===primary?'#mobilePrimaryNav [data-mobile-nav="'+primary+'"]':'#mobileContextDock [data-mobile-subnav="'+step.route+'"]');
 }
 if(menuOpen)closeMenu();
 return document.querySelector(step.target);
}
function positionOnboarding(step){
 const dialog=ensureOnboarding(),spot=dialog.querySelector('#onboardingSpotlight'),target=onboardingTarget(step);
 document.querySelectorAll('.tutorial-target').forEach(x=>x.classList.remove('tutorial-target'));
 if(!target){spot.hidden=false;dialog.dataset.noTarget='1';spot.style.left='12px';spot.style.top='12px';spot.style.width='1px';spot.style.height='1px';globalThis.FolkoopGuide?.syncModal?.();return;}
 if(step.id!=='helper')target.classList.add('tutorial-target');
 if(step.id!=='helper'){
  // WebKit may ignore scrollIntoView() for a target inside content that is
  // currently inert because the modal tour owns focus. Move the document
  // explicitly so every highlighted target is actually visible before guide
  // geometry is calculated.
  const r=target.getBoundingClientRect();
  const mobile=innerWidth<=760;
  const dockReserve=mobile?(document.body.classList.contains('mobile-context-visible')?126:76):24;
  const safeTop=mobile?72:24;
  const safeBottom=innerHeight-dockReserve;
  if(r.top<safeTop||r.bottom>safeBottom){
   const desired=(safeTop+safeBottom)/2;
   const locked=document.body.classList.contains('guide-tour-open');
   if(locked)document.body.classList.remove('guide-tour-open');
   window.scrollBy(0,r.top+r.height/2-desired);
   if(locked)document.body.classList.add('guide-tour-open');
  }
 }
 requestAnimationFrame(()=>{
  const rect=target.getBoundingClientRect(),pad=7;
  spot.hidden=false;dialog.dataset.noTarget='0';
  spot.style.left=Math.max(6,rect.left-pad)+'px';
  spot.style.top=Math.max(6,rect.top-pad)+'px';
  spot.style.width=Math.min(innerWidth-12,rect.width+pad*2)+'px';
  spot.style.height=Math.min(innerHeight-12,rect.height+pad*2)+'px';
  dialog.querySelector('.onboarding-card').dataset.side=rect.left+rect.width/2<innerWidth/2?'right':'left';
  if(step.id!=='helper')globalThis.FolkoopGuide?.teleportTo(target,{mode:step.motion||'point',pose:step.pose||null});
 });
}
function updateOnboardingScrollCue(){
 const dialog=ensureOnboarding(),copy=dialog.querySelector('#onboardingCopy'),cue=dialog.querySelector('#onboardingScrollCue');
 if(!copy||!cue)return;
 const overflow=copy.scrollHeight>copy.clientHeight+3;
 const atEnd=copy.scrollTop+copy.clientHeight>=copy.scrollHeight-3;
 cue.hidden=!overflow||atEnd;
}
function muraPracticeForStep(step){return step===2?1:step===3?2:step===4?3:0;}
function updateMuraPractice(){
 const dialog=ensureOnboarding(),box=dialog.querySelector('#muraPractice');if(!box)return;
 box.hidden=muraPracticeStep===0&&onboardingStep<2;
 dialog.querySelector('#muraPracticeStars').textContent=[0,1,2].map(i=>i<muraPracticeStep?'●':'○').join(' ');
 dialog.querySelector('#muraPracticeXp').textContent=muraPracticeStep+' / 3';
}
function completeMuraPractice(step){
 const n=muraPracticeForStep(step);if(!n||n<=muraPracticeStep)return;
 muraPracticeStep=n;muraPracticeXp=Math.min(15,n*5);updateMuraPractice();
 globalThis.FolkoopGuide?.react?.('done');
}
function showOnboarding(step=0){
 onboardingOpen=true;
 onboardingStep=Math.max(0,Math.min(onboardingSteps.length-1,step));
 const item=onboardingSteps[onboardingStep],dialog=ensureOnboarding(),source=helperSource();
 dialog.hidden=false;
 if(current!==item.route){current=item.route;history.replaceState(null,'','#/'+item.route);render();}
 dialog.querySelector('#onboardingProgress').textContent=(onboardingStep+1)+' / '+onboardingSteps.length;
 dialog.querySelector('#onboardingGuideName').textContent=source.name+' · '+source.label;
 dialog.querySelector('#onboardingTitle').textContent=tutorialTitle(item);
 dialog.querySelector('#onboardingBody').textContent=tutorialText(item);
 const copy=dialog.querySelector('#onboardingCopy');if(copy){copy.scrollTop=0;copy.onscroll=updateOnboardingScrollCue;}
 requestAnimationFrame(updateOnboardingScrollCue);
 dialog.querySelector('[data-onboarding="skip"]').textContent=t('tutorialSkip');
 const rtl=document.documentElement.dir==='rtl';
 const back=dialog.querySelector('[data-onboarding="back"]');back.textContent=onboardingStep===0?t('tutorialBack'):(rtl?'→ ':'← ')+t('tutorialProgress')+' '+onboardingStep;back.disabled=onboardingStep===0;
 const taskPending=muraPracticeForStep(onboardingStep)&&muraPracticeStep<muraPracticeForStep(onboardingStep);
 const next=dialog.querySelector('[data-onboarding="next"]');
 next.textContent=taskPending?(lang==='ru'?'Посмотреть на деле':lang==='sv'?'Visa i praktiken':'See it in practice'):(onboardingStep===onboardingSteps.length-1?(lang==='ru'?'Осмотреться у Муры':lang==='sv'?'Utforska hos Mura':'Explore Mura\'s account'):t('tutorialProgress')+' '+(onboardingStep+2)+(rtl?' ←':' →'));
 updateMuraPractice();
 positionOnboarding(item);
 globalThis.FolkoopGuide?.react?.('step');
}
function finishOnboarding(){
 const temporaryTour=tourReturnMode!==null;
 const explicitMuraVisit=isMuraVisit()&&!temporaryTour;
 const guestTour=isMuraVisit()||temporaryTour;
 const completedMuraPractice=muraPracticeStep===3&&guestTour;
 onboardingOpen=false;
 const dialog=ensureOnboarding();dialog.hidden=true;
 dialog.querySelector('#onboardingSpotlight').hidden=true;
 document.querySelectorAll('.tutorial-target').forEach(x=>x.classList.remove('tutorial-target'));
 if(menuOpen)closeMenu();
 globalThis.FolkoopGuide?.home({instant:true});
 globalThis.FolkoopGuide?.react?.('done');
 try{storage?.setItem(ONBOARDING_KEY,'done');}catch{}
 onboardingDone=true;

 // Visiting Mura is a read-only account visit, not a forced transition into
 // the visitor's own empty account. Finishing or skipping the tour keeps Mura
 // active until the visitor explicitly leaves Mura's account.
 if(explicitMuraVisit){
  current='home';
  history.replaceState(null,'','#/'+current);
  render();
  globalThis.FolkoopGuide?.element?.().removeAttribute('hidden');
  tourReturnMode=null;
  return;
 }
 if(temporaryTour&&tourReturnMode==='guest'){
  current='home';history.replaceState(null,'','#/home');render();
  globalThis.FolkoopGuide?.element?.().removeAttribute('hidden');
  tourReturnMode=null;
  return;
 }

 const returnTarget=temporaryTour&&tourReturnMode==='account'?'account':'local';
 if(guestTour&&!completedMuraPractice){if(temporaryTour)window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:false,target:returnTarget,temporary:true}}));current='home';history.replaceState(null,'','#/home');render();tourReturnMode=null;}
 if(completedMuraPractice){try{if(returnTarget==='account')sessionStorage.setItem(ENTRY_KEY,'account');else sessionStorage.removeItem(ENTRY_KEY);}catch{}window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:false,target:returnTarget,temporary:temporaryTour}}));document.body.classList.remove('network-login-open','guest-preview-open');current='me';history.replaceState(null,'','#/me');render();document.body.classList.remove('network-login-open','guest-preview-open');globalThis.FolkoopGuide?.element?.().removeAttribute('hidden');tourReturnMode=null;setTimeout(()=>{const panel=$('#workspace');panel?.querySelector('.my-place-empty')?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'center'});},120);}
}
function openMenu(){
 menuOpen=true;document.body.classList.add('menu-open');
 const b=$('#mobileMenuToggle');if(b)b.setAttribute('aria-expanded','true');
}
function closeMenu(){
 menuOpen=false;document.body.classList.remove('menu-open');
 const b=$('#mobileMenuToggle');if(b)b.setAttribute('aria-expanded','false');
}
function showCity(){
 if(!citySupported(selectedCity())){$('#cityWorkspace').hidden=true;sendCity();return;}
 $('#cityWorkspace').hidden=false;
 const mura=isMuraVisit();
 if(frame&&frame.dataset.mura!==String(mura)){frame.remove();frame=null;}
 if(!frame){frame=document.createElement('iframe');frame.id='cityFrame';frame.dataset.mura=String(mura);frame.title=t('city');frame.setAttribute('allow','geolocation');frame.referrerPolicy='no-referrer';frame.src='./city.html?embedded=1'+(mura?'&mura=1':'')+'#'+initialCityHash;frame.addEventListener('load',()=>sendCity());$('#cityWorkspace').append(frame);}
 sendCity();
}
function sendCity(){frame?.contentWindow?.postMessage({type:'folkoop:city',language:lang,visible:current==='city'&&citySupported(selectedCity())},location.origin);}
function render(focus=false){
 if(isMuraVisit()&&['center','settings','about'].includes(current)){current=current==='center'?'city':'me';history.replaceState(null,'','#/'+current);}
 document.documentElement.lang=lang;document.documentElement.dir=['ar','fa'].includes(lang)?'rtl':'ltr';document.title=`${navText(current)} · FOLKOOP`;
 $('#nav').innerHTML='';
 renderMobileChrome();
 $('#nav').setAttribute('aria-label',t('select'));$('#brandHome').setAttribute('aria-label','FOLKOOP · '+t('home'));
 const messageLink=$('#messageLink');if(messageLink){messageLink.setAttribute('aria-label',t('messages'));const messageLabel=$('#messageLabel');if(messageLabel)messageLabel.textContent=t('messages');}
 $('#languageLabel').textContent=t('language');$('#language').value=lang;$('#skip').textContent=t('skip'); const sidebarTagline=$('#sidebarTagline');if(sidebarTagline)sidebarTagline.textContent=t('tagline'); const meta=document.querySelector('meta[name="description"]');if(meta)meta.setAttribute('content',t('aboutText'));
 const menuButton=$('#mobileMenuToggle');if(menuButton){menuButton.setAttribute('aria-label',menuOpen?t('closeMenu'):t('menu'));menuButton.querySelector('.sr-only').textContent=menuOpen?t('closeMenu'):t('menu');}
 const location=$('#locationLabel');if(location){const city=selectedCity();location.textContent=city;location.hidden=!city;}
 $('#pilotTitle').textContent=t('pilot');$('#pilotText').textContent=t('scope');
 const partial=!I.FULL.includes(lang);$('#translationNote').hidden=!partial;$('#translationNote').textContent=t('partial');
 const root=$('#workspace');root.lang=partial?'en':lang;root.dir=partial?'ltr':document.documentElement.dir;
 $('#cityWorkspace').hidden=true;
 let body='';
 if(current==='home')body=home()+form();
 if(current==='me')body=myPage();
 if(current==='center')body=center();
 if(current==='settings')body=settingsPage();
 if(current==='about')body=aboutPage();
 if(current==='people')body=head('peopleTitle','peopleText')+`<div class="feature-grid"><article class="card"><span class="small-icon">${icon('me')}</span><h2>${esc(store.get().profile.name||t('me'))}</h2><p>${esc(store.get().profile.skills||t('emptyProfile'))}</p>${a('me','profileLink','text-link')}</article><article class="card"><h2>${esc(t('projects'))}</h2><p>${esc(t('nextBody'))}</p>${a('projects','projects','text-link')}</article><article class="card"><h2>${esc(t('messages'))}</h2><span class="badge muted-badge">${esc(t('future'))}</span></article></div>`;
 if(current==='communities')body=head('communities','peopleText');
 if(current==='messages')body=head('messages','messageText')+a('people','people','button secondary');
 if(current==='projects'||current==='together'){
  const kinds=current==='projects'?['project']:['need','offer','purchase','resource'];
  body=head(current+'Title',current+'Text')+`<div class="actions">${kinds.map(k=>button(k,k)).join('')}</div>`+form()+`<label class="search">${esc(t('search'))}<input id="draftSearch" type="search" value="${esc(query)}"></label><div id="draftList">${drafts(kinds)}</div>`;
 }
 if(current==='city')body=cityShell();
 root.innerHTML=body;if(current==='city'&&citySupported(selectedCity()))showCity();else sendCity();
 updateHelper();
 if(onboardingOpen)showOnboarding(onboardingStep);
 if(focus)root.querySelector('h1')?.focus({preventScroll:true});
}
function changeLanguage(value){capture();lang=C.LANGS.includes(value)?value:'sv';try{storage?.setItem('folkoop-language',lang);storage?.setItem(LANGUAGE_KEY,'done');}catch{}render();if(onboardingOpen)showOnboarding(onboardingStep);}
$('#language').innerHTML=C.LANGS.map(k=>`<option value="${k}">${esc(I.NAMES[k])}</option>`).join('');
$('#language').addEventListener('change',e=>changeLanguage(e.target.value));
document.addEventListener('click',e=>{
 const link=e.target.closest?.('[data-subsection]');if(!link)return;
 const key=link.dataset.subsection,parent=subsectionParent(key);if(!parent)return;
 e.preventDefault();subsection=key;document.documentElement.dataset.folkoopSubsection=key;try{sessionStorage.setItem(SUBSECTION_KEY,key);}catch{}
 if(current!==parent){current=parent;history.replaceState(null,'','#/'+parent);}
 render();
 window.dispatchEvent(new CustomEvent('folkoop:subsection',{detail:{key,parent}}));
 const selector={
  'home-overview':'.home-dashboard','home-attention':'.home-daily, .home-section','home-feed':'.home-feed','home-actions':'.home-quick, .first-actions',
  'projects-overview':'#networkPanel, #draftList','projects-mine':'#networkPanel','projects-tasks':'#networkPanel','projects-updates':'#networkPanel',
  'messages-chats':'#networkPanel','messages-direct':'#networkPanel','messages-groups':'#networkPanel','messages-invites':'#networkPanel'
 }[key];
 const target=selector&&document.querySelector(selector);target?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
});

window.addEventListener('folkoop:language-picked',e=>{
 const value=e.detail?.language;
 if(!C.LANGS.includes(value))return;
 globalThis.FolkoopGuide?.hideLanguageGate();
 changeLanguage(value);
 languageOnlyFlow=false;firstVisitFlow=false;
});
window.addEventListener('folkoop:open-entry',e=>{entryGateAfterMuraExit=e.detail?.source==='guest-exit';showEntryGate(e.detail?.note||'',entryGateAfterMuraExit);});
window.addEventListener('folkoop:network-rendered',()=>{if(onboardingOpen)requestAnimationFrame(()=>positionOnboarding(onboardingSteps[onboardingStep]));});
window.addEventListener('folkoop:account-ready',()=>{if(!onboardingDone&&!onboardingSuppressed)setTimeout(()=>showOnboarding(0),120);});
window.addEventListener('folkoop:helper-toggle',()=>{
 if(onboardingOpen)return;
 helperOpen=!helperOpen;updateHelper();
});
window.addEventListener('hashchange',()=>{capture();current=C.route(location.hash);query='';formKind=null;closeMenu();closeMobileDemo();render(true);window.scrollTo(0,0);});
document.addEventListener('click',e=>{
 const mobileAction=e.target.closest('[data-mobile-action]');
 if(mobileAction){
  const action=mobileAction.dataset.mobileAction;
  if(action==='demo'){const pop=$('#mobileContextDock')?.querySelector('.mobile-demo-popover'),open=pop?.hidden!==false;if(pop)pop.hidden=!open;mobileAction.setAttribute('aria-expanded',String(open));return;}
  if(action==='exitmura'){closeMobileDemo();entryGateAfterMuraExit=true;showEntryGate('',true);return;}
  if(action==='signin'){closeMobileDemo();showEntryGate('',true);return;}
  if(action==='language'){closeMobileDemo();firstVisitFlow=false;languageOnlyFlow=true;globalThis.FolkoopGuide?.showLanguageGate(C.LANGS,I.NAMES,lang);return;}
 }
 const entryLanguage=e.target.closest('[data-entry-language]');
 if(entryLanguage){changeLanguage(entryLanguage.dataset.entryLanguage);showEntryGate('',entryGateAfterMuraExit);return;}
 const entry=e.target.closest('[data-entry]');
 if(entry){
  const action=entry.dataset.entry;
  if(action==='guest'){
   if(entryGateAfterMuraExit){
    entryGateAfterMuraExit=false;hideEntryGate();
    try{sessionStorage.setItem(ENTRY_KEY,'guest');}catch{}
    current='home';history.replaceState(null,'','#/home');render();return;
   }
   setEntryMode('guest');return;
  }
  if(action==='email'){setEntryMode('account');return;}
 }
 const helper=e.target.closest('[data-helper]');
 if(helper){
  const action=helper.dataset.helper;
  if(action==='toggle'){helperOpen=!helperOpen;updateHelper();return;}
  if(action==='close'){helperOpen=false;updateHelper();return;}
  if(action==='tour'){helperOpen=false;updateHelper();startFullIntroduction();return;}
 }
 const onboarding=e.target.closest('[data-onboarding]');
 if(onboarding){
  const action=onboarding.dataset.onboarding;
  if(action==='skip'){finishOnboarding();return;}
  if(action==='back'){showOnboarding(onboardingStep-1);return;}
  if(action==='next'){
   const task=muraPracticeForStep(onboardingStep);
   if(task&&muraPracticeStep<task){completeMuraPractice(onboardingStep);const body=ensureOnboarding().querySelector('#onboardingBody');if(body)body.textContent=(lang==='ru'?(muraPracticeStep===3?'Готово — ты уже видел три ключевых связи в моём аккаунте. Дальше просто исследуй.':'Готово. Посмотрим следующую связь?'):lang==='sv'?(muraPracticeStep===3?'Klart — du har sett tre viktiga samband i mitt konto. Nu kan du bara utforska.':'Klart. Ska vi titta på nästa samband?'):(muraPracticeStep===3?'Done — you have seen three key connections in my account. Now just explore.':'Done. Want to see the next connection?'));ensureOnboarding().querySelector('[data-onboarding="next"]').textContent=onboardingStep===onboardingSteps.length-1?(lang==='ru'?'Осмотреться у Муры':lang==='sv'?'Utforska hos Mura':'Explore Mura\'s account'):t('tutorialNext');return;}
   if(onboardingStep>=onboardingSteps.length-1)finishOnboarding();else showOnboarding(onboardingStep+1);return;
  }
 }
 const navLink=e.target.closest('#nav a');if(navLink){closeMenu();return;}
 const target=e.target.closest('button');if(!target)return;
 if(target.id==='mobileMenuToggle'){menuOpen?closeMenu():openMenu();return;}
 if(target.dataset.create){capture();formKind=target.dataset.create;scratch={kind:formKind};render();$('#draftForm input[name="title"]')?.focus();return;}
 if(target.dataset.toggle){status(store.toggle(target.dataset.toggle));render();return;}
 if(target.dataset.delete&&confirm(t('confirmDelete'))){status(store.remove(target.dataset.delete));render();return;}
 const action=target.dataset.action;
 if(action==='cancel'){formKind=null;scratch={};render();}
 if(action==='tutorial'){startFullIntroduction();return;}
 if(action==='toggle-my-place-editor'){
  const panel=$('#myPlaceEditorPanel'),open=panel?.hidden!==false;if(!panel)return;panel.hidden=!open;target.setAttribute('aria-expanded',String(open));
  if(open){panel.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});setTimeout(()=>panel.querySelector('input,textarea,button')?.focus({preventScroll:true}),reducedMotion?0:220);}return;
 }
 if(action==='clear'&&confirm(t('confirmClear'))){if(store.clear()){scratch={};profileScratch=null;render();$('#status').textContent=t('deleted');}else status(false);}
 if(action==='export'){
  capture();const file=new Blob([JSON.stringify(store.get(),null,2)],{type:'application/json'});const url=URL.createObjectURL(file);const link=document.createElement('a');link.href=url;link.download='folkoop-my-data.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
});
document.addEventListener('input',e=>{
 if(e.target.id==='draftSearch'){query=e.target.value;$('#draftList').innerHTML=drafts(current==='projects'?['project']:['need','offer','purchase','resource']);}
});
document.addEventListener('change',e=>{
 if(e.target.id==='remember'){const ok=store.remember(e.target.checked);e.target.checked=store.isPersistent();capture();render();status(ok);}
});
document.addEventListener('submit',e=>{
 if(!['profileForm','draftForm'].includes(e.target.id))return;e.preventDefault();
 const values=Object.fromEntries(new FormData(e.target));
 if(e.target.id==='profileForm'){const ok=store.profile(values);profileScratch=null;render();status(ok);return;}
 const id=globalThis.crypto?.randomUUID?.()||'d-'+Date.now()+'-'+Math.random().toString(36).slice(2);
 const result=store.add({...values,id});if(!result.ok){$('#status').textContent=t('max');return;}
 formKind=null;scratch={};render();status(result.saved);
});
window.addEventListener('message',e=>{
 if(!frame||e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='folkoop:city-language')return;
 if(C.LANGS.includes(e.data.language)&&e.data.language!==lang)changeLanguage(e.data.language);
});
$('#skip').addEventListener('click',e=>{e.preventDefault();$('#workspace').focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!ensureEntryGate().hidden){const mode=sessionStorage.getItem(ENTRY_KEY);if(mode)hideEntryGate();return;}if(onboardingOpen)finishOnboarding();else if(helperOpen){helperOpen=false;updateHelper();}else if(menuOpen)closeMenu();}});
window.addEventListener('resize',()=>{if(onboardingOpen)positionOnboarding(onboardingSteps[onboardingStep]);});
ensureHelper();
globalThis.FolkoopGuide?.home({instant:true});
render();
function startFullIntroduction(){
 onboardingOpen=false;
 const dialog=ensureOnboarding();dialog.hidden=true;
 helperOpen=false;updateHelper();firstVisitFlow=false;languageOnlyFlow=false;
 tourReturnMode=entryModeNow()||'local';
 window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:true,target:'tour',temporary:true}}));
 muraPracticeStep=0;muraPracticeXp=0;showOnboarding(0);
}
function startFirstVisit(){
 onboardingOpen=false;helperOpen=false;updateHelper();languageOnlyFlow=false;firstVisitFlow=false;tourReturnMode=null;entryGateAfterMuraExit=false;showEntryGate('',false);
}
let onboardingDone=false,languageChosen=false;
try{
 onboardingDone=storage?.getItem(ONBOARDING_KEY)==='done';
 languageChosen=storage?.getItem(LANGUAGE_KEY)==='done';
}catch{}
let entryMode='';try{entryMode=sessionStorage.getItem(ENTRY_KEY)||'';}catch{}
if(!onboardingSuppressed){
 if(introParam==='1')setTimeout(startFullIntroduction,120);
 else if(!languageChosen)setTimeout(startFirstVisit,120);
 else if(!entryMode)setTimeout(()=>{entryGateAfterMuraExit=false;showEntryGate('',false);},120);
 else if(!onboardingDone)setTimeout(()=>showOnboarding(0),120);
}
})();
