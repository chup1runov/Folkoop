import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';

test('one five-item primary navigation hierarchy serves desktop and mobile',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8'),css=await readFile('apps/web/folkoop.css','utf8');
 assert.match(js,/const NAV_ORDER=\['home','together','city','center','messages'\]/);
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

test('Center is a primary space while Projects are nested under Together',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/const NAV_ORDER=\['home','together','city','center','messages'\]/);
 assert.match(js,/route==='projects'\?'together'/);
 assert(js.includes("center:['center','people','communities']"));
 assert(js.includes("city:[]"));
});

test('every primary destination has a second-line context definition',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 for(const entry of [
  "home:['home-overview','home-attention','home-feed','home-actions','me']",
  "together:['together','projects-overview','projects-mine','projects-tasks','projects-updates']",
  "city:[]",
  "center:['center','people','communities']",
  "messages:['messages-chats','messages-direct','messages-groups','messages-invites']"
 ])assert(js.includes(entry),entry);
});

test('Messages has one canonical primary navigation entry and no topbar duplicate',async()=>{
 const html=await readFile('apps/web/folkoop.html','utf8');
 assert(!html.includes('id="messageLink"'));
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/NAV_ORDER=\['home','together','city','center','messages'\]/);
});


test('production primary navigation is icon-only and Center uses the canonical FOLKOOP mark',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8'),css=await readFile('apps/web/folkoop.css','utf8'),html=await readFile('apps/web/folkoop.html','utf8');
 assert(js.includes('primary-center-mark'));
 assert(js.includes('src="./folkoop-mark.png"'));
 assert(js.includes('aria-label="'+esc(label)+'"'));
 assert.match(css,/\.mobile-primary-nav a\{font-size:0/);
 assert(html.includes('id="globalSearchButton"'));
 assert(html.includes('id="globalStartButton"'));
 assert(!html.includes('<a href="#/home" class="brand"'));
});
