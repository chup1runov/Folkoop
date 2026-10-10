import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const ctx={};ctx.globalThis=ctx;
vm.runInNewContext(readFileSync('apps/web/project-resource-preview.js','utf8'),ctx);
const resource=ctx.FolkoopProjectResources;
const project={id:'project',kind:'project',location_text:'Olofstorp',title:'Plant exchange'};
const entries=[
 {id:'cargo',kind:'resource',title:'Cargo bike',status:'open',location_text:'Olofstorp'},
 {id:'shed',kind:'resource',title:'Tool shed',status:'active',location_text:' olofstorp '},
 {id:'closed',kind:'resource',title:'Unavailable here',status:'done',location_text:'Olofstorp'},
 {id:'other',kind:'resource',title:'Far away',status:'open',location_text:'Göteborg'},
 {id:'request',kind:'need',title:'Need a cutter',status:'open',location_text:'Olofstorp'}
];
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));

test('only pre-visible resource catalogue entries with the same stated location appear',()=>{
 const records=Array.from(resource.candidates(project,entries));
 assert.deepEqual(records.map(x=>x.id),['cargo','shed']);
 const html=resource.render({project,visibleCooperations:entries,escape:esc,language:'ru'});
 assert.match(html,/Cargo bike/);
 assert.match(html,/Tool shed/);
 assert.doesNotMatch(html,/Unavailable here|Far away|Need a cutter/);
 assert.match(html,/data-coop="openNotify" data-id="cargo"/);
 assert.match(html,/не закреплённые за проектом/);
 assert.match(html,/data-resource-scope="catalogue-not-assigned"/);
});
test('incomplete or wrong-kind locations fail closed without invented matches',()=>{
 for(const candidate of [{...project,location_text:''},{...project,kind:'need'},null]){
  assert.equal(resource.render({project:candidate,visibleCooperations:entries,escape:esc}), '');
 }
 assert.equal(resource.render({project,visibleCooperations:[],escape:esc}), '');
 assert.equal(resource.render({project,visibleCooperations:entries}), '');
});
test('does not claim availability, reservation, booking or project assignment',()=>{
 const src=readFileSync('apps/web/project-resource-preview.js','utf8');
 assert.doesNotMatch(src,/fetch\s*\(|localStorage|sessionStorage|supabase|\.insert\(|\.update\(/i);
 const html=resource.render({project,visibleCooperations:entries,escape:esc,language:'en'});
 assert.match(html,/not reserved for this project/);
 assert.doesNotMatch(html,/data-coop="join"|data-coop="selectOffer"|data-economic=/);
});
test('escaping covers resource names and identifiers',()=>{
 const unsafe=[{id:'"><script>',kind:'resource',title:'<img src=x onerror=alert(1)>',status:'open',location_text:'Olofstorp'}];
 const html=resource.render({project,visibleCooperations:unsafe,escape:esc});
 assert(!html.includes('<script>'));
 assert(!html.includes('<img src='));
 assert(html.includes('&lt;img'));
 assert(html.includes('&quot;&gt;&lt;script&gt;'));
});
test('all eleven languages provide title, context, CTA and truthful limitation',()=>{
 for(const language of ['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku']){
  for(let i=0;i<5;i++)assert(resource.word(language,i)?.length>2,language+' copy '+i);
  const html=resource.render({project,visibleCooperations:entries,escape:esc,language});
  assert(html.includes(esc(resource.word(language,1))),language+' note');
  assert(html.includes(esc(resource.word(language,2))),language+' CTA');
 }
 assert.equal(resource.word('unknown',4),'Resources');
});
test('at most two visible objects are offered; cannot invent a project/resource relationship',()=>{
 const many=[...entries,{id:'extra',kind:'resource',title:'Extra resource',status:'open',location_text:'Olofstorp'}];
 assert.equal(resource.candidates(project,many).length,2);
 assert.equal(resource.candidates(project,many,3).length,3);
 const html=resource.render({project,visibleCooperations:many,escape:esc});
 assert.equal((html.match(/data-coop="openNotify"/g)||[]).length,2);
});
