// FOLKOOP P0-A: locally run, privacy-minimised first-contact comprehension evidence.
// No synthetic responses are added to the repository and no participant data is uploaded.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const STUDY_VARIANTS=Object.freeze([
 'current-welcome','three-equal-paths','four-concrete-actions'
]);
export const INTERPRETATIONS=Object.freeze([
 'cooperation-action','social-network-forum','classifieds-marketplace',
 'city-portal','project-management','unclear-other'
]);
export const FIRST_ACTIONS=Object.freeze([
 'need','offer-help','do-together','browse-nearby','explore-mura',
 'open-account','unclear'
]);
export const CONFUSION_TAGS=Object.freeze([
 'purpose','personal-benefit','first-action','excess-options','technical-language',
 'chat-comparison','marketplace-comparison','city-comparison',
 'mura-fiction','signup-pressure','physical-center','none','other'
]);
export const LOCALES=Object.freeze([
 'sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'
]);
export const QUESTIONS=Object.freeze([
 'What is this?',
 'What can you do here now?',
 'What personal problem could this solve?',
 'Why would you use this with or instead of Telegram, Facebook or Blocket?',
 'Which action would you choose first, and why?',
 'What is confusing?'
]);
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj||{},key);
const count=(rows,key)=>Object.fromEntries([...new Set(rows.map(row=>row[key]))].sort()
 .map(value=>[value,rows.filter(row=>row[key]===value).length]));

export function makeStudyTemplate({variant='current-welcome',language='sv',buildRef='REPLACE_WITH_40_CHAR_COMMIT_SHA'}={}){
 if(!STUDY_VARIANTS.includes(variant))throw Error('Unsupported study variant: '+variant);
 if(!LOCALES.includes(language))throw Error('Unsupported language: '+language);
 return {
  schemaVersion:1,
  study:{variant,language,buildRef,
   notice:'Store only anonymous coded responses locally. Keep verbatim statements and consent separately; never commit personal data.'},
  responses:[],
  instructions:{
   sample:'5-10 different first-time participants PER variant; independent groups for comparisons.',
   exposure:'Expose a real, uncoached first screen for 20-30 seconds before the six questions.',
   questions:[...QUESTIONS],
   requiredCoding:'Human coder must inspect original answers; do not score with LLM or invent participants.',
   responseTemplate:{
    anonId:'p01',freshReviewer:true,uncoached:true,exposureSeconds:25,
    humanCoded:true,interpretation:'cooperation-action',
    describesIntentToNextAction:true,choosesPlausibleFirstAction:true,
    firstAction:'need',muraUnderstood:'uncertain',confusionTags:['none']
   }
  }
 };
}

function validateStudyHeader(input){
 const errors=[];
 if(input?.schemaVersion!==1)errors.push('Expected schemaVersion=1');
 const study=input?.study||{};
 if(!STUDY_VARIANTS.includes(study.variant))errors.push('Unrecognized variant');
 if(!LOCALES.includes(study.language))errors.push('Unrecognized language');
 if(!/^[a-f0-9]{40}$/i.test(study.buildRef||''))
  errors.push('Exact tested 40-character commit SHA is required');
 if(!Array.isArray(input?.responses))errors.push('Missing responses array');
 return errors;
}
function classifyResponse(r,idx,seen){
 const errors=[],reasons=[];
 const id=String(r?.anonId||'');
 if(!/^p[0-9]{2,3}$/.test(id))errors.push('Use only local anonymous IDs p01, p02 etc; row '+(idx+1));
 else if(seen.has(id))errors.push('Duplicate anonymous reviewer ID: '+id);
 else seen.add(id);
 if(typeof r?.freshReviewer!=='boolean')errors.push(id+': freshness must be recorded');
 if(typeof r?.uncoached!=='boolean')errors.push(id+': coaching status missing');
 if(!Number.isInteger(r?.exposureSeconds))errors.push(id+': exposure seconds must be an integer');
 if(r?.humanCoded!==true)errors.push(id+': human coding of real answers not confirmed');
 if(!INTERPRETATIONS.includes(r?.interpretation))errors.push(id+': missing interpretation code');
 if(typeof r?.describesIntentToNextAction!=='boolean')errors.push(id+': flow comprehension not coded');
 if(typeof r?.choosesPlausibleFirstAction!=='boolean')errors.push(id+': first action comprehension not coded');
 if(!FIRST_ACTIONS.includes(r?.firstAction))errors.push(id+': first-action category missing');
 if(!['yes','no','uncertain'].includes(r?.muraUnderstood))errors.push(id+': Mura understanding missing');
 if(!Array.isArray(r?.confusionTags)||r.confusionTags.length===0||
    r.confusionTags.some(tag=>!CONFUSION_TAGS.includes(tag)))
  errors.push(id+': confusion tags must come from the fixed vocabulary');
 if(r?.freshReviewer===false)reasons.push('previously-seen');
 if(r?.uncoached===false)reasons.push('facilitated');
 if(Number.isInteger(r?.exposureSeconds)&&
    (r.exposureSeconds<20||r.exposureSeconds>30))reasons.push('exposure-outside-20-30s');
 return {errors,reasons,eligible:errors.length===0&&reasons.length===0};
}
export function assessStudy(input){
 const errors=validateStudyHeader(input);
 if(errors.length)return {valid:false,status:'INVALID',errors};
 const seen=new Set(),qualified=[],excluded={},allErrors=[];
 for(const [i,record] of input.responses.entries()){
  const result=classifyResponse(record,i,seen);
  allErrors.push(...result.errors);
  if(result.eligible)qualified.push(record);
  else for(const reason of result.reasons)excluded[reason]=(excluded[reason]||0)+1;
 }
 if(allErrors.length)return {valid:false,status:'INVALID',errors:allErrors};
 const n=qualified.length;
 const success=qualified.filter(x=>x.describesIntentToNextAction&&x.choosesPlausibleFirstAction).length;
 const interpretations=count(qualified,'interpretation');
 const firstActions=count(qualified,'firstAction');
 const mura=count(qualified,'muraUnderstood');
 const confusions={};
 for(const r of qualified)for(const tag of new Set(r.confusionTags||[]))
  if(tag!=='none')confusions[tag]=(confusions[tag]||0)+1;
 const threshold=Math.floor(n/2)+1;
 const misleading=qualified.filter(x=>x.interpretation!=='cooperation-action').length;
 const dominantWrong=Object.entries(interpretations).some(([kind,total])=>
  kind!=='cooperation-action'&&total>=threshold);
 const status=n<5?'INSUFFICIENT_EVIDENCE':
  n>10?'REVIEW_SAMPLE_SIZE':
  success>=threshold&&!dominantWrong?'PASS':'FAIL';
 // Export only categorical aggregates, never anonymous IDs, quotes or private notes.
 return {
  valid:true,status,
  study:{variant:input.study.variant,language:input.study.language,buildRef:input.study.buildRef},
  sample:{submitted:input.responses.length,eligible:n,excluded:input.responses.length-n,
    exclusionReasons:excluded,plannedMin:5,plannedMax:10},
  comprehension:{intentToActionAndPlausibleFirstChoice:success,
    thresholdForMajority:threshold,notMeetingCriterion:n-success},
  interpretationCounts:interpretations,
  dominantMisinterpretation:dominantWrong,
  otherInterpretationCount:misleading,
  firstActionCounts:firstActions,muraUnderstandingCounts:mura,
  confusionTagCounts:Object.fromEntries(Object.entries(confusions).sort(([a],[b])=>a.localeCompare(b))),
  limitations:[
   'An interviewer must truthfully code actual responses; this tool cannot verify human participation.',
   'Small qualitative sample: do not infer product-market fit, retention, matching success or statistical significance.',
   'Comparing different variants requires independently recruited groups of at least 5 each and a separate analysis.',
   'No participant-level or personal information is included in this aggregate report.'
  ]
 };
}
export function reportMarkdown(result){
 if(!result.valid)return '# Invalid first-contact data\n\n'+
  result.errors.map(e=>'- '+e).join('\n')+'\n';
 const s=result.sample,c=result.comprehension;
 const term=(o)=>Object.entries(o||{}).map(([k,v])=>'- '+k+': '+v).join('\n')||'- None recorded';
 return '# FOLKOOP first-contact comprehension — aggregate only\n\n'+
  '**Result:** '+result.status+' (not product-market-fit evidence)\n\n'+
  'Variant: '+result.study.variant+'; locale: '+result.study.language+
  '; tested commit: '+result.study.buildRef+'\n\n'+
  'Sample: '+s.eligible+' eligible of '+s.submitted+' recorded; '+s.excluded+
  ' excluded. Intended 5–10 real first-time participants per variant.\n\n'+
  'Comprehended intent → person/resource/opportunity → action **and** named a plausible first step: '+
  c.intentToActionAndPlausibleFirstChoice+'/'+s.eligible+
  ' (majority threshold '+c.thresholdForMajority+').\n\n'+
  '## Interpretations\n\n'+term(result.interpretationCounts)+'\n\n'+
  '## First-choice categories\n\n'+term(result.firstActionCounts)+'\n\n'+
  '## Mura understood as illustrative\n\n'+term(result.muraUnderstandingCounts)+'\n\n'+
  '## Confusion tags\n\n'+term(result.confusionTagCounts)+'\n\n'+
  '## Exclusions\n\n'+term(s.exclusionReasons)+'\n\n'+
  '## Limitations\n\n'+result.limitations.map(x=>'- '+x).join('\n')+'\n';
}
async function command(){
 const [operation,...args]=process.argv.slice(2);
 const opts={};for(let i=0;i<args.length;i++){
  if(args[i].startsWith('--'))opts[args[i].slice(2)]=args[++i];
 }
 if(operation==='init'){
  if(!opts.out)throw Error('Usage: init --out qa-output/first-contact/study.json --variant current-welcome --language sv --buildRef COMMIT_SHA');
  const template=makeStudyTemplate({
   variant:opts.variant||'current-welcome',language:opts.language||'sv',
   buildRef:opts.buildRef||'REPLACE_WITH_40_CHAR_COMMIT_SHA'
  });
  const output=resolve(opts.out);
  await mkdir(dirname(output),{recursive:true});
  await writeFile(output,JSON.stringify(template,null,2)+'\n',{flag:'wx'});
  console.log('Created private local EMPTY study template: '+output);
  console.log('No participant test has been performed. Read docs/research/FIRST_CONTACT_STUDY_20261008.md.');
 }else if(operation==='assess'){
  if(!opts.in||!opts.out||!/\.md$/i.test(opts.out))throw Error('Usage: assess --in qa-output/first-contact/study.json --out qa-output/first-contact/report.md (Markdown output required)');
  const study=JSON.parse(await readFile(resolve(opts.in),'utf8'));
  const result=assessStudy(study);
  const output=resolve(opts.out);
  await mkdir(dirname(output),{recursive:true});
  await writeFile(output,reportMarkdown(result));
  await writeFile(output.replace(/\.md$/i,'.json'),JSON.stringify(result,null,2)+'\n');
  console.log('Study status: '+result.status+'; output contains aggregates only, no respondent notes.');
  if(!result.valid||opts['require-pass']==='true'&&result.status!=='PASS')process.exitCode=1;
 }else{
  console.log('Commands: init, assess. See docs/research/FIRST_CONTACT_STUDY_20261008.md');
  if(operation)process.exitCode=1;
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
 await command();
