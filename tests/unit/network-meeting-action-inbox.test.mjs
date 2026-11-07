import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={document:{documentElement:{lang:'ru'}},Intl,Date};
vm.runInNewContext(readFileSync('apps/web/network-meetings.js','utf8'),context);
const m=context.FolkoopMeetings;
const row={project_id:'p" onclick="bad',project_title:'<img src=x>',meeting_version:2,total_count:120,next_action:'respond',roles:['attendee','facilitator'],before_terms:{place:'Old'},after_terms:{place:'<script>bad</script>',starts_at:'2099-10-20T16:00:00Z'}};
test('all eleven locales have an escaped read-only meeting action card',()=>{
 assert.equal(Object.keys(m.actionCopy).length,11);
 for(const lang of Object.keys(m.actionCopy)){
  context.document.documentElement.lang=lang;
  const html=m.renderActionInbox({rows:[row]});
  assert.ok(html.includes('1/120'));
  assert.ok(html.includes('data-coop="openNotify"'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('onclick="bad'));
  assert.ok(!html.includes('netMeetingResponse'));
  assert.ok(!html.includes('undefined'));
 }
 context.document.documentElement.lang='ru';
});
test('failed or missing data is not a successful empty inbox; stale terms are labelled',()=>{
 assert.equal(m.renderActionInbox({rows:[]}), '');
 assert.match(m.renderActionInbox({rows:[],error:true}),/Не удалось/);
 assert.match(m.renderActionInbox(),/Не удалось/);
 assert.match(m.renderActionInbox({rows:[{...row,next_action:'wait'}]}),/Состояние неактуально/);
});
