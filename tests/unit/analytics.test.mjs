import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const code=await readFile('apps/web/analytics.js','utf8');
const ctx=vm.createContext({URL});
vm.runInContext(code,ctx);
const A=ctx.FolkoopAnalytics;
const uid='11111111-1111-4111-8111-111111111111';

test('pilot analytics ships disabled and without a committed PostHog token',()=>{
 assert.equal(A.enabled,false);
 assert(!/projectToken:'phc_/.test(code));
});

test('enabled analytics is pinned to EU ingestion and validates public configuration',()=>{
 assert.throws(()=>A.create({enabled:true,host:'https://us.i.posthog.com',projectToken:'phc_'+'x'.repeat(30),schemaVersion:'2026-10-03-v1'},{transport:async()=>({ok:true})}),/ANALYTICS_CONFIG/);
 assert.throws(()=>A.create({enabled:true,host:'https://eu.i.posthog.com',projectToken:'secret',schemaVersion:'2026-10-03-v1'},{transport:async()=>({ok:true})}),/ANALYTICS_CONFIG/);
});

test('capture is allowlisted, strips unapproved properties and creates no person profile',async()=>{
 const calls=[];
 const a=A.create({enabled:true,host:'https://eu.i.posthog.com',projectToken:'phc_'+'x'.repeat(30),schemaVersion:'2026-10-03-v1'},{transport:async(url,options)=>{calls.push({url,options});return{ok:true};}});
 assert.equal(a.identify(uid),true);
 assert.equal(await a.capture('message_sent',{body:'private'}),false);
 assert.equal(calls.length,0);
 assert.equal(await a.capture('cooperation_created',{cooperation_kind:'need',title:'private',email:'private@example.test'}),true);
 assert.equal(calls.length,1);
 const call=calls[0],payload=JSON.parse(call.options.body);
 assert.equal(call.url,'https://eu.i.posthog.com/i/v0/e/');
 assert.equal(call.options.credentials,'omit');
 assert.equal(call.options.referrerPolicy,'no-referrer');
 assert.equal(payload.distinct_id,uid);
 assert.equal(payload.event,'cooperation_created');
 assert.equal(payload.properties.$process_person_profile,false);
 assert.equal(payload.properties.cooperation_kind,'need');
 assert.equal(payload.properties.analytics_schema,'2026-10-03-v1');
 assert.equal(payload.properties.pilot,'goteborg_core_loop');
 assert.equal('title' in payload.properties,false);
 assert.equal('email' in payload.properties,false);
});

test('invalid identity and reset prevent delivery',async()=>{
 const calls=[];
 const a=A.create({enabled:true,host:'https://eu.i.posthog.com',projectToken:'phc_'+'x'.repeat(30),schemaVersion:'2026-10-03-v1'},{transport:async()=>{calls.push(1);return{ok:true};}});
 assert.equal(a.identify('not-a-uuid'),false);
 assert.equal(await a.capture('cooperation_joined'),false);
 a.identify(uid);a.reset();
 assert.equal(await a.capture('cooperation_joined'),false);
 assert.equal(calls.length,0);
});

test('network adapter instruments only meaningful pilot actions',async()=>{
 const source=await readFile('apps/web/network-client.js','utf8');
 for(const event of ['pilot_session_started','cooperation_created','cooperation_joined','cooperation_completed','project_task_completed','purchase_participation_confirmed','purchase_completed']){
  assert(source.includes(`'${event}'`),`missing analytics hook: ${event}`);
 }
 for(const event of ['message_sent','page_view','profile_view'])assert(!source.includes(`'${event}'`));
});
