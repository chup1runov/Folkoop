import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parsePublicConfig,validateAcceptanceEnv} from '../../scripts/ops/r1-hosted-acceptance.mjs';

const CONFIG=readFileSync('apps/web/network-config.js','utf8');
const base={
 FOLKOOP_R1_HOSTED_ACCEPT_CONFIRM:'RUN_R1_HOSTED_ACCEPTANCE',
 FOLKOOP_R1_TEST_IDENTITY_ACK:'DEVELOPER_TEST_IDENTITIES_ONLY',
 FOLKOOP_R1_TEST_A_EMAIL:'a@example.invalid',
 FOLKOOP_R1_TEST_A_PASSWORD:'not-a-real-secret-a',
 FOLKOOP_R1_TEST_B_EMAIL:'b@example.invalid',
 FOLKOOP_R1_TEST_B_PASSWORD:'not-a-real-secret-b'
};
const rejects=(fn,code)=>assert.throws(fn,(e)=>e.code===code);

test('production config parses exact project while R1 UI remains off',()=>{
 const c=parsePublicConfig(CONFIG);
 assert.equal(c.ref,'cwvhkdqsrbllsykhccmb');
 assert.equal(c.url,'https://cwvhkdqsrbllsykhccmb.supabase.co');
});
test('hosted acceptance requires explicit execution confirmation',()=>rejects(()=>validateAcceptanceEnv({...base,FOLKOOP_R1_HOSTED_ACCEPT_CONFIRM:''}),'NOT_AUTHORIZED'));
test('hosted acceptance requires developer/test identity acknowledgement',()=>rejects(()=>validateAcceptanceEnv({...base,FOLKOOP_R1_TEST_IDENTITY_ACK:''}),'NOT_AUTHORIZED'));
test('two distinct identities are mandatory',()=>rejects(()=>validateAcceptanceEnv({...base,FOLKOOP_R1_TEST_B_EMAIL:base.FOLKOOP_R1_TEST_A_EMAIL.toUpperCase()}),'INVALID_TEST_IDENTITIES'));
test('missing credentials fail closed',()=>rejects(()=>validateAcceptanceEnv({...base,FOLKOOP_R1_TEST_B_PASSWORD:''}),'MISSING_SECRET'));
for(const key of ['SUPABASE_SERVICE_ROLE_KEY','SERVICE_ROLE_KEY','SUPABASE_SECRET_KEY','SECRET_KEY']){
 test('privileged credential forbidden: '+key,()=>rejects(()=>validateAcceptanceEnv({...base,[key]:'never-use-a-service-key'}),'UNSAFE_ENV'));
}
test('feature flag true is refused even with otherwise valid config',()=>rejects(()=>parsePublicConfig(CONFIG.replace('resourcePlanningEnabled:false','resourcePlanningEnabled:true')),'CONFIG_INVALID'));
test('wrong project ref is refused',()=>rejects(()=>parsePublicConfig(CONFIG.replace('cwvhkdqsrbllsykhccmb','aaaaaaaaaaaaaaaaaaaa')),'CONFIG_INVALID'));
test('acceptance script contains no Auth admin create/delete path',()=>{
 const src=readFileSync('scripts/ops/r1-hosted-acceptance.mjs','utf8');
 assert.doesNotMatch(src,/\/auth\/v1\/admin\/users/);
 assert.match(src,/PRIVILEGED_KEY_NOT_ALLOWED/);
 assert.match(src,/TECH-R1:/);
 assert.match(src,/SESSION_REQUIRED/);
});
