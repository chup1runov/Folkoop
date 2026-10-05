import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const messaging=await readFile('apps/web/network-messaging.js','utf8');
const ui=await readFile('apps/web/network-ui.js','utf8');
const shell=await readFile('apps/web/folkoop.js','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('Messages overview is browse-first and keeps creation in explicit modes',()=>{
  assert.match(messaging,/class="messages-hub"/);
  assert.match(messaging,/data-message-subsection="messages-direct"/);
  assert.match(messaging,/data-message-subsection="messages-groups"/);
  assert.match(messaging,/data-message-subsection="messages-invites"/);
  assert.match(messaging,/data-message-work/);
  assert.ok(!/else html+=`<div class="profile-grid">${directForm}${groupForm}/.test(messaging));
});

test('work chats are derived from existing cooperation-chat links',()=>{
  assert.match(messaging,/const workChats=joined\.filter\(chatItem=>coopChats\.some/);
  assert.match(messaging,/activityText\('workChat'\)/);
});

test('message hub reuses current subsection state instead of inventing duplicate routes',()=>{
  assert.match(ui,/folkoop:set-subsection/);
  assert.match(shell,/window\.addEventListener\('folkoop:set-subsection'/);
  assert.match(shell,/subsectionParent\(key\)!==parent/);
});

test('message hub is responsive',()=>{
  assert.match(css,/\.messages-hub-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:420px\)\{\.messages-hub-grid\{grid-template-columns:1fr\}\}/);
});
