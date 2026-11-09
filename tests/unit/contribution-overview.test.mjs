import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const context=vm.createContext({document:{documentElement:{lang:'ru'}},FolkoopCore:{escape},navigator:{onLine:true}});
vm.runInContext(readFileSync('apps/web/network-budget.js','utf8'),context);
const {overviewModel,renderOverview}=context.FolkoopBudget;
const fixture=()=>({loadedAt:1000,needs:[{id:'a',title:'Крепления',amount:1200,kind:'items'},{id:'b',title:'Работа',amount:400,kind:'time'},{id:'c',title:'Зал',amount:400,kind:'space'}],contributions:[{id:'1',need_id:'a',amount:800,status:'received',contributor_id:'person'},{id:'2',need_id:'a',amount:200,status:'submitted',contributor_id:'person'},{id:'3',need_id:'a',amount:100,status:'promised',contributor_id:'person'},{id:'4',need_id:'a',amount:99900,status:'withdrawn',contributor_id:'person'}]});
test('partial fulfilment uses non-additive lifecycle totals and distinct need units',()=>{
 const model=overviewModel(fixture(),1000,true);
 assert.equal(model.length,3);const r=model[0];
 assert.deepEqual([r.required,r.promised,r.submitted,r.received,r.uncovered,r.remaining],[1200,1100,200,800,100,400]);
 assert.equal(model[1].need.kind,'time');assert.equal(model[2].need.kind,'space');
 assert.equal(model[1].remaining,400);assert.equal(model[2].remaining,400);
});
test('unavailable, stale, future, duplicate, malformed and orphan records never look like zero',()=>{
 for(const mutate of [s=>s.error=true,s=>s.loadedAt=0,s=>s.loadedAt=61001,s=>s.needs.push(s.needs[0]),s=>s.contributions.push(s.contributions[0]),s=>s.contributions[0].amount='bad',s=>s.contributions[0].status='unknown',s=>s.contributions[0].need_id='missing']){
 const s=fixture();mutate(s);assert.equal(overviewModel(s,60000,true),null);
 }
 assert.equal(overviewModel(fixture(),1000,false),null);
});
test('withdrawal, cancellation, excess and empty are distinct from missing',()=>{
 const s=fixture();s.needs[1].cancelled=true;s.contributions[0].amount=2000;
 const model=overviewModel(s,1000,true);assert.equal(model.length,2);assert.equal(model[0].remaining,0);assert.equal(model[0].uncovered,0);
 s.contributions.forEach(c=>c.status='withdrawn');assert.equal(overviewModel(s,1000,true)[0].remaining,1200);
 assert.equal(overviewModel({loadedAt:1000,needs:[],contributions:[]},1000,true).length,0);
});
test('overview identifies receiver without self-confirmation and escapes user content',()=>{
 const s=fixture();s.needs[0].title='<script>';s.contributions[1].contributor_id='owner';
 const html=renderOverview({coop:{owner_id:'owner',description:'<img>'},snapshot:s,name:()=>'<b>',now:1000,online:true});
 assert.ok(html.includes('Другой участник'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&lt;img&gt;'));assert.ok(!html.includes('<script>'));
 const error=renderOverview({coop:{owner_id:'owner'},snapshot:{error:true},name:()=>'',now:1000});assert.ok(error.includes('role="status"'));assert.ok(!error.includes('budget-metrics'));
});
test('next action follows uncovered need, pending pledge, then receipt without claiming project success',()=>{
 const s=fixture();s.needs=s.needs.slice(0,1);s.contributions=[];
 const render=()=>renderOverview({coop:{owner_id:'owner'},snapshot:s,name:id=>id,now:1000,online:true});
 assert.ok(render().includes('Найти недостающие обещания'));
 s.contributions=[{id:'1',need_id:'a',amount:1200,status:'promised',contributor_id:'person'}];
 assert.ok(render().includes('Сообщить о выполнении обещания'));
 s.contributions[0].status='received';assert.ok(render().includes('Получение подтверждено по всем потребностям'));
 assert.ok(render().includes('не доказывают внешний результат'));
});
test('unaccepted new terms exclude a promise without erasing submitted or received history',()=>{
 const s=fixture();s.contributions.forEach(c=>c.terms_current=false);const r=overviewModel(s,1000,true)[0];
 assert.equal(r.promised,1000);assert.equal(r.submitted,200);assert.equal(r.received,800);assert.equal(r.uncovered,200);
});
