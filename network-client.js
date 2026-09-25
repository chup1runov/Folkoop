/* HTTP adapter for Supabase Auth + PostgREST. Tokens live in memory only.
   Server authorization is in the SQL migration, never in this UI adapter. */
(() => {
'use strict';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail=code=>Object.assign(new Error(code),{code});
function configuration(value){
 if(value?.enabled!==true)return null;
 let u;try{u=new URL(value.url);}catch{throw fail('CONFIG');}
 if(u.protocol!=='https:'||!/^\w{20}\.supabase\.co$/.test(u.hostname)||u.port||u.username||u.password||u.pathname!=='/'||u.search||u.hash||!/^sb_publishable_[A-Za-z0-9_-]{10,200}$/.test(value.publishableKey||''))throw fail('CONFIG');
 return {url:u.origin,key:value.publishableKey};
}
function client(value,{transport=globalThis.fetch?.bind(globalThis),clock=Date.now}={}){
 const cfg=configuration(value);let session=null,epoch=0,authAttempt=0;
 const controllers=new Set(),listeners=new Set();
 function notify(){for(const fn of listeners)fn(session?{id:session.id}:null);}
 function clear(){session=null;epoch++;authAttempt++;for(const c of controllers)c.abort();notify();}
 function user(){if(session&&session.expiresAt<=clock())clear();return session?{id:session.id}:null;}
 async function request(path,{method='GET',body,auth=true,token}={}){
  if(!cfg)throw fail('DISABLED');
  if(auth&&!user())throw fail('AUTH_REQUIRED');
  const version=epoch,controller=new AbortController();controllers.add(controller);
  const timer=setTimeout(()=>controller.abort(),12000);
  const headers={apikey:cfg.key,Accept:'application/json'};
  if(auth||token)headers.Authorization='Bearer '+(token||session.token);
  if(body!==undefined)headers['Content-Type']='application/json';
  try{
   const response=await transport(cfg.url+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',redirect:'error',signal:controller.signal});
   if(version!==epoch)throw fail('STALE');
   if(!response.ok){
    if(response.status===401){if(auth)clear();throw fail('AUTH_REQUIRED');}
    throw fail(response.status===429?'RATE_LIMIT':response.status===403?'DENIED':'REQUEST_FAILED');
   }
   if(response.status===204)return null;
   if(!/\bjson\b/i.test(response.headers.get('content-type')||''))throw fail('INVALID_RESPONSE');
   const result=await response.json();if(version!==epoch)throw fail('STALE');return result;
  }catch(e){if(e.code)throw e;throw fail('NETWORK');}
  finally{clearTimeout(timer);controllers.delete(controller);}
 }
 function id(value){if(!UUID.test(value||''))throw fail('INVALID_INPUT');return value;}
 function text(value,max,min=0){if(typeof value!=='string'||value.trim().length<min||value.length>max)throw fail('INVALID_INPUT');return value.trim();}
 function idList(values,max=49){if(!Array.isArray(values)||values.length>max)throw fail('INVALID_INPUT');const out=[...new Set(values.map(id))];if(!out.length)throw fail('INVALID_INPUT');return out;}
 const rpc=(name,args={})=>request('/rest/v1/rpc/'+name,{method:'POST',body:args});
 async function rows(path){const data=await request('/rest/v1/'+path);if(!Array.isArray(data))throw fail('INVALID_RESPONSE');return data;}
 return Object.freeze({
  enabled:!!cfg,user,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  async requestCode(email){text(email,254,3);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw fail('INVALID_INPUT');await request('/auth/v1/otp',{method:'POST',auth:false,body:{email,create_user:true}});},
  async verify(email,code){
   text(email,254,3);if(!/^\d{6,10}$/.test(code))throw fail('INVALID_INPUT');
   const attempt=++authAttempt;
   const result=await request('/auth/v1/verify',{method:'POST',auth:false,body:{email,token:code,type:'email'}});
   if(attempt!==authAttempt)throw fail('STALE');
   if(!result||typeof result.access_token!=='string'||!result.access_token||!Number.isFinite(result.expires_in)||result.expires_in<=0)throw fail('INVALID_RESPONSE');
   // Ask Auth instead of trusting localStorage or decoded JWT claims.
   const who=await request('/auth/v1/user',{auth:false,token:result.access_token});
   if(attempt!==authAttempt)throw fail('STALE');
   session={id:id(who?.id),token:result.access_token,expiresAt:clock()+result.expires_in*1000};
   try{await rpc('fk_claim_first_pilot');}catch(e){clear();throw e;}
   notify();return user();
  },
  async logout(){const token=session?.token;clear();if(token)await request('/auth/v1/logout?scope=local',{method:'POST',auth:false,token});},
  profile(){return rows('fk_profiles?select=id,name,skills,about,listed&id=eq.'+id(user()?.id));},
  saveProfile(p){if(typeof p.listed!=='boolean')throw fail('INVALID_INPUT');return rpc('fk_save_profile',{p_name:text(p.name,60,1),p_skills:text(p.skills,200),p_about:text(p.about,600),p_listed:p.listed});},
  directory(){return rows('fk_profiles?select=id,name,skills,about&listed=eq.true&order=name.asc&limit=100');},
  communities(){return rows('fk_communities?select=id,owner_id,name,description&order=created_at.desc&limit=100');},
  memberships(){return rows('fk_memberships?select=community_id,user_id,banned&limit=100');},
  createCommunity(name,description){return rpc('fk_create_community',{p_name:text(name,80,2),p_description:text(description,1000)});},
  join(cid){return rpc('fk_join',{p_community:id(cid)});},leave(cid){return rpc('fk_leave',{p_community:id(cid)});},
  posts(cid){return rows('fk_posts?select=id,community_id,author_id,body,created_at&community_id=eq.'+id(cid)+'&order=created_at.desc&limit=50');},
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
  chatMessages(cid){return rows('fk_messages?select=id,conversation_id,author_id,body,created_at&conversation_id=eq.'+id(cid)+'&order=created_at.asc&limit=100');},
  startDirect(uid){return rpc('fk_start_direct',{p_other:id(uid)});},
  createGroupChat(title,members){return rpc('fk_create_group_chat',{p_title:text(title,80,2),p_members:idList(members)});},
  inviteChat(cid,uid){return rpc('fk_invite_chat',{p_conversation:id(cid),p_user:id(uid)});},
  acceptChat(cid){return rpc('fk_accept_chat_invite',{p_conversation:id(cid)});},
  declineChat(cid){return rpc('fk_decline_chat_invite',{p_conversation:id(cid)});},
  leaveChat(cid){return rpc('fk_leave_chat',{p_conversation:id(cid)});},
  removeChatMember(cid,uid){return rpc('fk_remove_chat_member',{p_conversation:id(cid),p_user:id(uid)});},
  sendMessage(cid,body){return rpc('fk_send_message',{p_conversation:id(cid),p_body:text(body,4000,1)});},
  markChatRead(cid){return rpc('fk_mark_chat_read',{p_conversation:id(cid)});},
  deleteMessage(mid){return rpc('fk_delete_message',{p_message:id(mid)});},
  reportMessage(mid,reason){return rpc('fk_report_message',{p_message:id(mid),p_reason:text(reason,1000,2)});},
  deleteChat(cid){return rpc('fk_delete_chat',{p_conversation:id(cid)});},
  deleteProfile(){return rpc('fk_delete_profile');},
  async exportOwn(){const uid=id(user()?.id);const [profile,memberships,posts,blocks,reports,chatMemberships,messages,messageReports,chatInvites]=await Promise.all([
   rows('fk_profiles?id=eq.'+uid),
   rows('fk_memberships?user_id=eq.'+uid),
   rows('fk_posts?author_id=eq.'+uid+'&order=created_at.desc&limit=1000'),
   rows('fk_blocks?user_id=eq.'+uid),
   rows('fk_reports?reporter_id=eq.'+uid+'&limit=1000'),
   rows('fk_conversation_members?user_id=eq.'+uid+'&limit=500'),
   rows('fk_messages?author_id=eq.'+uid+'&order=created_at.desc&limit=1000'),
   rows('fk_message_reports?reporter_id=eq.'+uid+'&limit=1000'),
   rows('fk_conversation_invites?user_id=eq.'+uid+'&limit=500')
  ]);
   return {profile,memberships,posts,blocks,reports,chatMemberships,messages,messageReports,chatInvites,scope:'Visible records only; server limits may truncate. Request a complete account export from the operator.'};
  }
 });
}
globalThis.FolkoopNetwork=Object.freeze({client,configuration});
})();
