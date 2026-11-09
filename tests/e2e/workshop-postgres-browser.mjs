// Actual UI/client and SQL/RLS; synthetic session identity and a bounded PostgREST test adapter.
// This does not certify hosted Auth, PostgREST or a physical mobile device.
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
export async function checkBrowser({connect,ids}){
 const {chromium}=await import(pathToFileURL(resolve(process.env.FK_PLAYWRIGHT_MODULE,'index.mjs')));
 const browser=await chromium.launch();const BASE='http://127.0.0.1:4186/';const results=[];
 const ident=x=>{assert.match(x,/^[a-z_][a-z_0-9]*$/);return '"'+x+'"';};
 try{for(const [role,uid,target] of [['owner','f2222222-2222-4222-8222-222222222222',ids.r],['organizer','f1111111-1111-4111-8111-111111111111',ids.p1],['member','f2222222-2222-4222-8222-222222222222',ids.p1],['outsider','f4444444-4444-4444-8444-444444444444',ids.r]]){
  const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),errors=[],unexpected=[],mutations=[];let loseReply=false;
  await ctx.addInitScript(()=>{sessionStorage.setItem('folkoop-entry-mode-v1','account');localStorage.setItem('folkoop-language','en');localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-onboarding-v3','done');});
  await ctx.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(url.pathname.endsWith('/network-config.js'))return route.fulfill({contentType:'application/javascript',body:'globalThis.FolkoopNetworkConfig='+JSON.stringify({enabled:true,serverSession:true,url:'https://abcdefghijklmnopqrst.supabase.co',publishableKey:'sb_publishable_synthetic_only'})+';'});
   if(url.pathname==='/api/network/session')return route.fulfill({json:{id:uid,expiresAt:Date.now()+3600000}});
   if(!url.pathname.startsWith('/api/network/rest/v1/'))return req.url().startsWith(BASE)?route.continue():route.abort();
   const c=await connect();try{
    await c.query('begin; set local role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)",[uid,JSON.stringify({sub:uid,session_id:uid})]);
    const resource=url.pathname.split('/rest/v1/')[1];let result;
    if(resource.startsWith('rpc/')){
     const name=resource.slice(4);assert(name.startsWith('fk_'));const args=req.postDataJSON()||{},keys=Object.keys(args);
     const meta=(await c.query('select proretset from pg_proc join pg_namespace n on n.oid=pronamespace where n.nspname=$1 and proname=$2 and coalesce(proargnames,ARRAY[]::text[]) @> $3::text[]',['public',name,keys])).rows;assert.equal(meta.length,1,'Ambiguous RPC '+name);
     const call='public.'+ident(name)+'('+keys.map((k,i)=>ident(k)+'=>$'+(i+1)).join(',')+')';
     const r=await c.query(meta[0].proretset?'select * from '+call:'select '+call+' as result',keys.map(k=>args[k]!==null&&typeof args[k]==='object'?JSON.stringify(args[k]):args[k]));result=meta[0].proretset?r.rows:r.rows[0].result;
     if(['fk_save_resource_booking_policy','fk_resource_use_action'].includes(name))mutations.push(name);
    }else{
     assert(resource.startsWith('fk_'));const params=[],conditions=[];let limit=1000,offset=0,order='';
     for(const [k,v] of url.searchParams){
      if(k==='select')continue;
      if(k==='limit'){limit=Math.min(Number(v),1000);continue;}if(k==='offset'){offset=Number(v);continue;}
      if(k==='order'){order=' order by '+v.split(',').map(x=>{const [field,direction='asc']=x.split('.');assert(['asc','desc'].includes(direction));return ident(field)+' '+direction;}).join(',');continue;}
      if(k==='or'){const parts=v.slice(1,-1).split(',');conditions.push('('+parts.map(part=>{const [field,op,...rest]=part.split('.');assert.equal(op,'eq');params.push(rest.join('.'));return ident(field)+'=$'+params.length;}).join(' or ')+')');continue;}
      if(v.startsWith('neq.')){params.push(v.slice(4));conditions.push(ident(k)+'<>$'+params.length);}
      else if(v.startsWith('eq.')){params.push(v.slice(3));conditions.push(ident(k)+'=$'+params.length);}
      else if(v.startsWith('in.(')&&v.endsWith(')')){const slots=v.slice(4,-1).split(',').map(value=>{params.push(value);return '$'+params.length;});conditions.push(ident(k)+' in ('+slots.join(',')+')');}
      else throw Error('Unsupported filter '+k+'='+v);
     }
     assert(Number.isInteger(limit)&&Number.isInteger(offset));result=(await c.query('select * from public.'+ident(resource)+(conditions.length?' where '+conditions.join(' and '):'')+order+' limit '+limit+' offset '+offset,params)).rows;
     if(resource==='fk_room_requests')for(const row of result)row.booking_policy=(await c.query('select * from public.fk_resource_booking_policies where resource_id=$1 and revision=$2',[row.resource_id,row.booking_policy_revision])).rows[0]||null;
    }
    await c.query('commit');
    if(loseReply&&resource==='rpc/fk_save_resource_booking_policy'){loseReply=false;return route.abort('connectionfailed');}
    return route.fulfill({json:result,headers:{'content-range':Array.isArray(result)?`0-${Math.max(0,result.length-1)}/${result.length}`:'*/*'}});
   }catch(e){await c.query('rollback').catch(()=>{});if(!['42501','P0001'].includes(e.code))unexpected.push(e.message);return route.fulfill({status:400,json:{code:e.code||'HARNESS',message:e.message}});}finally{await c.end();}
  });
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(BASE+'?intro=0#/together');
  const open=p.locator(`[data-coop="open"][data-id="${target}"]`);await open.waitFor({timeout:15000});await open.click();await p.locator('.coop-summary').waitFor();if(role!=='outsider')await p.locator('.resource-bookings').waitFor();else assert.equal(await p.locator('.resource-bookings').count(),0);
  assert.deepEqual(unexpected,[],'PostgREST test adapter');
  if(role==='owner'){
   const form=p.locator('.netBookingPolicy');await form.locator('..').locator('summary').click();await form.locator('[name="capacity"]').fill('2');
   loseReply=true;const failed=p.waitForEvent('requestfailed',r=>r.url().endsWith('/fk_save_resource_booking_policy'));await form.locator('button').click();await failed;await p.waitForFunction(()=>!document.querySelector('.netBookingPolicy button')?.disabled);
   if(!await form.locator('..').evaluate(el=>el.open))await form.locator('..').locator('summary').click();assert.equal(await form.locator('[name="capacity"]').inputValue(),'2');
   const replied=p.waitForResponse(r=>r.url().endsWith('/fk_save_resource_booking_policy'));await form.locator('button').click();assert.equal((await replied).status(),200);
   const db=await connect();const check=await db.query('select max(revision)::int n from public.fk_resource_booking_policies where resource_id=$1',[ids.r]);await db.end();assert.equal(check.rows[0].n,2,'Lost-reply retry duplicated policy revision');assert.equal(mutations.length,2);
  }else{
   assert.equal(await p.locator('.netBookingPolicy').count(),0,'Nonowner can edit policy');
   const denied=await p.evaluate(async resource=>{const r=await fetch('/api/network/rest/v1/rpc/fk_save_resource_booking_policy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_resource:resource,p_revision:2,p_unit:'piece',p_capacity:9,p_from:'2030-01-01T00:00:00Z',p_until:'2030-01-02T00:00:00Z',p_conditions:'Forbidden attempt'})});return r.status;},ids.r);assert.equal(denied,400);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);console.log('PASS integrated role',role);results.push({role,width:390,passed:true,limits:'Synthetic session and PostgREST adapter; real UI/client/SQL/RLS'});await ctx.close();
 }}finally{await browser.close();}console.log('PASS authenticated UI with real PostgreSQL',JSON.stringify(results));
}
