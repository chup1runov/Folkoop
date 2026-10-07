#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';

const EXPECTED_REF='cwvhkdqsrbllsykhccmb';
const CONFIRM='RUN_R1_HOSTED_ACCEPTANCE';
const IDENTITY_ACK='DEVELOPER_TEST_IDENTITIES_ONLY';

export function parsePublicConfig(source){
  const get=(name)=>{
    const m=source.match(new RegExp('\\b'+name+':([^,\\n]+)'));
    if(!m)throw Object.assign(new Error('CONFIG_'+name.toUpperCase()+'_MISSING'),{code:'CONFIG_INVALID'});
    return m[1].trim();
  };
  const unquote=(value)=>{
    const m=value.match(/^'([^']*)'$/);
    if(!m)throw Object.assign(new Error('CONFIG_STRING_INVALID'),{code:'CONFIG_INVALID'});
    return m[1];
  };
  const url=unquote(get('url'));
  const key=unquote(get('publishableKey'));
  if(get('resourcePlanningEnabled')!=='false')throw Object.assign(new Error('R1_FEATURE_FLAG_MUST_BE_OFF'),{code:'CONFIG_INVALID'});
  let host;
  try{host=new URL(url).hostname;}catch{throw Object.assign(new Error('CONFIG_URL_INVALID'),{code:'CONFIG_INVALID'});}
  const ref=host.split('.')[0];
  if(ref!==EXPECTED_REF)throw Object.assign(new Error('WRONG_PROJECT_REF'),{code:'CONFIG_INVALID'});
  if(!/^sb_publishable_/.test(key))throw Object.assign(new Error('PUBLISHABLE_KEY_REQUIRED'),{code:'CONFIG_INVALID'});
  return Object.freeze({url,key,ref});
}

export function validateAcceptanceEnv(env){
  if(env.FOLKOOP_R1_HOSTED_ACCEPT_CONFIRM!==CONFIRM)throw Object.assign(new Error('EXPLICIT_CONFIRMATION_REQUIRED'),{code:'NOT_AUTHORIZED'});
  if(env.FOLKOOP_R1_TEST_IDENTITY_ACK!==IDENTITY_ACK)throw Object.assign(new Error('TEST_IDENTITY_ACK_REQUIRED'),{code:'NOT_AUTHORIZED'});
  const fields=['FOLKOOP_R1_TEST_A_EMAIL','FOLKOOP_R1_TEST_A_PASSWORD','FOLKOOP_R1_TEST_B_EMAIL','FOLKOOP_R1_TEST_B_PASSWORD'];
  for(const key of fields){
    if(typeof env[key]!=='string'||!env[key])throw Object.assign(new Error(key+'_REQUIRED'),{code:'MISSING_SECRET'});
  }
  if(env.FOLKOOP_R1_TEST_A_EMAIL.toLowerCase()===env.FOLKOOP_R1_TEST_B_EMAIL.toLowerCase()){
    throw Object.assign(new Error('TWO_DISTINCT_IDENTITIES_REQUIRED'),{code:'INVALID_TEST_IDENTITIES'});
  }
  for(const forbidden of ['SUPABASE_SERVICE_ROLE_KEY','SERVICE_ROLE_KEY','SUPABASE_SECRET_KEY','SECRET_KEY']){
    if(env[forbidden])throw Object.assign(new Error('PRIVILEGED_KEY_NOT_ALLOWED'),{code:'UNSAFE_ENV'});
  }
  return Object.freeze({
    a:Object.freeze({email:env.FOLKOOP_R1_TEST_A_EMAIL,password:env.FOLKOOP_R1_TEST_A_PASSWORD}),
    b:Object.freeze({email:env.FOLKOOP_R1_TEST_B_EMAIL,password:env.FOLKOOP_R1_TEST_B_PASSWORD})
  });
}

const fail=(code,detail='')=>Object.assign(new Error(code+(detail?': '+detail:'')),{code});

function makeClient(config,fetchFn){
  const request=async(path,{method='GET',token=null,body}={})=>{
    const headers={apikey:config.key,Accept:'application/json'};
    if(token)headers.Authorization='Bearer '+token;
    if(body!==undefined)headers['Content-Type']='application/json';
    const response=await fetchFn(config.url+path,{
      method,headers,
      body:body===undefined?undefined:JSON.stringify(body),
      redirect:'error',cache:'no-store',referrerPolicy:'no-referrer'
    });
    let data=null;
    if(response.status!==204){
      const type=response.headers.get('content-type')||'';
      if(!/json/i.test(type))throw fail('INVALID_RESPONSE');
      data=await response.json();
    }
    return {ok:response.ok,status:response.status,data};
  };
  return Object.freeze({
    async login(identity){
      const r=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:identity.email,password:identity.password}});
      if(!r.ok||typeof r.data?.access_token!=='string')throw fail('LOGIN_FAILED',String(r.status));
      const who=await request('/auth/v1/user',{token:r.data.access_token});
      if(!who.ok||typeof who.data?.id!=='string')throw fail('USER_LOOKUP_FAILED');
      return Object.freeze({token:r.data.access_token,id:who.data.id});
    },
    rpc(session,name,args={}){return request('/rest/v1/rpc/'+name,{method:'POST',token:session.token,body:args});},
    rows(session,path){return request('/rest/v1/'+path,{token:session.token});},
    logout(session){return request('/auth/v1/logout?scope=local',{method:'POST',token:session.token});}
  });
}

export async function runHostedAcceptance({env=process.env,configSource=readFileSync('apps/web/network-config.js','utf8'),fetchFn=fetch}={}){
  const identities=validateAcceptanceEnv(env);
  const config=parsePublicConfig(configSource);
  const api=makeClient(config,fetchFn);
  const report={schema_version:1,project_ref:config.ref,scope:'R1 hosted developer/test acceptance only',feature_flag:false,checks:[],cleanup:[],blockers:[]};
  const ok=(value,label)=>{if(!value)throw fail('CHECK_FAILED',label);report.checks.push(label);};
  let a=null,b=null,project=null,resource=null,requirement=null,joined=false,availabilityRevision=0,requirementRevision=0,aSessionActive=false,bSessionActive=false;
  const rpcOk=async(session,name,args,label)=>{
    const r=await api.rpc(session,name,args);
    if(!r.ok)throw fail(label,String(r.data?.message||r.data?.code||r.status));
    return r.data;
  };
  try{
    a=await api.login(identities.a);aSessionActive=true;
    b=await api.login(identities.b);bSessionActive=true;
    ok(a.id!==b.id,'two distinct Auth identities');

    for(const entry of [['A',a],['B',b]]){
      const ready=await api.rpc(entry[1],'fk_export_resource_planning',{p_kind:'requirements',p_after:null,p_limit:1});
      if(!ready.ok)throw fail('TEST_IDENTITY_NOT_ADMITTED',entry[0]+':'+String(ready.data?.message||ready.data?.code||ready.status));
      ok(ready.data?.scope==='own_resource_planning_only',entry[0]+' is admitted and R1 RPC is reachable');
    }

    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14);
    project=await rpcOk(a,'fk_create_cooperation',{
      p_kind:'project',
      p_title:'TECH-R1: hosted project '+stamp,
      p_description:'Synthetic developer/test acceptance; not pilot outcome evidence',
      p_location:'Göteborg',p_target_quantity:null,p_unit:''
    },'CREATE_PROJECT_FAILED');
    resource=await rpcOk(b,'fk_create_cooperation',{
      p_kind:'resource',
      p_title:'TECH-R1: hosted resource '+stamp,
      p_description:'Synthetic developer/test acceptance',
      p_location:'Göteborg',p_target_quantity:null,p_unit:''
    },'CREATE_RESOURCE_FAILED');
    if(typeof project!=='string'||typeof resource!=='string')throw fail('INVALID_OBJECT_ID');

    await rpcOk(b,'fk_join_cooperation',{p_cooperation:project},'JOIN_FAILED');
    joined=true;

    requirement=randomUUID();
    requirementRevision=await rpcOk(a,'fk_save_resource_requirement',{
      p_id:requirement,p_project:project,p_flow:null,
      p_title:'TECH-R1: 0.125 kg material',p_kind:'consumable',
      p_quantity:'0.125',p_unit:'kg',p_from:null,p_until:null,
      p_conditions:'Synthetic developer/test acceptance',p_expected_revision:0
    },'SAVE_REQUIREMENT_FAILED');

    availabilityRevision=await rpcOk(b,'fk_save_resource_availability',{
      p_resource:resource,p_kind:'consumable',p_quantity:'0.3',p_unit:'kg',
      p_from:null,p_until:null,p_conditions:'Synthetic private availability',
      p_expected_revision:0
    },'SAVE_AVAILABILITY_FAILED');

    ok(requirementRevision===1&&availabilityRevision===1,'initial R1 revisions are one');

    const reqPath='fk_resource_requirements?select=id,cooperation_id,title,quantity::text,unit,revision&cooperation_id=eq.'+encodeURIComponent(project)+'&order=id.asc';
    const avPath='fk_resource_availability?select=resource_id,quantity::text,unit,revision&resource_id=eq.'+encodeURIComponent(resource);
    const values=await Promise.all([
      api.rows(a,reqPath),api.rows(b,reqPath),api.rows(a,avPath),api.rows(b,avPath)
    ]);
    const ar=values[0],br=values[1],avA=values[2],avB=values[3];
    ok(ar.ok&&br.ok&&ar.data.length===1&&br.data.length===1,'project owner and member both read requirement');
    ok(ar.data[0].quantity==='0.125','hosted REST preserves exact requirement decimal string');
    ok(avA.ok&&avB.ok&&avA.data.length===0&&avB.data.length===1,'private availability is visible only to its owner');

    const denied=await api.rpc(b,'fk_save_resource_requirement',{
      p_id:requirement,p_project:project,p_flow:null,
      p_title:'TECH-R1: unauthorized edit',p_kind:'consumable',
      p_quantity:'1',p_unit:'kg',p_from:null,p_until:null,
      p_conditions:'',p_expected_revision:1
    });
    ok(!denied.ok&&denied.data?.code==='42501','project member cannot modify owner requirement');

    const exports=await Promise.all([
      api.rpc(a,'fk_export_resource_planning',{p_kind:'requirements',p_after:null,p_limit:100}),
      api.rpc(b,'fk_export_resource_planning',{p_kind:'requirements',p_after:null,p_limit:100})
    ]);
    ok(exports[0].ok&&exports[1].ok&&exports[0].data.records.some(x=>x.id===requirement)&&!exports[1].data.records.some(x=>x.id===requirement),'own export does not leak another author requirement');

    const oldA=a;
    const loggedOut=await api.logout(a);
    aSessionActive=false;
    ok(loggedOut.ok,'Auth logout succeeds for A');

    const staleWrite=await api.rpc(oldA,'fk_save_resource_requirement',{
      p_id:requirement,p_project:project,p_flow:null,
      p_title:'TECH-R1: stale token edit',p_kind:'consumable',
      p_quantity:'0.125',p_unit:'kg',p_from:null,p_until:null,
      p_conditions:'stale',p_expected_revision:1
    });
    ok(!staleWrite.ok&&staleWrite.status===403&&staleWrite.data?.message==='SESSION_REQUIRED','logged-out JWT cannot mutate R1');

    const staleRead=await api.rows(oldA,reqPath);
    ok(staleRead.ok&&Array.isArray(staleRead.data)&&staleRead.data.length===0,'logged-out JWT cannot read R1 row');

    const staleExport=await api.rpc(oldA,'fk_export_resource_planning',{p_kind:'requirements',p_after:null,p_limit:10});
    ok(!staleExport.ok&&staleExport.status===403&&staleExport.data?.message==='SESSION_REQUIRED','logged-out JWT cannot export R1');

    a=await api.login(identities.a);aSessionActive=true;
    report.result='PASS';
  }catch(error){
    report.result='FAIL';
    report.blockers.push(error?.code||String(error));
    throw Object.assign(error,{acceptanceReport:report});
  }finally{
    // Cleanup must not rely on a token that this test intentionally revoked.
    if(project&&!aSessionActive){
      try{
        a=await api.login(identities.a);aSessionActive=true;
        report.cleanup.push('owner_relogin:true');
      }catch{report.cleanup.push('owner_relogin:false');}
    }
    if(resource&&!bSessionActive){
      try{
        b=await api.login(identities.b);bSessionActive=true;
        report.cleanup.push('resource_owner_relogin:true');
      }catch{report.cleanup.push('resource_owner_relogin:false');}
    }
    try{
      if(a&&aSessionActive&&requirement&&project&&requirementRevision){
        const r=await api.rpc(a,'fk_remove_resource_requirement',{p_project:project,p_id:requirement,p_expected_revision:requirementRevision});
        report.cleanup.push('requirement:'+String(r.ok));
      }
    }catch{report.cleanup.push('requirement:false');}
    try{
      if(b&&bSessionActive&&resource&&availabilityRevision){
        const r=await api.rpc(b,'fk_remove_resource_availability',{p_resource:resource,p_expected_revision:availabilityRevision});
        report.cleanup.push('availability:'+String(r.ok));
      }
    }catch{report.cleanup.push('availability:false');}
    try{
      if(b&&bSessionActive&&project&&joined){
        const r=await api.rpc(b,'fk_leave_cooperation',{p_cooperation:project});
        report.cleanup.push('member:'+String(r.ok));
      }
    }catch{report.cleanup.push('member:false');}
    try{
      if(a&&aSessionActive&&project){
        const r=await api.rpc(a,'fk_delete_cooperation',{p_cooperation:project});
        report.cleanup.push('project:'+String(r.ok));
      }
    }catch{report.cleanup.push('project:false');}
    try{
      if(b&&bSessionActive&&resource){
        const r=await api.rpc(b,'fk_delete_cooperation',{p_cooperation:resource});
        report.cleanup.push('resource:'+String(r.ok));
      }
    }catch{report.cleanup.push('resource:false');}
    try{
      if(a&&aSessionActive){
        const r=await api.logout(a);report.cleanup.push('logout_a:'+String(r.ok));aSessionActive=false;
      }
    }catch{report.cleanup.push('logout_a:false');}
    try{
      if(b&&bSessionActive){
        const r=await api.logout(b);report.cleanup.push('logout_b:'+String(r.ok));bSessionActive=false;
      }
    }catch{report.cleanup.push('logout_b:false');}
  }
  const cleanupFailed=report.cleanup.some((item)=>item.endsWith(':false'));
  if(cleanupFailed){
    report.result='FAIL';
    if(!report.blockers.includes('CLEANUP_INCOMPLETE'))report.blockers.push('CLEANUP_INCOMPLETE');
    const error=fail('CLEANUP_INCOMPLETE');
    error.acceptanceReport=report;
    throw error;
  }
  return report;
}

const isCli=process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href;
if(isCli){
  runHostedAcceptance().then((report)=>{
    process.stdout.write(JSON.stringify(report,null,2)+'\n');
  }).catch((error)=>{
    const report=error?.acceptanceReport||{result:'FAIL',blockers:[error?.code||String(error)]};
    process.stdout.write(JSON.stringify(report,null,2)+'\n');
    process.exitCode=2;
  });
}
