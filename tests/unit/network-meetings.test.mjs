import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={document:{documentElement:{lang:'ru'}},Intl,Date};
vm.runInNewContext(readFileSync('apps/web/network-meetings.js','utf8'),context);
const m=context.FolkoopMeetings;
test('outcome copy covers eleven locales',()=>{
 assert.equal(Object.keys(m.outcomeCopy).length,11);
 for(const values of Object.values(m.outcomeCopy)){assert.equal(values.length,23);assert.ok(values.every(v=>typeof v==='string'&&v.trim()));}
});
test('outcome is independent, escaped and repeat requires blank dates with no old consent',()=>{
 const now=Date.parse('2026-10-18T12:00Z');
 const snapshot={loadedAt:now,terms:{version:1,starts_at:'2026-10-18T09:00Z',ends_at:'2026-10-18T10:00Z',place:'Room',conditions:'',minimum_attendees:2,capacity:4},responses:[],outcome:{ended:true,can_report:true,state:'unclear',reports:[{user_id:'a',result:'held',note:'<img src=x>'}]}};
 const args={snapshot,user:{id:'a'},owner:true,members:[],name:id=>id,now};
 const html=m.render(args);
 assert.match(html,/Ответы расходятся/);assert.match(html,/&lt;img src=x&gt;/);assert.ok(!html.includes('<img'));
 assert.match(html,/netMeetingOutcome/);assert.match(html,/netMeetingRepeat/);assert.ok(!html.includes('id="netMeetingTerms"'));
 assert.match(html,/name="start" type="datetime-local" required/);
 assert.ok(!m.render({...args,owner:false}).includes('netMeetingRepeat'));
 assert.match(m.render({...args,online:false}),/value="withdrawn" formnovalidate disabled/);
 assert.ok(!m.render({...args,snapshot:{...snapshot,outcome:{error:true}}}).includes('netMeetingOutcome'));
});
test('meeting copy covers eleven locales without empty fields',()=>{
 assert.equal(Object.keys(m.copy).length,11);
 for(const [locale,values] of Object.entries(m.copy)){assert.equal(values.length,30,locale);assert.ok(values.every(v=>typeof v==='string'&&v.trim()));}
});
test('Stockholm input rejects nonexistent DST times and requires explicit offset for ambiguous times',()=>{
 assert.equal(m.stockholmTime('2026-10-25T02:30','+02:00'),'2026-10-25T00:30:00.000Z');
 assert.equal(m.stockholmTime('2026-10-25T02:30','+01:00'),'2026-10-25T01:30:00.000Z');
 assert.throws(()=>m.stockholmTime('2026-03-29T02:30','+01:00'));
 assert.throws(()=>m.stockholmTime('2026-07-01T18:00','+01:00'));
});
test('only proposed person sees role acceptance; stale and offline snapshots cannot confirm',()=>{
 const now=Date.parse('2026-10-18T12:00Z');
 const snapshot={checked_at:new Date(now).toISOString(),current:true,attendee_count:1,terms:{version:2,starts_at:'2026-10-20T16:00Z',ends_at:'2026-10-20T17:00Z',place:'<img onerror=x>',conditions:'<script>x</script>',minimum_attendees:2,capacity:4,facilitator_id:'b',opener_id:'a'},responses:[{user_id:'a',role:'attendee',confirmed:true}]};
 const args={snapshot,user:{id:'a'},owner:false,members:[{user_id:'a'},{user_id:'b'}],name:id=>id,now};
 let html=m.render(args);
 assert.ok(html.includes('value="opener"'));assert.ok(!html.includes('value="facilitator"'));
 assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;script&gt;'));
 assert.match(m.render({...args,online:false}),/ disabled/);
 assert.match(m.render({...args,now:now+60001}),/неактуально/);
 assert.ok(!m.render({...args,snapshot:{error:true}}).includes('netMeetingResponse'));
});
