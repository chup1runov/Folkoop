import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FOLKOOP_LANGUAGES,FOLKOOP_I18N_PATHS} from '../../scripts/i18n/schema.mjs';
import {getReviewCorpus,fingerprint} from '../../scripts/i18n/native-review-source.mjs';
import {evaluateAcceptance,REQUIRED_ROUTE_SET} from '../../scripts/i18n/release-readiness.mjs';

const manifest=JSON.parse(await readFile('docs/i18n/locale-acceptance.json','utf8'));
const corpus=await getReviewCorpus();
const rows=Object.fromEntries(FOLKOOP_LANGUAGES.map(lang=>[lang,corpus[lang].rows]));

test('native-review packets cover all schema paths, City, Today, About FAQs and home modes',()=>{
 for(const lang of FOLKOOP_LANGUAGES){
  const r=rows[lang],ids=new Set(r.map(row=>row.key));
  assert.equal(ids.size,r.length,lang+' duplicate review key');
  for(const path of FOLKOOP_I18N_PATHS)
   assert(ids.has(path),lang+' missing schema review path '+path);
  for(const prefix of ['city.messages.','city.about.faq.','city.today.',
                       'city.todayCompact.','homeModes.'])
   assert(r.some(x=>x.key.startsWith(prefix)),lang+' missing review layer '+prefix);
  assert(r.length>FOLKOOP_I18N_PATHS.length+100,lang+' reviewer corpus unexpectedly small');
  assert.match(fingerprint(r),/^[0-9a-f]{64}$/);
  assert(r.every(x=>typeof x.source==='string'&&typeof x.target==='string'));
 }
});

test('only evidence-backed approvals count as certified; pending remains explicit',()=>{
 const status=evaluateAcceptance(manifest,rows);
 assert.equal(status.ok,true,status.errors.join('\n'));
 const approved=FOLKOOP_LANGUAGES.filter(l=>manifest.languages[l].native_review.status==='approved');
 const pending=FOLKOOP_LANGUAGES.filter(l=>manifest.languages[l].native_review.status==='pending');
 assert.deepEqual(status.approved,approved);
 assert.deepEqual(status.pending,pending);
 assert.equal(status.certified,approved.length===FOLKOOP_LANGUAGES.length);
 for(const lang of pending)assert.equal(manifest.languages[lang].native_review.approval,null);
});

test('a simulated human-approval record is never valid without coverage or matching copy digest',()=>{
 const cloned=structuredClone(manifest);
 cloned.languages.ar.native_review={
  status:'approved',
  approval:{
   confirmed_fluent_human:true,
   reviewer_alias:'test-only-alias',
   evidence_ref:'https://github.com/example/example/issues/1',
   reviewed_at:'2026-10-08',
   reviewed_copy_sha256:'0'.repeat(64),
   reviewed_routes:[...REQUIRED_ROUTE_SET],
   reviewed_full_csv:true,
   safety_claims_checked:true,
   blocking_findings_resolved:true
  }
 };
 let result=evaluateAcceptance(cloned,rows);
 assert.equal(result.ok,false);
 assert(result.errors.some(e=>e.includes('review is stale')));
 cloned.languages.ar.native_review.approval.reviewed_copy_sha256=fingerprint(rows.ar);
 result=evaluateAcceptance(cloned,rows);
 assert.equal(result.ok,true,result.errors.join('\n'));
 assert.equal(result.certified,false);
 assert.deepEqual(result.approved,['ar']);
 assert.equal(result.pending.length,10);
 const newSource=rows.ar.map(x=>({...x}));
 newSource[0].source+=' (changed reference)';
 result=evaluateAcceptance(cloned,{...rows,ar:newSource});
 assert.equal(result.ok,false,'changing canonical English copy must invalidate reviewed meaning');
 const altered=rows.ar.map(x=>({...x}));
 altered[0].target+=' ';
 result=evaluateAcceptance(cloned,{...rows,ar:altered});
 assert.equal(result.ok,false,'a post-approval text change must invalidate the claim');
 cloned.languages.ar.native_review.approval.reviewed_routes=['home'];
 result=evaluateAcceptance(cloned,rows);
 assert.equal(result.ok,false,'partial routes cannot earn full native-language approval');
});
