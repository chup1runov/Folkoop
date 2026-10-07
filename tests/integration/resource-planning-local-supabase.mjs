import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';

const API=process.env.API_URL;
const DB=process.env.DB_URL;
const ANON=process.env.ANON_KEY||process.env.PUBLISHABLE_KEY;
const SERVICE=process.env.SERVICE_ROLE_KEY||process.env.SECRET_KEY;
for(const [name,value] of Object.entries({API,DB,ANON,SERVICE}))assert(value, name+' missing from local Supabase status');
assert(API.startsWith('http://127.0.0.1:'),'local rehearsal must target loopback');

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const password='R1-local-only-8Y!zv2qL';
const report={local_only:true,production:false,checks:[],observations:{},blockers:[]};
const check=(condition,label)=>{assert.equal(!!condition,true,label);report.checks.push(label);};

async function http(path,{method='GET',token=null,key=ANON,body}={}){
 const headers={apikey:key,Accept:'application/json'};
 if(token)headers.Authorization='Bearer '+token;
 if(body!==undefined)headers['Content-Type']='application/json';
 const response=await fetch(API+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 let data=null;const type=response.headers.get('content-type')||'';
 if(/json/i.test(type)){try{data=await response.json();}catch{}}
 else {try{data=await response.text();}catch{}}
 return {ok:response.ok,status:response.status,data};
}
async function adminCreate(label){
 const email=`r1-${label}-${Date.now()}@example.invalid`;
 const r=await http('/auth/v1/admin/users',{method:'POST',token:SERVICE,key:SERVICE,body:{email,password,email_confirm:true}});
 assert.equal(r.ok,true,`admin create ${label}: ${r.status} ${JSON.stringify(r.data)}`);
 assert(UUID.test(r.data?.id),label+' user id');
 return {id:r.data.id,email};
}
async function login(user){
 const r=await http('/auth/v1/token?grant_type=password',{method:'POST',body:{email:user.email,password}});
 assert.equal(r.ok,true,`login ${user.email}: ${r.status} ${JSON.stringify(r.data)}`);
 assert.equal(typeof r.data?.access_token,'string');
 return {id:user.id,token:r.data.access_token};
}
async function rpc(session,name,args={}){
 return http('/rest/v1/rpc/'+name,{method:'POST',token:session.token,body:args});
}
async function rows(session,path){return http('/rest/v1/'+path,{token:session.token});}
function sql(statement){
 return execFileSync('psql',[DB,'-v','ON_ERROR_STOP=1','-At','-c',statement],{encoding:'utf8'}).trim();
}
function qid(id){assert(UUID.test(id));return "'"+id+"'::uuid";}

const A=await adminCreate('owner'),B=await adminCreate('member'),C=await adminCreate('outsider');
sql(`insert into folkoop_private.pilots(user_id,enabled) values
 (${qid(A.id)},true),(${qid(B.id)},true),(${qid(C.id)},true)
 on conflict(user_id) do update set enabled=excluded.enabled;`);
check(sql(`select count(*) from folkoop_private.pilots where user_id in (${qid(A.id)},${qid(B.id)},${qid(C.id)}) and enabled`)==='3','three Auth users are admitted as synthetic pilots');

let a=await login(A),b=await login(B),c=await login(C);
const makeCoop=async(kind,title)=>{
 const r=await rpc(a,'fk_create_cooperation',{p_kind:kind,p_title:title,p_description:'Synthetic local Supabase rehearsal',p_location:'Göteborg',p_target_quantity:null,p_unit:''});
 assert.equal(r.ok,true,`create ${kind}: ${r.status} ${JSON.stringify(r.data)}`);
 assert(UUID.test(r.data),kind+' cooperation id');
 return r.data;
};
const project=await makeCoop('project','R1 local rehearsal project');
const resource=await makeCoop('resource','R1 local rehearsal resource');
let r=await rpc(b,'fk_join_cooperation',{p_cooperation:project});
assert.equal(r.ok,true,`member join: ${r.status} ${JSON.stringify(r.data)}`);
check(true,'second user joins the project through the real PostgREST RPC');

const requirement='75111111-1111-4111-8111-111111111111';
r=await rpc(a,'fk_save_resource_requirement',{p_id:requirement,p_project:project,p_flow:null,p_title:'Local rehearsal material',p_kind:'consumable',p_quantity:'0.125',p_unit:'kg',p_from:null,p_until:null,p_conditions:'Synthetic local-only conditions',p_expected_revision:0});
assert.equal(r.ok,true,`save requirement: ${r.status} ${JSON.stringify(r.data)}`);
assert.equal(r.data,1);
r=await rpc(a,'fk_save_resource_availability',{p_resource:resource,p_kind:'consumable',p_quantity:'0.3',p_unit:'kg',p_from:null,p_until:null,p_conditions:'Owner-only local availability',p_expected_revision:0});
assert.equal(r.ok,true,`save availability: ${r.status} ${JSON.stringify(r.data)}`);
assert.equal(r.data,1);
check(true,'R1 string decimals cast through real PostgREST RPCs');

const reqPath=`fk_resource_requirements?select=id,cooperation_id,title,quantity::text,unit,revision&cooperation_id=eq.${project}&order=id.asc`;
const avPath=`fk_resource_availability?select=resource_id,quantity::text,unit,revision&resource_id=eq.${resource}`;
const ar=await rows(a,reqPath),br=await rows(b,reqPath),cr=await rows(c,reqPath);
assert.equal(ar.ok&&br.ok&&cr.ok,true);
check(ar.data.length===1&&br.data.length===1&&cr.data.length===0,'project RLS: owner/member can read requirement; outsider cannot');
check(ar.data[0].quantity==='0.125','REST quantity remains an exact decimal string');
const aa=await rows(a,avPath),ba=await rows(b,avPath),ca=await rows(c,avPath);
assert.equal(aa.ok&&ba.ok&&ca.ok,true);
check(aa.data.length===1&&ba.data.length===0&&ca.data.length===0,'availability RLS: only the resource owner can read the private declaration');

r=await rpc(b,'fk_save_resource_requirement',{p_id:'75222222-2222-4222-8222-222222222222',p_project:project,p_flow:null,p_title:'Unauthorized edit',p_kind:'consumable',p_quantity:'1',p_unit:'kg',p_from:null,p_until:null,p_conditions:'',p_expected_revision:0});
check(!r.ok&&r.data?.code==='42501','project member cannot create owner-only requirement');
const exportA=await rpc(a,'fk_export_resource_planning',{p_kind:'requirements',p_after:null,p_limit:100});
const exportB=await rpc(b,'fk_export_resource_planning',{p_kind:'requirements',p_after:null,p_limit:100});
assert.equal(exportA.ok&&exportB.ok,true);
check(exportA.data.records.length===1&&exportB.data.records.length===0,'own-record export does not leak another author’s requirement');
check(exportA.data.records[0].quantity==='0.125'&&exportA.data.snapshot===false,'R1 export preserves decimal text and explicit non-snapshot scope');

const logout=await http('/auth/v1/logout?scope=local',{method:'POST',token:a.token});
check(logout.ok,'Auth logout endpoint accepts the owner session');
const sessionCount=Number(sql(`select count(*) from auth.sessions where user_id=${qid(A.id)}`));
report.observations.auth_sessions_after_logout=sessionCount;
check(sessionCount===0,'logout removes the local Auth session row');

const replay=await rpc(a,'fk_save_resource_requirement',{p_id:requirement,p_project:project,p_flow:null,p_title:'Local rehearsal material',p_kind:'consumable',p_quantity:'0.125',p_unit:'kg',p_from:null,p_until:null,p_conditions:'Attempt with logged-out JWT',p_expected_revision:1});
report.observations.logged_out_jwt_resource_write={status:replay.status,ok:replay.ok,code:replay.data?.code||null,message:replay.data?.message||null};
if(replay.ok)report.blockers.push('LOGGED_OUT_JWT_CAN_WRITE_R1');
else check(replay.status===403&&replay.data?.message==='SESSION_REQUIRED','logged-out JWT cannot mutate R1');
const revokedRead=await rows(a,reqPath);
check(revokedRead.ok&&Array.isArray(revokedRead.data)&&revokedRead.data.length===0,'logged-out JWT loses R1 table read through RLS');
const revokedExport=await rpc(a,'fk_export_resource_planning',{p_kind:'requirements',p_after:null,p_limit:100});
check(!revokedExport.ok&&revokedExport.status===403&&revokedExport.data?.message==='SESSION_REQUIRED','logged-out JWT cannot export R1');

a=await login(A);
const inventory=JSON.parse(sql(`select folkoop_private.account_closure_inventory(${qid(A.id)})::text`));
check(Number(inventory.owned_shared.resource_requirements)===1,'operator closure inventory sees R1 requirement before account deletion');
check(Number(inventory.owned_shared.resource_availability)===1,'operator closure inventory sees R1 availability before account deletion');
check(Number(inventory.pseudonymising_set_null.resource_requirements_authored)===1,'operator closure inventory exposes authored requirement provenance');

const del=await http('/auth/v1/admin/users/'+A.id,{method:'DELETE',token:SERVICE,key:SERVICE});
assert.equal(del.ok,true,`admin delete owner: ${del.status} ${JSON.stringify(del.data)}`);
check(Number(sql(`select count(*) from public.fk_resource_requirements where cooperation_id=${qid(project)}`))===0,'Auth deletion removes owned project requirements');
check(Number(sql(`select count(*) from public.fk_resource_availability where resource_id=${qid(resource)}`))===0,'Auth deletion removes owned resource availability');
check(Number(sql(`select count(*) from folkoop_private.resource_plan_removals where cooperation_id in (${qid(project)},${qid(resource)})`))===0,'Auth deletion removes R1 removal metadata for deleted parents');
const bUser=await http('/auth/v1/user',{token:b.token});
check(bUser.ok&&bUser.data?.id===B.id,'another account remains valid after owner deletion');

for(const user of [B,C])await http('/auth/v1/admin/users/'+user.id,{method:'DELETE',token:SERVICE,key:SERVICE});
mkdirSync('qa-output',{recursive:true});
writeFileSync('qa-output/r1-local-supabase.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(report.blockers.length)process.exitCode=2;
