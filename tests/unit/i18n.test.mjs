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


test('primary navigation labels stay compact and semantically attached to current sections',()=>{
 const keys=['home','people','together','projects','city','center'];
 for(const lang of EXTRA){
  const pack=extra[lang];
  for(const key of keys){
   const value=pack.shell[key];
   assert(value.length>0&&value.length<48,lang+' '+key+' must be a navigation label, not explanatory prose');
   assert(!/[.!?]$/.test(value),lang+' '+key+' unexpectedly looks like a sentence');
  }
  assert.equal(pack.tutorial.together,pack.shell.togetherText,lang+' tutorial Together drifted from current copy');
  assert.equal(pack.tutorial.projects,pack.shell.projectsText,lang+' tutorial Projects drifted from current copy');
  assert.equal(pack.tutorial.people,pack.shell.peopleText,lang+' tutorial People drifted from current copy');
  assert.equal(pack.tutorial.city,pack.shell.cityText,lang+' tutorial City drifted from current copy');
  assert.equal(pack.tutorial.center,pack.shell.centerOnlineText,lang+' tutorial Center drifted from current copy');
  assert(pack.homeWelcome.placeText.startsWith(pack.shell.cityHelp),lang+' Home place copy lost city-selection guidance');
 }
});

test('Mura, guest and account routes prefer the selected language before English fallback',async()=>{
 const city=await readFile('apps/web/app.js','utf8');
 assert(folkoop.includes('muraTutorialCopy[lang]||globalThis.FolkoopExtraCopy?.muraNarrative?.[lang]?.tutorial||muraTutorialCopy.en'));
 assert(folkoop.includes('muraTutorialTitles[lang]||globalThis.FolkoopExtraCopy?.muraNarrative?.[lang]?.titles||muraTutorialTitles.en'));
 assert(folkoop.includes('muraHelperCopy[lang]||globalThis.FolkoopExtraCopy?.muraHelper?.[lang]||muraHelperCopy.en'));
 assert(!network.includes('muraGuestCopy[lang()]||muraGuestCopy.en'));
 assert(network.includes("accountEntryCopy[lang()]?.[k]||accountEntryCopy.en[k]||t(k)"));
 assert(city.includes('muraCityCopy[currentLanguage]?.[key]??muraCityCopy.en[key]'));
});

test('renderers consume the full-language registry rather than three-language fallback',()=>{
 assert(folkoop.includes('FolkoopExtraCopy?.languages'));
 assert(welcome.includes('FolkoopExtraCopy?.languages'));
 assert(network.includes('FolkoopExtraCopy?.languages'));
 assert(network.includes('FolkoopCore?.LANGS?.includes'));
 assert(auth.includes('FolkoopExtraCopy?.languages'));
});

test('RTL contract stays explicit and identical across shell, OAuth and City',async()=>{
 assert.deepEqual(FOLKOOP_RTL_LANGUAGES,['ar','fa']);
 const city=await readFile('apps/web/app.js','utf8');
 assert.match(folkoop,/\['ar','fa'\]\.includes\(lang\)/);
 assert.match(auth,/\['ar','fa'\]\.includes\(lang\)/);
 assert.match(city,/new Set\(\['ar', 'fa'\]\)/);
});
