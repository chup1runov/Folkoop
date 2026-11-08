import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const c=vm.createContext({URL,location:{href:'https://example.test/Folkoop/#/me'},document:{documentElement:{lang:'ru'},getElementById:()=>null}});
for(const file of ['folkoop-core.js','public-profile.js'])vm.runInContext(await readFile('apps/web/'+file,'utf8'),c);
const p=c.FolkoopPublicProfile;
test('public projection only includes explicitly selected supported string fields',()=>{
 const value=p.project({name:'Alias',about:'hidden',messages:'private',ideas:['bad'],skills:'chosen'},['name','skills','messages','ideas']);
 assert.deepEqual(JSON.parse(JSON.stringify(value)),{name:'Alias',skills:'chosen'});
 assert.deepEqual(JSON.parse(JSON.stringify(p.project({name:'A'},[]))),{});
});
test('public page escapes text and does not generate actions or HTML from biography',()=>{
 const html=p.render({name:'<img src=x>',thoughts:'<script>bad()</script>',messages:'secret'});
 assert(html.includes('&lt;img'));assert(html.includes('&lt;script'));assert(!html.includes('<script'));assert(!html.includes('secret'));assert(!html.includes('data-net'));
});
test('public URL works at a hosted subpath and encodes stable identity',()=>{
 assert.equal(p.link('test-id'),'https://example.test/Folkoop/person.html?id=test-id&lang=ru');
});
test('editor requires an existing profile and does not enable publication by default',()=>{
 const state={revision:0,published:false,content:{},visible:[]};
 assert(!p.editor('id',state,{}).includes('<form'));
 const html=p.editor('id',state,{name:'Owner'});assert(html.includes('netPublicProfile'));assert(!html.includes(' checked'));assert(html.includes('data-public-preview'));
});
test('all advertised languages include public visibility and field labels',()=>{
 assert.equal(Object.keys(p.copy).length,11);for(const code of c.FolkoopCore.LANGS){assert.equal(p.copy[code].length,20);assert(p.copy[code].every(x=>x.length>0));}
});
test('public entry loads neither account UI nor onboarding',async()=>{
 const html=await readFile('apps/web/person.html','utf8');assert(!html.includes('network-ui.js'));assert(!html.includes('folkoop.js'));assert(!html.includes('analytics.js'));assert(html.includes('no-referrer'));
});
