/* FOLKOOP shell: local drafts and profile, with the preserved City module. */
(() => {
'use strict';
const C=globalThis.FolkoopCore, I=globalThis.FolkoopCopy, $=s=>document.querySelector(s), esc=C.escape;
let storage;try{storage=localStorage;}catch{/* Memory-only mode. */}
const store=C.workspace(storage);
let lang='sv';try{const saved=storage?.getItem('folkoop-language');lang=C.LANGS.includes(saved)?saved:(navigator.language||'sv').split('-')[0];}catch{}
if(!C.LANGS.includes(lang))lang='sv';
let current=C.route(location.hash), formKind=null, scratch={}, profileScratch=null, query='', frame=null;
const NAV_ORDER=['me','home','messages','people','communities','together','projects','city','center','settings','about'];
const ONBOARDING_KEY='folkoop-onboarding-v3';
const LANGUAGE_KEY='folkoop-language-choice-v1';
const ENTRY_KEY='folkoop-entry-mode-v1';
const introParam=new URL(location.href).searchParams.get('intro');
const onboardingSuppressed=introParam==='0'||(navigator.webdriver&&introParam!=='1');
let onboardingOpen=false,onboardingStep=0,menuOpen=false,helperOpen=false,firstVisitFlow=false;
const onboardingSteps=[
 {id:'welcome',route:'home',target:'.brand',motion:'point',pose:'please'},
 {id:'home',route:'home',target:'#nav a[href="#/home"]',motion:'point',pose:'point'},
 {id:'together',route:'together',target:'#nav a[href="#/together"]',motion:'point',pose:'point'},
 {id:'projects',route:'projects',target:'#nav a[href="#/projects"]',motion:'point',pose:'idea'},
 {id:'people',route:'people',target:'#nav a[href="#/people"]',motion:'point',pose:'point'},
 {id:'city',route:'city',target:'#nav a[href="#/city"]',motion:'point',pose:'point'},
 {id:'center',route:'center',target:'#nav a[href="#/center"]',motion:'perch',pose:'sit-edge'},
 {id:'quick',route:'home',target:'.quick-grid',motion:'perch',pose:'sit-edge'}
];

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
 return head('aboutTitle','aboutText')+`<section class="mission"><h2>${esc(t('mission'))}</h2><p>${esc(t('missionBody'))}</p></section><div class="card"><p><strong>FOLKOOP</strong></p><p class="meta">${esc(t('tagline'))}</p></div>`;
}
function cityShell(){
 const city=selectedCity();
 if(!city)return head('cityMissingTitle','cityMissingText')+`<div class="actions">${a('me','profileLink')}</div>`;
 if(!citySupported(city))return head('cityUnsupportedTitle','cityUnsupportedText')+`<article class="card"><h2>${esc(city)}</h2><p>${esc(t('cityUnsupportedText'))}</p><div class="actions">${a('me','profileLink','button secondary')}</div></article>`;
 return head('city','cityText')+`<a class="text-link" href="./city.html?embedded=1" target="_blank" rel="noopener">${esc(t('cityFull'))} ↗</a>`;
}

const tutorialCopy={
 en:{
  welcome:'Bring one real thing: something you need, a skill you can offer, a resource you can share or an idea you want to build. FOLKOOP helps you find people and resources and turn that into a concrete next step — not just another post or like.',
  home:'Home tells you what matters today: a message, task, confirmation or project step. Handle the useful thing first, then leave when you are caught up.',
  together:'Need help? Can help? Have something to share? Want to buy together? Together is where everyday needs become cooperation so people do not have to solve or buy everything alone.',
  projects:'Have an idea? Turn it into a team: people, roles, tasks, updates and a work chat around one real goal.',
  people:'Find people by what they can do and communities by what they care about. The goal is not followers — it is finding people you can actually do something with.',
  city:'City brings connected official local sources and routes into one place. You should not need to know which authority or website to search before you can take the next step.',
  center:'Center is the long-term physical FOLKOOP layer: a place in the city to meet people, get human help, learn, work on projects and share tools. No FOLKOOP Center is open yet; the next ambition is a suitable or partner space, then more city nodes if the model proves useful.',
  quick:'Do not learn everything first. Start with one real thing now: ask for help, offer help, buy together or share a resource. A real project can start from one small next step.'
 },
 ru:{
  welcome:'Принеси сюда что-то реальное: то, что тебе нужно, что ты умеешь, чем готов поделиться или что хочешь создать. FOLKOOP помогает найти людей и ресурсы и превратить это в конкретный следующий шаг — не просто в ещё один пост или лайк.',
  home:'Главная показывает, что важно сегодня: сообщение, задача, подтверждение или шаг проекта. Сначала сделай полезное — а когда всё просмотрено, приложение можно спокойно закрыть.',
  together:'Нужна помощь? Можешь помочь? Есть вещь или ресурс? Хочешь купить вместе? Здесь обычные потребности превращаются в кооперацию, чтобы не решать и не покупать всё в одиночку.',
  projects:'Есть идея? Преврати её в команду: люди, роли, задачи, обновления и рабочий чат вокруг одной реальной цели.',
  people:'Ищи людей по тому, что они умеют, а сообщества — по тому, что вам важно. Цель не в подписчиках, а в людях, с которыми реально можно что-то сделать.',
  city:'Город собирает подключённые официальные источники и маршруты в одном месте. Не нужно заранее знать, какой сайт или ведомство искать, чтобы понять следующий шаг.',
  center:'Центр — будущая физическая часть FOLKOOP: место в городе, где можно познакомиться, получить человеческую помощь, учиться, работать над проектами и делиться инструментами. Открытого Центра пока нет; следующий ориентир — подходящее или партнёрское помещение, а если модель сработает — такие узлы в крупных городах.',
  quick:'Не изучай всё заранее. Начни с одной реальной вещи: попроси помощь, предложи помощь, купи вместе или поделись ресурсом. Большой проект тоже начинается с одного небольшого шага.'
 },
 sv:{
  welcome:'Ta med något verkligt: något du behöver, en färdighet du kan erbjuda, en resurs du kan dela eller en idé du vill bygga. FOLKOOP hjälper dig hitta människor och resurser och göra det till ett konkret nästa steg — inte bara ännu ett inlägg eller en like.',
  home:'Hem visar vad som är viktigt idag: ett meddelande, en uppgift, en bekräftelse eller nästa projektsteg. Gör det användbara först och lämna appen när du är ikapp.',
  together:'Behöver du hjälp? Kan du hjälpa? Har du något att dela? Vill du köpa tillsammans? Här blir vardagsbehov till samarbete så att människor inte behöver lösa eller köpa allt själva.',
  projects:'Har du en idé? Gör den till ett team: människor, roller, uppgifter, uppdateringar och en arbetschatt kring ett verkligt mål.',
  people:'Hitta människor efter vad de kan och gemenskaper efter vad ni bryr er om. Målet är inte följare utan människor du faktiskt kan göra något tillsammans med.',
  city:'Stad samlar anslutna officiella lokala källor och vägar på ett ställe. Du ska inte behöva veta vilken myndighet eller webbplats du måste leta efter innan du kan ta nästa steg.',
  center:'Center är FOLKOOPs framtida fysiska lager: en plats i staden för att möta människor, få mänsklig hjälp, lära sig, arbeta med projekt och dela verktyg. Inget FOLKOOP Center är öppet ännu; nästa ambition är en lämplig eller partnerlokal och senare fler stadsnoder om modellen visar sig fungera.',
  quick:'Lär dig inte allt först. Börja med en verklig sak nu: be om hjälp, erbjud hjälp, köp tillsammans eller dela en resurs. Ett stort projekt kan börja med ett enda litet nästa steg.'
 }
};
const tutorialTitles={
 en:{welcome:'Bring a real need, skill, resource or idea',home:'What matters today',together:'Do not do everything alone',projects:'Turn an idea into a team',people:'Find your people',city:'Your city, one route',center:'From online network to a real place',quick:'Start with one real thing'},
 ru:{welcome:'Принеси реальную потребность, навык, ресурс или идею',home:'Что важно сегодня',together:'Не делай всё в одиночку',projects:'Преврати идею в команду',people:'Найди своих людей',city:'Твой город — один понятный маршрут',center:'От онлайн-сети к реальному месту',quick:'Начни с одной реальной вещи'},
 sv:{welcome:'Ta med ett verkligt behov, en färdighet, resurs eller idé',home:'Det som är viktigt idag',together:'Gör inte allt ensam',projects:'Gör en idé till ett team',people:'Hitta dina människor',city:'Din stad — en begriplig väg',center:'Från nätverk till en verklig plats',quick:'Börja med en verklig sak'}
};
const entryCopy={
 en:{title:'How do you want to enter?',body:'Sign in to participate, or explore the whole product in read-only guest mode.',email:'Continue with email',guest:'Explore as guest',guestNote:'Guest mode uses sample data. You can browse every main area, but creating, joining, sending and changing data requires a full account.',back:'Back to language'},
 ru:{title:'Как хочешь войти?',body:'Войди, чтобы участвовать, или посмотри весь FOLKOOP в гостевом режиме.',email:'Войти по почте',guest:'Посмотреть как гость',guestNote:'В гостевом режиме используются демонстрационные данные. Можно открыть все основные разделы, но создавать, вступать, отправлять и менять данные можно только после полного входа.',back:'Назад к языку'},
 sv:{title:'Hur vill du gå in?',body:'Logga in för att delta, eller utforska hela FOLKOOP i skrivskyddat gästläge.',email:'Fortsätt med e-post',guest:'Utforska som gäst',guestNote:'Gästläget använder exempeldata. Du kan se alla huvuddelar, men skapa, gå med, skicka och ändra data kräver ett fullständigt konto.',back:'Tillbaka till språk'},
 es:{title:'¿Cómo quieres entrar?',body:'Inicia sesión para participar o explora todo FOLKOOP en modo invitado de solo lectura.',email:'Continuar con correo',guest:'Explorar como invitado',guestNote:'El modo invitado usa datos de ejemplo. Puedes ver todas las áreas principales, pero crear, unirte, enviar o cambiar datos requiere una cuenta completa.',back:'Volver al idioma'},
 uk:{title:'Як хочеш увійти?',body:'Увійди, щоб брати участь, або переглянь увесь FOLKOOP у гостьовому режимі лише для читання.',email:'Продовжити з e-mail',guest:'Переглянути як гість',guestNote:'Гостьовий режим використовує демонстраційні дані. Можна переглядати всі основні розділи, але створення, вступ, надсилання та зміни потребують повного акаунта.',back:'Назад до мови'},
 fi:{title:'Miten haluat jatkaa?',body:'Kirjaudu osallistuaksesi tai tutustu koko FOLKOOPiin vain luku -vierastilassa.',email:'Jatka sähköpostilla',guest:'Tutustu vieraana',guestNote:'Vierastila käyttää esimerkkitietoja. Voit selata kaikkia pääalueita, mutta luominen, liittyminen, lähettäminen ja muuttaminen vaativat täyden tilin.',back:'Takaisin kieleen'},
 bs:{title:'Kako želiš ući?',body:'Prijavi se da učestvuješ ili pregledaj cijeli FOLKOOP u gostujućem režimu samo za čitanje.',email:'Nastavi e-poštom',guest:'Pogledaj kao gost',guestNote:'Gostujući režim koristi primjerne podatke. Sve glavne dijelove možeš pregledati, ali kreiranje, pridruživanje, slanje i promjene traže puni račun.',back:'Nazad na jezik'},
 ar:{title:'كيف تريد الدخول؟',body:'سجّل الدخول للمشاركة، أو استكشف FOLKOOP كاملًا في وضع ضيف للقراءة فقط.',email:'المتابعة بالبريد الإلكتروني',guest:'الاستكشاف كضيف',guestNote:'يستخدم وضع الضيف بيانات تجريبية. يمكنك تصفح كل الأقسام الرئيسية، لكن الإنشاء والانضمام والإرسال والتعديل تتطلب حسابًا كاملاً.',back:'العودة إلى اللغة'},
 fa:{title:'چطور می‌خواهید وارد شوید؟',body:'برای مشارکت وارد شوید، یا کل FOLKOOP را در حالت مهمان فقط‌خواندنی ببینید.',email:'ادامه با ایمیل',guest:'مشاهده به‌عنوان مهمان',guestNote:'حالت مهمان از داده‌های نمونه استفاده می‌کند. همه بخش‌های اصلی قابل مشاهده‌اند، اما ساختن، پیوستن، ارسال و تغییر داده به حساب کامل نیاز دارد.',back:'بازگشت به زبان'},
 so:{title:'Sidee rabtaa inaad u gasho?',body:'Soo gal si aad uga qaybqaadato, ama ku eeg FOLKOOP oo dhan qaab marti oo akhris-keliya.',email:'Ku sii wad iimayl',guest:'U eeg marti ahaan',guestNote:'Qaabka martidu wuxuu isticmaalaa xog tusaale ah. Qaybaha waaweyn oo dhan waad daawan kartaa, laakiin samayn, ku biirid, dirid iyo beddelid waxay u baahan yihiin akoon buuxa.',back:'Ku noqo luqadda'},
 ku:{title:'Tu dixwazî çawa têkevî?',body:'Ji bo beşdarbûnê têkevî, an jî FOLKOOP hemû bi moda mêvanê tenê-xwendinê bibîne.',email:'Bi e-nameyê bidomîne',guest:'Wek mêvan bibîne',guestNote:'Moda mêvanê daneyên mînak bikar tîne. Tu dikarî hemû beşên sereke bibînî, lê çêkirin, tevlêbûn, şandin û guhartin hesabek tam dixwaze.',back:'Vegere ziman'}
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
 if(mode==='guest'){location.hash='#/home';setTimeout(()=>{if(!onboardingDone)showOnboarding(0);},220);}
 else {location.hash='#/me';setTimeout(()=>document.querySelector('#netLogin [name="email"]')?.focus(),80);}
}
const helperCopy={
 en:{name:'FOLKOOP guide',label:'FOLKOOP helper',open:'Open FOLKOOP guide',close:'Close',tour:'Show the full introduction again',intro:'I live here to explain what this part of FOLKOOP is for.',tips:{
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
  about:'About explains the purpose, boundaries and current pilot state of FOLKOOP.'
 }},
 ru:{name:'FOLKOOP guide',label:'помощник FOLKOOP',open:'Открыть Муру',close:'Закрыть',tour:'Показать всю инструкцию ещё раз',intro:'Я живу здесь, чтобы объяснять, зачем нужен текущий раздел FOLKOOP.',tips:{
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
  about:'О нас объясняет идею FOLKOOP, границы продукта и текущее состояние пилота.'
 }},
 sv:{name:'FOLKOOP guide',label:'FOLKOOP-hjälp',open:'Öppna FOLKOOP guide',close:'Stäng',tour:'Visa hela introduktionen igen',intro:'Jag finns här för att förklara vad den aktuella delen av FOLKOOP är till för.',tips:{
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
  about:'Om oss förklarar FOLKOOPs syfte, gränser och pilotens nuvarande läge.'
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
 dialog.innerHTML='<div class="onboarding-backdrop"></div><div id="onboardingSpotlight" class="onboarding-spotlight" aria-hidden="true"></div><section class="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboardingTitle"><div class="row"><span id="onboardingProgress" class="eyebrow"></span><button type="button" class="text-button" data-onboarding="skip"></button></div><div class="onboarding-guide"><span class="onboarding-guide-mark" aria-hidden="true">К</span><span id="onboardingGuideName"></span></div><h2 id="onboardingTitle"></h2><p id="onboardingBody"></p><div class="onboarding-actions"><button type="button" class="button secondary" data-onboarding="back"></button><button type="button" class="button" data-onboarding="next"></button></div></section>';
 document.body.append(dialog);
 return dialog;
}
function onboardingTarget(step){
 const mobileToggle=$('#mobileMenuToggle');
 const mobileMenu=mobileToggle&&getComputedStyle(mobileToggle).display!=='none';
 if(step.id==='helper')globalThis.FolkoopGuide?.home({instant:true,pose:step.pose||'wink'});
 if(step.target.startsWith('#nav')&&mobileMenu)openMenu();
 else if(menuOpen&&!step.target.startsWith('#nav'))closeMenu();
 return document.querySelector(step.target);
}
function positionOnboarding(step){
 const dialog=ensureOnboarding(),spot=dialog.querySelector('#onboardingSpotlight'),target=onboardingTarget(step);
 document.querySelectorAll('.tutorial-target').forEach(x=>x.classList.remove('tutorial-target'));
 if(!target){spot.hidden=true;dialog.dataset.noTarget='1';return;}
 if(step.id!=='helper')target.classList.add('tutorial-target');
 if(step.id!=='helper')target.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});
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
function showOnboarding(step=0){
 onboardingOpen=true;
 onboardingStep=Math.max(0,Math.min(onboardingSteps.length-1,step));
 const item=onboardingSteps[onboardingStep],dialog=ensureOnboarding(),source=helperSource();
 dialog.hidden=false;
 if(current!==item.route){location.hash='#/'+item.route;return;}
 dialog.querySelector('#onboardingProgress').textContent=t('tutorialProgress')+' '+(onboardingStep+1)+' / '+onboardingSteps.length;
 dialog.querySelector('#onboardingGuideName').textContent=source.name+' · '+source.label;
 dialog.querySelector('#onboardingTitle').textContent=tutorialTitle(item);
 dialog.querySelector('#onboardingBody').textContent=tutorialText(item);
 dialog.querySelector('[data-onboarding="skip"]').textContent=t('tutorialSkip');
 const back=dialog.querySelector('[data-onboarding="back"]');back.textContent=t('tutorialBack');back.disabled=onboardingStep===0;
 dialog.querySelector('[data-onboarding="next"]').textContent=onboardingStep===onboardingSteps.length-1?t('tutorialDone'):t('tutorialNext');
 positionOnboarding(item);
}
function finishOnboarding(){
 onboardingOpen=false;
 const dialog=ensureOnboarding();dialog.hidden=true;
 dialog.querySelector('#onboardingSpotlight').hidden=true;
 document.querySelectorAll('.tutorial-target').forEach(x=>x.classList.remove('tutorial-target'));
 if(menuOpen)closeMenu();
 globalThis.FolkoopGuide?.home({instant:true});
 try{storage?.setItem(ONBOARDING_KEY,'done');}catch{}
 onboardingDone=true;
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
 if(firstVisitFlow){firstVisitFlow=false;setTimeout(showEntryGate,80);}
 else setTimeout(()=>showOnboarding(0),80);
});
window.addEventListener('folkoop:open-entry',()=>showEntryGate());
window.addEventListener('folkoop:account-ready',()=>{if(!onboardingDone)setTimeout(()=>showOnboarding(0),120);});
window.addEventListener('folkoop:helper-toggle',()=>{
 if(onboardingOpen)return;
 helperOpen=!helperOpen;updateHelper();
});
window.addEventListener('hashchange',()=>{capture();current=C.route(location.hash);query='';formKind=null;closeMenu();render(true);window.scrollTo(0,0);});
document.addEventListener('click',e=>{
 const entry=e.target.closest('[data-entry]');
 if(entry){
  const action=entry.dataset.entry;
  if(action==='guest'){setEntryMode('guest');return;}
  if(action==='email'){setEntryMode('account');return;}
  if(action==='language'){hideEntryGate();firstVisitFlow=true;globalThis.FolkoopGuide?.showLanguageGate(C.LANGS,I.NAMES,lang);return;}
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
 if(action==='tutorial'){startFullIntroduction();return;}
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
 helperOpen=false;updateHelper();firstVisitFlow=false;
 if(globalThis.FolkoopGuide){
  globalThis.FolkoopGuide.showLanguageGate(C.LANGS,I.NAMES,lang);
 }else showOnboarding(0);
}
function startFirstVisit(){
 onboardingOpen=false;helperOpen=false;updateHelper();firstVisitFlow=true;
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
