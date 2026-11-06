// Prepared only: not executed during this change at the user's request.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../apps/web/network-welcome.js',import.meta.url),'utf8');
function setup(lang='ru'){
 const context=vm.createContext({document:{documentElement:{lang}},navigator:{onLine:true},Date});
 vm.runInContext(source,context);
 return {context,ui:context.FolkoopWelcome,p:{id:'project',kind:'project',owner_id:'owner',status:'active'},s:{loadedAt:Date.now(),rows:[{cooperation_id:'project',host_id:'owner',enabled:true,host_name:'<Pavel>',instructions:'Meet at the library desk',revision:2}]}};
}
test('shows explicit host and instructions, escapes public text',()=>{
 const {ui,p,s}=setup();const html=ui.card(p,s);
 assert.match(html,/Можно прийти одному/);assert.match(html,/&lt;Pavel&gt;/);assert.match(html,/library desk/);assert.doesNotMatch(html,/<Pavel>/);
});
test('does not claim welcome when disabled, closed or owner changes',()=>{
 const {ui,p,s}=setup();assert.equal(ui.card({...p,status:'done'},s),'');
 assert.equal(ui.card({...p,owner_id:'other'},s),'');s.rows[0].enabled=false;assert.equal(ui.card(p,s),'');
});
test('stale, unavailable and offline discovery cards do not promise welcome',()=>{
 const {ui,p,s,context}=setup();assert.equal(ui.card(p,{...s,loadedAt:Date.now()-61000},true),'');
 assert.equal(ui.card(p,{error:true},true),'');context.navigator.onLine=false;assert.equal(ui.card(p,s,true),'');
});
test('editor preserves version and draft, does not assign another host',()=>{
 const {ui,p,s}=setup();const html=ui.editor(p,s,{enabled:false,name:'Draft',instructions:'Hello newcomers',revision:1});
 assert.match(html,/name="revision" value="1"/);assert.match(html,/value="Draft"/);assert.doesNotMatch(html,/ checked|name="host_id"/);
});
test('all supported locales have the required copy',()=>{
 for(const lang of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku']){
  const {ui}=setup(lang);for(let i=0;i<12;i++)assert.ok(ui.text(i),`${lang}:${i}`);
 }
});
