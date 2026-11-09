import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({document:{documentElement:{lang:'ru'}},FolkoopCore:{escape:String}});
vm.runInContext(readFileSync('apps/web/network-budget.js','utf8'),ctx);
const state=ctx.FolkoopBudget.contributionTermsState;
function fixture(){return {now:1000,loadedAt:1000,contribution:{cooperation_id:'p',need_id:'n',contributor_id:'member',terms_revision:1,status:'promised'},terms:[{cooperation_id:'p',need_id:'n',revision:1,document_id:'d',document_revision:1,due_at:'2026-11-20T12:00:00Z',participation:'Bring four fasteners'}],documents:[{document_id:'d',cooperation_id:'p',revision:1,kind:'rules'}],consents:[{document_id:'d',cooperation_id:'p',revision:1,user_id:'member',confirmed:true}]};}
test('only personal consent to exact current document and need terms permits a projected submission',()=>{
 assert.equal(state(fixture()).canSubmit,true);
 for(const change of [s=>s.consents[0].user_id='organiser',s=>s.consents[0].cooperation_id='other',s=>s.consents[0].revision=2,s=>s.consents=[]]){const s=fixture();change(s);assert.equal(state(s).state,'awaiting');assert.equal(state(s).canSubmit,false);}
});
test('new terms or document never inherit old consent',()=>{
 const s=fixture();s.terms.push({...s.terms[0],revision:2,due_at:'2026-11-21T12:00:00Z'});assert.equal(state(s).state,'changed');
 s.contribution.terms_revision=2;assert.equal(state(s).state,'current');
 s.documents.push({...s.documents[0],revision:2});assert.equal(state(s).state,'changed');
 s.terms[1].document_revision=2;assert.equal(state(s).state,'awaiting');
 s.consents.push({...s.consents[0],revision:2});assert.equal(state(s).state,'current');
});
test('decline or consent withdrawal blocks new performance; contribution withdrawal stays withdrawn',()=>{
 const s=fixture();s.consents[0].confirmed=false;assert.equal(state(s).state,'declined');
 s.contribution.status='withdrawn';assert.equal(state(s).state,'withdrawn');assert.equal(state(s).canSubmit,false);
});
test('historical receipt retains exact basis without pretending current consent',()=>{
 const s=fixture();s.contribution.status='received';s.terms.push({...s.terms[0],revision:2});s.consents[0].confirmed=false;
 const result=state(s);assert.equal(result.state,'historical');assert.equal(result.acceptedRevision,1);assert.equal(result.latestRevision,2);assert.equal(result.canSubmit,false);
});
test('legacy, missing, stale and malformed snapshots do not invent acceptance',()=>{
 const s=fixture();delete s.contribution.terms_revision;assert.equal(state(s).state,'unlinked');
 for(const change of [s=>s.contribution.contributor_id=null,s=>s.loadedAt=NaN,s=>s.online=false,s=>s.error=true,s=>s.documents=[],s=>s.terms=[],s=>s.terms[0].due_at='bad',s=>s.documents[0].cooperation_id='other',s=>s.consents.push(s.consents[0]),s=>s.terms.push(s.terms[0])]){const x=fixture();change(x);assert.equal(state(x).state,'unavailable');assert.equal(state(x).canSubmit,false);}
});
test('deadline marks lateness without deleting the ability to report actual performance',()=>{
 const s=fixture();s.now=Date.parse(s.terms[0].due_at);s.loadedAt=s.now;assert.equal(state(s).overdue,false);
 s.now++;assert.equal(state(s).overdue,true);assert.equal(state(s).canSubmit,true);
 s.contribution.status='submitted';assert.equal(state(s).canSubmit,false);
});
