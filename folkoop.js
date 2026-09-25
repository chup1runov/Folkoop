/* FOLKOOP shell: local drafts and profile, with the preserved City module. */
(() => {
'use strict';
const C=globalThis.FolkoopCore, I=globalThis.FolkoopCopy, $=s=>document.querySelector(s), esc=C.escape;
let storage;try{storage=localStorage;}catch{/* Memory-only mode. */}
const store=C.workspace(storage);
let lang='sv';try{const saved=storage?.getItem('sverinav-language');lang=C.LANGS.includes(saved)?saved:(navigator.language||'sv').split('-')[0];}catch{}
if(!C.LANGS.includes(lang))lang='sv';
let current=C.route(location.hash), formKind=null, scratch={}, profileScratch=null, query='', frame=null;
const NAV_ORDER=['me','home','messages','people','communities','together','projects','city','center','settings','about'];
const ONBOARDING_KEY='folkoop-onboarding-v1';
let onboardingOpen=false,onboardingStep=0,menuOpen=false;
const onboardingSteps=['me','home','messages','people','communities','together','projects','city','center','settings','about'];

const legacyRoutes=['ansvar','rapportera','nara','beslut','om'];
let initialCityHash=legacyRoutes.includes(location.hash.slice(1))?location.hash.slice(1):'home';
if(initialCityHash!=='home'){current='city';history.replaceState(null,'','#/city');}
const icons={home:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M15 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9',communities:'M4 19v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M8 7a4 4 0 1 0 8 0',together:'m8 12 3 3 5-6M4 5h16v14H4Z',projects:'M3 7h18v14H3ZM8 7V3h8v4M3 12h18',city:'M3 21V9h6v12M9 21V3h6v18M15 21V7h6v14',center:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-7h6v7',me:'M4 21v-2a8 8 0 0 1 16 0v2',messages:'M3 3h18v14H9l-6 4Z',settings:'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8M4 12h2M18 12h2M12 4v2M12 18v2',about:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M12 11v5M12 8h.01',arrow:'M5 12h14m-6-6 6 6-6 6',plus:'M12 5v14M5 12h14'};
function icon(k){return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${icons[k]||icons.plus}"/>${k==='people'?'<circle cx="9" cy="7" r="4"/>':k==='me'?'<circle cx="12" cy="7" r="4"/>':''}</svg>`;}
const t=k=>I.COPY[lang][k]||I.COPY.en[k]||k;
const selectedCity=()=>store.get().profile.city||'';
const citySupported=city=>/^(göteborg|goteborg|gothenburg)$/i.test((city||'').trim());
const navText=k=>k==='city'&&selectedCity()?t('city')+' · '+selectedCity():(k==='about'?t('aboutPage'):t(k));

const a=(route,label,cls='button')=>`<a class="${cls}" href="#/${route}">${esc(t(label))}${icon('arrow')}</a>`;
const button=(kind,key,cls='button')=>`<button class="${cls}" type="button" data-create="${kind}">${esc(t(key))}${icon('plus')}</button>`;
function head(title,body){return `<header class="section-head"><p class="eyebrow">FOLKOOP / ${esc(t(current))}</p><h1 tabindex="-1">${esc(t(title))}</h1><p>${esc(t(body))}</p></header>`;}
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
function home(){
 return `<section class="hero"><div><p class="eyebrow">${esc(selectedCity()?selectedCity().toUpperCase()+' · FOLKOOP':'FOLKOOP')}</p><h1 tabindex="-1">${esc(t('hero')).replace('\n','<br>')}</h1><p>${esc(t('intro'))}</p><div class="actions">${button('project','newProject')}${a('city','openCity','button secondary')}</div></div><div class="hero-symbol" aria-hidden="true"><img src="./folkoop-mark.png" alt=""></div></section><section class="start"><div class="row"><h2>${esc(t('next'))}</h2><span class="muted">${esc(t('tagline'))}</span></div><div class="quick-grid">${['need','offer','purchase','resource'].map(k=>button(k,k,'quick')).join('')}</div></section><div class="feature-grid"><article class="card city-card"><span class="small-icon">${icon('city')}</span><h2>${esc(t('city'))}</h2><p>${esc(t('cityText'))}</p>${a('city','openCity','text-link')}</article><article class="card"><span class="small-icon">${icon('projects')}</span><h2>${esc(t('projects'))}</h2><p>${esc(t('projectsText'))}</p>${a('projects','projects','text-link')}</article><article class="card"><span class="small-icon">${icon('center')}</span><h2>${esc(t('center'))}</h2><p>${esc(t('centerCard3Text'))}</p><span class="badge muted-badge">${esc(t('future'))}</span></article></div><section class="mission"><h2>${esc(t('mission'))}</h2><p>${esc(t('missionBody'))}</p></section>`;
}
function myPage(){
 const p=profileScratch||store.get().profile;
 return head('myTitle','myText')+`<div class="profile-grid"><form id="profileForm" class="card editor"><div class="profile-avatar" aria-hidden="true">${icon('me')}</div><label>${esc(t('name'))}<input name="name" maxlength="60" autocomplete="nickname" value="${esc(p.name||'')}"></label><label>${esc(t('cityProfile'))}<input name="city" maxlength="120" autocomplete="address-level2" value="${esc(p.city||'')}"></label><p class="meta">${esc(t('cityHelp'))}</p><label>${esc(t('skills'))}<input name="skills" maxlength="200" value="${esc(p.skills||'')}"></label><label>${esc(t('about'))}<textarea name="about" rows="4" maxlength="600">${esc(p.about||'')}</textarea></label><p class="meta">${esc(t('privacy'))}</p><button class="button" type="submit">${esc(t('saveProfile'))}</button></form><aside><div class="card"><h2>${esc(t('profileSaved'))}</h2><p>${esc(t('myText'))}</p><label class="checkbox"><input id="remember" type="checkbox"${store.isPersistent()?' checked':''}> <span>${esc(t('remember'))}</span></label><p class="meta">${esc(t(store.isPersistent()?'device':'memory'))}</p><div class="stack"><button class="button secondary" type="button" data-action="export">${esc(t('export'))}</button><button class="text-button danger" type="button" data-action="clear">${esc(t('clear'))}</button></div></div><div class="card"><strong class="stat">${store.get().drafts.length}</strong><p>${esc(t('count'))}</p>${a('projects','projects','text-link')}</div></aside></div><h2>${esc(t('drafts'))}</h2>${drafts()}`;
}
function center(){return head('centerTitle','centerText')+`<div class="feature-grid">${[1,2,3].map(n=>`<article class="card"><span class="small-icon">${icon(['','people','together','center'][n])}</span><h2>${esc(t('centerCard'+n))}</h2><p>${esc(t('centerCard'+n+'Text'))}</p><span class="badge muted-badge">${esc(t('future'))}</span></article>`).join('')}</div><div class="actions">${button('event','proposeEvent')}</div>${form()}${drafts(['event'])}`;}

function settingsPage(){
 return head('settingsTitle','settingsText')+`<div class="feature-grid"><article class="card"><span class="small-icon">${icon('settings')}</span><h2>${esc(t('language'))}</h2><p>${esc(I.NAMES[lang]||lang)}</p></article><article class="card"><span class="small-icon">${icon('me')}</span><h2>${esc(t('cityProfile'))}</h2><p>${esc(selectedCity()||t('cityMissingText'))}</p>${a('me','profileLink','text-link')}</article><article class="card"><span class="small-icon">${icon('about')}</span><h2>${esc(t('repeatTutorial'))}</h2><button class="button secondary" type="button" data-action="tutorial">${esc(t('repeatTutorial'))}</button></article></div>`;
}
function aboutPage(){
 return head('aboutTitle','aboutText')+`<section class="mission"><h2>${esc(t('mission'))}</h2><p>${esc(t('missionBody'))}</p></section><div class="card"><p><strong>FOLKOOP</strong> · v0.22 pilot</p><p class="meta">People · cooperation · projects · city · real life.</p></div>`;
}
function cityShell(){
 const city=selectedCity();
 if(!city)return head('cityMissingTitle','cityMissingText')+`<div class="actions">${a('me','profileLink')}</div>`;
 if(!citySupported(city))return head('cityUnsupportedTitle','cityUnsupportedText')+`<article class="card"><h2>${esc(city)}</h2><p>${esc(t('cityUnsupportedText'))}</p><div class="actions">${a('me','profileLink','button secondary')}</div></article>`;
 return head('city','cityText')+`<a class="text-link" href="./city.html?embedded=1" target="_blank" rel="noopener">${esc(t('cityFull'))} ↗</a>`;
}

const tutorialCopy={
 en:{
  me:'Your profile: name, city, skills and what you want others to know. Your city controls which local City tools may be shown.',
  home:'Home is the starting point: current activity, shortcuts and what needs your attention.',
  messages:'Messages contains direct chats, group chats and work chats linked to cooperation.',
  people:'People is the directory of pilot participants who chose to be discoverable.',
  communities:'Communities are longer-lived groups with members and publications.',
  together:'Together is for needs, offers, shared resources and joint purchases.',
  projects:'Projects is for teams, tasks, roles, progress and a linked work chat.',
  city:'City connects the app to local civic information for the city you selected in Profile. The current local pilot is Göteborg.',
  center:'Center is the physical/offline layer: meetings, learning, equipment and human help.',
  settings:'Settings contains language, app preferences and this introduction.',
  about:'About explains what FOLKOOP is, what it is trying to do and the limits of the current pilot.'
 },
 ru:{
  me:'Профиль: имя, город, навыки и то, что ты хочешь показать другим. Выбранный город определяет, какие местные инструменты можно показывать.',
  home:'Главная — стартовый экран: текущая активность, быстрые действия и то, что требует внимания.',
  messages:'Сообщения — личные, групповые и рабочие чаты, связанные с кооперацией.',
  people:'Люди — каталог участников пилота, которые сами включили видимость профиля.',
  communities:'Сообщества — постоянные группы с участниками и публикациями.',
  together:'Вместе — потребности, предложения, общие ресурсы и совместные закупки.',
  projects:'Проекты — команды, задачи, роли, прогресс и связанный рабочий чат.',
  city:'Город — местные гражданские инструменты для города, который указан в Профиле. Сейчас локальный пилот подключён к Göteborg.',
  center:'Центр — физический слой: встречи, обучение, оборудование и помощь людей в реальном мире.',
  settings:'Настройки — язык, параметры приложения и возможность заново пройти эту инструкцию.',
  about:'О нас — что такое FOLKOOP, зачем он создаётся и какие ограничения есть у текущего пилота.'
 },
 sv:{
  me:'Profil: namn, stad, färdigheter och det du vill visa andra. Din valda stad styr vilka lokala stadsverktyg som kan visas.',
  home:'Hem är startpunkten: aktivitet, genvägar och sådant som behöver din uppmärksamhet.',
  messages:'Meddelanden innehåller direktchattar, gruppchattar och arbetschattar kopplade till samarbete.',
  people:'Människor är katalogen över pilotdeltagare som själva valt att vara synliga.',
  communities:'Gemenskaper är mer långvariga grupper med medlemmar och publikationer.',
  together:'Tillsammans är för behov, erbjudanden, delade resurser och gemensamma köp.',
  projects:'Projekt är för team, uppgifter, roller, framsteg och en kopplad arbetschatt.',
  city:'Stad kopplar appen till lokal samhällsinformation för staden du valt i Profil. Den lokala piloten är nu Göteborg.',
  center:'Center är det fysiska lagret: möten, lärande, utrustning och mänsklig hjälp.',
  settings:'Inställningar innehåller språk, appval och möjlighet att visa introduktionen igen.',
  about:'Om oss förklarar vad FOLKOOP är, vad projektet försöker göra och pilotens nuvarande begränsningar.'
 }
};
function tutorialText(route){
 const source=tutorialCopy[lang]||tutorialCopy.en;
 return source[route]||tutorialCopy.en[route]||'';
}
function ensureOnboarding(){
 let dialog=document.getElementById('onboarding');
 if(dialog)return dialog;
 dialog=document.createElement('div');
 dialog.id='onboarding';
 dialog.className='onboarding';
 dialog.hidden=true;
 dialog.innerHTML='<div class="onboarding-backdrop"></div><section class="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle"><div class="row"><span id="onboardingProgress" class="eyebrow"></span><button type="button" class="text-button" data-onboarding="skip"></button></div><h2 id="onboardingTitle"></h2><p id="onboardingBody"></p><div class="onboarding-actions"><button type="button" class="button secondary" data-onboarding="back"></button><button type="button" class="button" data-onboarding="next"></button></div></section>';
 document.body.append(dialog);
 return dialog;
}
function showOnboarding(step=0){
 onboardingOpen=true;
 onboardingStep=Math.max(0,Math.min(onboardingSteps.length-1,step));
 const route=onboardingSteps[onboardingStep];
 const dialog=ensureOnboarding();
 dialog.hidden=false;
 location.hash='#/'+route;
 dialog.querySelector('#onboardingProgress').textContent=t('tutorialProgress')+' '+(onboardingStep+1)+' / '+onboardingSteps.length;
 dialog.querySelector('#onboardingTitle').textContent=navText(route);
 dialog.querySelector('#onboardingBody').textContent=tutorialText(route);
 dialog.querySelector('[data-onboarding="skip"]').textContent=t('tutorialSkip');
 const back=dialog.querySelector('[data-onboarding="back"]');back.textContent=t('tutorialBack');back.disabled=onboardingStep===0;
 dialog.querySelector('[data-onboarding="next"]').textContent=onboardingStep===onboardingSteps.length-1?t('tutorialDone'):t('tutorialNext');
 document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('tutorial-target',a.getAttribute('href')==='#/'+route));
}
function finishOnboarding(){
 onboardingOpen=false;
 const dialog=ensureOnboarding();dialog.hidden=true;
 document.querySelectorAll('#nav a').forEach(a=>a.classList.remove('tutorial-target'));
 try{storage?.setItem(ONBOARDING_KEY,'done');}catch{}
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
 $('#nav').setAttribute('aria-label',t('select'));$('#brandHome').setAttribute('aria-label','FOLKOOP · '+t('home'));
 $('#messageLink').setAttribute('aria-label',t('messages'));$('#messageLabel').textContent=t('messages');
 $('#languageLabel').textContent=t('language');$('#language').value=lang;$('#skip').textContent=t('skip');
 const menuButton=$('#mobileMenuToggle');if(menuButton){menuButton.setAttribute('aria-label',menuOpen?t('closeMenu'):t('menu'));menuButton.querySelector('.sr-only').textContent=menuOpen?t('closeMenu'):t('menu');}
 const location=$('#locationLabel');if(location)location.textContent=(selectedCity()?selectedCity()+' · ':'')+'pilot';
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
 if(onboardingOpen)showOnboarding(onboardingStep);
 if(focus)root.querySelector('h1')?.focus({preventScroll:true});
}
function changeLanguage(value){capture();lang=C.LANGS.includes(value)?value:'sv';try{storage?.setItem('sverinav-language',lang);}catch{}render();if(onboardingOpen)showOnboarding(onboardingStep);}
$('#language').innerHTML=C.LANGS.map(k=>`<option value="${k}">${esc(I.NAMES[k])}</option>`).join('');
$('#language').addEventListener('change',e=>changeLanguage(e.target.value));
window.addEventListener('hashchange',()=>{capture();current=C.route(location.hash);query='';formKind=null;closeMenu();render(true);window.scrollTo(0,0);});
document.addEventListener('click',e=>{
 const onboarding=e.target.closest('[data-onboarding]');
 if(onboarding){
  const action=onboarding.dataset.onboarding;
  if(action==='skip'){finishOnboarding();return;}
  if(action==='back'){showOnboarding(onboardingStep-1);return;}
  if(action==='next'){if(onboardingStep>=onboardingSteps.length-1)finishOnboarding();else showOnboarding(onboardingStep+1);return;}
 }
 const navLink=e.target.closest('#nav a');if(navLink){closeMenu();return;}
 const target=e.target.closest('button');if(!target)return;
 if(target.id==='mobileMenuToggle'){menuOpen?closeMenu():openMenu();return;}
 if(target.dataset.create){capture();formKind=target.dataset.create;scratch={kind:formKind};render();$('#draftForm input[name="title"]')?.focus();return;}
 if(target.dataset.toggle){status(store.toggle(target.dataset.toggle));render();return;}
 if(target.dataset.delete&&confirm(t('confirmDelete'))){status(store.remove(target.dataset.delete));render();return;}
 const action=target.dataset.action;
 if(action==='cancel'){formKind=null;scratch={};render();}
 if(action==='tutorial'){showOnboarding(0);return;}
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
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(onboardingOpen)finishOnboarding();else if(menuOpen)closeMenu();}});
render();
let onboardingDone=false;try{onboardingDone=storage?.getItem(ONBOARDING_KEY)==='done';}catch{onboardingDone=true;}
if(!onboardingDone)setTimeout(()=>showOnboarding(0),150);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
})();
