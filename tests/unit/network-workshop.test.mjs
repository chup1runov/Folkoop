import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(await readFile('apps/web/network-workshop.js','utf8'),context);
const workshop=context.FolkoopWorkshop;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('fictional project links distinct resources, need, offer and four members',()=>{
 const {cooperations,members}=workshop.fixture('ru');
 assert.equal(new Set(cooperations.map(x=>x.id)).size,5);
 assert.equal(cooperations.find(x=>x.id===workshop.ids.tool).owner_id,workshop.ids.anna);
 assert.equal(members.length,4);
 assert.ok(members.every(x=>x.cooperation_id===workshop.ids.project));
 assert.equal(members.filter(x=>x.role==='owner').length,1);
 assert.equal(cooperations.filter(x=>x.kind==='resource').length,2);
 const html=workshop.render({lang:'ru',escape});
 for(const record of cooperations.filter(x=>x.kind!=='project')) assert.ok(html.includes(`data-id="${record.id}"`));
 assert.ok(html.includes(`data-id="${workshop.ids.community}"`));
});
test('fresh fixture cannot carry consent or mutations into next visit',()=>{
 const first=workshop.fixture('ru'); first.cooperations[0].status='done'; first.members.pop();
 const second=workshop.fixture('ru');
 assert.equal(second.cooperations[0].status,'open'); assert.equal(second.members.length,4);
 assert.deepEqual(Object.keys(second).sort(),['cooperations','members']);
});
test('read-only story works without DOM, storage, network or account APIs',()=>{
 for(const lang of ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']){
  const html=workshop.render({lang,escape});
  assert.equal((html.match(/<li>/g)||[]).length,8);
  assert.ok(html.includes(lang==='ru'?'Вымышленный':'Fictional'));
  assert.ok(html.includes(lang==='ru'?'проверены локально':'tested locally'));
  assert.doesNotMatch(html,/<form|data-coop=|data-net=|<input/);
  assert.ok(html.includes(`lang="${lang==='ru'?'ru':'en'}"`));
 }
});
