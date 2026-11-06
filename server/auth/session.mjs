/* Pages-only BFF: no privileged Supabase key, no browser-readable credentials. */
const COOKIE='__Host-folkoop-session', TTL=7*86400;
const enc=new TextEncoder(), dec=new TextDecoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const bytes=s=>Uint8Array.from(s.match(/../g)||[],x=>parseInt(x,16));
const error=(status,message)=>Object.assign(new Error(message),{status});
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const cookie=(value,age=TTL)=>`${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
export function createSessionHandler({fetch:send=globalThis.fetch,clock=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 return async function handle(request,env){
  let db, stage='origin';
  try{
   const url=new URL(request.url), path=url.pathname.replace(/^\/api\/network/,'');
   if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)throw error(403,'ORIGIN_REQUIRED');
   if(request.headers.get('sec-fetch-site')==='cross-site')throw error(403,'ORIGIN_REQUIRED');
   stage='configuration';
   if(!env.SESSIONS||!/^https:\/\/\w{20}\.supabase\.co$/.test(env.SUPABASE_URL||'')||!/^sb_publishable_/.test(env.SUPABASE_PUBLISHABLE_KEY||'')||!(/^[a-f0-9]{64}$/i.test(env.SESSION_KEY||'')))throw error(503,'SESSION_UNAVAILABLE');
   db=env.SESSIONS;
   stage='crypto';
   const now=()=>Math.floor(clock()/1000);
   const key=await crypto.subtle.importKey('raw',bytes(env.SESSION_KEY),'AES-GCM',false,['encrypt','decrypt']);
   const digest=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
   async function seal(value,id){const iv=crypto.getRandomValues(new Uint8Array(12));return hex(iv)+hex(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(id)},key,enc.encode(JSON.stringify(value))));}
   async function open(row){return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(row.sealed.slice(0,24)),additionalData:enc.encode(row.id)},key,bytes(row.sealed.slice(24)))));}
   const rawCookie=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
   const sid=/^[a-f0-9]{64}$/.test(rawCookie||'')?await digest(rawCookie):null;
   async function upstream(path,method='GET',body,token,prefer){
    const headers={apikey:env.SUPABASE_PUBLISHABLE_KEY,Accept:'application/json'};
    if(token)headers.Authorization='Bearer '+token;
    if(body!==undefined)headers['Content-Type']='application/json';
    if(prefer==='count=exact')headers.Prefer=prefer;
    return send(env.SUPABASE_URL+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(10000)});
   }
   async function payload(){if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw error(415,'JSON_REQUIRED');const text=await request.text();if(text.length>65536)throw error(413,'BODY_TOO_LARGE');try{return JSON.parse(text);}catch{throw error(400,'INVALID_INPUT');}}
   async function requireOK(response){if(!response.ok){const detail=await response.json().catch(()=>null);throw error(response.status,detail?.message==='PILOT_INVITE_REQUIRED'?'PILOT_INVITE_REQUIRED':response.status===401?'AUTH_REQUIRED':'REQUEST_FAILED');}return response.json();}
   if(path==='/session'&&request.method==='POST'){
    stage='payload';
    const b=await payload();
    if(typeof b.access_token!=='string'||b.access_token.length>12000||typeof b.refresh_token!=='string'||b.refresh_token.length<10||b.refresh_token.length>12000)throw error(400,'INVALID_INPUT');
    if(b.acceptance?.termsAccepted!==true||b.acceptance?.privacyAcknowledged!==true)throw error(403,'POLICY_REQUIRED');
    if(typeof b.invite!=='string'||b.invite.length>120)throw error(400,'INVALID_INPUT');
    stage='identity';
    const who=await requireOK(await upstream('/auth/v1/user','GET',undefined,b.access_token));
    if(!/^[0-9a-f-]{36}$/i.test(who.id||'')||!who.email_confirmed_at)throw error(401,'AUTH_REQUIRED');
    stage='consent';
    await requireOK(await upstream('/rest/v1/rpc/fk_claim_pilot_invite','POST',{p_code:b.invite,p_terms_version:'2026-09-29-v1',p_accept_terms:true,p_privacy_version:'2026-09-29-v1',p_ack_privacy:true},b.access_token));
    // Exchange the supplied refresh token before storing: verifies the pair and gives a server-known expiry.
    stage='exchange';
    const tokens=await requireOK(await upstream('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:b.refresh_token}));
    const refreshed=await requireOK(await upstream('/auth/v1/user','GET',undefined,tokens.access_token));
    if(refreshed.id!==who.id)throw error(401,'AUTH_REQUIRED');
    if(!tokens.access_token||!tokens.refresh_token||!Number.isFinite(tokens.expires_in)||tokens.expires_in<=0)throw error(502,'INVALID_RESPONSE');
    stage='persist';
    const opaque=hex(crypto.getRandomValues(new Uint8Array(32))), id=await digest(opaque),expires=now()+TTL;
    await db.prepare('DELETE FROM sessions WHERE expires <= ?').bind(now()).run();
    await db.prepare('INSERT INTO sessions(id,user_id,sealed,expires,refresh_after) VALUES(?,?,?,?,?)').bind(id,who.id,await seal({access:tokens.access_token,refresh:tokens.refresh_token},id),expires,now()+tokens.expires_in-60).run();
    if(sid)await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sid).run();
    return json({id:who.id,expiresAt:expires*1000},200,{'Set-Cookie':cookie(opaque)});
   }
   if(path==='/session'&&request.method==='DELETE'){
    const row=sid?await db.prepare('SELECT * FROM sessions WHERE id = ?').bind(sid).first():null;
    if(row){
     const all=url.searchParams.get('all')==='1';
     await db.prepare(all?'DELETE FROM sessions WHERE user_id = ?':'DELETE FROM sessions WHERE id = ?').bind(all?row.user_id:sid).run();
     const tokens=await open(row);
     const result=await upstream('/auth/v1/logout?scope='+(all?'global':'local'),'POST',undefined,tokens.access);
     if(!result.ok&&result.status!==401)return json({message:'PROVIDER_LOGOUT_FAILED'},502,{'Set-Cookie':cookie('',0)});
    }
    return json({ok:true},200,{'Set-Cookie':cookie('',0)});
   }
   let row=sid?await db.prepare('SELECT * FROM sessions WHERE id = ?').bind(sid).first():null;
   if(!row||row.expires<=now())return json({message:'AUTH_REQUIRED'},401,{'Set-Cookie':cookie('',0)});
   let tokens=await open(row);
   if(row.refresh_after<=now()){
    const lease=now()+15;
    const lock=await db.prepare('UPDATE sessions SET lease_until = ? WHERE id = ? AND lease_until <= ? AND refresh_after <= ?').bind(lease,sid,now(),now()).run();
    if(lock.meta.changes){
     try{
      const response=await upstream('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:tokens.refresh});
      if([400,401].includes(response.status)){await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sid).run();throw error(401,'AUTH_REQUIRED');}
      const fresh=await requireOK(response);
      if(!fresh.access_token||!fresh.refresh_token||!Number.isFinite(fresh.expires_in)||fresh.expires_in<=0)throw error(502,'INVALID_RESPONSE');
      tokens={access:fresh.access_token,refresh:fresh.refresh_token};
      const updated=await db.prepare('UPDATE sessions SET sealed = ?, refresh_after = ?, lease_until = 0 WHERE id = ? AND lease_until = ?').bind(await seal(tokens,sid),now()+fresh.expires_in-60,sid,lease).run();
      if(!updated.meta.changes)throw error(401,'AUTH_REQUIRED');
     }finally{await db.prepare('UPDATE sessions SET lease_until = 0 WHERE id = ? AND lease_until = ?').bind(sid,lease).run();}
    }else{
     for(let n=0;n<30;n++){await sleep(100);row=await db.prepare('SELECT * FROM sessions WHERE id = ?').bind(sid).first();if(!row)throw error(401,'AUTH_REQUIRED');if(row.refresh_after>now())break;}
     if(row.refresh_after<=now())throw error(503,'SESSION_BUSY');
     tokens=await open(row);
    }
   }
   if(path==='/session'&&request.method==='GET'){
    const who=await requireOK(await upstream('/auth/v1/user','GET',undefined,tokens.access));
    if(who.id!==row.user_id)throw error(401,'AUTH_REQUIRED');
    return json({id:who.id,expiresAt:row.expires*1000});
   }
   // Strict API surface. User JWT still enforces existing database RLS and RPC checks.
   const read=/^\/rest\/v1\/fk_[a-z0-9_]+$/.test(path)&&request.method==='GET';
   const rpc=/^\/rest\/v1\/rpc\/fk_[a-z0-9_]+$/.test(path)&&request.method==='POST';
   if(!read&&!rpc)throw error(404,'NOT_FOUND');
   const response=await upstream(path+url.search,request.method,rpc?await payload():undefined,tokens.access,request.headers.get('prefer'));
   const headers={'Cache-Control':'no-store','Content-Type':'application/json','X-Content-Type-Options':'nosniff'};
   if(response.headers.has('content-range'))headers['Content-Range']=response.headers.get('content-range');
   return new Response(response.body,{status:response.status,headers});
  }catch(e){if(!e.status||e.status>=500)console.error('SESSION_FAILURE',stage);return json({message:e.status?e.message:'SESSION_UNAVAILABLE'},e.status||503);}
 };
}
