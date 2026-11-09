import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const now=Date.parse('2026-11-09T12:00:00Z'),iso=n=>new Date(n).toISOString();
function setup(lang='ru'){const c={document:{documentElement:{lang}},FolkoopMeetings:{outcomeText:i=>'outcome-'+i}};vm.runInNewContext(readFileSync('apps/web/network-shared-progress.js','utf8'),c);return c.FolkoopSharedProgress;}
function meeting(){return {coop:{id:'p',kind:'project',owner_id:'a',status:'active'},user:{id:'a'},members:[{user_id:'a'},{user_id:'b'}],name:id=>id,now,data:{loadedAt:now,projectTasks:[],projectBudget:{loadedAt:now,contributions:[]},meeting:{loadedAt:now,current:true,people_confirmed:true,terms:{version:2,minimum_attendees:2,facilitator_id:'a',opener_id:'b',starts_at:iso(now+1000),ends_at:iso(now+2000)},responses:[{user_id:'a',role:'attendee',version:2,confirmed:true},{user_id:'b',role:'attendee',version:2,confirmed:true},{user_id:'a',role:'facilitator',version:2,confirmed:true},{user_id:'b',role:'opener',version:2,confirmed:true}],room:{confirmed:true},budget:{configured:true,version:2,ready:true,requirements:[]},outcome:{version:2,ended:false,state:'unreported',reports:[]}}}};}
const step=(m,key)=>m.steps.find(s=>s.key===key);
test('meeting progress requires current personal attendance and both current roles',()=>{
 const f=setup(),a=meeting();assert.equal(step(f.model(a),'people').state,'done');
 a.data.meeting.responses[3].version=1;assert.equal(step(f.model(a),'people').state,'pending');
 a.data.meeting.responses[3].version=2;a.data.meeting.responses[1].confirmed=false;assert.equal(step(f.model(a),'people').state,'pending');
 a.data.meeting.current=false;assert.equal(step(f.model(a),'people').state,'unknown');
});
test('room revocation and requirement version changes reopen their own stage',()=>{
 const f=setup(),a=meeting();assert.equal(step(f.model(a),'room').state,'done');assert.equal(step(f.model(a),'resources').state,'done');
 a.data.meeting.room.confirmed=false;a.data.meeting.budget.version=1;assert.equal(step(f.model(a),'room').state,'pending');assert.equal(step(f.model(a),'resources').state,'pending');
 a.data.meeting.budget.version=2;a.data.meeting.budget.ready=false;assert.equal(step(f.model(a),'resources').state,'pending');
});
test('outcome is not a self-report, a prior version or a majority over an objection',()=>{
 const f=setup(),a=meeting(),m=a.data.meeting;m.terms.starts_at=iso(now-2000);m.terms.ends_at=iso(now-1000);m.current=false;
 m.outcome={version:2,ended:true,state:'participant_confirmed',reports:[{user_id:'a',version:2,result:'held'},{user_id:'b',version:2,result:'held'}]};
 assert.equal(step(f.model(a),'outcome').state,'done');assert.equal(step(f.model(a),'people').state,'unknown');assert.doesNotMatch(f.render(a),/class="shared-progress-next"/);
 m.outcome.reports[1].version=1;assert.equal(step(f.model(a),'outcome').state,'reported');assert.match(f.render(a),/shared-progress-next[^]*data-shared-step="outcome"/);
 m.outcome.reports[1].version=2;m.outcome.reports[1].result='not_held';m.outcome.state='unclear';assert.equal(step(f.model(a),'outcome').state,'disputed');
 m.outcome.error=true;assert.equal(step(f.model(a),'outcome').state,'unknown');
});
test('task results require another reviewer, valid date and the exact project',()=>{
 const f=setup(),a=meeting();a.data.projectTasks=[{id:'t',cooperation_id:'p',assignee_id:'a',work_stage:'verified',reviewed_by:'b',reviewed_at:iso(now),title:'<script>'}];
 assert.equal(step(f.model(a),'tasks').state,'done');
 a.data.projectTasks[0].reviewed_by='a';assert.equal(step(f.model(a),'tasks').state,'pending');
 a.data.projectTasks[0].reviewed_by='b';a.data.projectTasks[0].work_stage='legacy';a.data.projectTasks[0].status='done';assert.equal(step(f.model(a),'tasks').state,'pending');
 a.data.projectTasks[0].cooperation_id='other';assert.equal(step(f.model(a),'tasks'),undefined);
});
function purchase(){return {coop:{id:'p',kind:'purchase',owner_id:'a',status:'active',target_quantity:0.3,unit:'kg'},user:{id:'a'},members:[{user_id:'a'},{user_id:'b'}],name:id=>id,now,data:{loadedAt:now,purchaseProcess:[{cooperation_id:'p',stage:'confirming'}],purchaseChoice:[{cooperation_id:'p',offer_id:'offer',selected_by:'a'}],purchaseOffers:[{cooperation_id:'p',id:'offer',valid_until:'2026-11-10'}],commitments:[{cooperation_id:'p',user_id:'a',quantity:.1},{cooperation_id:'p',user_id:'b',quantity:.2}],purchaseConfirmations:[{cooperation_id:'p',user_id:'a',decision:'confirmed',quantity:.1},{cooperation_id:'p',user_id:'b',decision:'pending',quantity:.2}]}};}
test('pledges, personal consents, collection and organizer outcome stay separate',()=>{
 const f=setup(),a=purchase();let m=f.model(a);assert.equal(step(m,'quantity').state,'done');assert.equal(step(m,'quantity').target,'purchase-progress');assert.equal(step(m,'quantity').detail,'0.3 / 0.3 kg');assert.equal(step(m,'consent').state,'pending');assert.equal(step(m,'collection').state,'pending');
 a.data.purchaseConfirmations[1].decision='confirmed';assert.equal(step(f.model(a),'consent').state,'done');
 a.data.purchaseProcess[0].stage='distributing';for(const x of a.data.purchaseConfirmations)x.collected_at=iso(now);
 assert.equal(step(f.model(a),'collection').state,'done');
 a.data.purchaseProcess[0].stage='done';a.data.purchaseProcess[0].result_note='Received everything';assert.equal(step(f.model(a),'purchase-result').state,'reported');
 a.data.purchaseConfirmations[1].collected_at=null;assert.equal(step(f.model(a),'collection').state,'pending');
});
test('expired offer and old consent before confirmation do not count',()=>{
 const f=setup(),a=purchase();a.data.purchaseConfirmations[1].decision='confirmed';a.data.purchaseOffers[0].valid_until='2026-11-08';
 assert.equal(step(f.model(a),'terms').state,'pending');assert.equal(step(f.model(a),'consent').state,'pending');
 a.data.purchaseOffers[0].valid_until='2026-11-10';a.data.purchaseProcess[0].stage='collecting';assert.equal(step(f.model(a),'consent').state,'pending');
 a.coop.status='cancelled';assert.ok(f.model(a).steps.every(s=>s.state==='unknown'));assert.equal(f.model(a).active,false);
});
test('unavailable and partial data never display success or stale named evidence',()=>{
 const f=setup();for(const override of [{online:false},{now:now+60000},{data:{...meeting().data,partialLoad:['fk_project_tasks']}}]){const m=f.model({...meeting(),...override});assert.equal(m.done,0);assert.ok(m.steps.every(s=>s.state==='unknown'&&!s.evidence.length));}
});
test('only selected resource needs appear as contributions; no ranking or mutation',()=>{
 const f=setup(),a=meeting();a.data.meeting.budget.requirements=[{need:'n'}];a.data.projectBudget.contributions=[{cooperation_id:'p',need_id:'n',contributor_id:'a',status:'promised'},{cooperation_id:'p',need_id:'unrelated',contributor_id:'b',status:'received'}];
 const before=JSON.stringify(a);const m=f.model(a);assert.equal(step(m,'resources').evidence.length,1);assert.equal(step(m,'resources').evidence[0].label,31);assert.equal(JSON.stringify(a),before);
 assert.match(f.render(a),/Твой вклад/);assert.doesNotMatch(f.render(a),/<form|data-coop="join"/);
});
test('Mura is authored illustration and known notices remain event-specific',()=>{
 const f=setup(),a=meeting();const html=f.render({...a,demo:true,demoMeeting:true});assert.match(html,/вымышленные данные/);assert.doesNotMatch(html,/<form/);
 assert.equal(f.notice('task_verified','t'),'Подтверждён результат задачи');assert.equal(f.notice('collection_changed','not_collected'),null);assert.equal(f.notice('purchase_stage','done'),'Организатор описал итог закупки');assert.equal(f.notice('member_joined','x'),null);
});
test('all 37 copy entries exist in each supported locale',()=>{for(const l of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku'])for(let i=0;i<37;i++)assert.ok(setup(l).text(i),l+':'+i);});

test('cancellation belongs to the selected project and receipt needs another confirmer',()=>{
 const f=setup(),a=meeting();a.data.purchaseProcess=[{cooperation_id:'other',stage:'cancelled'}];assert.equal(f.model(a).active,true);
 a.data.meeting.budget.requirements=[{need:'n'}];a.data.projectBudget.contributions=[{cooperation_id:'p',need_id:'n',contributor_id:'a',status:'received',received_by:'a'}];assert.equal(step(f.model(a),'resources').evidence[0].label,31);
 a.data.projectBudget.contributions[0].received_by='b';assert.equal(step(f.model(a),'resources').evidence[0].label,32);
});

test('offer expiry follows SQL inclusive DATE and nullable expiry, not midnight timestamp',()=>{
 const f=setup(),a=purchase(),o=a.data.purchaseOffers[0];
 for(const value of [null,'2026-11-09','2026-11-10']){o.valid_until=value;assert.equal(step(f.model(a),'terms').state,'done');}
 for(const value of ['2026-11-08','2026-02-31','bad','']){o.valid_until=value;assert.equal(step(f.model(a),'terms').state,'pending');}
 o.valid_until=null;o.withdrawn_at=iso(now);assert.equal(step(f.model(a),'terms').state,'pending');
});
