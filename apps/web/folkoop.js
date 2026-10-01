/* FOLKOOP shell: local drafts and profile, with the preserved City module. */
(() => {
'use strict';
const C=globalThis.FolkoopCore, I=globalThis.FolkoopCopy, $=s=>document.querySelector(s), esc=C.escape;
let storage;try{storage=localStorage;}catch{/* Memory-only mode. */}
const store=C.workspace(storage);
let lang='sv';try{const saved=storage?.getItem('folkoop-language');lang=C.LANGS.includes(saved)?saved:(navigator.language||'sv').split('-')[0];}catch{}
if(!C.LANGS.includes(lang))lang='sv';
let current=C.route(location.hash), formKind=null, scratch={}, profileScratch=null, query='', frame=null;
const NAV_ORDER=['home','together','projects','messages','people','communities','city','center','me','settings','about'];
const ONBOARDING_KEY='folkoop-onboarding-v3';
const LANGUAGE_KEY='folkoop-language-choice-v1';
const ENTRY_KEY='folkoop-entry-mode-v1';
const introParam=new URL(location.href).searchParams.get('intro');
const onboardingSuppressed=introParam==='0'||(navigator.webdriver&&introParam!=='1');
let onboardingOpen=false,onboardingStep=0,menuOpen=false,helperOpen=false,firstVisitFlow=false,languageOnlyFlow=false,muraPracticeStep=0,muraPracticeXp=0;
const onboardingSteps=[
 {id:'welcome',route:'me',target:'.demo-profile-card',motion:'point',pose:'point'},
 {id:'home',route:'me',target:'.demo-profile-card',motion:'point',pose:'point'},
 {id:'together',route:'together',target:'[data-demo-story="need"]',motion:'point',pose:'point'},
 {id:'projects',route:'together',target:'[data-demo-story="offer"]',motion:'point',pose:'point'},
 {id:'people',route:'projects',target:'[data-demo-story="project"]',motion:'point',pose:'point'},
 {id:'city',route:'people',target:'#networkPanel',motion:'point',pose:'point'},
 {id:'center',route:'messages',target:'#networkPanel',motion:'point',pose:'point'},
 {id:'quick',route:'me',target:'.demo-profile-card',motion:'point',pose:'point'}
];

const legacyRoutes=['ansvar','rapportera','nara','beslut','om'];
let initialCityHash=legacyRoutes.includes(location.hash.slice(1))?location.hash.slice(1):'home';
if(initialCityHash!=='home'){current='city';history.replaceState(null,'','#/city');}
const actionIcons={need:'M12 3v18M3 12h18',offer:'M12 21V3M5 10l7-7 7 7',project:'M4 19V5h16v14H4Zm4-7h8M12 8v8',purchase:'M4 6h2l2 9h9l2-6H8M10 20h.01M17 20h.01',resource:'M5 7h14v12H5V7Zm3 0V4h8v3'};
const icons={home:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M15 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9',communities:'M4 19v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M8 7a4 4 0 1 0 8 0',together:'m8 12 3 3 5-6M4 5h16v14H4Z',projects:'M3 7h18v14H3ZM8 7V3h8v4M3 12h18',city:'M3 21V9h6v12M9 21V3h6v18M15 21V7h6v14',center:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-7h6v7',me:'M4 21v-2a8 8 0 0 1 16 0v2',messages:'M3 3h18v14H9l-6 4Z',settings:'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8M4 12h2M18 12h2M12 4v2M12 18v2',about:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M12 11v5M12 8h.01',arrow:'M5 12h14m-6-6 6 6-6 6',plus:'M12 5v14M5 12h14'};
function icon(k){const path=actionIcons[k]||icons[k]||icons.plus;return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"/>${k==='people'?'<circle cx="9" cy="7" r="4"/>':k==='me'?'<circle cx="12" cy="7" r="4"/>':''}</svg>`;}
const t=k=>I.COPY[lang][k]||I.COPY.en[k]||k;
const selectedCity=()=>store.get().profile.city||'';
const citySupported=city=>/^(göteborg|goteborg|gothenburg)$/i.test((city||'').trim());
const navText=k=>k==='city'&&selectedCity()?t('city')+' · '+selectedCity():(k==='about'?t('aboutPage'):t(k));
const MOBILE_PRIMARY=['home','together','projects','city','messages','me'];
const MOBILE_CONTEXT={
 together:['together','people','communities'],
 city:['city','center'],
 me:['me','settings','about']
};
const mobilePrimaryFor=route=>['people','communities'].includes(route)?'together':route==='center'?'city':['settings','about'].includes(route)?'me':route;
const entryModeNow=()=>{try{return sessionStorage.getItem(ENTRY_KEY)||'';}catch{return '';}};
function renderMobileChrome(){
 const primary=$('#mobilePrimaryNav'),dock=$('#mobileContextDock');if(!primary||!dock)return;
 const active=mobilePrimaryFor(current);
 primary.dataset.activeSection=active;
 primary.innerHTML=MOBILE_PRIMARY.map(k=>'<a href="#/'+k+'" data-mobile-nav="'+k+'" data-section="'+k+'"'+(active===k?' aria-current="page"':'')+'>'+icon(k)+'<span>'+esc(k==='city'?t('city'):k==='me'?t('me'):t(k))+'</span></a>').join('');
 const context=MOBILE_CONTEXT[active]||[],guest=entryModeNow()==='guest';
 dock.dataset.parentSection=active;
 const items=context.map(k=>'<a href="#/'+k+'" data-mobile-subnav="'+k+'" data-section="'+active+'"'+(current===k?' aria-current="page"':'')+'>'+icon(k)+'<span>'+esc(k==='about'?t('aboutPage'):t(k))+'</span></a>').join('');
 const language=active==='me'?'<button type="button" data-mobile-action="language">'+icon('settings')+'<span>'+esc(t('language'))+'</span></button>':'';
 const demo=guest?'<button class="mobile-demo-chip" type="button" data-mobile-action="demo" aria-expanded="false"><span class="demo-dot" aria-hidden="true"></span><span>'+esc(entrySource().muraRole)+'</span></button>':'';
 const popover=guest?'<aside class="mobile-demo-popover" hidden><strong>'+esc(entrySource().muraRole)+'</strong><p>'+esc(entrySource().guestNote)+'</p><button class="button" type="button" data-mobile-action="signin">'+esc(entrySource().email)+'</button></aside>':'';
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
 return `<section class="hero"><div><p class="eyebrow">${esc(selectedCity()?selectedCity().toUpperCase()+' · FOLKOOP':'FOLKOOP')}</p><h1 tabindex="-1">${esc(t('hero')).replace('\n','<br>')}</h1><p>${esc(t('intro'))}</p></div><div class="hero-symbol" aria-hidden="true"><img src="./folkoop-mark.png" alt=""></div></section>${firstActions()}<section class="start secondary-actions"><div class="row"><h2>${esc(t('together'))}</h2><span class="muted">${esc(t('tagline'))}</span></div><div class="quick-grid">${['purchase','resource'].map(k=>button(k,k,'quick')).join('')}</div></section><div class="feature-grid"><article class="card city-card"><span class="small-icon">${icon('city')}</span><h2>${esc(t('city'))}</h2><p>${esc(t('cityText'))}</p>${a('city','openCity','text-link')}</article><article class="card"><span class="small-icon">${icon('projects')}</span><h2>${esc(t('projects'))}</h2><p>${esc(t('projectsText'))}</p>${a('projects','projects','text-link')}</article><article class="card"><span class="small-icon">${icon('center')}</span><h2>${esc(t('center'))}</h2><p>${esc(t('centerCard3Text'))}</p><span class="badge muted-badge">${esc(t('future'))}</span></article></div><section class="mission"><h2>${esc(t('mission'))}</h2><p>${esc(t('missionBody'))}</p></section>`;
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
  welcome:"Hi, I'm Mura, FOLKOOP's guide. I'll show you my space and use examples to explain how things work here.",
  home:"This is my place. I keep a short line about myself, what I can offer and the things I have started. Your own place can grow from your real activity instead of a long profile form.",
  together:"For example, I am fixing up a room and need a tile cutter for one weekend. I can post that need instead of buying a tool I may use once.",
  projects:"I can also give something back. I know basic photography, so I can offer to help a neighbour photograph an item, a small event or a community project.",
  people:"One example project in my space is a small plant-and-seed exchange. An idea can become people, roles, tasks and a work chat instead of disappearing in a group conversation.",
  city:"People and communities help me find others around a practical interest — gardening, cycling, fixing things or helping locally. The point is not followers; it is finding someone to do something with.",
  center:"Messages are where we coordinate after we have a reason to talk. City helps with local information and official routes; Center is a future physical layer and is not open yet.",
  quick:"That's my space in FOLKOOP. Yours starts empty on purpose. Begin with one real thing: something you need, something you can offer, or something you want to make happen with other people."
 },
 ru:{
  welcome:"Привет, я Мура, помощница FOLKOOP. Покажу тебе своё пространство и на примерах объясню, как здесь всё работает.",
  home:"Это моё место. Здесь я показываю немного о себе, чем могу помочь и что уже начинала. Твоё место тоже может постепенно складываться из реальных дел, а не из длинной анкеты.",
  together:"Например, я делаю небольшой ремонт и мне нужен плиткорез всего на выходные. Здесь я могу попросить инструмент, а не покупать вещь ради одного раза.",
  projects:"Но я не только прошу. Я немного умею фотографировать и могу помочь соседу снять вещь для объявления, небольшое мероприятие или местный проект.",
  people:"Один из проектов-примеров в моём пространстве — небольшой обмен растениями и семенами. Идея может превратиться в людей, роли, задачи и рабочий чат, а не потеряться в общей переписке.",
  city:"Люди и сообщества помогают мне находить тех, кому тоже интересны сад, велосипед, ремонт или помощь рядом. Смысл не в подписчиках, а в людях, с которыми реально можно что-то сделать.",
  center:"В Сообщениях мы договариваемся уже после того, как появился повод общаться. Город помогает с местной информацией и официальными маршрутами; Центр — будущая физическая часть и пока не открыт.",
  quick:"Вот так выглядит моё пространство в FOLKOOP. Твоё специально начинается пустым. Начни с одной реальной вещи: что тебе нужно, чем можешь помочь или что хочешь сделать вместе с другими."
 },
 sv:{
  welcome:"Hej, jag är Mura, FOLKOOPs guide. Jag visar dig min plats och förklarar med exempel hur allt fungerar här.",
  home:"Det här är min plats. Här visar jag lite om mig själv, vad jag kan erbjuda och sådant jag har startat. Din egen plats kan växa ur verkliga handlingar i stället för ett långt profilformulär.",
  together:"Till exempel håller jag på att fixa ett rum och behöver en kakelskärare över en helg. Här kan jag fråga efter verktyget i stället för att köpa något jag kanske använder en gång.",
  projects:"Jag kan också bidra. Jag kan lite fotografering och kan erbjuda hjälp med att fotografera en sak, ett litet evenemang eller ett lokalt projekt.",
  people:"Ett exempelprojekt på min plats är ett litet växt- och fröbyte. En idé kan bli människor, roller, uppgifter och en arbetschatt i stället för att försvinna i en gruppkonversation.",
  city:"Människor och gemenskaper hjälper mig hitta andra kring praktiska intressen — odling, cykling, att laga saker eller hjälpa till lokalt. Poängen är inte följare utan människor att faktiskt göra något med.",
  center:"I Meddelanden samordnar vi när det redan finns en anledning att prata. Stad hjälper med lokal information och officiella vägar; Center är ett framtida fysiskt lager och är inte öppet ännu.",
  quick:"Det här är min plats i FOLKOOP. Din börjar tom med flit. Börja med en verklig sak: något du behöver, kan erbjuda eller vill få gjort tillsammans med andra."
 }
};
const tutorialTitles={
 en:{welcome:"Hi, I'm Mura",home:'This is my place',together:'A tool I need',projects:'What I can offer',people:'A project I started',city:'How I find people',center:'Where we coordinate',quick:'Now make your place yours'},
 ru:{welcome:'Привет, я Мура',home:'Это моё место',together:'Что мне понадобилось',projects:'Чем я могу помочь',people:'Проект, который я начала',city:'Как я нахожу людей',center:'Где мы договариваемся',quick:'Теперь сделай своё место своим'},
 sv:{welcome:'Hej, jag är Mura',home:'Det här är min plats',together:'Ett verktyg jag behöver',projects:'Det jag kan erbjuda',people:'Ett projekt jag startade',city:'Så hittar jag människor',center:'Där vi samordnar',quick:'Gör nu din plats till din'}
};
const entryCopy={
 en:{title:'How do you want to start?',body:"Sign in to participate, or let Mura show you how FOLKOOP works first.",email:'Continue with email',guest:'Let Mura show me',muraRole:'FOLKOOP guide',guestNote:"Mura uses illustrative people, messages, projects and activity to explain FOLKOOP. They are examples, not claims about real participants or events. Sign in to participate yourself.",back:'Back to language'},
 ru:{title:'Как хочешь начать?',body:"Войди, чтобы участвовать, или сначала позволь Муре показать, как работает FOLKOOP.",email:'Войти по почте',guest:'Мура покажет',muraRole:'Помощница FOLKOOP',guestNote:"Мура использует примеры людей, сообщений, проектов и действий, чтобы объяснить FOLKOOP. Это примеры, а не утверждения о реальных участниках или событиях. Войди, чтобы участвовать самому.",back:'Назад к языку'},
 sv:{title:'Hur vill du börja?',body:"Logga in för att delta, eller låt Mura först visa hur FOLKOOP fungerar.",email:'Fortsätt med e-post',guest:'Låt Mura visa',muraRole:'FOLKOOP-guide',guestNote:"Mura använder exempel på människor, meddelanden, projekt och aktivitet för att förklara FOLKOOP. De är exempel, inte påståenden om riktiga deltagare eller händelser. Logga in för att delta själv.",back:'Tillbaka till språk'},
 es:{title:'¿Cómo quieres entrar?',body:"FOLKOOP empieza con algo que necesitas, puedes ofrecer o quieres hacer y te ayuda a encontrar personas o recursos relevantes y un siguiente paso concreto. Inicia sesión para participar o explora el demo.",email:'Continuar con correo',guest:'Explorar como invitado',guestNote:"El modo invitado es un DEMO. Todas las personas, mensajes, proyectos y actividades son ejemplos ficticios, no participantes reales. Puedes explorar, pero para crear, unirte, enviar o cambiar algo debes iniciar sesión.",back:'Volver al idioma'},
 uk:{title:'Як хочеш увійти?',body:"FOLKOOP починається з того, що тобі потрібно, що можеш запропонувати або що хочеш зробити, і допомагає знайти потрібних людей чи ресурси та конкретний наступний крок. Увійди для участі або переглянь демо.",email:'Продовжити з e-mail',guest:'Переглянути як гість',guestNote:"Гостьовий режим — ДЕМО. Усі люди, повідомлення, проєкти й активність тут — вигадані приклади, а не реальні учасники. Переглядати можна без входу; створювати, приєднуватися, надсилати чи змінювати — лише після входу.",back:'Назад до мови'},
 fi:{title:'Miten haluat jatkaa?',body:"FOLKOOP alkaa siitä, mitä tarvitset, voit tarjota tai haluat tehdä, ja auttaa löytämään sopivia ihmisiä tai resursseja sekä konkreettisen seuraavan askeleen. Kirjaudu osallistuaksesi tai tutustu demoon.",email:'Jatka sähköpostilla',guest:'Tutustu vieraana',guestNote:"Vierastila on DEMO. Kaikki ihmiset, viestit, projektit ja toiminta ovat kuvitteellisia esimerkkejä, eivät oikeita osallistujia. Voit selata, mutta luominen, liittyminen, lähettäminen ja muuttaminen vaativat kirjautumisen.",back:'Takaisin kieleen'},
 bs:{title:'Kako želiš ući?',body:"FOLKOOP počinje od onoga što ti treba, što možeš ponuditi ili što želiš uraditi i pomaže pronaći odgovarajuće ljude ili resurse i konkretan sljedeći korak. Prijavi se za učešće ili pogledaj demo.",email:'Nastavi e-poštom',guest:'Pogledaj kao gost',guestNote:"Gostujući režim je DEMO. Sve osobe, poruke, projekti i aktivnosti su izmišljeni primjeri, ne stvarni učesnici. Možeš pregledati sadržaj, ali kreiranje, pridruživanje, slanje i promjene traže prijavu.",back:'Nazad na jezik'},
 ar:{title:'كيف تريد الدخول؟',body:"يبدأ FOLKOOP بما تحتاجه أو تستطيع تقديمه أو تريد فعله، ثم يساعدك على العثور على الأشخاص أو الموارد المناسبة والخطوة التالية الواضحة. سجّل الدخول للمشاركة أو استكشف العرض التجريبي.",email:'المتابعة بالبريد الإلكتروني',guest:'الاستكشاف كضيف',guestNote:"وضع الضيف هو عرض تجريبي. جميع الأشخاص والرسائل والمشاريع والأنشطة أمثلة خيالية وليست لمشاركين حقيقيين. يمكنك التصفح، لكن الإنشاء والانضمام والإرسال والتعديل تتطلب تسجيل الدخول.",back:'العودة إلى اللغة'},
 fa:{title:'چطور می‌خواهید وارد شوید؟',body:"FOLKOOP از چیزی که نیاز داری، می‌توانی ارائه کنی یا می‌خواهی انجام دهی شروع می‌شود و کمک می‌کند آدم‌ها یا منابع مناسب و گام بعدی مشخص را پیدا کنی. برای مشارکت وارد شو یا دمو را ببین.",email:'ادامه با ایمیل',guest:'مشاهده به‌عنوان مهمان',guestNote:"حالت مهمان یک دمو است. همهٔ افراد، پیام‌ها، پروژه‌ها و فعالیت‌ها نمونه‌های ساختگی‌اند و شرکت‌کنندهٔ واقعی نیستند. می‌توانی مرور کنی، اما ساختن، پیوستن، ارسال یا تغییر نیاز به ورود دارد.",back:'بازگشت به زبان'},
 so:{title:'Sidee rabtaa inaad u gasho?',body:"FOLKOOP wuxuu ka bilaabmaa waxa aad u baahan tahay, bixin karto ama rabto inaad qabato, wuxuuna kaa caawiyaa helidda dadka ama kheyraadka ku habboon iyo tallaabada xigta ee cad. Soo gal si aad uga qaybqaadato ama eeg demada.",email:'Ku sii wad iimayl',guest:'U eeg marti ahaan',guestNote:"Qaabka martidu waa DEMO. Dhammaan dadka, fariimaha, mashaariicda iyo hawlaha waa tusaalooyin la sameeyay, ma aha ka-qaybgalayaal dhab ah. Waad daawan kartaa, laakiin samayn, ku biirid, dirid ama beddelid waxay u baahan yihiin gelitaan.",back:'Ku noqo luqadda'},
 ku:{title:'Tu dixwazî çawa têkevî?',body:"FOLKOOP bi tiştê ku pêwîst e, dikarî pêşkêş bikî an dixwazî bikî dest pê dike û alîkar dike ku mirov an çavkaniyên guncaw û gava paşîn a zelal bibînî. Ji bo beşdarbûnê têkevî an demoyê bibîne.",email:'Bi e-nameyê bidomîne',guest:'Wek mêvan bibîne',guestNote:"Moda mêvanê DEMO ye. Hemû mirov, peyam, proje û çalakî nimûneyên çêkirî ne, ne beşdarên rastîn. Tu dikarî temaşe bikî, lê çêkirin, tevlêbûn, şandin an guhartin têketin dixwaze.",back:'Vegere ziman'}
};
const entrySource=()=>entryCopy[lang]||entryCopy.en;
function ensureEntryGate(){
 let gate=document.getElementById('folkoopEntryGate');
 if(gate)return gate;
 gate=document.createElement('section');
 gate.id='folkoopEntryGate';gate.className='entry-gate';gate.hidden=true;
 gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-labelledby','entryGateTitle');
 gate.innerHTML='<div class="entry-gate-backdrop"></div><div class="entry-gate-card"><p class="eyebrow">FOLKOOP</p><h1 id="entryGateTitle"></h1><p id="entryGateBody" class="entry-gate-body"></p><div class="entry-gate-actions"><button type="button" class="button" data-entry="email"></button><button type="button" class="button secondary" data-entry="guest"></button></div><p id="entryGateNote" class="meta"></p><button type="button" class="text-button entry-gate-back" data-entry="language"></button></div>';
 document.body.append(gate);return gate;
}
function showEntryGate(){
 const gate=ensureEntryGate(),x=entrySource();
 gate.querySelector('#entryGateTitle').textContent=x.title;
 gate.querySelector('#entryGateBody').textContent=x.body;
 gate.querySelector('#entryGateNote').textContent=x.guestNote;
 gate.querySelector('[data-entry="email"]').textContent=x.email;
 gate.querySelector('[data-entry="guest"]').textContent=x.guest;
 gate.querySelector('[data-entry="language"]').textContent=x.back;
 gate.hidden=false;document.body.classList.add('entry-gate-open');
 globalThis.FolkoopGuide?.element?.().setAttribute('hidden','');
 requestAnimationFrame(()=>gate.querySelector('[data-entry="email"]')?.focus());
}
function hideEntryGate(){
 const gate=ensureEntryGate();gate.hidden=true;document.body.classList.remove('entry-gate-open');
 globalThis.FolkoopGuide?.element?.().removeAttribute('hidden');
}
function setEntryMode(mode){
 try{sessionStorage.setItem(ENTRY_KEY,mode);}catch{}
 hideEntryGate();
 window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:mode==='guest'}}));
 if(mode==='guest'){location.hash='#/me';setTimeout(()=>{if(!onboardingDone)showOnboarding(0);},220);}
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
const extraCopy=globalThis.FolkoopExtraCopy?.languages||{};
for(const code of C.LANGS){
 const x=extraCopy[code];
 if(x?.tutorial)tutorialCopy[code]=x.tutorial;
 if(x?.tutorialTitles)tutorialTitles[code]=x.tutorialTitles;
 if(x?.helper)helperCopy[code]=x.helper;
}
function tutorialSource(){return tutorialCopy[lang]||tutorialCopy.en;}
function tutorialTitle(step){
 const titles=tutorialTitles[lang]||tutorialTitles.en;
 return titles[step.id]||navText(step.route);
}
function tutorialText(step){
 const source=tutorialSource();
 return source[step.id]||source[step.route]||tutorialCopy.en[step.id]||tutorialCopy.en[step.route]||'';
}
function helperSource(){return helperCopy[lang]||helperCopy.en;}
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
 dialog.innerHTML='<div class="onboarding-backdrop"></div><div id="onboardingSpotlight" class="onboarding-spotlight" aria-hidden="true"></div><section class="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle"><div class="row"><span id="onboardingProgress" class="eyebrow"></span><button type="button" class="text-button" data-onboarding="skip"></button></div><div class="onboarding-guide"><span class="onboarding-guide-mark" aria-hidden="true">M</span><span id="onboardingGuideName"></span></div><div class="mura-practice" id="muraPractice" hidden><span id="muraPracticeStars">○ ○ ○</span><strong id="muraPracticeXp">0 XP</strong></div><h2 id="onboardingTitle"></h2><div class="onboarding-copy" id="onboardingCopy"><p id="onboardingBody"></p><div class="onboarding-scroll-cue" id="onboardingScrollCue" aria-hidden="true"><span>⌄</span></div></div><div class="onboarding-actions"><button type="button" class="button secondary" data-onboarding="back"></button><button type="button" class="button" data-onboarding="next"></button></div></section>';
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
 if(!target){spot.hidden=false;dialog.dataset.noTarget='1';spot.style.left='12px';spot.style.top='12px';spot.style.width='1px';spot.style.height='1px';return;}
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
 dialog.querySelector('#muraPracticeStars').textContent=[0,1,2].map(i=>i<muraPracticeStep?'★':'○').join(' ');
 dialog.querySelector('#muraPracticeXp').textContent=muraPracticeXp+' XP';
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
 if(current!==item.route){current=item.route;history.replaceState(null,'','#/'+item.route);render();return;}
 dialog.querySelector('#onboardingProgress').textContent=t('tutorialProgress')+' '+(onboardingStep+1)+' / '+onboardingSteps.length;
 dialog.querySelector('#onboardingGuideName').textContent=source.name+' · '+source.label;
 dialog.querySelector('#onboardingTitle').textContent=tutorialTitle(item);
 dialog.querySelector('#onboardingBody').textContent=tutorialText(item);
 const copy=dialog.querySelector('#onboardingCopy');if(copy){copy.scrollTop=0;copy.onscroll=updateOnboardingScrollCue;}
 requestAnimationFrame(updateOnboardingScrollCue);
 dialog.querySelector('[data-onboarding="skip"]').textContent=t('tutorialSkip');
 const back=dialog.querySelector('[data-onboarding="back"]');back.textContent=t('tutorialBack');back.disabled=onboardingStep===0;
 const next=dialog.querySelector('[data-onboarding="next"]');next.textContent=muraPracticeForStep(onboardingStep)&&muraPracticeStep<muraPracticeForStep(onboardingStep)?(lang==='ru'?'Помочь Муре':lang==='sv'?'Hjälp Mura':'Help Mura'):(onboardingStep===onboardingSteps.length-1?t('tutorialDone'):t('tutorialNext'));
 updateMuraPractice();
 positionOnboarding(item);
 globalThis.FolkoopGuide?.react?.('step');
}
function finishOnboarding(){
 const completedMuraPractice=muraPracticeStep===3&&entryModeNow()==='guest';
 onboardingOpen=false;
 const dialog=ensureOnboarding();dialog.hidden=true;
 dialog.querySelector('#onboardingSpotlight').hidden=true;
 document.querySelectorAll('.tutorial-target').forEach(x=>x.classList.remove('tutorial-target'));
 if(menuOpen)closeMenu();
 globalThis.FolkoopGuide?.home({instant:true});
 globalThis.FolkoopGuide?.react?.('done');
 try{storage?.setItem(ONBOARDING_KEY,'done');}catch{}
 onboardingDone=true;
 if(completedMuraPractice){try{sessionStorage.removeItem(ENTRY_KEY);}catch{}window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:false}}));location.hash='#/me';render();setTimeout(()=>{const panel=$('#workspace');panel?.querySelector('.my-place-empty')?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'center'});},120);}
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
 if(!frame){frame=document.createElement('iframe');frame.id='cityFrame';frame.title=t('city');frame.setAttribute('allow','geolocation');frame.referrerPolicy='no-referrer';frame.src='./city.html?embedded=1#'+initialCityHash;frame.addEventListener('load',()=>sendCity());$('#cityWorkspace').append(frame);}
 sendCity();
}
function sendCity(){frame?.contentWindow?.postMessage({type:'folkoop:city',language:lang,visible:current==='city'&&citySupported(selectedCity())},location.origin);}
function render(focus=false){
 document.documentElement.lang=lang;document.documentElement.dir=['ar','fa'].includes(lang)?'rtl':'ltr';document.title=`${navText(current)} · FOLKOOP`;
 $('#nav').innerHTML=NAV_ORDER.map(k=>`<a href="#/${k}"${current===k?' aria-current="page"':''} data-nav="${k}">${icon(k)}<span>${esc(navText(k))}</span></a>`).join('');
 renderMobileChrome();
 $('#nav').setAttribute('aria-label',t('select'));$('#brandHome').setAttribute('aria-label','FOLKOOP · '+t('home'));
 $('#messageLink').setAttribute('aria-label',t('messages'));$('#messageLabel').textContent=t('messages');
 $('#languageLabel').textContent=t('language');$('#language').value=lang;$('#skip').textContent=t('skip'); const sidebarTagline=$('#sidebarTagline');if(sidebarTagline)sidebarTagline.textContent=t('tagline'); const meta=document.querySelector('meta[name="description"]');if(meta)meta.setAttribute('content',t('aboutText'));
 const menuButton=$('#mobileMenuToggle');if(menuButton){menuButton.setAttribute('aria-label',menuOpen?t('closeMenu'):t('menu'));menuButton.querySelector('.sr-only').textContent=menuOpen?t('closeMenu'):t('menu');}
 const location=$('#locationLabel');if(location)location.textContent=selectedCity()||'FOLKOOP';
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
window.addEventListener('folkoop:language-picked',e=>{
 const value=e.detail?.language;
 if(!C.LANGS.includes(value))return;
 globalThis.FolkoopGuide?.hideLanguageGate();
 changeLanguage(value);
 if(languageOnlyFlow){languageOnlyFlow=false;return;}
 if(firstVisitFlow){firstVisitFlow=false;setTimeout(showEntryGate,80);}
 else setTimeout(()=>showOnboarding(0),80);
});
window.addEventListener('folkoop:open-entry',()=>showEntryGate());
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
  if(action==='signin'){closeMobileDemo();showEntryGate();return;}
  if(action==='language'){closeMobileDemo();firstVisitFlow=false;languageOnlyFlow=true;globalThis.FolkoopGuide?.showLanguageGate(C.LANGS,I.NAMES,lang);return;}
 }
 const entry=e.target.closest('[data-entry]');
 if(entry){
  const action=entry.dataset.entry;
  if(action==='guest'){setEntryMode('guest');return;}
  if(action==='email'){setEntryMode('account');return;}
  if(action==='language'){hideEntryGate();languageOnlyFlow=false;firstVisitFlow=true;globalThis.FolkoopGuide?.showLanguageGate(C.LANGS,I.NAMES,lang);return;}
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
   if(task&&muraPracticeStep<task){completeMuraPractice(onboardingStep);const body=ensureOnboarding().querySelector('#onboardingBody');if(body)body.textContent=(lang==='ru'?`Спасибо! +5 учебных XP. ${muraPracticeStep===3?'Три звезды собраны — теперь ты знаешь основные действия FOLKOOP.':'Звезда получена. Продолжим?'}`:lang==='sv'?`Tack! +5 övnings-XP. ${muraPracticeStep===3?'Tre stjärnor är klara — nu kan du de viktigaste handlingarna i FOLKOOP.':'En stjärna klar. Fortsätter vi?'}`:`Thanks! +5 practice XP. ${muraPracticeStep===3?'All three stars are complete — you now know FOLKOOP’s core actions.':'One star earned. Ready to continue?'}`);ensureOnboarding().querySelector('[data-onboarding="next"]').textContent=onboardingStep===onboardingSteps.length-1?t('tutorialDone'):t('tutorialNext');return;}
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
 if(globalThis.FolkoopGuide){
  globalThis.FolkoopGuide.showLanguageGate(C.LANGS,I.NAMES,lang);
 }else showOnboarding(0);
}
function startFirstVisit(){
 onboardingOpen=false;helperOpen=false;updateHelper();languageOnlyFlow=false;firstVisitFlow=true;
 if(globalThis.FolkoopGuide)globalThis.FolkoopGuide.showLanguageGate(C.LANGS,I.NAMES,lang);
 else showEntryGate();
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
 else if(!entryMode)setTimeout(showEntryGate,120);
 else if(!onboardingDone)setTimeout(()=>showOnboarding(0),120);
}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
})();
