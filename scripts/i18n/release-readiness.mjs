// Claim gate for native-language certification. Does not block ordinary pilot deployment.
// "Approved" requires evidence of human review of the *current* extracted copy.
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {FOLKOOP_LANGUAGES} from './schema.mjs';
import {getReviewCorpus,fingerprint} from './native-review-source.mjs';

export const REQUIRED_ROUTE_SET=[
 'home','together','projects','messages','people','communities',
 'city','center','me','settings','about'
];
export function evaluateAcceptance(manifest,reviewRows){
 const fail=[];
 if(manifest?.version!==1)fail.push('manifest must have version 1');
 const locales=manifest?.languages||{};
 const expected=[...FOLKOOP_LANGUAGES].sort();
 const listed=Object.keys(locales).sort();
 if(JSON.stringify(expected)!==JSON.stringify(listed))
  fail.push('locale registry must match the eleven supported languages exactly');
 const checks={};
 for(const lang of FOLKOOP_LANGUAGES){
  const entry=locales[lang],review=entry?.native_review;
  const errors=[];
  if(typeof entry?.variant!=='string'||!entry.variant.trim())errors.push('locale variant missing');
  if(!Array.isArray(reviewRows[lang])||reviewRows[lang].length<509)
   errors.push('review source corpus incomplete');
  if(review?.status==='pending'){
   if(review.approval!==null)errors.push('pending review must not contain an approval');
  }else if(review?.status==='approved'){
   const a=review.approval;
   if(!a||typeof a!=='object')errors.push('approval evidence missing');
   else{
    if(a.confirmed_fluent_human!==true)errors.push('fluent human reviewer confirmation missing');
    if(typeof a.reviewer_alias!=='string'||!a.reviewer_alias.trim())
     errors.push('non-sensitive reviewer alias missing');
    if(typeof a.evidence_ref!=='string'||!/^https:\/\/github\.com\/[^\s]+$/i.test(a.evidence_ref))
     errors.push('public evidence or discussion reference missing');
    if(typeof a.reviewed_at!=='string'||!Number.isFinite(Date.parse(a.reviewed_at)))
     errors.push('review timestamp missing');
    if(typeof a.reviewed_copy_sha256!=='string'||
       a.reviewed_copy_sha256!==fingerprint(reviewRows[lang]||[]))
     errors.push('review is stale: reviewed copy fingerprint does not match current strings');
    if(!Array.isArray(a.reviewed_routes)||
       REQUIRED_ROUTE_SET.some(r=>!a.reviewed_routes.includes(r)))
     errors.push('11-route coverage evidence incomplete');
    if(a.reviewed_full_csv!==true)errors.push('complete exported review corpus not confirmed');
    if(a.safety_claims_checked!==true)errors.push('privacy, payments, source and venue claims not confirmed');
    if(a.blocking_findings_resolved!==true)errors.push('blocking linguistic findings not resolved');
   }
  }else errors.push('native review status must be pending or approved');
  const status=errors.length?'invalid':review?.status;
  checks[lang]={status,variant:entry?.variant||null,errors};
  for(const e of errors)fail.push(lang+': '+e);
 }
 const pending=FOLKOOP_LANGUAGES.filter(l=>checks[l].status==='pending');
 const approved=FOLKOOP_LANGUAGES.filter(l=>checks[l].status==='approved');
 return {ok:fail.length===0,certified:fail.length===0&&pending.length===0,
  approved,pending,errors:fail,locales:checks};
}
export async function evaluateFromRepo(){
 const manifest=JSON.parse(await readFile('docs/i18n/locale-acceptance.json','utf8'));
 const source=await getReviewCorpus();
 const rows=Object.fromEntries(FOLKOOP_LANGUAGES.map(l=>[l,source[l].rows]));
 return evaluateAcceptance(manifest,rows);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const report=await evaluateFromRepo();
 for(const [lang,info]of Object.entries(report.locales))
  console.log(lang.toUpperCase()+': '+info.status.toUpperCase()+
    (info.errors.length?' — '+info.errors.join('; '):''));
 console.log('Approved '+report.approved.length+'/11; pending '+report.pending.length+'/11.');
 if(!report.ok){
  console.error('Invalid localization acceptance evidence: '+report.errors.join(' | '));
  process.exitCode=1;
 }else if(!report.certified&&process.argv.includes('--require-approved')){
  console.error('NOT CERTIFIED: native human review is still pending.');
  process.exitCode=1;
 }else{
  console.log(report.certified?'ALL 11 NATIVE-REVIEW CERTIFIED':'Technical QA is separate; do NOT claim native approval.');
 }
}
