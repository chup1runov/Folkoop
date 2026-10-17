import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';

test('City visibility and language updates do not replay subsection navigation',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert(js.includes("if(parent==='city')pendingCityScreen="));
 assert(js.includes('screen:ready?pendingCityScreen:undefined'));
 assert(js.includes('if(ready)pendingCityScreen=undefined'));
 assert(js.includes("frame.dataset.ready='true';sendCity()"));
});

test('one five-item primary navigation hierarchy serves desktop and mobile',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8'),css=await readFile('apps/web/folkoop.css','utf8');
 assert.match(js,/const NAV_ORDER=\['home','together','center','city','messages'\]/);
 assert.match(js,/const MOBILE_PRIMARY=NAV_ORDER/);
 assert.match(css,/Unified information architecture/);
 assert.match(css,/\.sidebar,\.mobile-menu-toggle\{display:none!important\}/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});

test('Profile is nested under the personal Home hub while legacy route stays addressable',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/\['me','settings','about'\]\.includes\(route\)\?'home'/);
 assert(js.includes("home:['home-overview','me','settings']"));
 assert(js.includes("home:['home-overview','me']"));
 assert(js.includes("personalPrimaryLabel=t('me')"));
});

test('Center is a primary space while Projects are nested under Together',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/const NAV_ORDER=\['home','together','center','city','messages'\]/);
 assert.match(js,/route==='projects'\?'together'/);
 assert(js.includes("center:CENTER_SECTIONS"));
 assert(js.includes("city:CITY_SECTIONS"));
});

test('every primary destination has a second-line context definition',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8');
 for(const entry of [
  "home:['home-overview','me','settings']",
  "together:['together','projects-overview','projects-mine','projects-tasks','projects-updates']",
  "city:CITY_SECTIONS",
  "center:CENTER_SECTIONS",
  "messages:['messages-chats','messages-direct','messages-groups','messages-invites']"
 ])assert(js.includes(entry),entry);
});

test('Messages has one canonical primary navigation entry and no topbar duplicate',async()=>{
 const html=await readFile('apps/web/folkoop.html','utf8');
 assert(!html.includes('id="messageLink"'));
 const js=await readFile('apps/web/folkoop.js','utf8');
 assert.match(js,/NAV_ORDER=\['home','together','center','city','messages'\]/);
});


test('production primary navigation has visible labels and Center uses the canonical FOLKOOP mark',async()=>{
 const js=await readFile('apps/web/folkoop.js','utf8'),css=await readFile('apps/web/folkoop.css','utf8'),html=await readFile('apps/web/folkoop.html','utf8');
 assert(js.includes('primary-center-mark'));
 assert(js.includes('src="./folkoop-mark.png"'));
 assert(js.includes("aria-label=\"'+esc(label)+'\""));
 assert(js.includes("primaryIcon(k)+'<span>'+esc(label)"));
 assert(html.includes('id="globalSearchButton"'));
 assert(html.includes('id="globalStartButton"'));
 assert(!html.includes('<a href="#/home" class="brand"'));
});
