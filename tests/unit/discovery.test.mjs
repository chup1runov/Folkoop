import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function setup(lang='ru',broken=false){
 const storage=new Map(),c={document:{documentElement:{lang}},localStorage:{getItem:k=>{if(broken)throw Error();return storage.get(k)||null;},setItem:(k,v)=>{if(broken)throw Error();storage.set(k,v);}}};
 vm.runInNewContext(readFileSync('apps/web/network-discovery.js','utf8'),c);
 vm.runInNewContext(readFileSync('apps/web/network-for-you.js','utf8'),c);
 return {d:c.FolkoopDiscovery,f:c.FolkoopForYou,storage};
}
test('local IDs are scoped per account and Mura; no content persists',()=>{
 const {d,storage}=setup();d.change('user1',false,'save','abc');d.change('user1',true,'save','demo');
 assert.deepEqual([...d.read('user1').saved],['abc']);assert.equal(d.read('user2').saved.length,0);
 assert.deepEqual([...d.read('user1',true).saved],['demo']);
 assert.equal(d.read('user1').persistent,true);assert.equal(storage.size,2);
 assert.deepEqual(Object.keys(JSON.parse([...storage.values()][0])).sort(),['goal','hidden','saved']);
 d.change('user1',false,'hide','abc');d.change('user1',false,'restore');assert.equal(d.read('user1').hidden.length,0);
 d.change('user1',false,'save','abc');assert.equal(d.read('user1').saved.length,0);
});
test('invalid or unavailable storage is safe, recoverable and honestly ephemeral',()=>{
 const {d,storage}=setup();storage.set('folkoop-discovery-v1:u','bad json');assert.equal(d.read('u').persistent,false);
 d.change('u',false,'save','a');assert.equal(d.read('u').persistent,true);
 assert.equal(d.clean({saved:['a','a','<script>'],goal:{start:Number.MAX_SAFE_INTEGER}}).goal,null);
 assert.deepEqual([...d.clean({saved:['a','a','<script>']}).saved],['a']);
 const e=setup('ru',true).d;e.change('u',false,'save','a');assert.equal(e.read('u').persistent,false);assert.equal(e.read('u').saved[0],'a');
});
test('saved and hidden bounds never silently evict previous choices',()=>{
 const {d}=setup();for(let i=0;i<100;i++)d.change('u',false,'save','id'+i);
 assert.equal(d.change('u',false,'save','new').limit,true);assert.equal(d.read('u').saved.length,100);assert.ok(d.read('u').saved.includes('id0'));
 d.change('u',false,'clear-saved');assert.equal(d.read('u').saved.length,0);
});
test('ranking is deterministic, diverse, bounded and respects relevance/membership',()=>{
 const {d,f}=setup(),items=Array.from({length:7},(_,i)=>({id:'x'+i,kind:i===3?'need':'project',owner_id:i<3?'same':'different'+i,status:'open',title:'Swedish group',created_at:'2026-11-0'+(9-i)}));
 const before=JSON.stringify(items),rank=d.rank(items);
 assert.equal(rank[0].id,'x0');assert.equal(rank[1].id,'x3');assert.equal(rank[2].id,'x4');
 assert.equal(d.rank(items).map(x=>x.id).join(),rank.map(x=>x.id).join());assert.equal(JSON.stringify(items),before);
 assert.equal(f.select(items,'swedish','u',[]).length,3);
 assert.equal(f.select(items,'swedish','u',[],{hidden:['x0'],all:true}).length,6);
 const weak={...items[3],id:'weak',title:'Other',description:'Swedish',created_at:'2099'};
 assert.notEqual(f.select([weak,...items],'swedish','u',[])[0].id,'weak');
 assert.equal(f.select(items,'swedish','u',[{cooperation_id:'x0',user_id:'u'}],{all:true}).at(-1).id,'x0');
});
test('goal counts unique own results independently verified inside exact seven-day interval',()=>{
 const {d}=setup(),start=Date.parse('2026-11-09T12:00:00Z'),end=start+7*86400000,goal={start};
 const row={id:'task',assignee_id:'u',work_stage:'verified',reviewed_by:'other',reviewed_at:new Date(start).toISOString()};
 assert.equal(d.goalProgress(goal,[row,row],'u',start).count,1);
 for(const patch of [{assignee_id:'v'},{reviewed_by:'u'},{reviewed_by:null},{work_stage:'done'},{work_stage:'changes'},{reviewed_at:'invalid'},{reviewed_at:new Date(start-1).toISOString()},{reviewed_at:new Date(end).toISOString()},{reviewed_at:new Date(start+1).toISOString()}])assert.equal(d.goalProgress(goal,[{...row,...patch}],'u',start).count,0,JSON.stringify(patch));
 assert.equal(d.goalProgress(goal,[row],'u',end).complete,true);assert.equal(d.goalProgress(goal,[],'u',end).ended,true);
 assert.equal(d.goalProgress(goal,[],'u',start-1).future,true);
});
test('finite pages, saved removed data, closed listings, goal unavailable and escaping',()=>{
 const {f}=setup(),items=Array.from({length:7},(_,i)=>({id:'x'+i,status:'open',title:'<title>',kind:'project'})),args={items,members:[],user:'u',loadedAt:10,now:10,kindLabel:x=>x,preferences:{saved:['missing','x0'],hidden:[],goal:{start:1}}};
 assert.match(f.render({...args,discoveryPage:1}),/2 \/ 3/);
 assert.doesNotMatch(f.render({...args,discoveryPage:2}),/data-discovery="next"/);
 const saved=f.render({...args,items:[{...items[0],status:'done'}],discoveryView:'saved'});
 assert.match(saved,/Закрыто/);assert.match(saved,/&lt;title&gt;/);assert.doesNotMatch(saved,/data-id="missing"/);
 const unknown=f.render({...args,goalAvailable:false});assert.match(unknown,/Обнови данные/);assert.doesNotMatch(unknown,/<progress/);
 assert.doesNotMatch(f.render({...args,demo:true}),/data-discovery="start"/);
});
test('all thirty-one labels exist across the eleven supported locales',()=>{
 for(const lang of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku']){const d=setup(lang).d;for(let i=0;i<31;i++)assert.ok(d.text(i),lang+':'+i);}
});
