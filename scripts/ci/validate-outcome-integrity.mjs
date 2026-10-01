import {readFile} from 'node:fs/promises';

const REQUIRED_GUARDS=new Set(['G01','G02','G03','G04','G05','G06','G07','G08','G09','G10']);
const ALLOWED_MAPPINGS=new Set(['contextual','direct-role','future']);
const REQUIRED_OUTCOME_CLASSES=new Set(['self_reported','participant_confirmed','not_completed','unclear']);
const REQUIRED_EVIDENCE_QUALIFIERS=new Set(['participant_only','external_evidence_present']);

const REPO_ROOT=new URL('../../',import.meta.url);

export async function loadIntegrity(url=new URL('docs/architecture/outcome-integrity-v1.json',REPO_ROOT)){
  return JSON.parse(await readFile(url,'utf8'));
}

export function validateIntegrity(profile){
  const errors=[];
  if(profile?.schemaVersion!==1) errors.push('schemaVersion must be 1');
  if(profile?.profileVersion!=='1.0') errors.push('profileVersion must be 1.0');
  if(profile?.profileId!=='folkoop-outcome-provenance-integrity') errors.push('profileId mismatch');
  if(profile?.runtimeDependency!==false) errors.push('runtimeDependency must remain false for the Göteborg pilot');
  if(profile?.status!=='advisory') errors.push('status must remain advisory before separately approved runtime integration');

  const mappingIds=new Set();
  for(const m of profile?.mappings||[]){
    if(!m?.id||mappingIds.has(m.id)) errors.push('mapping ids must be present and unique');
    mappingIds.add(m.id);
    if(!ALLOWED_MAPPINGS.has(m.mapping)) errors.push(`unsupported mapping mode: ${m?.mapping}`);
    if(!Array.isArray(m.integrityRoles)||!m.integrityRoles.length) errors.push(`mapping ${m?.id||'?'} must name integrity roles`);
  }

  const guardIds=new Set((profile?.guards||[]).map(g=>g?.id));
  for(const id of REQUIRED_GUARDS) if(!guardIds.has(id)) errors.push(`missing required guard ${id}`);
  if(guardIds.size!==(profile?.guards||[]).length) errors.push('guard ids must be unique');

  const names=new Set((profile?.guards||[]).map(g=>g?.name));
  for(const required of ['done_is_not_confirmed_outcome','organic_and_facilitated_matches_remain_distinct','recommendation_requires_provenance','no_sensitive_matching_by_default','no_runtime_semantic_stack_before_evidence']){
    if(!names.has(required)) errors.push(`missing integrity guard: ${required}`);
  }

  const city=profile?.cityProvenanceContract;
  if(city?.version!=='1.0') errors.push('city provenance contract version must be 1.0');
  if(city?.runtimeEnforcement?.path!=='apps/web/civic-core.js'||city?.runtimeEnforcement?.function!=='feed') errors.push('city runtime enforcement must bind to apps/web/civic-core.js feed()');
  for(const key of ['schemaVersion','sourceId','fetchedAt','adapterVersion','items']){
    if(!city?.feedEnvelope?.required?.includes(key)) errors.push(`city feed envelope must require ${key}`);
  }
  for(const key of ['id','sourceId','sourceUrl']){
    if(!city?.item?.required?.includes(key)) errors.push(`city item must require ${key}`);
  }

  const outcome=profile?.outcomeContract;
  if(outcome?.version!=='1.0') errors.push('outcome contract version must be 1.0');
  const outcomeIds=new Set((outcome?.classifications||[]).map(x=>x?.id));
  for(const id of REQUIRED_OUTCOME_CLASSES) if(!outcomeIds.has(id)) errors.push(`missing outcome classification ${id}`);
  const evidenceIds=new Set((outcome?.evidenceQualifiers||[]).map(x=>x?.id));
  for(const id of REQUIRED_EVIDENCE_QUALIFIERS) if(!evidenceIds.has(id)) errors.push(`missing evidence qualifier ${id}`);

  return errors;
}

export async function validateRepositoryBindings(profile){
  const errors=[];
  const runtime=profile?.cityProvenanceContract?.runtimeEnforcement;
  if(runtime?.path){
    try{
      const source=await readFile(new URL(runtime.path,REPO_ROOT),'utf8');
      if(!source.includes('adapterVersion')) errors.push(`${runtime.path} does not enforce adapterVersion`);
      if(!source.includes('INVALID_FEED')) errors.push(`${runtime.path} does not fail closed on malformed feeds`);
    }catch{errors.push(`missing City runtime enforcement file: ${runtime.path}`);}
  }
  for(const adapter of profile?.cityProvenanceContract?.currentAdapters||[]){
    let source;
    try{source=await readFile(new URL(adapter.path,REPO_ROOT),'utf8');}
    catch{errors.push(`missing adapter file: ${adapter.path}`);continue;}
    if(!source.includes(adapter.sourceId)) errors.push(`${adapter.path} does not contain sourceId ${adapter.sourceId}`);
    if(!source.includes(adapter.expectedAdapterVersion)) errors.push(`${adapter.path} does not contain adapterVersion ${adapter.expectedAdapterVersion}`);
    if(!source.includes('fetchedAt')) errors.push(`${adapter.path} does not record fetchedAt`);
    if(!source.includes(adapter.locator)) errors.push(`${adapter.path} does not record locator ${adapter.locator}`);
  }
  for(const ref of profile?.outcomeContract?.policyRefs||[]){
    try{await readFile(new URL(ref,REPO_ROOT),'utf8');}
    catch{errors.push(`missing policy reference: ${ref}`);}
  }
  return errors;
}

if(import.meta.url===`file://${process.argv[1]}`){
  const profile=await loadIntegrity();
  const errors=[...validateIntegrity(profile),...await validateRepositoryBindings(profile)];
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
  else console.log(`FOLKOOP outcome integrity ${profile.profileVersion}: OK (${profile.mappings.length} mappings, ${profile.guards.length} guards)`);
}
