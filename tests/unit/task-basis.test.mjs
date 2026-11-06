// Authored with the feature; intentionally not run during the code-only phase.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function setup(lang='ru'){
 const context={document:{documentElement:{lang}},Date,navigator:{onLine:true}};
 vm.runInNewContext(readFileSync('apps/web/network-task-work.js','utf8'),context);
 return context.FolkoopTaskWork;
}
const task={id:'task',work_stage:'available',work_revision:1};
const basis={task_id:'task',revision:1,document_id:'doc',document_revision:1,latest_document_revision:1,decision_id:'decision',ready:false,
 document:{title:'<Rules>',body:'<script>not executable</script>'},decision:{question:'<Decision>',options:['One','Two'],selected_option:0,rationale:'Reason'},
 signers:[{user_id:'a',member:true,confirmed:null},{user_id:'b',member:true,confirmed:true}]};
const snapshot=rows=>({rows,loadedAt:Date.now()});
const args=(state=snapshot([basis]))=>({task,state,documents:{rows:[]},decisions:{decisions:[]},members:[{user_id:'a'},{user_id:'b'}],user:{id:'a'},owner:false,active:true,name:id=>'<'+id+'>'});
test('basis status fails closed for missing, stale, offline or pending data',()=>{
 const w=setup();
 assert.equal(w.basisAllowed(null,'task'),false);
 assert.equal(w.basisAllowed({error:true},'task'),false);
 assert.equal(w.basisAllowed({...snapshot([]),loadedAt:Date.now()-60001},'task'),false);
 assert.equal(w.basisAllowed(snapshot([basis]),'task'),false);
 assert.equal(w.basisAllowed(snapshot([]),'task'),true);
 assert.equal(w.basisAllowed(snapshot([{...basis,ready:true}]),'task'),true);
});
test('renders pinned content safely and personal confirmation without organizer editor',()=>{
 const html=setup().renderBasis(args());
 assert.match(html,/&lt;Rules&gt;/);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;a&gt;/);
 assert.match(html,/netTaskBasisConsent/);
 assert.doesNotMatch(html,/<script>|class="editor netTaskBasis"/);
});
test('new document version does not replace the pinned version or offer stale confirmation',()=>{
 const html=setup().renderBasis(args(snapshot([{...basis,latest_document_revision:2}])));
 assert.match(html,/Новая версия документа/);
 assert.match(html,/&lt;Rules&gt;/);
 assert.doesNotMatch(html,/netTaskBasisConsent/);
});
test('only the signer can respond; withdrawal stays available for stale documents',()=>{
 const w=setup();
 assert.doesNotMatch(w.renderBasis({...args(),user:{id:'outsider'}}),/netTaskBasisConsent/);
 const html=w.renderBasis({...args(snapshot([{...basis,latest_document_revision:2}])),user:{id:'b'}});
 assert.match(html,/Отозвать моё согласие/);
});
test('pending basis disables execution but does not prevent release',()=>{
 const w=setup(),common={user:{id:'a'},organizer:'b',name:id=>id,active:true,basisState:snapshot([basis])};
 assert.match(w.render({...common,task}),/value="claim" disabled/);
 const html=w.render({...common,task:{...task,assignee_id:'a',work_stage:'working'}});
 assert.match(html,/value="submit" disabled/);
 assert.doesNotMatch(html,/value="release" disabled/);
});
test('all supported locales have basis labels; organizer can choose required people',()=>{
 for(const locale of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku']){
  const w=setup(locale);
  for(let i=0;i<25;i++)assert.ok(w.basisText(i),`${locale}:${i}`);
  const html=w.renderBasis({...args(),owner:true});
  assert.match(html,/name="signers"/);
  assert.match(html,/class="editor netTaskBasis"/);
 }
});
