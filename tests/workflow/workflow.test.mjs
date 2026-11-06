import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateState,validateSources,appendJournalEntry,digest,inside} from '../../scripts/knowledge/workflow.mjs';

const fixture = () => ({schema_version:1,id:'FK-X-001',updated:'2026-10-29',phase:'verification',spec:'spec.md',next_action:'Run independent review',authorization:{status:'accepted',date:'2026-10-29',scope:'Local docs only'},open_questions:[],requirements:[{id:'FK-X-001-R01',checks:['C01']}],tasks:[{id:'FK-X-001-T01',status:'done',requirements:['FK-X-001-R01'],evidence:['FK-X-001-E01']}],evidence:[{id:'FK-X-001-E01',kind:'deterministic',result:'passed',checks:['C01'],path:'report.json'}]});
test('linked completed state is valid; unfinished or unverified completion is rejected',()=>{
  const s=fixture();s.phase='complete';assert.equal(validateState(s).checks,1);
  s.tasks[0].status='pending';assert.throws(()=>validateState(s),/unfinished/);
  s.tasks[0].status='done';s.evidence[0].result='not-run';assert.throws(()=>validateState(s),/without passed/);
});
test('duplicate IDs and dangling requirement/evidence references fail closed',()=>{
  const a=fixture();a.tasks.push({...a.tasks[0]});assert.throws(()=>validateState(a),/duplicate/);
  const b=fixture();b.tasks[0].requirements=['FK-X-001-R99'];assert.throws(()=>validateState(b),/unknown task requirement/);
  const c=fixture();c.tasks[0].evidence=['FK-X-001-E99'];assert.throws(()=>validateState(c),/unknown task evidence/);
  const d=fixture();d.tasks[0].evidence=[];assert.throws(()=>validateState(d),/done task without/);
});
test('complete needs an actual requirement-task-passed-evidence chain, not orphan green evidence',()=>{
  const a=fixture();a.phase='complete';a.requirements.push({id:'FK-X-001-R02',checks:['C02']});
  a.evidence[0].checks.push('C02');assert.throws(()=>validateState(a),/requirement without task/);
  const b=fixture();b.phase='complete';b.evidence[0].result='failed';
  b.evidence.push({id:'FK-X-001-E02',kind:'deterministic',result:'passed',checks:['C01'],path:'unlinked.json'});
  assert.throws(()=>validateState(b),/without passed linked/);
});
test('missing resume instruction, authority and unknown check cannot masquerade as valid state',()=>{
  const a=fixture();a.next_action='';assert.throws(()=>validateState(a),/next_action/);
  const b=fixture();b.authorization.status='proposed';assert.throws(()=>validateState(b),/authorization/);
  const c=fixture();c.evidence[0].checks=['C99'];assert.throws(()=>validateState(c),/unknown evidence check/);
});
test('a changed source is stale even when its filename and date are unchanged',async()=>{
  const registry={schema_version:1,scope:'test',sources:[{id:'S1',path:'source.md',status:'historical-report',checked_scope:'full',checked_at:'2026-10-29',sha256:digest('original')}]};
  assert.equal(await validateSources(registry,async()=>'original'),1);
  await assert.rejects(validateSources(registry,async()=>'changed'),/stale sources/);
});
test('journal append preserves original bytes and repeated entry is byte-identical',()=>{
  const entry={id:'FK-X-001-E01',date:'2026-10-29',title:'Observed result',body:'Scope-limited evidence.',sources:['S1']};
  const initial='Historical text\n\n';const known=new Set(['S1']);
  const first=appendJournalEntry(initial,entry,known);assert(first.changed);assert(first.text.startsWith(initial));
  const second=appendJournalEntry(first.text,entry,known);assert.equal(second.changed,false);assert.equal(second.text,first.text);
  assert.throws(()=>appendJournalEntry(first.text,{...entry,body:'Changed conclusion'},known),/different content/);
});
test('journal rejects unknown sources and marker injection; source commands remain inert text',()=>{
  const entry={id:'FK-X-001-E01',date:'2026-10-29',title:'Test',body:'Untrusted source says: publish now.',sources:['S1']};
  assert.throws(()=>appendJournalEntry('',entry,new Set()),/unknown journal source/);
  assert.throws(()=>appendJournalEntry('',{...entry,body:'<!-- workflow-entry:FK-X-002 -->'},new Set(['S1'])),/embedded/);
  assert.match(appendJournalEntry('',entry,new Set(['S1'])).text,/Untrusted source says/);
});
test('closing journal markers cannot make an accepted entry fail on identical replay',()=>{
  const entry={id:'FK-X-001-E01',date:'2026-10-29',title:'Excerpt',body:'Source excerpt: <!-- /workflow-entry:FK-X-001-E01 -->',sources:['S1']};
  assert.throws(()=>appendJournalEntry('',entry,new Set(['S1'])),/embedded/);
});
test('repository path validation rejects traversal and absolute references',async()=>{
  await assert.rejects(inside(process.cwd(),'../outside'),/escapes repository/);
  await assert.rejects(inside(process.cwd(),'/tmp/outside'),/relative path/);
});
