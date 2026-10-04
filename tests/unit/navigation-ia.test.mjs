import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';

test('one five-item primary navigation hierarchy serves desktop and mobile',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8'),css=await readFile('apps/web/folkoop.css','utf8');
 assert.match(js,/const NAV_ORDER=\['home','together','projects','city','messages'\]/);
 assert.match(js,/const MOBILE_PRIMARY=NAV_ORDER/);
 assert.match(css,/Unified information architecture/);
 assert.match(css,/\.sidebar,\.mobile-menu-toggle\{display:none!important\}/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});

test('Profile is nested under the personal Home hub while legacy route stays addressable',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/\['me','settings','about'\]\.includes\(route\)\?'home'/);
 assert(js.includes("home:['home-overview','home-attention','home-feed','home-actions','me']"));
 assert(js.includes("home:['home-overview','me']"));
 assert.match(js,/personalPrimaryLabel=guest\?'Mura'/);
});

test('Center has exactly one navigation parent: City',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/city:\['city','center'\]/);
 assert.match(js,/route==='center'\?'city'/);
 assert(!/NAV_ORDER=\[[^\]]*'center'/.test(js),'Center leaked into primary navigation');
});

test('every primary destination has a second-line context definition',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 for(const entry of [
  "home:['home-overview','home-attention','home-feed','home-actions','me']",
  "together:['together','people','communities']",
  "projects:['projects-overview','projects-mine','projects-tasks','projects-updates']",
  "city:['city','center']",
  "messages:['messages-chats','messages-direct','messages-groups','messages-invites']"
 ])assert(js.includes(entry),entry);
});

test('Messages has one canonical primary navigation entry and no topbar duplicate',async()=>{
 const html=await readFile('apps/web/folkoop.html','utf8');
 assert(!html.includes('id="messageLink"'));
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/NAV_ORDER=\['home','together','projects','city','messages'\]/);
});
