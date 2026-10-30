import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [client,ui,renderer,config,proposal,runner]=await Promise.all([
 'apps/web/network-client.js','apps/web/network-ui.js',
 'apps/web/network-messaging.js','apps/web/network-config.js',
 'supabase/proposals/chat-visible-read-cursor-v1.sql',
 'scripts/ci/test-database.sh'
].map(path=>readFile(path,'utf8')));

test('no old unbounded read RPC remains in network UI or adapter',()=>{
 assert.doesNotMatch(ui,/api\.markChatRead\(/);
 assert.doesNotMatch(client,/rpc\('fk_mark_chat_read'/);
 assert.match(client,/ackVisibleChat\(cid,mid\)/);
 assert.match(client,/chatBoundedReadEnabled/);
 assert.match(ui,/document\.visibilityState==='visible'/);
 assert.match(ui,/IntersectionObserver/);
 assert.match(ui,/entry\.intersectionRatio<0\.5/);
 assert.match(renderer,/data-chat-message-id=/);
});

test('hosted bounded receipts are OFF until proposed migration is accepted',()=>{
 assert.match(config,/chatBoundedReadEnabled:false/);
 assert.doesNotMatch(config,/chatBoundedReadEnabled:true/);
 assert.match(proposal,/add column if not exists last_read_message_id uuid/);
 assert.match(proposal,/create function public\.fk_ack_visible_chat\(p_conversation uuid,p_message uuid\)/);
 assert.match(proposal,/for update;/);
 assert.match(proposal,/create or replace function public\.fk_chat_inbox\(\)/);
 assert.match(proposal,/grant execute on function public\.fk_ack_visible_chat\(uuid,uuid\) to authenticated/);
});

test('candidate SQL runs only in a disposable transaction after canonical network tests',()=>{
 const start=runner.indexOf("echo \"==> disposable candidate chat-visible-read-v1");
 assert(start>runner.indexOf('db_tests=(supabase/tests/network-*.sql)'));
 const candidate=runner.slice(start);
 assert.match(candidate,/printf 'begin;\\n'/);
 assert.match(candidate,/cat supabase\/proposals\/chat-visible-read-cursor-v1\.sql/);
 assert.match(candidate,/cat supabase\/tests\/candidate-chat-visible-read\.sql/);
 assert.match(candidate,/printf 'rollback;\\n'/);
});
