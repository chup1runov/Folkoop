import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={document:{documentElement:{lang:'ru'}},Date};
vm.runInNewContext(readFileSync('apps/web/network-decisions.js','utf8'),context);
const render=context.FolkoopDecisions.renderDocumentSummary;
const now=Date.parse('2026-10-18T12:00Z');
const snapshot={consentsLoadedAt:now,rows:[{document_id:'d',cooperation_id:'p',revision:2,kind:'rules',title:'<Rules>'},{document_id:'report',revision:1,kind:'report',title:'Report'}],consents:[
 {document_id:'d',revision:2,user_id:'a',confirmed:true,responded_at:now},
 {document_id:'d',revision:1,user_id:'b',confirmed:true,responded_at:now},
 {document_id:'d',revision:2,user_id:'c',confirmed:false,responded_at:now},
 {document_id:'d',revision:2,user_id:'former',confirmed:true,responded_at:now}
]};
const args={snapshot,owner:true,members:['a','b','c','a'].map(user_id=>({user_id})),name:id=>'<'+id+'>',now,online:true};
test('document summary uses current version, unique current members and separate former members',()=>{
 const html=render(args);
 assert.match(html,/Подтверждено · 1/);
 assert.match(html,/Ждём ответа · 1/);
 assert.match(html,/Согласие отозвано · 1/);
 assert.match(html,/Бывший участник · 1/);
 assert.match(html,/&lt;Rules&gt;/);
 assert.match(html,/data-document="d"/);
 assert.ok(!html.includes('Report'));
 assert.equal(render({...args,owner:false}),'');
});
test('unavailable or stale consent data never becomes an empty approval tally',()=>{
 for(const overrides of [{online:false},{now:now+60000},{snapshot:{...snapshot,consentsError:true}}]){
  const html=render({...args,...overrides});
  assert.match(html,/Согласия недоступны/);
  assert.ok(!html.includes('Подтверждено ·'));
 }
});
