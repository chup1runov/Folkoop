import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('apps/web/network-ui.js','utf8');
const load=vm.runInNewContext(source.slice(source.indexOf('async function loadAccountSections('),source.indexOf('async function load(){'))+';loadAccountSections');
function client(failed,code='NETWORK'){return new Proxy({}, {get:(_,name)=>async()=>{if(name===failed)throw Object.assign(new Error(name),{code});return [{section:name}];}});}
test('unrelated purchase failure does not prevent messages; failure is explicitly retained',async()=>{
 const result=await load(client('purchaseProcesses'),'messages');assert.equal(result.values[5][0].section,'chats');assert.deepEqual([...result.failed],['purchaseProcesses']);
});
test('required chat membership failure stays fatal',async()=>{await assert.rejects(load(client('chatMembers'),'messages'));});
test('profile remains usable when unrelated groups fail',async()=>{const r=await load(client('communities'),'me');assert.equal(r.values[0][0].section,'profile');assert.equal(r.failed[0],'communities');});
test('session errors from background data cannot be swallowed',async()=>{for(const code of ['AUTH_REQUIRED','STALE','POLICY_REQUIRED','INVITE_REQUIRED'])await assert.rejects(load(client('purchaseProcesses',code),'messages'),e=>e.code===code);});
