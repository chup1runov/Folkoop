import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createSessionHandler} from '../../server/auth/session.mjs';
const uid='11111111-1111-4111-8111-111111111111';
function fixture({refreshStatus=200}={}){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync('cloudflare/migrations/0001_sessions.sql','utf8'));
 const env={SESSION_KEY:'ab'.repeat(32),SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_testonly',SESSIONS:{prepare(s){return {bind(...args){const stmt=sql.prepare(s);return {async run(){return {meta:{changes:Number(stmt.run(...args).changes)}};},async first(){return stmt.get(...args)||null;}};}}}}};
 let time=1000000000000, refreshes=0;
 const calls=[];
 const handler=createSessionHandler({clock:()=>time,fetch:async(url,opts)=>{calls.push({url,...opts});
  if(url.includes('/token?')){if(refreshStatus!==200)return Response.json({message:'invalid refresh token'},{status:refreshStatus});refreshes++;await new Promise(r=>setTimeout(r,10));return Response.json({access_token:'private-access-'+refreshes,refresh_token:'private-refresh-'+refreshes,expires_in:3600});}
  if(url.endsWith('/user'))return Response.json({id:uid,email_confirmed_at:'2026-01-01'});
  if(url.includes('/logout'))return new Response(null,{status:204});
  return Response.json(url.includes('fk_profiles')?[{id:uid}]:true,{headers:{'Content-Range':'0-0/1'}});
 }});
 async function req(path='/session',{method='GET',body,cookie,origin='https://local.example'}={}){return handler(new Request('https://local.example/api/network'+path,{method,headers:{origin,'Content-Type':'application/json',...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined}),env);}
 async function login(){const res=await req('/session',{method:'POST',body:{access_token:'original-access',refresh_token:'original-refresh',invite:'',acceptance:{termsAccepted:true,privacyAcknowledged:true}}});assert.equal(res.status,200);return res.headers.get('set-cookie').split(';')[0];}
 return {sql,env,calls,req,login,advance:n=>time+=n,refreshes:()=>refreshes};
}
test('opaque HttpOnly session restores identity and proxies RLS JWT without exposing credentials',async()=>{
 const f=fixture(),cookie=await f.login();assert.match(cookie,/__Host-folkoop-session=[a-f0-9]{64}$/);
 const row=f.sql.prepare('select * from sessions').get();assert(!row.sealed.includes('private'));assert(!cookie.includes(row.id));
 const response=await f.req('/session',{cookie});assert.deepEqual(await response.json(),{id:uid,expiresAt:1000604800000});assert.equal(response.headers.get('cache-control'),'no-store');
 const r=await f.req('/rest/v1/fk_profiles?select=id',{cookie});assert.equal(r.status,200);assert.equal(r.headers.get('content-range'),'0-0/1');assert.equal(f.calls.at(-1).headers.Authorization,'Bearer private-access-1');
 assert.equal((await f.req('/rest/v1/fk_profiles')).status,401);
});
test('strict origin and explicit consent; arbitrary proxy targets denied',async()=>{
 const f=fixture();assert.equal((await f.req('/session',{method:'POST',origin:'https://evil.example',body:{}})).status,403);
 assert.equal((await f.req('/session',{method:'POST',body:{access_token:'x',refresh_token:'1234567890'}})).status,403);
 const cookie=await f.login();assert.equal((await f.req('/auth/v1/admin/users',{cookie})).status,404);
 assert.equal((await f.req('/rest/v1/fk_profiles',{cookie,method:'POST',body:{}})).status,404);
});
test('parallel expiry refresh uses one lease; logout revokes server access',async()=>{
 const f=fixture(),cookie=await f.login();f.advance(3600000);
 const responses=await Promise.all([f.req('/session',{cookie}),f.req('/session',{cookie})]);assert(responses.every(r=>r.status===200));assert.equal(f.refreshes(),2);
 const out=await f.req('/session',{method:'DELETE',cookie});assert.equal(out.status,200);assert.match(out.headers.get('set-cookie'),/Max-Age=0/);
 assert.equal((await f.req('/session',{cookie})).status,401);assert.equal(f.sql.prepare('select count(*) n from sessions').get().n,0);
});
test('expiry, invalid cookies and missing configuration fail closed',async()=>{
 const f=fixture(),cookie=await f.login();f.advance(8*86400000);assert.equal((await f.req('/session',{cookie})).status,401);
 assert.equal((await f.req('/session',{cookie:'__Host-folkoop-session=bad'})).status,401);
 delete f.env.SESSION_KEY;assert.equal((await f.req('/session',{cookie})).status,503);
});
test('all-device logout removes both server sessions, individual logout only its own',async()=>{
 const f=fixture(),one=await f.login(),two=await f.login();await f.req('/session',{method:'DELETE',cookie:one});assert.equal((await f.req('/session',{cookie:two})).status,200);
 await f.login();await f.req('/session?all=1',{method:'DELETE',cookie:two});assert.equal(f.sql.prepare('select count(*) n from sessions').get().n,0);
});

test('unexpected failure logs only a fixed stage, never credentials or exception detail',async()=>{
 const seen=[],original=console.error;console.error=(...args)=>seen.push(args);
 try{
  const f=fixture();f.env.SESSIONS.prepare=()=>{throw new Error('private-secret-from-driver');};
  const response=await f.req('/session',{method:'POST',body:{access_token:'original-access',refresh_token:'original-refresh',invite:'',acceptance:{termsAccepted:true,privacyAcknowledged:true}}});
  assert.equal(response.status,503);assert.deepEqual(await response.json(),{message:'SESSION_UNAVAILABLE'});
  assert.deepEqual(seen,[['SESSION_FAILURE','persist']]);
 }finally{console.error=original;}
});

test('default runtime fetch retains its global receiver for Workers',async()=>{
 const original=globalThis.fetch;let called=false;
 globalThis.fetch=async function(){assert.equal(this,globalThis);called=true;return Response.json({message:'invalid'},{status:401});};
 try{
  const handler=createSessionHandler(),f=fixture();
  const response=await handler(new Request('https://local.example/api/network/session',{method:'POST',headers:{origin:'https://local.example','Content-Type':'application/json'},body:JSON.stringify({access_token:'original-access',refresh_token:'original-refresh',invite:'',acceptance:{termsAccepted:true,privacyAcknowledged:true}})}),f.env);
  assert.equal(called,true);assert.equal(response.status,401);
 }finally{globalThis.fetch=original;}
});

test('rejected refresh requires a new link, transient upstream failure does not become expiry',async()=>{
 for(const [status,expected] of [[400,401],[503,503]]){const f=fixture({refreshStatus:status});const response=await f.req('/session',{method:'POST',body:{access_token:'original-access',refresh_token:'original-refresh',invite:'',acceptance:{termsAccepted:true,privacyAcknowledged:true}}});assert.equal(response.status,expected);assert.equal(f.sql.prepare('select count(*) n from sessions').get().n,0);}
});
