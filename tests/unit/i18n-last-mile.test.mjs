import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FOLKOOP_LANGUAGES} from '../../scripts/i18n/schema.mjs';

function objectLiteral(source,name){
 const hit=new RegExp('\\bconst\\s+'+name+'\\s*=\\s*\\{').exec(source);
 assert(hit,'Missing '+name);
 const from=source.indexOf('{',hit.index),stack=[],quote={value:'',esc:false};
 for(let i=from;i<source.length;i++){
  const ch=source[i];
  if(quote.value){
   if(quote.esc){quote.esc=false;continue;}
   if(ch==='\\'){quote.esc=true;continue;}
   if(ch===quote.value)quote.value='';
   continue;
  }
  if(ch==="'"||ch==='"'||ch.charCodeAt(0)===96){quote.value=ch;continue;}
  if(ch==='{')stack.push(ch);
  if(ch==='}'){
   assert.equal(stack.pop(),'{');
   if(!stack.length)return source.slice(from,i+1);
  }
 }
 throw Error('Unclosed '+name);
}
function parse(source,name){
 return Function('"use strict";return ('+objectLiteral(source,name)+')')();
}
const core=await readFile('apps/web/folkoop.js','utf8');
const network=await readFile('apps/web/network-ui.js','utf8');
const guide=await readFile('apps/web/folkoop-guide.js','utf8');
const actions=parse(core,'onboardingActionCopy');
const feedback=parse(core,'onboardingFeedbackCopy');
const entries=parse(network,'accountEntryCopy');
const languageTitles=parse(guide,'LANGUAGE_DIALOG_TITLES');

test('all eleven locales have translated language chooser headings and direction',()=>{
 for(const code of FOLKOOP_LANGUAGES){
  assert.equal(typeof languageTitles[code],'string',code);
  assert(languageTitles[code].length>4,code);
 }
 assert.equal(Object.keys(languageTitles).length,11);
 assert(guide.includes("gate.lang=current;gate.dir=['ar','fa'].includes(current)?'rtl':'ltr'"));
 assert(!guide.includes('Hej! · Hi! · Привет!'));
 assert(!guide.includes('Välj språk · Choose language · Выбери язык'));
});

test('all eleven locales have complete account-entry copy',()=>{
 const fields=['login','invite','email','send','localContinue'];
 for(const code of FOLKOOP_LANGUAGES){
  assert(entries[code],code+' account entry absent');
  for(const key of fields){
   const value=entries[code][key];
   assert(typeof value==='string'&&value.trim().length>3,code+' account entry '+key);
  }
 }
 assert.equal(Object.keys(entries).length,11);
 assert(network.includes("accountEntryCopy[lang()]?.[k]||accountEntryCopy.en[k]||t(k)"));
});

test('all eleven locales have guided-tour action and feedback texts',()=>{
 for(const code of FOLKOOP_LANGUAGES){
  for(const key of ['practice','explore'])
   assert(typeof actions[code]?.[key]==='string'&&actions[code][key].length>4,code+' '+key);
  for(const key of ['next','finished'])
   assert(typeof feedback[code]?.[key]==='string'&&feedback[code][key].length>12,code+' '+key);
 }
 assert.equal(Object.keys(actions).length,11);
 assert.equal(Object.keys(feedback).length,11);
 assert(core.includes("onboardingFeedbackCopy[lang]||onboardingFeedbackCopy.en"));
 assert(core.includes("$('#mobilePrimaryNav')?.setAttribute('aria-label',t('select'))"));
 assert(core.includes("$('#networkPanel')?.setAttribute('aria-label','FOLKOOP · '+t('together'))"));
});

test('PWA release version and build metadata stay in sync',async()=>{
 const [sw,pkg,lock]=await Promise.all([
  readFile('apps/web/sw.js','utf8'),
  readFile('package.json','utf8'),
  readFile('package-lock.json','utf8')
 ]);
 const version=JSON.parse(pkg).version;
 assert.match(version,/^\d+\.\d+\.\d+$/,'release must use a valid semantic version');
 assert.equal(JSON.parse(lock).version,version);
 assert.equal(JSON.parse(lock).packages[''].version,version);
 assert(sw.includes("const VERSION='"+version+"'"));
});
