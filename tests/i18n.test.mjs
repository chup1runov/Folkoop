import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const LANGS=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];
const EXTRA=['ar','so','fa','fi','bs','ku','es','uk'];

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
const parseObject=(source,name)=>vm.runInNewContext('('+objectLiteral(source,name)+')');

function leafMap(value,prefix='',out=new Map()){
 for(const [key,item] of Object.entries(value||{})){
  const path=prefix?prefix+'.'+key:key;
  if(item&&typeof item==='object'&&!Array.isArray(item))leafMap(item,path,out);
  else out.set(path,item);
 }
 return out;
}
function assertSameShape(actual,expected,label){
 const a=leafMap(actual),e=leafMap(expected);
 assert.deepEqual([...a.keys()].sort(),[...e.keys()].sort(),label+' keys');
 for(const [key,value] of a){
  assert.equal(typeof value,'string',label+':'+key+' type');
  assert(value.trim().length>0,label+':'+key+' empty');
 }
 return {a,e};
}

const extraCtx=vm.createContext({});
vm.runInContext(await readFile('folkoop-i18n-extra.js','utf8'),extraCtx);
const extra=extraCtx.FolkoopExtraCopy.languages;

const shellCtx=vm.createContext({});
vm.runInContext(await readFile('folkoop-core.js','utf8'),shellCtx);
vm.runInContext(await readFile('folkoop-i18n-extra.js','utf8'),shellCtx);
vm.runInContext(await readFile('folkoop-copy.js','utf8'),shellCtx);
const shellEn=shellCtx.FolkoopCopy.COPY.en;

const folkoop=await readFile('folkoop.js','utf8');
const tutorialEn=parseObject(folkoop,'tutorialCopy').en;
const tutorialTitlesEn=parseObject(folkoop,'tutorialTitles').en;
const helperEn=parseObject(folkoop,'helperCopy').en;

const welcome=await readFile('home-welcome.js','utf8');
const welcomeEn=parseObject(welcome,'copy').en;

const network=await readFile('network-ui.js','utf8');
const networkEn={
 base:parseObject(network,'en'),
 chat:parseObject(network,'chatCopy').en,
 coop:parseObject(network,'coopCopy').en,
 offer:parseObject(network,'offerCopy').en,
 lifecycle:parseObject(network,'lifecycleCopy').en,
 activity:parseObject(network,'activityCopy').en,
 home:parseObject(network,'homeCopy').en
};
const auth=await readFile('auth-callback.js','utf8');
const authEn=parseObject(auth,'copyByLanguage').en;

const baseline={shell:shellEn,tutorial:tutorialEn,tutorialTitles:tutorialTitlesEn,helper:helperEn,homeWelcome:welcomeEn,network:networkEn,auth:authEn};

test('extra registry contains every non-core supported language',()=>{
 assert.deepEqual(Object.keys(extra).sort(),EXTRA.slice().sort());
});

test('every added language exactly matches the full interface schema',()=>{
 const english=leafMap(baseline);
 for(const lang of EXTRA){
  const {a}=assertSameShape(extra[lang],baseline,lang);
  let same=0;
  for(const [key,value] of a)if(value===english.get(key))same++;
  assert(same/a.size<0.2,lang+' appears to contain excessive English fallback');
 }
});

test('renderers consume full-language registry instead of three-language fallback',()=>{
 assert(folkoop.includes('FolkoopExtraCopy?.languages'));
 assert(welcome.includes('FolkoopExtraCopy?.languages'));
 assert(network.includes('FolkoopExtraCopy?.languages'));
 assert(network.includes('FolkoopCore?.LANGS?.includes'));
 assert(auth.includes('FolkoopExtraCopy?.languages'));
});

test('shell advertises all eleven languages as full translations',()=>{
 assert.deepEqual([...shellCtx.FolkoopCopy.FULL].sort(),LANGS.slice().sort());
 for(const lang of LANGS)assertSameShape(shellCtx.FolkoopCopy.COPY[lang],shellEn,'shell '+lang);
});
