// Read-only native-language review corpus builder. Run from the repository root.
// This is NOT a translation service and cannot sign off on human-language quality.
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {FOLKOOP_LANGUAGES,FOLKOOP_I18N_PATHS,flattenI18n} from './schema.mjs';

const CORE=new Set(['en','sv','ru']);
const CITY_DICTIONARIES=[
 'messages','planMessages','reportMessages','roadMessages',
 'pilotMessages','auditCopy','sourceStatusMessages','iosInstallMessages'
];
const COMPACT_KEYS=['details','noNotices','nextDeadline','moreServices','changeArea','forecast','statusNotShown'];
const PRIORITY_KEYS=new Set([
 'shell.privacy','shell.noDraftsText','shell.messageText','shell.peopleText',
 'shell.projectsText','shell.togetherText','shell.centerText','shell.centerOnlineText',
 'shell.centerHostText','shell.cityText','network.base.private',
 'network.base.policyAccept','network.chat.notEncrypted','network.chat.messagesDesc',
 'network.coop.purchaseHelp','network.offer.notOrder','network.lifecycle.externalOrderNotice',
 'network.lifecycle.deliverySelfReport','network.lifecycle.resultSelfReport',
 'network.home.demoText','network.home.demoLocked','auth.failed',
 'city.messages.privacy','city.auditCopy.privacy','city.today.ticketNote'
]);

function declaredLiteral(source,name){
 const m=new RegExp('\\bconst\\s+'+name+'\\s*=\\s*([\\{\\[])').exec(source);
 if(!m)throw new Error('Missing const '+name);
 const start=m.index+m[0].length-1,stack=[];
 let quote='',escaped=false;
 for(let i=start;i<source.length;i++){
  const ch=source[i];
  if(quote){
   if(escaped){escaped=false;continue;}
   if(ch==='\\'){escaped=true;continue;}
   if(ch===quote)quote='';
   continue;
  }
  if(ch==="'"||ch==='"'||ch.charCodeAt(0)===96){quote=ch;continue;}
  if(ch==='{'||ch==='[')stack.push(ch);
  else if(ch==='}'||ch===']'){
   if(stack.pop()!==(ch==='}'?'{':'['))throw new Error('Unbalanced '+name);
   if(!stack.length)return source.slice(start,i+1);
  }
 }
 throw new Error('Unclosed '+name);
}
function parse(source,name,scope={}){
 const names=Object.keys(scope);
 return Function(...names,'"use strict";return ('+declaredLiteral(source,name)+')')(...names.map(n=>scope[n]));
}
function fromGlobal(sources){
 const ctx=vm.createContext({});
 vm.runInContext(sources,ctx);
 return ctx;
}
let cached;
export async function getReviewCorpus(){
 if(cached)return cached;
 cached=(async()=>{
  const paths=[
   'apps/web/folkoop-core.js','apps/web/folkoop-i18n-extra.js',
   'apps/web/folkoop-copy.js','apps/web/folkoop.js',
   'apps/web/home-welcome.js','apps/web/network-ui.js',
   'apps/web/auth-callback.mjs','apps/web/app.js',
   'apps/web/today.js','apps/web/about-copy.js'
  ];
  const content=await Promise.all(paths.map(p=>readFile(p,'utf8')));
  const src=Object.fromEntries(paths.map((p,i)=>[p,content[i]]));
  const shell=fromGlobal(src['apps/web/folkoop-core.js']+
    '\n'+src['apps/web/folkoop-i18n-extra.js']+
    '\n'+src['apps/web/folkoop-copy.js']);
  const extra=shell.FolkoopExtraCopy.languages;
  const main=src['apps/web/folkoop.js'];
  const tutorial=parse(main,'tutorialCopy');
  const tutorialTitles=parse(main,'tutorialTitles');
  const helper=parse(main,'helperCopy');
  const homeWelcome=parse(src['apps/web/home-welcome.js'],'copy');
  const network=src['apps/web/network-ui.js'];
  const en=parse(network,'en');
  const networkBase={en,ru:parse(network,'ru',{en}),sv:parse(network,'sv',{en})};
  const chat=parse(network,'chatCopy');
  const coop=parse(network,'coopCopy');
  const offer=parse(network,'offerCopy');
  const lifecycle=parse(network,'lifecycleCopy');
  const activity=parse(network,'activityCopy');
  const home=parse(network,'homeCopy');
  const homeModes=parse(network,'homeModesCopy');
  const auth=parse(src['apps/web/auth-callback.mjs'],'copyByLanguage');
  const city={};
  for(const name of CITY_DICTIONARIES)
   city[name]=parse(src['apps/web/app.js'],name);
  const todaySrc=src['apps/web/today.js'];
  const todayKeys=parse(todaySrc,'KEYS');
  const todayCopy=parse(todaySrc,'COPY');
  const compactCopy=parse(todaySrc,'COMPACT_COPY');
  const about=fromGlobal(src['apps/web/about-copy.js']).FolkoopAboutCopy;
  const full={};
  for(const lang of FOLKOOP_LANGUAGES){
   const bundle=CORE.has(lang)?{
    shell:shell.FolkoopCopy.COPY[lang],
    tutorial:tutorial[lang],
    tutorialTitles:tutorialTitles[lang],
    helper:helper[lang],
    homeWelcome:homeWelcome[lang],
    network:{
     base:networkBase[lang],chat:chat[lang],coop:coop[lang],
     offer:offer[lang],lifecycle:lifecycle[lang],
     activity:activity[lang],home:home[lang]
    },
    auth:auth[lang]
   }:extra[lang];
   const flat=flattenI18n(bundle);
   const rows=[];
   const add=(key,value,reference,origin)=>{
    if(typeof reference!=='string')throw new Error('Missing English source '+key);
    rows.push({key,source:reference,target:typeof value==='string'?value:'',origin,
      priority:PRIORITY_KEYS.has(key)?'critical':'normal'});
   };
   const refFlat=CORE.has(lang)&&lang==='en'?flat:null;
   // English schema copy is needed for each target, assembled below.
   full[lang]={flat,rows,add,bundle,refFlat};
  }
  const canonical=full.en.flat;
  for(const lang of FOLKOOP_LANGUAGES){
   const b=full[lang];
   const add=b.add;
   for(const key of FOLKOOP_I18N_PATHS)
    add(key,b.flat.get(key),canonical.get(key),'schema-v2');
   const englishModes=homeModes.en||{};
   for(const [key,value] of Object.entries(englishModes))
    add('homeModes.'+key,homeModes[lang]?.[key],value,'network-home-modes');
   for(const name of CITY_DICTIONARIES){
    const reference=city[name].en||{};
    for(const [key,value] of Object.entries(reference))
     if(typeof value==='string')add('city.'+name+'.'+key,city[name][lang]?.[key],value,'city');
   }
   for(let i=0;i<todayKeys.length;i++)
    add('city.today.'+todayKeys[i],todayCopy[lang]?.[i],todayCopy.en[i],'city-today');
   for(let i=0;i<COMPACT_KEYS.length;i++)
    add('city.todayCompact.'+COMPACT_KEYS[i],compactCopy[lang]?.[i],compactCopy.en[i],'city-today-compact');
   const canonicalAbout=about.en||{};
   for(const [key,value] of Object.entries(canonicalAbout))
    if(typeof value==='string')add('city.about.'+key,about[lang]?.[key],value,'city-about');
   const questions=canonicalAbout.questions||[];
   for(let i=0;i<questions.length;i++){
    add('city.about.faq.'+(i+1)+'.question',
      about[lang]?.questions?.[i]?.[0],questions[i][0],'city-about-faq');
    add('city.about.faq.'+(i+1)+'.answer',
      about[lang]?.questions?.[i]?.[1],questions[i][1],'city-about-faq');
   }
   b.rows.sort((a,b)=>a.key.localeCompare(b.key,'en'));
   delete b.add;
   delete b.bundle;
   delete b.flat;
   delete b.refFlat;
  }
  return full;
 })();
 return cached;
}
export function fingerprint(rows){
 const canonical=rows.map(({key,target})=>[key,target]);
 return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
function csvCell(value){
 let v=String(value??'');
 // Avoid spreadsheet formula evaluation when reviewers open the generated CSV.
 if(/^[\s]*[=+@\u0009\u000d]/.test(v)||/^[\s]*-(?!\d)/.test(v))v="'"+v;
 return '"'+v.replaceAll('"','""')+'"';
}
export async function exportReviewPacks(outDir='qa-output/native-review'){
 const corpus=await getReviewCorpus();
 await mkdir(outDir,{recursive:true});
 const stats={schemaVersion:2,extractedAt:null,limitations:[
  'Does not extract authored-only Mura guest/home dictionaries for all languages.',
  'Does not include third-party official-source content, generated content, every ARIA string or all nested runtime copy.',
  'Human reviewers must test live routes and controls as well as the exported strings.'
 ],locales:{}};
 for(const lang of FOLKOOP_LANGUAGES){
  const rows=corpus[lang].rows,digest=fingerprint(rows);
  const header=['key','source_en','target','origin','priority','review_status','suggested_text','reviewer_notes'];
  const body=[header.join(',')].concat(rows.map(row=>
   [row.key,row.source,row.target,row.origin,row.priority,'PENDING','',''].map(csvCell).join(',')));
  await writeFile(resolve(outDir,lang+'.csv'),'\ufeff'+body.join('\n')+'\n','utf8');
  stats.locales[lang]={entries:rows.length,blank:rows.filter(x=>!x.target.trim()).length,
    critical:rows.filter(x=>x.priority==='critical').length,sha256:digest};
 }
 await writeFile(resolve(outDir,'review-inventory.json'),JSON.stringify(stats,null,2)+'\n','utf8');
 return stats;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const outArg=process.argv.indexOf('--out');
 const target=outArg<0?'qa-output/native-review':process.argv[outArg+1];
 const result=await exportReviewPacks(target);
 console.log('Native reviewer packets exported (NOT human-approved):');
 for(const [lang,meta] of Object.entries(result.locales))
  console.log(lang,meta.entries,'keys; blank',meta.blank,'; sha256',meta.sha256);
}
