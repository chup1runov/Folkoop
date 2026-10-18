import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile('apps/web/network-ui.js','utf8');
const start=source.indexOf('const MEETING_PROJECT='),end=source.indexOf('function demoSnapshot(',start);
const context=vm.createContext({lang:()=> 'ru',esc:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))});
vm.runInContext(source.slice(start,end)+';globalThis.subject={id:MEETING_PROJECT,copy:meetingReadinessCopy,render:renderMeetingReadiness};',context);
const subject=context.subject;

test('readiness story is restricted to its authored project and never real accounts',()=>{
 assert.equal(subject.render({id:subject.id},false),'');
 assert.equal(subject.render({id:'another-project'},true),'');
 const html=subject.render({id:subject.id},true);
 for(const label of ['Что нужно','Что подтверждено','Чего не хватает','не реальная бронь','версия 1','Europe/Stockholm','Результат встречи не зафиксирован'])assert(html.includes(label),label);
 assert(html.includes('data-readiness="story-pending"'));
 assert(!html.includes('<form'));
 assert(!html.includes('data-coop="join"'));
});

test('readiness explanation is provided in all eleven languages',()=>{
 assert.equal(Object.keys(subject.copy).length,11);
 for(const [code,copy] of Object.entries(subject.copy)){
  assert.equal(copy.length,15,code);
  assert(copy.every(value=>typeof value==='string'&&value.trim()),code);
  context.lang=()=>code;
  const html=subject.render({id:subject.id},true);
  assert(html.includes(copy[2]),code);
  assert(html.includes('data-readiness-task'),code);
 }
});

test('the next step uses the existing project task collection and readonly disclosure',()=>{
 assert(source.includes('cooperation_id:MEETING_PROJECT,creator_id:DEMO_UID,assignee_id:DEMO_UID'));
 assert(source.includes("host.querySelector('[data-coop-section=\"tasks\"]')"));
 assert(source.includes('if(!guestDemo||selectedCoop!==MEETING_PROJECT)return;'));
});
