/* HTTP adapter for Supabase Auth + PostgREST. Static hosts use memory-only tokens; opted-in Pages uses an HttpOnly session.
   Server authorization is in the SQL migration, never in this UI adapter. */
(() => {
'use strict';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail=code=>Object.assign(new Error(code),{code});
const POLICY=Object.freeze({
 termsVersion:'2026-09-29-v1',
 privacyVersion:'2026-09-29-v1',
 termsUrlEn:'https://github.com/chup1runov/Folkoop/blob/main/docs/PILOT_TERMS_EN.md',
 termsUrlSv:'https://github.com/chup1runov/Folkoop/blob/main/docs/PILOT_TERMS_SV.md',
 privacyUrl:'https://github.com/chup1runov/Folkoop/blob/main/docs/PILOT_PRIVACY_NOTICE_DRAFT.md'
});
function analytics(){return globalThis.FolkoopAnalytics||null;}
function analyticsIdentify(uid){try{return analytics()?.identify?.(uid)===true;}catch{return false;}}
function analyticsReset(){try{analytics()?.reset?.();}catch{}}
function track(event,properties){try{void analytics()?.capture?.(event,properties);}catch{}}
function policyAcceptance(value){
 if(value?.termsAccepted!==true||value?.privacyAcknowledged!==true)throw fail('POLICY_REQUIRED');
 return {
  p_terms_version:POLICY.termsVersion,
  p_accept_terms:true,
  p_privacy_version:POLICY.privacyVersion,
  p_ack_privacy:true
 };
}
function configuration(value){
 if(value?.enabled!==true)return null;
 let u,r;try{u=new URL(value.url);r=new URL(value.oauthRedirectUrl||'https://invalid.example/');}catch{throw fail('CONFIG');}
 if(u.protocol!=='https:'||!/^\w{20}\.supabase\.co$/.test(u.hostname)||u.port||u.username||u.password||u.pathname!=='/'||u.search||u.hash||!/^sb_publishable_[A-Za-z0-9_-]{10,200}$/.test(value.publishableKey||''))throw fail('CONFIG');
 if(value.googleOAuthEnabled===true&&(r.protocol!=='https:'||r.username||r.password||r.search||r.hash))throw fail('CONFIG');
 let emailRedirectUrl=null;
 if(value.emailRedirectUrl!==undefined){
  let e;try{e=new URL(value.emailRedirectUrl);}catch{throw fail('CONFIG');}
  if(e.protocol!=='https:'||e.username||e.password||e.port||e.search||e.hash)throw fail('CONFIG');
  emailRedirectUrl=e.href;
 }
 return {serverSession:value.serverSession===true,emailRedirectUrl,url:u.origin,key:value.publishableKey,googleOAuthEnabled:value.googleOAuthEnabled===true,oauthRedirectUrl:r.href};
}
function client(value,{transport=globalThis.fetch?.bind(globalThis),clock=Date.now}={}){
 const cfg=configuration(value);let session=null,epoch=0,authAttempt=0;
 const pendingMessages=new Map(),coverageWarnings=new Set();
 const controllers=new Set(),listeners=new Set();
 let expiryTimer=null,channel=null;
 const browser=globalThis.window,exitKey='folkoop-session-exit-v1';
 // Only the shared cookie mode shares logout. Never transmit identity or credentials.
 if(browser&&cfg?.serverSession){
  try{channel=new BroadcastChannel(exitKey);channel.onmessage=e=>{if(e.data?.type==='signed-out')clear('signed-out');};}catch{}
  browser.addEventListener('storage',e=>{if(!channel&&e.key===exitKey&&e.newValue)clear('signed-out');});
 }
 function signalExit(){
  if(!browser||!cfg?.serverSession)return;
  try{if(channel)channel.postMessage({type:'signed-out'});else{browser.localStorage.setItem(exitKey,crypto.randomUUID());browser.localStorage.removeItem(exitKey);}}catch{}
 }
 function notify(reason){
  if(browser){clearTimeout(expiryTimer);expiryTimer=session?setTimeout(()=>{expiryTimer=null;user();},Math.max(0,Math.min(session.expiresAt-clock(),2147483647))):null;}
  for(const fn of listeners)fn(session?{id:session.id}:null,reason);
 }
 if(browser){browser.addEventListener('focus',()=>user());browser.addEventListener('pageshow',()=>user());}

 function clear(reason){pendingMessages.clear();coverageWarnings.clear();session=null;epoch++;authAttempt++;for(const c of controllers)c.abort();analyticsReset();notify(reason);}
 function user(){if(session&&session.expiresAt<=clock())clear('expired');return session?{id:session.id}:null;}
 async function request(path,{method='GET',body,auth=true,token,withCount=false}={}){
  if(!cfg)throw fail('DISABLED');
  if(auth&&!user())throw fail('AUTH_REQUIRED');
  const version=epoch,controller=new AbortController();controllers.add(controller);
  const timer=setTimeout(()=>controller.abort(),12000);
  const headers={apikey:cfg.key,Accept:'application/json'};
  if(withCount)headers.Prefer='count=exact';
  const server=cfg.serverSession&&auth&&!token;
  if((auth||token)&&!server)headers.Authorization='Bearer '+(token||session.token);
  if(body!==undefined)headers['Content-Type']='application/json';
  try{
   const response=await transport(server?'/api/network'+path:cfg.url+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),credentials:server?'same-origin':'omit',referrerPolicy:'no-referrer',cache:'no-store',redirect:'error',signal:controller.signal});
   if(version!==epoch)throw fail('STALE');
   if(!response.ok){
    let detail=null;
    if(/\bjson\b/i.test(response.headers.get('content-type')||'')){
     try{detail=await response.json();}catch{}
    }
    if(version!==epoch)throw fail('STALE');
    if(path.split('?')[0]==='/auth/v1/otp'&&response.status===429)throw fail('EMAIL_RATE_LIMIT');
    if(response.status===401){if(auth)clear('expired');throw fail('AUTH_REQUIRED');}
    if(response.status===403&&detail?.message==='PILOT_INVITE_REQUIRED')throw fail('INVITE_REQUIRED');
    if(response.status===403&&['PILOT_TERMS_REQUIRED','PILOT_PRIVACY_REQUIRED'].includes(detail?.message))throw fail('POLICY_REQUIRED');
    if(['RATE_LIMIT','VERSION_CONFLICT','PROFILE_REQUIRED','BUDGET_CONFLICT','DECISION_CONFLICT','DECISION_CLOSED','OBJECTIONS_PENDING','DISCUSSION_OPEN','WELCOME_CONFLICT','MEETING_VERSION_CONFLICT','MEETING_FULL','MEETING_CLOSED','ATTENDANCE_REQUIRED','TASK_REVISION_CONFLICT','TASK_UNAVAILABLE','TASK_BASIS_CONFLICT','TASK_BASIS_PENDING','TASK_BASIS_CLOSED','INVALID_BASIS_LINK','INVALID_SIGNER'].includes(detail?.message))throw fail(detail.message);
    throw fail(response.status===429?'RATE_LIMIT':response.status===403?'DENIED':'REQUEST_FAILED');
   }
   if(response.status===204)return null;
   if(!/\bjson\b/i.test(response.headers.get('content-type')||''))throw fail('INVALID_RESPONSE');
   const result=await response.json();if(version!==epoch)throw fail('STALE');
   if(withCount){
    const range=response.headers.get('content-range')||'',match=/^(?:\d+-\d+|\*)\/(\d+)$/.exec(range);
    const total=match?Number(match[1]):null;
    return {records:result,total:Number.isSafeInteger(total)&&total>=0?total:null};
   }
   return result;
  }catch(e){if(e.code)throw e;throw fail('NETWORK');}
  finally{clearTimeout(timer);controllers.delete(controller);}
 }
 async function serverSession(method,body,all=false){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await transport('/api/network/session'+(all?'?all=1':''),{method,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,credentials:'same-origin',cache:'no-store',redirect:'error',signal:controller.signal});
   const result=await response.json();
   if(!response.ok)throw fail(response.status===401?(method==='POST'?'AUTH_LINK_EXPIRED':'AUTH_REQUIRED'):result.message==='PILOT_INVITE_REQUIRED'?'INVITE_REQUIRED':response.status===429?'AUTH_RATE_LIMIT':'AUTH_SERVER');
   return result;
  }catch(e){if(e.code)throw e;throw fail('NETWORK');}finally{clearTimeout(timer);}
 }
 async function establish(access,refresh,invite,acceptance,attempt){
  const result=await serverSession('POST',{access_token:access,refresh_token:refresh,invite,acceptance});
  if(attempt!==authAttempt){await serverSession('DELETE');throw fail('STALE');}
  session={id:id(result.id),expiresAt:result.expiresAt};
  analyticsIdentify(session.id);notify();return user();
 }
 async function messagePage(cid,before=null){
  let cursor='';
  if(before!==null){
   // Preserve PostgreSQL microseconds: Date.toISOString would skip equal-ms rows.
   const at=before?.created_at;
   if(typeof at!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(at)||!Number.isFinite(Date.parse(at)))throw fail('INVALID_INPUT');
   cursor='&or='+encodeURIComponent('(created_at.lt.'+at+',and(created_at.eq.'+at+',id.lt.'+id(before.id)+'))');
  }
  const records=await rows('fk_messages?select=id,conversation_id,author_id,body,created_at&conversation_id=eq.'+id(cid)+'&order=created_at.desc,id.desc&limit=101'+cursor);
  const messages=records.slice(0,100).reverse();
  return {messages,hasMore:records.length>100,before:messages.length?{id:messages[0].id,created_at:messages[0].created_at}:null};
 }
 function id(value){if(!UUID.test(value||''))throw fail('INVALID_INPUT');return value;}
 function text(value,max,min=0){if(typeof value!=='string'||value.trim().length<min||value.length>max)throw fail('INVALID_INPUT');return value.trim();}
 function idList(values,max=49){if(!Array.isArray(values)||values.length>max)throw fail('INVALID_INPUT');const out=[...new Set(values.map(id))];if(!out.length)throw fail('INVALID_INPUT');return out;}
 function kind(value){if(!['need','offer','purchase','resource','project'].includes(value))throw fail('INVALID_INPUT');return value;}
 function status(value){if(!['open','active','done','cancelled'].includes(value))throw fail('INVALID_INPUT');return value;}
 function taskStatus(value){if(!['todo','doing','done'].includes(value))throw fail('INVALID_INPUT');return value;}
 function economicKind(value){if(!['procurement','production','sale','service','distribution'].includes(value))throw fail('INVALID_INPUT');return value;}
 function economicStage(value){if(!['planning','active','closed','cancelled'].includes(value))throw fail('INVALID_INPUT');return value;}
 function economicRole(value){if(!['coordinator','contributor','producer','buyer','seller','logistics'].includes(value))throw fail('INVALID_INPUT');return value;}
 function quantity(value,{allowZero=false}={}){const n=Number(value);if(!Number.isFinite(n)||(allowZero?n<0:n<=0)||n>1000000000)throw fail('INVALID_INPUT');return n;}
 function currency(value){const v=text(value,3,3).toUpperCase();if(!/^[A-Z]{3}$/.test(v))throw fail('INVALID_INPUT');return v;}
 function deliveryMode(value){if(!['pickup','delivery','both'].includes(value))throw fail('INVALID_INPUT');return value;}
 function optionalDate(value){if(value===null||value===undefined||value==='')return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw fail('INVALID_INPUT');return value;}
 function integer(value,min,max){const n=Number(value);if(!Number.isInteger(n)||n<min||n>max)throw fail('INVALID_INPUT');return n;}
 function timestamp(value,{required=false}={}){
  if(value===null||value===undefined||value===''){if(required)throw fail('INVALID_INPUT');return null;}
  const d=new Date(value);if(!Number.isFinite(d.getTime()))throw fail('INVALID_INPUT');return d.toISOString();
 }
 function bool(value){if(typeof value!=='boolean')throw fail('INVALID_INPUT');return value;}
 function pickupWindow(start,end){
  const s=timestamp(start),e=timestamp(end);
  if(s&&e&&Date.parse(e)<Date.parse(s))throw fail('INVALID_INPUT');
  return [s,e];
 }
 const rpc=(name,args={})=>request('/rest/v1/rpc/'+name,{method:'POST',body:args});
 async function trackedRpc(name,args,event,properties){const result=await rpc(name,args);track(event,properties);return result;}
 async function rpcRows(name,args={}){const data=await rpc(name,args);if(!Array.isArray(data))throw fail('INVALID_RESPONSE');return data;}
 const primaryKeys={"fk_stories":["id"],"fk_story_reports":["id"],"fk_blocks":["user_id","target_id"],"fk_communities":["id"],"fk_contribution_notices":["event_id","recipient_id"],"fk_conversation_invites":["conversation_id","user_id"],"fk_conversation_members":["conversation_id","user_id"],"fk_conversations":["id"],"fk_cooperation_activity":["id"],"fk_cooperation_chats":["cooperation_id"],"fk_cooperation_members":["cooperation_id","user_id"],"fk_cooperation_reads":["cooperation_id","user_id"],"fk_cooperation_updates":["id"],"fk_cooperations":["id"],"fk_decision_objections":["id"],"fk_economic_flow_roles":["flow_id","user_id","role"],"fk_economic_flows":["id"],"fk_meeting_budget_changes":["cooperation_id","version"],"fk_meeting_budget_notices":["cooperation_id","version","recipient_id"],"fk_meeting_budget_policies":["cooperation_id","version"],"fk_meeting_history":["id"],"fk_meeting_outcomes":["cooperation_id","version","user_id"],"fk_meeting_reminders":["cooperation_id","recipient_id","role"],"fk_meeting_repeats":["cooperation_id","version"],"fk_meeting_responses":["cooperation_id","version","user_id","role"],"fk_meeting_rooms":["cooperation_id","version"],"fk_meeting_terms":["cooperation_id","version"],"fk_memberships":["community_id","user_id"],"fk_message_reads":["message_id","user_id"],"fk_message_reports":["id"],"fk_messages":["id"],"fk_need_projects":["need_id"],"fk_need_responses":["cooperation_id","user_id"],"fk_posts":["id"],"fk_profiles":["id"],"fk_project_budget_events":["id"],"fk_project_budget_needs":["id"],"fk_project_contributions":["id"],"fk_project_decision_responses":["decision_id","user_id"],"fk_project_decisions":["id"],"fk_project_document_consents":["document_id","revision","user_id"],"fk_project_document_versions":["document_id","revision"],"fk_project_expenses":["id"],"fk_project_tasks":["id"],"fk_project_welcome":["cooperation_id"],"fk_purchase_commitments":["cooperation_id","user_id"],"fk_purchase_confirmations":["cooperation_id","user_id"],"fk_purchase_offer_choice":["cooperation_id"],"fk_purchase_offer_reports":["id"],"fk_purchase_offers":["id"],"fk_purchase_process":["cooperation_id"],"fk_reports":["id"],"fk_room_notification_reads":["request_id","user_id"],"fk_room_request_versions":["request_id","revision"],"fk_room_requests":["id"],"fk_task_bases":["task_id","revision"],"fk_task_basis_signers":["id"],"fk_task_work_events":["task_id","revision"]};
 async function pagedRows(path,cap=10000){
  const pagingUser=user()?.id,pagingEpoch=epoch;
  const [table,query='']=path.split('?'),params=new URL('https://pagination.invalid/?'+query).searchParams,keys=primaryKeys[table];
  if(!keys)throw fail('INVALID_INPUT');
  const limit=Math.min(Number(params.get('limit')||500),1000);
  const order=(params.get('order')||'').split(',').filter(Boolean);
  for(const key of keys)if(!order.some(x=>x.split('.')[0]===key))order.push(key+'.asc');
  params.set('order',order.join(','));params.set('limit',String(limit));
  const result=[],seen=new Set();let total=null,coverage='unknown',pages=0;
  while(result.length<cap){
   params.set('offset',String(result.length));
   const page=await request('/rest/v1/'+table+'?'+params,{withCount:true});pages++;
   if(epoch!==pagingEpoch||user()?.id!==pagingUser)throw fail('STALE');
   if(!Array.isArray(page.records)||page.records.length>limit)throw fail('INVALID_RESPONSE');
   if(pages>1&&page.total!==total)throw fail('DATA_CHANGED');
   total=page.total;
   for(const row of page.records){
    if(keys.every(k=>row[k]!==undefined)){const key=JSON.stringify(keys.map(k=>row[k]));if(seen.has(key))throw fail('DATA_CHANGED');seen.add(key);}
    result.push(row);
   }
   if(total===null)break;
   if(result.length>total)throw fail('DATA_CHANGED');
   if(result.length===total){coverage='visible-query-complete';break;}
   if(!page.records.length)throw fail('INVALID_RESPONSE');
   coverage='truncated';
  }
  if(coverage!=='visible-query-complete')coverageWarnings.add(table);
  Object.defineProperty(result,'coverage',{value:{collection:table,returned:result.length,requestedLimit:limit,visibleTotal:total,coverage,pages},enumerable:false});
  return result;
 }
 async function rows(path){
  // Message/history cursors and the small recent-home preview own their pagination.
  if(path.startsWith('fk_messages?')||path.startsWith('fk_meeting_history?')||path.startsWith('fk_posts?')&&!path.includes('community_id=eq.')){
   const data=await request('/rest/v1/'+path);if(!Array.isArray(data))throw fail('INVALID_RESPONSE');return data;
  }
  return pagedRows(path);
 }
 return Object.freeze({
  takeCoverageWarnings(){const warnings=[...coverageWarnings];coverageWarnings.clear();return warnings;},
  enabled:!!cfg,googleOAuthEnabled:!!cfg?.googleOAuthEnabled,policy:POLICY,user,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  googleOAuthUrl(){
   if(!cfg?.googleOAuthEnabled)throw fail('DISABLED');
   const u=new URL(cfg.url+'/auth/v1/authorize');u.searchParams.set('provider','google');u.searchParams.set('redirect_to',cfg.oauthRedirectUrl);return u.href;
  },
  async completeOAuth(accessToken,expiresIn,inviteCode='',acceptance,refreshToken){
   if(typeof accessToken!=='string'||accessToken.length<20||accessToken.length>12000)throw fail('INVALID_INPUT');
   const seconds=Number(expiresIn);if(!Number.isFinite(seconds)||seconds<=0||seconds>86400)throw fail('INVALID_INPUT');
   const invite=text(inviteCode,120),policy=policyAcceptance(acceptance),attempt=++authAttempt;
   if(cfg.serverSession)return establish(accessToken,refreshToken,invite,acceptance,attempt);
   const who=await request('/auth/v1/user',{auth:false,token:accessToken});
   if(attempt!==authAttempt)throw fail('STALE');
   session={id:id(who?.id),token:accessToken,expiresAt:clock()+seconds*1000};
   try{await rpc('fk_claim_pilot_invite',{p_code:invite,...policy});}catch(e){clear();throw e;}
   analyticsIdentify(session.id);track('pilot_session_started');notify();return user();
  },
  async inspectEmailLink(accessToken){
   if(typeof accessToken!=='string'||accessToken.length<20||accessToken.length>12000)throw fail('INVALID_INPUT');
   const who=await request('/auth/v1/user',{auth:false,token:accessToken});
   id(who?.id);if(typeof who.email!=='string'||!who.email_confirmed_at)throw fail('AUTH_REQUIRED');
   return {id:who.id,email:who.email};
  },
  async requestCode(email){text(email,254,3);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw fail('INVALID_INPUT');try{await request('/auth/v1/otp'+(cfg?.emailRedirectUrl?'?redirect_to='+encodeURIComponent(cfg.emailRedirectUrl):''),{method:'POST',auth:false,body:{email,create_user:true}});}catch(e){if(['NETWORK','REQUEST_FAILED','INVALID_RESPONSE'].includes(e.code))throw fail('EMAIL_DELIVERY_UNKNOWN');throw e;}},
  async verify(email,code,inviteCode='',acceptance){
   text(email,254,3);if(!/^\d{6,10}$/.test(code))throw fail('INVALID_INPUT');
   const invite=text(inviteCode,120),policy=policyAcceptance(acceptance);
   const attempt=++authAttempt;
   const result=await request('/auth/v1/verify',{method:'POST',auth:false,body:{email,token:code,type:'email'}});
   if(attempt!==authAttempt)throw fail('STALE');
   if(!result||typeof result.access_token!=='string'||!result.access_token||!Number.isFinite(result.expires_in)||result.expires_in<=0)throw fail('INVALID_RESPONSE');
   if(cfg.serverSession)return establish(result.access_token,result.refresh_token,invite,acceptance,attempt);
   // Ask Auth instead of trusting localStorage or decoded JWT claims.
   const who=await request('/auth/v1/user',{auth:false,token:result.access_token});
   if(attempt!==authAttempt)throw fail('STALE');
   session={id:id(who?.id),token:result.access_token,expiresAt:clock()+result.expires_in*1000};
   try{await rpc('fk_claim_pilot_invite',{p_code:invite,...policy});}catch(e){clear();throw e;}
   analyticsIdentify(session.id);track('pilot_session_started');notify();return user();
  },
  async restore(){
   if(!cfg?.serverSession)return null;const attempt=++authAttempt;
   try{const result=await serverSession('GET');if(attempt!==authAttempt)throw fail('STALE');session={id:id(result.id),expiresAt:result.expiresAt};notify();return user();}
   catch(e){if(attempt!==authAttempt)throw fail('STALE');if(e.code==='AUTH_REQUIRED'){clear('expired');return null;}throw e;}
  },
  async logout({allDevices=false}={}){bool(allDevices);const token=session?.token;clear('signed-out');signalExit();if(cfg?.serverSession){await serverSession('DELETE',undefined,allDevices);signalExit();return;}if(token)await request('/auth/v1/logout?scope='+(allDevices?'global':'local'),{method:'POST',auth:false,token});},
  stories(){return rpcRows('fk_story_feed');},
  story(story){return rows('fk_stories?id=eq.'+id(story)+'&limit=1');},
  storyArchive(){return rows('fk_stories?author_id=eq.'+id(user()?.id)+'&order=created_at.desc,id.desc&limit=100');},
  publishStory(v){if(!['teal','plum','blue'].includes(v.tone)||!['network','project'].includes(v.audience)||v.audience==='project'&&!v.cooperation)throw fail('INVALID_INPUT');return rpc('fk_publish_story',{p_id:id(v.id),p_body:text(v.body,500,1),p_tone:v.tone,p_audience:v.audience,p_cooperation:v.cooperation?id(v.cooperation):null});},
  withdrawStory(story){return rpc('fk_withdraw_story',{p_story:id(story)});},
  reportStory(story){return rpc('fk_report_story',{p_story:id(story),p_reason:'other'});},
  publicPage(uid){return request('/rest/v1/fk_public_pages?select=id,content&id=eq.'+id(uid)+'&limit=1',{auth:false});},
  myPublicPage(){return rpc('fk_my_public_page');},
  savePublicPage(p){return rpc('fk_save_public_page',{p_revision:integer(p.revision,0,2147483646),p_published:bool(p.published),p_content:p.content,p_visible:p.visible});},
  profile(){return rows('fk_profiles?select=id,name,skills,about,listed&id=eq.'+id(user()?.id));},
  saveProfile(p){if(typeof p.listed!=='boolean')throw fail('INVALID_INPUT');return rpc('fk_save_profile',{p_name:text(p.name,60,1),p_skills:text(p.skills,200),p_about:text(p.about,600),p_listed:p.listed});},
  directory(){return rows('fk_profiles?select=id,name,skills,about&listed=eq.true&order=name.asc&limit=100');},
  communities(){return rows('fk_communities?select=id,owner_id,name,description&order=created_at.desc&limit=100');},
  memberships(){return rows('fk_memberships?select=community_id,user_id,banned&limit=100');},
  createCommunity(name,description){return rpc('fk_create_community',{p_name:text(name,80,2),p_description:text(description,1000)});},
  join(cid){return rpc('fk_join',{p_community:id(cid)});},leave(cid){return rpc('fk_leave',{p_community:id(cid)});},
  posts(cid){return rows('fk_posts?select=id,community_id,author_id,body,created_at&community_id=eq.'+id(cid)+'&order=created_at.desc&limit=50');},
  homePosts(){return rows('fk_posts?select=id,community_id,author_id,body,created_at&order=created_at.desc&limit=30');},
  publish(cid,body){return rpc('fk_publish',{p_community:id(cid),p_body:text(body,3000,1)});},
  deletePost(pid){return rpc('fk_delete_post',{p_post:id(pid)});},
  ban(cid,uid){return rpc('fk_ban',{p_community:id(cid),p_user:id(uid)});},
  block(uid,blocked=true){return rpc('fk_block',{p_user:id(uid),p_blocked:blocked===true});},
  blocks(){return rows('fk_blocks?select=target_id&limit=100');},
  report(pid,reason){return rpc('fk_report',{p_post:id(pid),p_reason:text(reason,1000,2)});},
  deleteCommunity(cid){return rpc('fk_delete_community',{p_community:id(cid)});},
  visibleProfiles(){return rows('fk_profiles?select=id,name,skills,about,listed&order=name.asc&limit=200');},
  chats(){return rows('fk_conversations?select=id,kind,owner_id,title,created_at&order=created_at.desc&limit=100');},
  chatMembers(){return rows('fk_conversation_members?select=conversation_id,user_id,role,joined_at,last_read_at&limit=500');},
  chatInvites(){return rows('fk_conversation_invites?select=conversation_id,user_id,invited_by,created_at&order=created_at.desc&limit=100');},
  async chatMessages(cid){return (await messagePage(cid)).messages;},
  async chatMessageContext(cid,mid){
   const anchors=await rows('fk_messages?select=id,conversation_id,author_id,body,created_at&conversation_id=eq.'+id(cid)+'&id=eq.'+id(mid));
   if(anchors.length!==1)throw fail('DENIED');const anchor=anchors[0];
   const page=await messagePage(cid,anchor);const messages=[...page.messages.slice(-99),anchor];
   return {messages,hasMore:page.hasMore||page.messages.length>99,before:{id:messages[0].id,created_at:messages[0].created_at}};
  },
  chatMessagePage(cid,before=null){return messagePage(cid,before);},
  startDirect(uid){return rpc('fk_start_direct',{p_other:id(uid)});},
  createGroupChat(title,members){return rpc('fk_create_group_chat',{p_title:text(title,80,2),p_members:idList(members)});},
  inviteChat(cid,uid){return rpc('fk_invite_chat',{p_conversation:id(cid),p_user:id(uid)});},
  acceptChat(cid){return rpc('fk_accept_chat_invite',{p_conversation:id(cid)});},
  declineChat(cid){return rpc('fk_decline_chat_invite',{p_conversation:id(cid)});},
  leaveChat(cid){return rpc('fk_leave_chat',{p_conversation:id(cid)});},
  removeChatMember(cid,uid){return rpc('fk_remove_chat_member',{p_conversation:id(cid),p_user:id(uid)});},
  sendMessage(cid,body){
   cid=id(cid);body=text(body,4000,1);const key=JSON.stringify([user()?.id,cid,body]);
   let command=pendingMessages.get(key);if(!command){command=globalThis.crypto.randomUUID();pendingMessages.set(key,command);}
   return rpc('fk_send_message_once',{p_conversation:cid,p_body:body,p_command:command}).then(result=>{pendingMessages.delete(key);return result;}).catch(e=>{if(['NETWORK','REQUEST_FAILED'].includes(e.code))throw fail('MESSAGE_UNCONFIRMED');throw e;});
  },
  async searchAccount(query,after=''){
   const records=await rpcRows('fk_search_account',{p_query:text(query,160,2),p_after:text(after,200)});
   if(records.length>51)throw fail('INVALID_RESPONSE');
   return {rows:records.slice(0,50),hasMore:records.length>50,after:records.slice(0,50).at(-1)?.key||''};
  },
  markChatRead(cid,messages){return rpc('fk_mark_messages_read',{p_conversation:id(cid),p_messages:idList(messages,100)});},
  deleteMessage(mid){return rpc('fk_delete_message',{p_message:id(mid)});},
  reportMessage(mid,reason){return rpc('fk_report_message',{p_message:id(mid),p_reason:text(reason,1000,2)});},
  deleteChat(cid){return rpc('fk_delete_chat',{p_conversation:id(cid)});},
  cooperations(){return rows('fk_cooperations?select=id,owner_id,kind,title,description,location_text,status,target_quantity,unit,created_at,updated_at&order=created_at.desc&limit=200');},
  cooperationMembers(){return rows('fk_cooperation_members?select=cooperation_id,user_id,role,joined_at&limit=1000');},
  meetingActionInbox(){return rpcRows('fk_meeting_action_inbox');},
  meetingRoomAlerts(){return rpcRows('fk_meeting_room_alerts');},
  meetingReminderInbox(){return rpcRows('fk_meeting_reminder_inbox');},
  async meetingHistory(cid,before){const result=await rows('fk_meeting_history?cooperation_id=eq.'+id(cid)+(before?'&id=lt.'+integer(before,1,Number.MAX_SAFE_INTEGER):'')+'&order=id.desc&limit=101');const page=result.slice(0,100);return {rows:page,more:result.length>100,cursor:page.at(-1)?.id};},
  async meetingReminderLog(cid){const result=await rows('fk_meeting_reminders?cooperation_id=eq.'+id(cid)+'&order=sent_at.desc,recipient_id.asc,role.asc&limit=1000');return {rows:result,possiblyTruncated:result.length===1000};},
  sendMeetingReminder(cid,v,recipient,role){if(!['attendee','facilitator','opener'].includes(role))throw fail('INVALID_INPUT');return rpc('fk_send_meeting_reminder',{p_project:id(cid),p_version:integer(v,1,1000),p_recipient:id(recipient),p_role:role});},
  meetingSnapshot(cid){return rpc('fk_meeting_ready_snapshot',{p_cooperation:id(cid)});},
  bindMeetingRoom(cid,version,request,revision){return rpc('fk_bind_meeting_room',{p_project:id(cid),p_version:integer(version,1,999),p_request:id(request),p_revision:integer(revision,1,100)});},
  meetingOutcomeSnapshot(cid){return rpc('fk_meeting_outcome_snapshot',{p_cooperation:id(cid)});},
  reportMeetingOutcome(cid,version,result,note=''){if(!['held','not_held','postponed','unsure','withdrawn'].includes(result))throw fail('INVALID_INPUT');return rpc('fk_report_meeting_outcome',{p_cooperation:id(cid),p_version:integer(version,1,1000),p_result:result,p_note:text(note,500)});},
  repeatMeeting(cid,v){return rpc('fk_repeat_meeting',{p_cooperation:id(cid),p_version:integer(v.version,1,1000),p_starts_at:timestamp(v.startsAt,{required:true}),p_ends_at:timestamp(v.endsAt,{required:true})});},
  saveMeetingTerms(cid,v){return rpc('fk_save_meeting_terms',{p_cooperation:id(cid),p_expected_version:integer(v.version,0,999),p_starts_at:timestamp(v.startsAt,{required:true}),p_ends_at:timestamp(v.endsAt,{required:true}),p_place:text(v.place,200,1),p_conditions:text(v.conditions||'',1000),p_minimum:integer(v.minimum,1,100),p_capacity:integer(v.capacity,1,100),p_facilitator:v.facilitator?id(v.facilitator):null,p_opener:v.opener?id(v.opener):null});},
  respondMeeting(cid,version,role,confirmed){if(!['attendee','facilitator','opener'].includes(role))throw fail('INVALID_INPUT');return rpc('fk_respond_meeting',{p_cooperation:id(cid),p_version:integer(version,1,1000),p_role:role,p_confirm:bool(confirmed)});},
  cooperationUpdates(cid){return rows('fk_cooperation_updates?select=id,cooperation_id,author_id,body,created_at&cooperation_id=eq.'+id(cid)+'&order=created_at.asc&limit=100');},
  meetingBudgetNotices(){return rpc('fk_meeting_budget_notice_inbox');},
  readMeetingBudgetNotice(cid,version){return rpc('fk_read_meeting_budget_notice',{p_project:id(cid),p_version:integer(version,1,1000)});},
  contributionNotices(){return rpc('fk_contribution_notice_inbox');},
  readContributionNotice(event){return rpc('fk_read_contribution_notice',{p_event:id(event)});},
  saveMeetingBudget(cid,version,requirements){
   if(!Array.isArray(requirements)||requirements.length>100)throw fail('INVALID_INPUT');
   const selected=requirements.map(r=>{if(!['promise','receipt'].includes(r.mode))throw fail('INVALID_INPUT');return {need:id(r.need),mode:r.mode};});
   return rpc('fk_save_meeting_budget',{p_project:id(cid),p_version:integer(version,1,999),p_requirements:selected});
  },
  projectBudget(cid){return rpc('fk_project_budget_snapshot',{p_project:id(cid)});},
  budgetAction(cid,requestId,action,v){
   const payload={};
   if(!['need','pledge','expense','cancel_need','void_expense','submit','confirm','return','withdraw','reopen'].includes(action))throw fail('INVALID_INPUT');
   if(['need','pledge','expense'].includes(action))payload.amount=integer(v.amount,1,100000000);
   if(action==='need'){if(!['money','items','time','space'].includes(v.kind))throw fail('INVALID_INPUT');payload.kind=v.kind;payload.title=text(v.title,160,2);}
   if(['pledge','expense','cancel_need'].includes(action))payload.need=id(v.need);
   if(action==='void_expense')payload.expense=id(v.expense);
   if(['submit','confirm','return','withdraw','reopen'].includes(action)){payload.contribution=id(v.contribution);payload.revision=integer(v.revision,1,2147483646);}
   if(['expense','void_expense','return','reopen'].includes(action))payload.note=text(v.note,500,2);
   return rpc('fk_project_budget_action',{p_project:id(cid),p_id:id(requestId),p_action:action,p_data:payload});
  },
  async projectWelcomes(){const result=await rows('fk_project_welcome?select=*&order=cooperation_id&limit=501');if(result.length>500)throw fail('INVALID_RESPONSE');return result;},
  saveProjectWelcome(cid,v){return rpc('fk_save_project_welcome',{p_project:id(cid),p_revision:integer(v.revision,0,2147483646),p_enabled:bool(v.enabled),p_name:v.enabled?text(v.name,60,1):'',p_instructions:v.enabled?text(v.instructions,1000,10):''});},
  projectTasks(cid){return rows('fk_project_tasks?select=*&cooperation_id=eq.'+id(cid)+'&order=created_at.asc&limit=200');},
  projectDocuments(cid){return rpcRows('fk_project_documents',{p_project:id(cid)});},
  taskBases(cid){return rpcRows('fk_task_bases_snapshot',{p_project:id(cid)});},
  taskBasisNotifications(){return rpcRows('fk_task_basis_notifications');},
  saveTaskBasis(v){const [document,revision]=String(v.document||'').split(':');return rpc('fk_save_task_basis',{p_task:id(v.task),p_revision:integer(v.revision,0,99),p_decision:id(v.decision),p_document:id(document),p_document_revision:integer(revision,1,50),p_signers:idList(v.signers,50)});},
  respondTaskBasis(task,revision,confirmed){return rpc('fk_respond_task_basis',{p_task:id(task),p_revision:integer(revision,1,100),p_confirm:bool(confirmed)});},
  documentRevisionNotifications(){return rpcRows('fk_document_revision_notifications');},
  async documentConsents(cid){const result=await rows('fk_project_document_consents?cooperation_id=eq.'+id(cid)+'&order=document_id.asc,revision.desc,user_id.asc&limit=1001');if(result.length>1000)throw fail('INVALID_RESPONSE');return result;},
  respondDocument(document,revision,confirmed){return rpc('fk_respond_project_document',{p_document:id(document),p_revision:integer(revision,1,50),p_confirm:bool(confirmed)});},
  documentHistory(document){return rows('fk_project_document_versions?document_id=eq.'+id(document)+'&order=revision.desc&limit=50');},
  saveProjectDocument(cid,v){if(!['rules','estimate','report'].includes(v.kind))throw fail('INVALID_INPUT');return rpc('fk_save_project_document',{p_id:id(v.id),p_project:id(cid),p_revision:integer(v.revision,0,49),p_kind:v.kind,p_title:text(v.title,160,2),p_body:text(v.body,12000,2),p_decision:v.decision?id(v.decision):null,p_tasks:v.tasks?.length?idList(v.tasks,20):[]});},
  async projectDecisions(cid){const project=id(cid);const [decisions,responses]=await Promise.all([
   rows('fk_project_decisions?select=*&cooperation_id=eq.'+project+'&order=created_at.asc&limit=50'),
   rows('fk_project_decision_responses?select=*&cooperation_id=eq.'+project+'&order=decision_id.asc,user_id.asc&limit=1000')
  ]);if(responses.length>=1000)throw fail('INVALID_RESPONSE');
   const objections=decisions.length?await rows('fk_decision_objections?select=*&decision_id=in.('+decisions.map(d=>id(d.id)).join(',')+')&order=id&limit=1000'):[];
   if(objections.length>=1000)throw fail('INVALID_RESPONSE');return {decisions,responses,objections};},
  proposeProjectDecision(cid,v){if(!Array.isArray(v.options)||v.options.length<2||v.options.length>6)throw fail('INVALID_INPUT');return rpc('fk_propose_decision_rules',{p_id:id(v.id),p_cooperation:id(cid),p_question:text(v.question,160,2),p_purpose:text(v.purpose,1000,2),p_options:v.options.map(s=>text(s,160,1)),p_closes_at:timestamp(v.closesAt,{required:true}),p_decide_by:timestamp(v.decideBy,{required:true})});},
  saveDecisionObjection(v){return rpc('fk_save_decision_objection',{p_id:id(v.id),p_decision:id(v.decision),p_revision:integer(v.revision,0,2147483646),p_body:v.withdraw?'':text(v.body,1000,2),p_withdraw:bool(v.withdraw)});},
  answerDecisionObjection(v){if(!['accepted','declined'].includes(v.disposition))throw fail('INVALID_INPUT');return rpc('fk_answer_decision_objection',{p_id:id(v.id),p_revision:integer(v.revision,1,2147483646),p_disposition:v.disposition,p_reply:text(v.reply,1000,2)});},
  respondProjectDecision(decision,option,note){if(option==='')throw fail('INVALID_INPUT');return rpc('fk_respond_project_decision',{p_decision:id(decision),p_option:option===null?null:integer(option,0,5),p_note:text(note||'',500)});},
  finishProjectDecision(decision,v){if(v.option===''||v.option===null||!Array.isArray(v.tasks)||v.tasks.length<1||v.tasks.length>10)throw fail('INVALID_INPUT');return rpc('fk_finish_project_decision',{p_decision:id(decision),p_option:integer(v.option,0,5),p_rationale:text(v.rationale,1000,2),p_tasks:v.tasks.map(s=>text(s,160,2))});},
  purchaseCommitments(cid){return rows('fk_purchase_commitments?select=cooperation_id,user_id,quantity,note,updated_at&cooperation_id=eq.'+id(cid)+'&limit=200');},
  economicFlows(cid){return rows('fk_economic_flows?select=id,cooperation_id,kind,stage,summary,created_by,created_at,updated_at&cooperation_id=eq.'+id(cid)+'&order=created_at.desc&limit=100');},
  economicFlowRoles(flowIds){if(!Array.isArray(flowIds)||!flowIds.length)return Promise.resolve([]);const ids=idList(flowIds,100);return rows('fk_economic_flow_roles?select=flow_id,user_id,role,created_at&flow_id=in.('+ids.join(',')+')&order=created_at.asc&limit=600');},
  createEconomicFlow(cid,v){return rpc('fk_create_economic_flow',{p_cooperation:id(cid),p_kind:economicKind(v.kind),p_summary:text(v.summary,500,1)});},
  updateEconomicFlow(fid,v){return rpc('fk_update_economic_flow',{p_flow:id(fid),p_stage:economicStage(v.stage),p_summary:text(v.summary,500,1)});},
  deleteEconomicFlow(fid){return rpc('fk_delete_economic_flow',{p_flow:id(fid)});},
  addEconomicFlowRole(fid,uid,role){return rpc('fk_add_economic_flow_role',{p_flow:id(fid),p_user:id(uid),p_role:economicRole(role)});},
  removeEconomicFlowRole(fid,uid,role){return rpc('fk_remove_economic_flow_role',{p_flow:id(fid),p_user:id(uid),p_role:economicRole(role)});},
  createCooperation(v){const k=kind(v.kind);const target=k==='purchase'?quantity(v.targetQuantity):null;const unit=k==='purchase'?text(v.unit,30,1):'';return trackedRpc('fk_create_cooperation',{p_kind:k,p_title:text(v.title,120,2),p_description:text(v.description||'',3000),p_location:text(v.location||'',120),p_target_quantity:target,p_unit:unit},'cooperation_created',{cooperation_kind:k});},
  joinCooperation(cid){return trackedRpc('fk_join_cooperation',{p_cooperation:id(cid)},'cooperation_joined');},
  leaveCooperation(cid){return rpc('fk_leave_cooperation',{p_cooperation:id(cid)});},
  updateCooperation(cid,v){const k=kind(v.kind),next=status(v.status);const target=k==='purchase'?quantity(v.targetQuantity):null;const unit=k==='purchase'?text(v.unit,30,1):'';const args={p_cooperation:id(cid),p_title:text(v.title,120,2),p_description:text(v.description||'',3000),p_location:text(v.location||'',120),p_status:next,p_target_quantity:target,p_unit:unit};return next==='done'?trackedRpc('fk_update_cooperation',args,'cooperation_completed'):rpc('fk_update_cooperation',args);},
  removeCooperationMember(cid,uid){return rpc('fk_remove_cooperation_member',{p_cooperation:id(cid),p_user:id(uid)});},
  deleteCooperation(cid){return rpc('fk_delete_cooperation',{p_cooperation:id(cid)});},
  addCooperationUpdate(cid,body){return rpc('fk_add_cooperation_update',{p_cooperation:id(cid),p_body:text(body,3000,1)});},
  deleteCooperationUpdate(uid){return rpc('fk_delete_cooperation_update',{p_update:id(uid)});},
  createProjectTask(cid,v){return rpc('fk_create_project_task',{p_cooperation:id(cid),p_title:text(v.title,160,1),p_details:text(v.details||'',2000),p_assignee:v.assignee?id(v.assignee):null});},
  setProjectTaskStatus(tid,value){const next=taskStatus(value),args={p_task:id(tid),p_status:next};return next==='done'?trackedRpc('fk_set_project_task_status',args,'project_task_completed'):rpc('fk_set_project_task_status',args);},
  taskWorkAction(tid,revision,action,note=''){
   if(!['claim','release','submit','approve','changes'].includes(action))throw fail('INVALID_INPUT');
   const args={p_task:id(tid),p_revision:integer(revision,0,2147483647),p_action:action,p_note:text(note,action==='submit'?2000:1000,['submit','changes'].includes(action)?2:0)};
   return rpc('fk_task_work_action',args);
  },
  assignProjectTask(tid,uid){return rpc('fk_assign_project_task',{p_task:id(tid),p_assignee:uid?id(uid):null});},
  deleteProjectTask(tid){return rpc('fk_delete_project_task',{p_task:id(tid)});},
  setPurchaseCommitment(cid,value,note=''){return rpc('fk_set_purchase_commitment',{p_cooperation:id(cid),p_quantity:quantity(value,{allowZero:true}),p_note:text(note,500)});},
  purchaseOffers(cid){return rows('fk_purchase_offers?select=id,cooperation_id,provider_id,unit_price,currency,min_quantity,available_quantity,delivery_mode,delivery_fee,lead_time_days,valid_until,note,created_at,updated_at&cooperation_id=eq.'+id(cid)+'&withdrawn_at=is.null&order=unit_price.asc&limit=100');},
  purchaseChoice(cid){return rows('fk_purchase_offer_choice?select=cooperation_id,offer_id,selected_by,selected_at&cooperation_id=eq.'+id(cid)+'&limit=1');},
  savePurchaseOffer(cid,v){const mode=deliveryMode(v.deliveryMode);const fee=mode==='pickup'?0:quantity(v.deliveryFee??0,{allowZero:true});return rpc('fk_save_purchase_offer',{p_cooperation:id(cid),p_unit_price:quantity(v.unitPrice),p_currency:currency(v.currency),p_min_quantity:quantity(v.minQuantity),p_available_quantity:(v.availableQuantity===null||v.availableQuantity===undefined||v.availableQuantity==='')?null:quantity(v.availableQuantity),p_delivery_mode:mode,p_delivery_fee:fee,p_lead_time_days:integer(v.leadTimeDays??0,0,365),p_valid_until:optionalDate(v.validUntil),p_note:text(v.note||'',1000)});},
  withdrawPurchaseOffer(cid){return rpc('fk_withdraw_purchase_offer',{p_cooperation:id(cid)});},
  choosePurchaseOffer(cid,offerId){return rpc('fk_choose_purchase_offer',{p_cooperation:id(cid),p_offer:offerId?id(offerId):null});},
  reportPurchaseOffer(offerId,reason){return rpc('fk_report_purchase_offer',{p_offer:id(offerId),p_reason:text(reason,1000,2)});},
  cooperationChats(){return rows('fk_cooperation_chats?select=cooperation_id,conversation_id,created_at&limit=500');},
  cooperationActivity(cid){return rows('fk_cooperation_activity?select=id,cooperation_id,actor_id,subject_id,event_type,label,created_at&cooperation_id=eq.'+id(cid)+'&order=created_at.desc&limit=100');},
  markCooperationRead(cid){return rpc('fk_mark_cooperation_read',{p_cooperation:id(cid)});},
  chatInbox(){return rpcRows('fk_chat_inbox');},
  activityInbox(){return rpcRows('fk_activity_inbox');},
  taskActionInbox(){return rpcRows('fk_task_action_inbox');},
  roomNotificationInbox(){return rpcRows('fk_room_notification_inbox');},
  readRoomNotifications(request,revision){return rpc('fk_read_room_notifications',{p_request:id(request),p_revision:integer(revision,1,100)});},
  async sharedNeed(cid,isNeed){const key=id(cid);const [responses,links]=await Promise.all([
   isNeed?rows('fk_need_responses?select=cooperation_id,user_id,interested,can_help,preferences,updated_at&cooperation_id=eq.'+key+'&order=updated_at.asc,user_id.asc&limit=201'):Promise.resolve([]),
   rows('fk_need_projects?select=need_id,project_id,created_at&'+(isNeed?'need_id':'project_id')+'=eq.'+key+'&limit=1')
  ]);if(responses.length>200)throw fail('INVALID_RESPONSE');return {responses,links};},
  respondSharedNeed(cid,v){return rpc('fk_respond_shared_need',{p_need:id(cid),p_interested:bool(v.interested),p_can_help:bool(v.can_help),p_preferences:text(v.preferences||'',500)});},
  projectFromNeed(cid){return rpc('fk_project_from_need',{p_need:id(cid)});},
  async roomRequests(cid,isResource){const result=await rows('fk_room_requests?select=*&'+(isResource?'resource_id':'project_id')+'=eq.'+id(cid)+'&order=updated_at.desc,id.asc&limit=201');if(result.length>200)throw fail('INVALID_RESPONSE');return result;},
  roomRequestAction(v,action){
   if(!['request','offer','accept','decline','cancel'].includes(action))throw fail('INVALID_INPUT');
   const edit=['request','offer'].includes(action);
   return rpc('fk_room_request_action',{p_id:id(v.id),p_project:id(v.project),p_resource:id(v.resource),p_revision:integer(v.revision,0,100),p_action:action,
    p_start:edit?timestamp(v.start,{required:true}):null,p_end:edit?timestamp(v.end,{required:true}):null,p_people:edit?integer(v.people,1,200):null,
    p_note:edit?text(v.note,1000,2):null,p_expires:action==='offer'?timestamp(v.expires,{required:true}):null});
  },
  async taskWorkHistory(tid,before=null){
   const result=await rows('fk_task_work_events?select=task_id,revision,actor_id,action,note,created_at&task_id=eq.'+id(tid)+(before===null?'':'&revision=lt.'+integer(before,1,2147483647))+'&order=revision.desc&limit=51');
   return {rows:result.slice(0,50),more:result.length>50};
  },
  myTaskResults(){const uid=id(user()?.id);return rows('fk_project_tasks?select=id,cooperation_id,assignee_id,title,work_stage,reviewed_by,reviewed_at&assignee_id=eq.'+uid+'&work_stage=eq.verified&order=reviewed_at.desc,id.asc&limit=100');},
  assignedTasks(){const uid=id(user()?.id);return rows('fk_project_tasks?select=id,cooperation_id,creator_id,assignee_id,title,details,status,created_at,updated_at&assignee_id=eq.'+uid+'&status=neq.done&order=updated_at.desc&limit=100');},
  myPurchaseConfirmations(){const uid=id(user()?.id);return rows('fk_purchase_confirmations?select=cooperation_id,user_id,quantity,decision,note,decided_at,collected_at,collected_note,updated_at&user_id=eq.'+uid+'&limit=200');},
  purchaseProcesses(){return rows('fk_purchase_process?select=cooperation_id,stage,confirmation_deadline,external_order_reference,ordered_at,expected_delivery_at,delivery_note,delivered_at,pickup_place,pickup_start,pickup_end,result_note,finished_at,updated_at&limit=200');},
  purchaseProcess(cid){return rows('fk_purchase_process?select=cooperation_id,stage,confirmation_deadline,external_order_reference,ordered_at,expected_delivery_at,delivery_note,delivered_at,pickup_place,pickup_start,pickup_end,result_note,finished_at,updated_at&cooperation_id=eq.'+id(cid)+'&limit=1');},
  purchaseConfirmations(cid){return rows('fk_purchase_confirmations?select=cooperation_id,user_id,quantity,decision,note,decided_at,collected_at,collected_note,updated_at&cooperation_id=eq.'+id(cid)+'&limit=200');},
  startPurchaseConfirmation(cid,deadline){return rpc('fk_start_purchase_confirmation',{p_cooperation:id(cid),p_deadline:timestamp(deadline,{required:true})});},
  confirmPurchaseParticipation(cid,confirmed,note=''){const decision=bool(confirmed),args={p_cooperation:id(cid),p_confirm:decision,p_note:text(note,500)};return decision?trackedRpc('fk_confirm_purchase_participation',args,'purchase_participation_confirmed'):rpc('fk_confirm_purchase_participation',args);},
  resetPurchaseConfirmation(cid){return rpc('fk_reset_purchase_confirmation',{p_cooperation:id(cid)});},
  markPurchaseOrdered(cid,v={}){const [start,end]=pickupWindow(v.pickupStart,v.pickupEnd);return rpc('fk_mark_purchase_ordered',{p_cooperation:id(cid),p_reference:text(v.reference||'',120),p_expected_delivery:timestamp(v.expectedDelivery),p_note:text(v.note||'',1000),p_pickup_place:text(v.pickupPlace||'',200),p_pickup_start:start,p_pickup_end:end});},
  setPurchaseDeliveryPlan(cid,v={}){const [start,end]=pickupWindow(v.pickupStart,v.pickupEnd);return rpc('fk_set_purchase_delivery_plan',{p_cooperation:id(cid),p_expected_delivery:timestamp(v.expectedDelivery),p_note:text(v.note||'',1000),p_pickup_place:text(v.pickupPlace||'',200),p_pickup_start:start,p_pickup_end:end});},
  markPurchaseDelivered(cid,note=''){return rpc('fk_mark_purchase_delivered',{p_cooperation:id(cid),p_note:text(note,1000)});},
  markPurchaseCollected(cid,collected,note=''){return rpc('fk_mark_purchase_collected',{p_cooperation:id(cid),p_collected:bool(collected),p_note:text(note,500)});},
  finishPurchase(cid,note=''){return trackedRpc('fk_finish_purchase',{p_cooperation:id(cid),p_result_note:text(note,2000)},'purchase_completed');},
  cancelPurchase(cid,reason){return rpc('fk_cancel_purchase_process',{p_cooperation:id(cid),p_reason:text(reason,2000,3)});},
  deleteProfile(){return rpc('fk_delete_profile');},
  async exportOwn(){
   const uid=id(user()?.id),exportEpoch=epoch,startedAt=new Date(clock()).toISOString(),sections=[];
   const termFields=['cooperation_id','version','starts_at','ends_at','place','conditions','minimum_attendees','capacity','created_at'];
   // Traverse each visible query; not a privileged or atomic account archive.
   async function rows(path){
    const records=await pagedRows(path,100000);
    if(records.coverage.coverage==='truncated')throw fail('EXPORT_TOO_LARGE');
    sections.push(records.coverage);return records;
   }
   const [profile,memberships,posts,blocks,reports,chatMemberships,messages,messageReads,messageReports,chatInvites,cooperationMemberships,cooperationUpdates,tasks,commitments,purchaseOffers,purchaseOfferReports,purchaseConfirmations,economicFlows,economicFlowRoles,meetingResponses,meetingOutcomes,projectDecisions,decisionResponses,taskWorkEvents,needResponses,roomRequests,roomRequestVersions,roomNotificationReads]=await Promise.all([
   rows('fk_profiles?id=eq.'+uid),
   rows('fk_memberships?user_id=eq.'+uid),
   rows('fk_posts?author_id=eq.'+uid+'&order=created_at.desc&limit=1000'),
   rows('fk_blocks?user_id=eq.'+uid),
   rows('fk_reports?reporter_id=eq.'+uid+'&limit=1000'),
   rows('fk_conversation_members?user_id=eq.'+uid+'&limit=500'),
   rows('fk_messages?author_id=eq.'+uid+'&order=created_at.desc&limit=1000'),
   rows('fk_message_reads?user_id=eq.'+uid+'&order=read_at.desc&limit=1000'),
   rows('fk_message_reports?reporter_id=eq.'+uid+'&limit=1000'),
   rows('fk_conversation_invites?user_id=eq.'+uid+'&limit=500'),
   rows('fk_cooperation_members?user_id=eq.'+uid+'&limit=500'),
   rows('fk_cooperation_updates?author_id=eq.'+uid+'&order=created_at.desc&limit=1000'),
   rows('fk_project_tasks?or=(creator_id.eq.'+uid+',assignee_id.eq.'+uid+',reviewed_by.eq.'+uid+')&order=created_at.desc&limit=1000'),
   rows('fk_purchase_commitments?user_id=eq.'+uid+'&limit=500'),
   rows('fk_purchase_offers?provider_id=eq.'+uid+'&order=updated_at.desc&limit=500'),
   rows('fk_purchase_offer_reports?reporter_id=eq.'+uid+'&limit=500'),
   rows('fk_purchase_confirmations?user_id=eq.'+uid+'&limit=500'),
   rows('fk_economic_flows?created_by=eq.'+uid+'&order=created_at.desc&limit=500'),
   rows('fk_economic_flow_roles?user_id=eq.'+uid+'&order=created_at.desc&limit=500'),
   rows('fk_meeting_responses?user_id=eq.'+uid+'&order=responded_at.desc&limit=1000&select=*,terms:fk_meeting_terms('+termFields.join(',')+')'),
   rows('fk_meeting_outcomes?user_id=eq.'+uid+'&order=reported_at.desc&limit=1000'),
   rows('fk_project_decisions?or=(created_by.eq.'+uid+',decided_by.eq.'+uid+',decision_maker.eq.'+uid+')&order=created_at.desc&limit=1000'),
   rows('fk_project_decision_responses?user_id=eq.'+uid+'&order=updated_at.desc&limit=1000'),
   rows('fk_task_work_events?actor_id=eq.'+uid+'&order=created_at.desc&limit=1000'),
   rows('fk_need_responses?user_id=eq.'+uid+'&order=updated_at.desc&limit=1000'),
   rows('fk_room_requests?or=(requester_id.eq.'+uid+',resource_owner_id.eq.'+uid+')&order=updated_at.desc&limit=1000'),
   rows('fk_room_request_versions?actor_id=eq.'+uid+'&order=created_at.desc&limit=1000'),
   rows('fk_room_notification_reads?user_id=eq.'+uid+'&order=read_at.desc&limit=1000')
  ]);
   // A left embed retains the personal response even if related terms are no longer visible.
   // Never replace historical conditions with the project's current version.
   const missingTerms=new Map();let linkedResponses=0;
   for(const response of meetingResponses){
    if(response.user_id!==uid||!UUID.test(response.cooperation_id||'')||!Number.isInteger(response.version)||response.version<1)throw fail('INVALID_RESPONSE');
    const terms=response.terms;
    if(terms===null){missingTerms.set(response.cooperation_id+':'+response.version,{cooperation_id:response.cooperation_id,version:response.version});continue;}
    if(!terms||Array.isArray(terms)||terms.cooperation_id!==response.cooperation_id||terms.version!==response.version||termFields.some(key=>terms[key]===undefined))throw fail('INVALID_RESPONSE');
    response.terms=Object.fromEntries(termFields.map(key=>[key,terms[key]]));linkedResponses++;
   }
   const meetingTermsContext={scope:'Conditions for returned personal responses only; not a full historical agreement package',linkedResponses,missing:[...missingTerms.values()],fields:termFields};
   const meetingReminders=await rows('fk_meeting_reminders?or=(recipient_id.eq.'+uid+',sender_id.eq.'+uid+')&order=sent_at.desc&limit=1000');
   const meetingHistory=await rows('fk_meeting_history?or=(participant_id.eq.'+uid+',actor_id.eq.'+uid+')&order=id.desc&limit=1000');
   const projectDocumentVersions=await rows('fk_project_document_versions?or=(author_id.eq.'+uid+',editor_id.eq.'+uid+')&order=created_at.desc&limit=1000');
   const documentFields=['document_id','revision','cooperation_id','kind','title','body','decision_id','task_ids','created_at'];
   const documentConsents=await rows('fk_project_document_consents?user_id=eq.'+uid+'&order=responded_at.desc&limit=1000&select=*,document:fk_project_document_versions('+documentFields.join(',')+')');
   const missingDocuments=new Map();let linkedConsents=0;
   for(const consent of documentConsents){
    if(consent.user_id!==uid||!UUID.test(consent.document_id||'')||!UUID.test(consent.cooperation_id||'')||!Number.isInteger(consent.revision)||consent.revision<1)throw fail('INVALID_RESPONSE');
    const document=consent.document;
    if(document===null){missingDocuments.set(consent.document_id+':'+consent.revision,{document_id:consent.document_id,revision:consent.revision});continue;}
    if(!document||Array.isArray(document)||document.document_id!==consent.document_id||document.revision!==consent.revision||document.cooperation_id!==consent.cooperation_id||!['rules','estimate'].includes(document.kind)||documentFields.some(key=>document[key]===undefined))throw fail('INVALID_RESPONSE');
    consent.document=Object.fromEntries(documentFields.map(key=>[key,document[key]]));linkedConsents++;
   }
   const documentConsentContext={scope:'Exact versions for returned personal consents, including withdrawn consent; historical confirmation is not consent to newer versions',linkedConsents,missing:[...missingDocuments.values()],fields:documentFields};
   const taskBases=await rows('fk_task_bases?created_by=eq.'+uid+'&order=created_at.desc&limit=1000');
   const taskBasisSigners=await rows('fk_task_basis_signers?user_id=eq.'+uid+'&order=id.desc&limit=1000');
   const projectWelcomes=await rows('fk_project_welcome?host_id=eq.'+uid+'&order=updated_at.desc&limit=1000');
   const decisionObjections=await rows('fk_decision_objections?or=(author_id.eq.'+uid+',answered_by.eq.'+uid+')&order=updated_at.desc&limit=1000');
   const budgetNeeds=await rows('fk_project_budget_needs?created_by=eq.'+uid+'&order=created_at.desc&limit=1000');
   const contributions=await rows('fk_project_contributions?or=(contributor_id.eq.'+uid+',received_by.eq.'+uid+')&order=created_at.desc&limit=1000');
   const projectExpenses=await rows('fk_project_expenses?recorded_by=eq.'+uid+'&order=created_at.desc&limit=1000');
   const budgetEvents=await rows('fk_project_budget_events?actor_id=eq.'+uid+'&order=created_at.desc&limit=1000');
   const contributionNotices=await rows('fk_contribution_notices?recipient_id=eq.'+uid+'&order=event_id&limit=1000');
   const meetingBudgetPolicies=await rows('fk_meeting_budget_policies?author_id=eq.'+uid+'&order=created_at.desc&limit=1000');
   const meetingBudgetNotices=await rows('fk_meeting_budget_notices?recipient_id=eq.'+uid+'&order=cooperation_id,version&limit=1000');
   const stories=await rows('fk_stories?author_id=eq.'+uid+'&order=created_at.desc&limit=1000');
   const storyReports=await rows('fk_story_reports?reporter_id=eq.'+uid+'&order=created_at.desc&limit=1000');
   let publicPage=null;
   try{const page=await rpc('fk_my_public_page');if(page&&Number.isInteger(page.revision)&&page.content&&Array.isArray(page.visible))publicPage=page;}catch(error){if(['AUTH_REQUIRED','STALE','POLICY_REQUIRED','INVITE_REQUIRED'].includes(error.code))throw error;}
   sections.push({collection:'publicPage',visibleTotal:publicPage?(publicPage.revision?1:0):null,returned:publicPage?.revision?1:0,coverage:publicPage?'visible-query-complete':'unknown',pages:1});
   if(user()?.id!==uid||epoch!==exportEpoch)throw fail('STALE');
   const manifest={format:'folkoop-visible-records-v2',startedAt,finishedAt:new Date(clock()).toISOString(),
    completeAccountExport:false,atomicSnapshot:false,meetingTermsContext,documentConsentContext,sections:sections.sort((a,b)=>a.collection.localeCompare(b.collection)),
    excluded:['Auth identity and sessions','Private pilot admission and policy records','Local device drafts','Records outside the listed queries or current access permissions','Provider logs'],
    fullCopyContact:'Chup1runov@gmail.com'};
   return {stories,storyReports,publicPage,profile,memberships,posts,blocks,reports,chatMemberships,messages,messageReads,messageReports,chatInvites,cooperationMemberships,cooperationUpdates,tasks,commitments,purchaseOffers,purchaseOfferReports,purchaseConfirmations,economicFlows,economicFlowRoles,meetingResponses,meetingOutcomes,projectDecisions,decisionResponses,taskWorkEvents,needResponses,roomRequests,roomRequestVersions,roomNotificationReads,meetingReminders,meetingHistory,projectDocumentVersions,documentConsents,taskBases,taskBasisSigners,projectWelcomes,decisionObjections,budgetNeeds,contributions,projectExpenses,budgetEvents,contributionNotices,meetingBudgetPolicies,meetingBudgetNotices,manifest,scope:'Paginated visible records; see manifest coverage and exclusions. Request provider/private records from the operator.'};
  }
 });
}
globalThis.FolkoopNetwork=Object.freeze({client,configuration});
})();
