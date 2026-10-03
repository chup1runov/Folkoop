/* Privacy-first pilot analytics.
   Disabled by default until the participant Privacy Notice explicitly covers analytics.
   No names, email addresses, free text, message bodies or cooperation descriptions are sent. */
(() => {
'use strict';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KINDS=new Set(['need','offer','purchase','resource','project']);
const EVENT_PROPERTIES=Object.freeze({
 pilot_session_started:Object.freeze([]),
 cooperation_created:Object.freeze(['cooperation_kind']),
 cooperation_joined:Object.freeze([]),
 cooperation_completed:Object.freeze([]),
 project_task_completed:Object.freeze([]),
 purchase_participation_confirmed:Object.freeze([]),
 purchase_completed:Object.freeze([])
});
const DEFAULT_CONFIG=Object.freeze({
 enabled:false,
 host:'https://eu.i.posthog.com',
 projectToken:'',
 schemaVersion:'2026-10-03-v1'
});

function configuration(value){
 if(value?.enabled!==true)return Object.freeze({enabled:false});
 let host;
 try{host=new URL(value.host);}catch{throw new Error('ANALYTICS_CONFIG');}
 if(host.origin!=='https://eu.i.posthog.com'||host.pathname!=='/'||host.search||host.hash||host.username||host.password)throw new Error('ANALYTICS_CONFIG');
 if(!/^phc_[A-Za-z0-9_-]{20,200}$/.test(value.projectToken||''))throw new Error('ANALYTICS_CONFIG');
 if(!/^\d{4}-\d{2}-\d{2}-v\d+$/.test(value.schemaVersion||''))throw new Error('ANALYTICS_CONFIG');
 return Object.freeze({enabled:true,host:host.origin,projectToken:value.projectToken,schemaVersion:value.schemaVersion});
}

function safeProperties(event,value){
 const allowed=EVENT_PROPERTIES[event];
 if(!allowed)return null;
 const input=value&&typeof value==='object'?value:{};
 const output={};
 for(const key of allowed){
  if(key==='cooperation_kind'&&KINDS.has(input[key]))output[key]=input[key];
 }
 return output;
}

function create(value=DEFAULT_CONFIG,{transport=globalThis.fetch?.bind(globalThis)}={}){
 const cfg=configuration(value);
 let distinctId=null;

 function identify(value){
  if(!UUID.test(value||'')){distinctId=null;return false;}
  distinctId=value;
  return true;
 }

 function reset(){distinctId=null;}

 async function capture(event,properties={}){
  if(!cfg.enabled||!distinctId||typeof transport!=='function')return false;
  const safe=safeProperties(event,properties);
  if(!safe)return false;
  const body={
   api_key:cfg.projectToken,
   event,
   distinct_id:distinctId,
   properties:{
    $process_person_profile:false,
    analytics_schema:cfg.schemaVersion,
    pilot:'goteborg_core_loop',
    ...safe
   }
  };
  try{
   const response=await transport(cfg.host+'/i/v0/e/',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body),
    credentials:'omit',
    referrerPolicy:'no-referrer',
    cache:'no-store',
    redirect:'error',
    keepalive:true
   });
   return response?.ok===true;
  }catch{return false;}
 }

 return Object.freeze({enabled:cfg.enabled,identify,reset,capture});
}

const instance=create(DEFAULT_CONFIG);
globalThis.FolkoopAnalytics=Object.freeze({
 ...instance,
 create,
 events:Object.freeze(Object.keys(EVENT_PROPERTIES))
});
})();
