// Disposable loopback PostgreSQL. No hosted URL, credentials or existing database accepted.
import {mkdtemp,readFile,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';import {createServer} from 'node:net';import assert from 'node:assert/strict';
const tools=process.env.FK_TEST_MODULES;if(!tools)throw Error('Set FK_TEST_MODULES to isolated installed test dependencies');
const {default:pg}=await import(pathToFileURL(resolve(tools,'pg/lib/index.js')));const {Client}=pg;
const bin=resolve(tools,'@embedded-postgres/darwin-arm64/native/bin');
const folder=await mkdtemp(join(tmpdir(),'folkoop-t12-pg-'));
const port=await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n));});});
const cfg={host:'127.0.0.1',port,user:'postgres',database:'postgres'};
const clients=[];let started=false;
async function connect(){const c=new Client(cfg);await c.connect();clients.push(c);return c;}
async function run(c,sql){
 sql=sql.replace(/^\\set ON_ERROR_STOP (?:on|1)\s*$/gm,'');const vars=new Map();
 const substitute=text=>text.replace(/:'([a-zA-Z_][a-zA-Z_0-9]*)'/g,(_,k)=>{assert(vars.has(k),'Unknown psql variable '+k);const v=vars.get(k);return v===null?'NULL':"'"+String(v).replaceAll("'","''")+"'";});
 const chunks=sql.split(/\\(gset|gexec)[ \t]*(?:\r?\n|$)/);
 for(let i=0;i<chunks.length;i+=2){assert(!/^\\/m.test(chunks[i]),'Unsupported psql meta-command');const value=await c.query(substitute(chunks[i])),result=Array.isArray(value)?value:[value];
 if(chunks[i+1]==='gset'){const rows=result.at(-1)?.rows;assert.equal(rows?.length,1);for(const [k,v] of Object.entries(rows[0]))vars.set(k,v);}
 if(chunks[i+1]==='gexec')for(const row of result.at(-1)?.rows||[])for(const v of Object.values(row))if(v!==null)await c.query(String(v));
 }
}
const uid='f1111111-1111-4111-8111-111111111111';
async function begin(c){await c.query("begin; set local role authenticated; set local statement_timeout='8s'");await c.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[uid,JSON.stringify({sub:uid,session_id:uid})]);}
const accept=(c,request,project,resource)=>c.query("select public.fk_resource_use_action($1,$2,$3,2,'accept',null,null,null,null,null,null,'piece')",[request,project,resource]);
async function blocked(admin,c){for(let i=0;i<80;i++){const r=await admin.query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID]);if(r.rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,25));}throw Error('Second real session did not wait for a lock');}
try{
 execFileSync(join(bin,'initdb'),['-D',join(folder,'data'),'-U','postgres','--auth=trust','--encoding=UTF8','--locale=C'],{stdio:'pipe'});
 execFileSync(join(bin,'pg_ctl'),['-D',join(folder,'data'),'-l',join(folder,'server.log'),'-o',`-h 127.0.0.1 -p ${port} -k ${folder}`,'-w','start'],{stdio:'pipe'});started=true;
 const db=await connect();console.log('ENGINE',(await db.query('select version()')).rows[0].version);
 await run(db,await readFile('supabase/tests/network-bootstrap.sql','utf8'));
 let migrations=0,tests=0;
 for(const f of (await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).sort()){await run(db,await readFile('supabase/migrations/'+f,'utf8'));await run(db,await readFile('supabase/tests/data-api-assert-after-migration.sql','utf8'));migrations++;}
 for(const f of (await readdir('supabase/tests')).filter(x=>/^network-.*\.sql$/.test(x)&&x!=='network-bootstrap.sql').sort()){try{await run(db,await readFile('supabase/tests/'+f,'utf8'));}catch(e){throw Error(f+': '+e.message,{cause:e});}tests++;console.log('PASS',f);}
 const fixture=await readFile('supabase/tests/network-resource-booking.sql','utf8');const marker="select public.fk_resource_use_action('00000000-0000-4000-8000-000000000201',current_setting('test.meeting')::uuid,current_setting('test.resource')::uuid,2,'accept'";assert(fixture.includes(marker));await run(db,fixture.slice(0,fixture.indexOf(marker)));
 const ids=(await db.query("select current_setting('test.meeting') as p1,current_setting('test.project2') as p2,current_setting('test.resource') as r")).rows[0];await db.query('commit');
 const a=await connect(),b=await connect();assert.notEqual(a.processID,b.processID);
 await begin(a);await begin(b);await accept(a,'00000000-0000-4000-8000-000000000201',ids.p1,ids.r);
 const waiting=accept(b,'00000000-0000-4000-8000-000000000202',ids.p2,ids.r).then(()=>({ok:true}),e=>({ok:false,message:e.message}));await blocked(db,b);await a.query('commit');const loser=await waiting;assert.equal(loser.ok,false);assert.match(loser.message,/BOOKING_CAPACITY_CONFLICT/);await b.query('rollback');
 assert.equal((await db.query("select count(*)::int n from public.fk_room_requests where state='agreed'")).rows[0].n,1);console.log('PASS concurrent overlapping reservations: observed lock wait; exactly one succeeds');
 await begin(a);await begin(b);await accept(a,'00000000-0000-4000-8000-000000000201',ids.p1,ids.r);const retry=accept(b,'00000000-0000-4000-8000-000000000201',ids.p1,ids.r);await blocked(db,b);await a.query('commit');await retry;await b.query('commit');
 assert.equal((await db.query("select revision from public.fk_room_requests where id='00000000-0000-4000-8000-000000000201'")).rows[0].revision,3);console.log('PASS concurrent duplicate acceptance: same revision retained');
 if(process.env.FK_PLAYWRIGHT_MODULE){const {checkBrowser}=await import('../../tests/e2e/workshop-postgres-browser.mjs');await checkBrowser({connect,ids});}
 console.log(JSON.stringify({result:'passed',migrations,tests,concurrentCases:2,engine:'PostgreSQL 17.11',limits:['Synthetic auth schema/claims, no hosted Supabase Auth','Loopback disposable database; not deployment evidence']}));
}catch(e){console.error(e.stack);process.exitCode=1;}finally{for(const c of clients)await c.end().catch(()=>{});if(started)execFileSync(join(bin,'pg_ctl'),['-D',join(folder,'data'),'-m','fast','-w','stop'],{stdio:'pipe'});console.log('Disposable cluster stopped:',folder);}
