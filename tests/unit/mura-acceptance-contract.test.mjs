import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(path,'utf8');

test('Mura acceptance contract keeps action/outcome comprehension above engagement',async()=>{
 const contract=await read('docs/MURA_ACCEPTANCE_CONTRACT.md');
 assert(contract.includes('not optimized for session length'));
 assert(contract.includes('5–10 minutes'));
 assert(contract.includes('Completed outcomes are mandatory'));
 assert(contract.includes('connection density'));
 assert(contract.includes('Physical iPhone'));
});

test('Mura browser acceptance protects the explicit-exit-only account boundary',async()=>{
 const e2e=await read('tests/e2e/guest-demo-browser.py');
 for(const required of [
  "#folkoopEntryGate:visible",
  "#netLogin:visible",
  "supabase.co",
  "data-mobile-action=\\\"exitmura\\\"",
  "form:visible",
  "data-coop=\\\"delete\\\"",
  "data-mobile-subnav=\\\"center\\\"",
  "data-mobile-subnav=\\\"settings\\\"",
  "data-mobile-subnav=\\\"about\\\"",
  "mura-outcome-grid"
 ]) assert(e2e.includes(required),required);
});

test('Mura copy separates personal voice from account/pilot system copy',async()=>{
 const source=await read('apps/web/network-ui.js');
 assert(source.includes("messagesTitle:'Переписки Муры'"));
 assert(source.includes("networkDesc:'Что мне нужно, чем я могу помочь, чем мы делимся и что делаем вместе.'"));
 assert(source.includes("out:'Выйти из аккаунта Муры'"));
 // Real-account copy may still mention the pilot/server. The contract is that Mura
 // uses a separate guest copy layer rather than deleting truthful account copy.
 assert(source.includes("login:'Вход в пилот'"));
 assert(source.includes('const muraGuestCopy='));
});

test('Mura Home contains outcomes and only safe story navigation hooks',async()=>{
 const source=await read('apps/web/network-mura-home.js');
 assert(source.includes('outcomeTitle'));
 assert(source.includes("coops.filter(x=>x.status==='done')"));
 for(const hook of ['openCoop','openCommunity','openChat'])assert(source.includes(hook),hook);
 for(const forbidden of ['createCoop','register','signup'])assert(!source.includes('data-home="'+forbidden+'"'),forbidden);
});
