import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {
 FOLKOOP_I18N_SCHEMA_VERSION,
 FOLKOOP_LANGUAGES,
 FOLKOOP_RTL_LANGUAGES,
 FOLKOOP_I18N_GROUPS,
 FOLKOOP_I18N_PATHS,
 flattenI18n,
 validateI18nBundle
} from '../../scripts/i18n/schema.mjs';

const CORE=['sv','en','ru'];
const EXTRA=FOLKOOP_LANGUAGES.filter(lang=>!CORE.includes(lang));

function objectLiteral(source,name){
 const re=new RegExp('const\\s+'+name+'\\s*=\\s*\\{','g');
 const hit=re.exec(source);
 assert(hit,'Missing const '+name);
 const start=source.indexOf('{',hit.index);
 let depth=0,quote='',escaped=false;
 for(let i=start;i<source.length;i++){
  const ch=source[i];
  if(quote){
   if(escaped){escaped=false;continue;}
   if(ch==='\\\\'){escaped=true;continue;}
   if(ch===quote)quote='';
   continue;
  }
  if(ch==="'"||ch==='"'||ch==='\x60'){quote=ch;continue;}
  if(ch==='{')depth++;
  if(ch==='}'&&--depth===0)return source.slice(start,i+1);
 }
 throw new Error('Unclosed object '+name);
}
function parseObject(source,name,scope={}){
 const keys=Object.keys(scope);
 const values=keys.map(key=>scope[key]);
 return Function(...keys,'"use strict";return ('+objectLiteral(source,name)+')')(...values);
}

const extraCtx=vm.createContext({});
vm.runInContext(await readFile('apps/web/folkoop-i18n-extra.js','utf8'),extraCtx);
const extra=extraCtx.FolkoopExtraCopy.languages;

const shellCtx=vm.createContext({});
vm.runInContext(await readFile('apps/web/folkoop-core.js','utf8'),shellCtx);
vm.runInContext(await readFile('apps/web/folkoop-i18n-extra.js','utf8'),shellCtx);
vm.runInContext(await readFile('apps/web/folkoop-copy.js','utf8'),shellCtx);

const folkoop=await readFile('apps/web/folkoop.js','utf8');
const tutorialCopy=parseObject(folkoop,'tutorialCopy');
const tutorialTitles=parseObject(folkoop,'tutorialTitles');
const helperCopy=parseObject(folkoop,'helperCopy');

const welcome=await readFile('apps/web/home-welcome.js','utf8');
const homeWelcome=parseObject(welcome,'copy');

const network=await readFile('apps/web/network-ui.js','utf8');
const networkEn=parseObject(network,'en');
const networkBase={
 en:networkEn,
 ru:parseObject(network,'ru',{en:networkEn}),
 sv:parseObject(network,'sv',{en:networkEn})
};
const chatCopy=parseObject(network,'chatCopy');
const coopCopy=parseObject(network,'coopCopy');
const offerCopy=parseObject(network,'offerCopy');
const lifecycleCopy=parseObject(network,'lifecycleCopy');
const activityCopy=parseObject(network,'activityCopy');
const homeCopy=parseObject(network,'homeCopy');

const auth=await readFile('apps/web/auth-callback.mjs','utf8');
const authCopy=parseObject(auth,'copyByLanguage');

function coreBundle(lang){
 return {
  shell:shellCtx.FolkoopCopy.COPY[lang],
  tutorial:tutorialCopy[lang],
  tutorialTitles:tutorialTitles[lang],
  helper:helperCopy[lang],
  homeWelcome:homeWelcome[lang],
  network:{
   base:networkBase[lang],
   chat:chatCopy[lang],
   coop:coopCopy[lang],
   offer:offerCopy[lang],
   lifecycle:lifecycleCopy[lang],
   activity:activityCopy[lang],
   home:homeCopy[lang]
  },
  auth:authCopy[lang]
 };
}
const bundle=lang=>CORE.includes(lang)?coreBundle(lang):extra[lang];

test('versioned schema is the single explicit interface-key contract',()=>{
 assert.equal(FOLKOOP_I18N_SCHEMA_VERSION,2);
 assert.deepEqual(FOLKOOP_I18N_GROUPS,['auth','helper','homeWelcome','network','shell','tutorial','tutorialTitles']);
 const englishPaths=[...flattenI18n(bundle('en')).keys()].sort();
 assert.deepEqual(englishPaths,FOLKOOP_I18N_PATHS);
 assert.equal(FOLKOOP_I18N_PATHS.length,509);
});

test('language registry and runtime shell advertise the same eleven languages',()=>{
 assert.deepEqual([...shellCtx.FolkoopCore.LANGS],FOLKOOP_LANGUAGES);
 assert.deepEqual([...shellCtx.FolkoopCopy.FULL],FOLKOOP_LANGUAGES);
 assert.deepEqual(Object.keys(extra).sort(),EXTRA.slice().sort());
});

test('every supported language exactly satisfies the explicit schema',()=>{
 for(const lang of FOLKOOP_LANGUAGES){
  const report=validateI18nBundle(bundle(lang));
  assert.deepEqual(report.missing,[],lang+' missing keys');
  assert.deepEqual(report.extra,[],lang+' unexpected keys');
  assert.deepEqual(report.invalid,[],lang+' invalid values');
  assert.equal(report.ok,true,lang+' schema status');
 }
});

test('non-core language packs do not collapse into excessive English fallback',()=>{
 const english=flattenI18n(bundle('en'));
 for(const lang of EXTRA){
  const leaves=flattenI18n(bundle(lang));
  let same=0;
  for(const [key,value] of leaves)if(value===english.get(key))same++;
  assert(same/leaves.size<0.2,lang+' appears to contain excessive English fallback');
 }
});

test('renderers consume the full-language registry rather than three-language fallback',()=>{
 assert(folkoop.includes('FolkoopExtraCopy?.languages'));
 assert(welcome.includes('FolkoopExtraCopy?.languages'));
 assert(network.includes('FolkoopExtraCopy?.languages'));
 assert(network.includes('FolkoopCore?.LANGS?.includes'));
 assert(auth.includes('FolkoopExtraCopy?.languages'));
});


const NAV_EXPECTED={
 sv:{home:'Hem',people:'Människor',communities:'Gemenskaper',together:'Tillsammans',projects:'Projekt',city:'Stad',center:'Center',me:'Profil',messages:'Meddelanden',settings:'Inställningar'},
 en:{home:'Home',people:'People',communities:'Communities',together:'Together',projects:'Projects',city:'City',center:'Center',me:'Profile',messages:'Messages',settings:'Settings'},
 ru:{home:'Главная',people:'Люди',communities:'Сообщества',together:'Вместе',projects:'Проекты',city:'Город',center:'Центр',me:'Профиль',messages:'Сообщения',settings:'Настройки'},
 es:{home:'Inicio',people:'Personas',communities:'Comunidades',together:'Juntos',projects:'Proyectos',city:'Ciudad',center:'Centro',me:'Perfil',messages:'Mensajes',settings:'Ajustes'},
 uk:{home:'Головна',people:'Люди',communities:'Спільноти',together:'Разом',projects:'Проєкти',city:'Місто',center:'Центр',me:'Профіль',messages:'Повідомлення',settings:'Налаштування'},
 fi:{home:'Etusivu',people:'Ihmiset',communities:'Yhteisöt',together:'Yhdessä',projects:'Projektit',city:'Kaupunki',center:'Keskus',me:'Profiili',messages:'Viestit',settings:'Asetukset'},
 bs:{home:'Početna',people:'Ljudi',communities:'Zajednice',together:'Zajedno',projects:'Projekti',city:'Grad',center:'Centar',me:'Profil',messages:'Poruke',settings:'Postavke'},
 ar:{home:'الرئيسية',people:'الأشخاص',communities:'المجتمعات',together:'معًا',projects:'المشاريع',city:'المدينة',center:'المركز',me:'الملف الشخصي',messages:'الرسائل',settings:'الإعدادات'},
 fa:{home:'خانه',people:'افراد',communities:'جوامع',together:'با هم',projects:'پروژه‌ها',city:'شهر',center:'مرکز',me:'پروفایل',messages:'پیام‌ها',settings:'تنظیمات'},
 so:{home:'Bogga hore',people:'Dadka',communities:'Bulshooyinka',together:'Wadajir',projects:'Mashaariic',city:'Magaalada',center:'Xarunta',me:'Borofayl',messages:'Farriimaha',settings:'Dejinta'},
 ku:{home:'Destpêk',people:'Mirov',communities:'Civak',together:'Bi hev re',projects:'Proje',city:'Bajar',center:'Navend',me:'Profîl',messages:'Peyam',settings:'Mîheng'}
};

test('route labels are real navigation labels in every supported language',()=>{
 for(const lang of FOLKOOP_LANGUAGES){
  const shell=bundle(lang).shell;
  for(const [key,value] of Object.entries(NAV_EXPECTED[lang])){
   assert.equal(shell[key],value,lang+' '+key);
   assert(value.length<=24,lang+' '+key+' must remain a compact navigation label');
  }
 }
});

test('Mura, account-entry and accessibility routes keep the selected language',async()=>{
 const accountEntry=parseObject(network,'accountEntryCopy');
 assert.deepEqual(Object.keys(accountEntry).sort(),[...FOLKOOP_LANGUAGES].sort());
 const accountKeys=Object.keys(accountEntry.en).sort();
 for(const lang of FOLKOOP_LANGUAGES)assert.deepEqual(Object.keys(accountEntry[lang]).sort(),accountKeys,lang+' account entry');

 const onboardingActions=parseObject(folkoop,'onboardingActionCopy');
 assert.deepEqual(Object.keys(onboardingActions).sort(),[...FOLKOOP_LANGUAGES].sort());

 assert.match(network,/regularMuraCopy=\{base:baseCopy,chat:chatCopy,coop:coopCopy,offer:offerCopy,activity:activityCopy,home:homeCopy\}/);
 assert.doesNotMatch(network,/muraGuestCopy\[lang\(\)\]\|\|muraGuestCopy\.en/);
 assert.match(folkoop,/muraTutorialCopy\[lang\]\|\|tutorialCopy\[lang\]\|\|muraTutorialCopy\.en/);
 assert.match(folkoop,/muraHelperCopy\[lang\]\|\|helperCopy\[lang\]\|\|muraHelperCopy\.en/);
 assert.match(folkoop,/mobilePrimary\.setAttribute\('aria-label',t\('select'\)\)/);
 assert.match(folkoop,/networkPanel\.setAttribute\('aria-label','FOLKOOP · '\+t\('together'\)\)/);

 const city=await readFile('apps/web/app.js','utf8');
 assert.doesNotMatch(city,/muraCityCopy\[currentLanguage\]\?\.\[key\]\?\?muraCityCopy\.en/);

 const guide=await readFile('apps/web/folkoop-guide.js','utf8');
 assert.doesNotMatch(guide,/Välj språk · Choose language · Выбери язык/);

 const aboutProject=await readFile('apps/web/about-project.js','utf8');
 const contactLabels=parseObject(aboutProject,'CONTACT_LABEL');
 assert.deepEqual(Object.keys(contactLabels).sort(),[...FOLKOOP_LANGUAGES].sort());
});

test('immersive Mura Home has authored copy for all eleven languages',async()=>{
 const source=await readFile('apps/web/network-mura-home.js','utf8');
 const context=vm.createContext({
  document:{documentElement:{lang:'en'}},
  FolkoopCore:{LANGS:[...FOLKOOP_LANGUAGES]}
 });
 vm.runInContext(source,context);
 const domain=context.FolkoopNetworkMuraHome.create({
  escape:value=>String(value??''),
  getData:()=>({profile:{name:'Mura',city:'Göteborg'},cooperations:[],assignedTasks:[],directory:[],localDrafts:[],chats:[],chatMessages:[],groups:[],homePosts:[],myConfirmations:[],chatInbox:[],coopMembers:[]}),
  getProfile:()=>null,
  kindLabel:value=>String(value),
  statusLabel:value=>String(value),
  formatWhen:value=>String(value)
 });
 const eyebrow={
  sv:'MURAS FOLKOOP',en:"MURA'S FOLKOOP",ru:'FOLKOOP МУРЫ',es:'FOLKOOP DE MURA',uk:'FOLKOOP МУРИ',
  fi:'MURAN FOLKOOP',bs:'MURIN FOLKOOP',ar:'FOLKOOP مورا',fa:'FOLKOOP مورا',so:'FOLKOOP-KA MURA',ku:'FOLKOOP-A MURA'
 };
 for(const lang of FOLKOOP_LANGUAGES){
  context.document.documentElement.lang=lang;
  const html=domain.render({id:'demo-user'});
  assert(html.includes(eyebrow[lang]),lang+' Mura Home must use authored selected-language copy');
 }
});

test('economic coordination is an eleven-language route, not an English island',async()=>{
 const economic=await readFile('apps/web/network-purchase-lifecycle.js','utf8');
 const copy=parseObject(economic,'COPY');
 assert.deepEqual(Object.keys(copy).sort(),[...FOLKOOP_LANGUAGES].sort());
 const keys=Object.keys(copy.en).sort();
 for(const lang of FOLKOOP_LANGUAGES)assert.deepEqual(Object.keys(copy[lang]).sort(),keys,lang+' economic flow');
});

test('RTL contract stays explicit and identical across shell, OAuth and City',async()=>{
 assert.deepEqual(FOLKOOP_RTL_LANGUAGES,['ar','fa']);
 const city=await readFile('apps/web/app.js','utf8');
 assert.match(folkoop,/\['ar','fa'\]\.includes\(lang\)/);
 assert.match(auth,/\['ar','fa'\]\.includes\(lang\)/);
 assert.match(city,/new Set\(\['ar', 'fa'\]\)/);
});
