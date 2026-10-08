import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
 makeStudyTemplate,assessStudy,reportMarkdown,
 STUDY_VARIANTS,QUESTIONS
} from '../../scripts/research/first-contact-study.mjs';

// Test-only synthetic data. These are not participants, user research, or pilot evidence.
const SHA='2ad16a4f4bc3a69827f1c9fb6b48cbdff196b898';
const response=(idx,overrides={})=>({
 anonId:'p'+String(idx).padStart(2,'0'),freshReviewer:true,uncoached:true,
 exposureSeconds:25,humanCoded:true,
 interpretation:'cooperation-action',
 describesIntentToNextAction:true,choosesPlausibleFirstAction:true,
 firstAction:'need',muraUnderstood:'uncertain',confusionTags:['none'],
 ...overrides
});
const dataset=(count,overrides=[],options={})=>{
 const x=makeStudyTemplate({buildRef:SHA,variant:options.variant||'current-welcome'});
 x.responses=Array.from({length:count},(_,i)=>response(i+1,overrides[i]||{}));
 return x;
};

test('research protocol provides an empty private template rather than fabricated evidence',()=>{
 const sample=makeStudyTemplate({buildRef:SHA});
 assert.deepEqual(sample.responses,[]);
 assert.equal(sample.schemaVersion,1);
 assert.equal(sample.study.buildRef,SHA);
 assert.deepEqual([...STUDY_VARIANTS],['current-welcome','three-equal-paths','four-concrete-actions']);
 assert.equal(QUESTIONS.length,6);
 const outcome=assessStudy(sample);
 assert.equal(outcome.status,'INSUFFICIENT_EVIDENCE');
 assert.equal(outcome.sample.eligible,0);
});

test('a strict majority of five genuine fresh/uncoached coded observations can pass',()=>{
 const d=dataset(5,[
  {},{},
  {interpretation:'social-network-forum',describesIntentToNextAction:false,
   choosesPlausibleFirstAction:false,firstAction:'unclear',
   muraUnderstood:'no',confusionTags:['chat-comparison']},
  {},{}
 ]);
 const out=assessStudy(d);
 assert.equal(out.valid,true);
 assert.equal(out.status,'PASS');
 assert.equal(out.sample.eligible,5);
 assert.equal(out.comprehension.intentToActionAndPlausibleFirstChoice,4);
 assert.equal(out.comprehension.thresholdForMajority,3);
 assert.equal(out.interpretationCounts['cooperation-action'],4);
 assert.equal(out.confusionTagCounts['chat-comparison'],1);
});

test('a full cohort fails if most first actions or the understanding are wrong',()=>{
 const d=dataset(5,[
  {describesIntentToNextAction:false,choosesPlausibleFirstAction:false,
   interpretation:'social-network-forum'},
  {describesIntentToNextAction:false,choosesPlausibleFirstAction:false,
   interpretation:'social-network-forum'},
  {describesIntentToNextAction:false,choosesPlausibleFirstAction:false,
   interpretation:'social-network-forum'}
 ]);
 const out=assessStudy(d);
 assert.equal(out.valid,true);
 assert.equal(out.status,'FAIL');
 assert.equal(out.comprehension.intentToActionAndPlausibleFirstChoice,2);
 assert.equal(out.dominantMisinterpretation,true);
});

test('the denominator excludes coached, previously briefed and mistimed respondents',()=>{
 const d=dataset(7,[
  {freshReviewer:false},
  {uncoached:false},
  {exposureSeconds:45}
 ]);
 const out=assessStudy(d);
 assert.equal(out.status,'INSUFFICIENT_EVIDENCE');
 assert.equal(out.sample.submitted,7);
 assert.equal(out.sample.eligible,4);
 assert.equal(out.sample.excluded,3);
 assert.deepEqual(out.sample.exclusionReasons,{
  'previously-seen':1,'facilitated':1,'exposure-outside-20-30s':1
 });
});

test('cannot call four reviewers a validated test or claim >10 as a preregistered five-to-ten sample',()=>{
 assert.equal(assessStudy(dataset(4)).status,'INSUFFICIENT_EVIDENCE');
 assert.equal(assessStudy(dataset(11)).status,'REVIEW_SAMPLE_SIZE');
});

test('invalid coding and duplicated anonymous IDs are explicitly rejected',()=>{
 const missing=dataset(5);
 delete missing.responses[1].humanCoded;
 const a=assessStudy(missing);
 assert.equal(a.status,'INVALID');
 assert(a.errors.some(x=>x.includes('human coding')));
 const repeated=dataset(5);
 repeated.responses[1].anonId='p01';
 const b=assessStudy(repeated);
 assert.equal(b.status,'INVALID');
 assert(b.errors.some(x=>x.includes('Duplicate anonymous reviewer ID')));
 const unpinned=dataset(5);
 unpinned.study.buildRef='main';
 assert.equal(assessStudy(unpinned).status,'INVALID');
});

test('aggregate public reports omit raw comments and participant-level data',()=>{
 const d=dataset(5);
 d.responses[0].privateVerbatim='DO_NOT_PUBLISH_PRIVATE_REVIEW_087';
 d.responses[0].privateEmail='sensitive@example.invalid';
 const result=assessStudy(d);
 const md=reportMarkdown(result);
 const data=JSON.stringify(result);
 for(const secret of ['DO_NOT_PUBLISH_PRIVATE_REVIEW_087','sensitive@example.invalid','p01']){
  assert(!data.includes(secret),secret+' leaked to JSON report');
  assert(!md.includes(secret),secret+' leaked to Markdown report');
 }
 assert.equal(result.status,'PASS');
 assert(md.includes('aggregate only'));
});

test('each variant has a separate evidence record, not a pooled false-positive A/B test',()=>{
 const a=dataset(5,[],{variant:'three-equal-paths'});
 const b=dataset(3,[],{variant:'four-concrete-actions'});
 assert.equal(assessStudy(a).status,'PASS');
 assert.equal(assessStudy(b).status,'INSUFFICIENT_EVIDENCE');
 assert.equal(assessStudy(a).study.variant,'three-equal-paths');
 assert.equal(assessStudy(b).study.variant,'four-concrete-actions');
});
