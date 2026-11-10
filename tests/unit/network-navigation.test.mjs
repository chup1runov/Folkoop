import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=await readFile('apps/web/network-navigation.js','utf8');
const runtime=await readFile('apps/web/network-ui.js','utf8');

function makeHarness({active='',saved='',hash='#/home',storageFails=false}={}){
 const sandbox={};
 runInNewContext(source,sandbox,{timeout:1000});
 let currentHash=hash,currentActive=active,currentSaved=saved,savedReads=0;
 const setHashes=[];
 const navigation=sandbox.FolkoopNetworkNavigation.create({
  getHash:()=>currentHash,
  setHash:next=>{setHashes.push(next);currentHash=next;},
  getActiveSubsection:()=>currentActive,
  readSavedSubsection:key=>{
   savedReads++;
   assert.equal(key,'folkoop-subsection-v1');
   if(storageFails)throw new Error('blocked storage');
   return currentSaved;
  }
 });
 return {navigation,sandbox,setActive:next=>{currentActive=next;},setSaved:next=>{currentSaved=next;},
         changeHash:next=>{currentHash=next;},get savedReads(){return savedReads;},setHashes};
}

test('route navigation has an explicit dependency contract and no browser globals',()=>{
 const ctx={};
 runInNewContext(source,ctx,{timeout:1000});
 assert(Object.isFrozen(ctx.FolkoopNetworkNavigation));
 assert.throws(()=>ctx.FolkoopNetworkNavigation.create(),/explicit browser adapters/);
 const h=makeHarness();
 assert(Object.isFrozen(h.navigation));
 assert.deepEqual(Object.keys(h.navigation).sort(),['currentSubsection','navigate','consumeHashChange'].sort());
});

test('current subsection prioritizes the shell route and restores known saved sections',()=>{
 const h=makeHarness({active:'projects-tasks',saved:'messages-groups'});
 assert.equal(h.navigation.currentSubsection('projects'),'projects-tasks');
 assert.equal(h.savedReads,0,'do not read storage when current shell already resolved it');
 assert.equal(h.navigation.currentSubsection('home'),'home-overview','wrong parent must not expose a stale selection');
 h.setActive('');
 assert.equal(h.navigation.currentSubsection('messages'),'messages-groups');
 assert.equal(h.navigation.currentSubsection('projects'),'projects-overview');
 h.setSaved('projects-mine');
 assert.equal(h.navigation.currentSubsection('projects'),'projects-mine');
 assert.equal(h.navigation.currentSubsection('home'),'home-overview');
 h.setSaved('home-overview');
 assert.equal(h.navigation.currentSubsection('home'),'home-overview');
});

test('blocked or absent session storage preserves safe subsection defaults',()=>{
 for(const opts of [{storageFails:true},{saved:''}]){
  const h=makeHarness(opts);
  assert.equal(h.navigation.currentSubsection('home'),'home-overview');
  assert.equal(h.navigation.currentSubsection('projects'),'projects-overview');
  assert.equal(h.navigation.currentSubsection('messages'),'messages-chats');
 }
});

test('programmatic route change is consumed once without resetting selected chat or project',()=>{
 const h=makeHarness();
 h.navigation.navigate('#/projects');
 assert.deepEqual(h.setHashes,['#/projects']);
 assert.equal(h.navigation.consumeHashChange(),false,'own hashchange should not trigger a reload');
 assert.equal(h.navigation.consumeHashChange(),true,'only the corresponding event is suppressed');
 h.navigation.navigate('#/messages');
 assert.equal(h.navigation.consumeHashChange(),false);
 h.changeHash('#/home');
 assert.equal(h.navigation.consumeHashChange(),true,'external browser navigation must reload');
});

test('stale expected hash never suppresses a later external change',()=>{
 const h=makeHarness();
 h.navigation.navigate('#/projects');
 h.changeHash('#/center');
 assert.equal(h.navigation.consumeHashChange(),true);
 h.changeHash('#/projects');
 assert.equal(h.navigation.consumeHashChange(),true,'old pending target must be cleared after mismatch');
});

test('UI keeps guest-only selection clearing and explicit route reload boundaries',()=>{
 assert.match(runtime,/const networkNavigation=globalThis\.FolkoopNetworkNavigation\?\.create/);
 assert.match(runtime,/const currentSubsection=parent=>networkNavigation\.currentSubsection\(parent\);/);
 assert.match(runtime,/function navigateNetwork\(hash\)\{networkNavigation\.navigate\(hash\);\}/);
 assert.match(runtime,/if\(!networkNavigation\.consumeHashChange\(\)\)return;if\(guestDemo\)\{selected=null;selectedChat=null;selectedCoop=null;\}version\+\+;loadCurrentRoute\(\);/);
 assert.doesNotMatch(runtime,/\binternalHash\b/);
});
