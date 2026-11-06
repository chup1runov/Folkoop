// Written for later execution; no checks were run in the code-only step.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function setup(lang='ru'){
 const c={document:{documentElement:{lang}},Date};
 for(const file of ['network-task-work.js','network-task-basis-notices.js'])vm.runInNewContext(readFileSync('apps/web/'+file,'utf8'),c);
 return c.FolkoopTaskBasisNotices;
}
const time=Date.parse('2026-10-18T20:00Z');
const people=[
 {user_id:'a',name:'<Alice>',member:true,confirmed:true,responded_at:'2026-10-18T19:30:00Z'},
 {user_id:'b',name:'Bob',member:true,confirmed:null},
 {user_id:'c',name:'C',member:true,confirmed:false,responded_at:'2026-10-18T19:31:00Z'},
 {user_id:null,name:null,member:false,confirmed:true}
];
const basis={revision:2,decision_id:'decision',decision:{question:'<Question>',options:['One','Two'],selected_option:0,rationale:'Reason'},document_id:'doc',document_revision:2,document:{revision:2,title:'<Rules>',body:'<script>not executable</script>'},signers:people};
const item={task_id:'task',cooperation_id:'project',task_title:'<Task>',project_title:'Project',revision:2,organizer:true,work_stage:'working',response_state:'not_required',after_basis:basis,before_basis:{...basis,revision:1,document_revision:1,document:{revision:1,title:'Old',body:'Old body'}},signers:people,total_count:1};
const args=(rows=[item])=>({rows,loadedAt:time,now:time,online:true});
test('organizer sees distinct current status groups, names and response times',()=>{
 const html=setup().render(args());
 for(const label of ['Подтверждено · 1','Ждём ответ · 1','Согласие отозвано · 1','Участник недоступен или вышел · 1'])assert.ok(html.includes(label));
 assert.match(html,/&lt;Alice&gt;/);
 assert.match(html,/2026-10-18T19:31:00Z/);
 assert.match(html,/data-task="task"/);
 assert.doesNotMatch(html,/<script>|<form/);
});
test('only pending current basis requests consent; withdrawn is not pending',()=>{
 const render=setup().render;
 assert.match(render(args([{...item,organizer:false,response_state:'pending'}])),/Нужно твоё согласие/);
 const withdrawn=render(args([{...item,organizer:false,response_state:'withdrawn'}]));
 assert.match(withdrawn,/Согласие отозвано/);
 assert.doesNotMatch(withdrawn,/Нужно твоё согласие/);
 assert.match(render(args([{...item,organizer:false}])),/больше не требуется/);
});
test('unbound new document asks organizer to update, not signer to approve stale basis',()=>{
 const html=setup().render(args([{...item,organizer:false,response_state:'pending',document_stale:true,latest_document:{revision:3,title:'New',body:'New text'}}]));
 assert.match(html,/Новый документ ещё не включён/);
 assert.match(html,/New text/);
 assert.match(html,/&lt;script&gt;/);
 assert.doesNotMatch(html,/Нужно твоё согласие/);
});
test('comparison uses identities and versions, not responses or signer order',()=>{
 const diff=setup().changedFields;
 assert.deepEqual(Array.from(diff(basis,{...basis,signers:[...people].reverse()})),[]);
 assert.deepEqual(Array.from(diff(basis,{...basis,decision_id:'other',document_revision:3,signers:people.slice(1)})),['decision','document','signers']);
});
test('empty, unavailable and stale inboxes are distinct',()=>{
 const render=setup().render;
 assert.match(render(args([])),/Нет уведомлений/);
 for(const overrides of [{error:true},{online:false},{now:time+60000}]){
  const html=render({...args([]),...overrides});
  assert.match(html,/Данные недоступны или устарели/);
  assert.doesNotMatch(html,/Нет уведомлений/);
 }
 assert.equal(render({}), '');
});
test('completed task does not invite new consent; all locale labels are present',()=>{
 assert.doesNotMatch(setup().render(args([{...item,work_stage:'verified',response_state:'pending'}])),/Нужно твоё согласие/);
 for(const lang of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku']){
  const notices=setup(lang);
  for(let i=0;i<18;i++)assert.ok(notices.text(i),`${lang}:${i}`);
 }
});
