import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const r=JSON.parse(await readFile('docs/NO_LOSS_REQUIREMENTS_REGISTER.json','utf8'));
const c=JSON.parse(await readFile('docs/contracts/online-center-host-city-action-outcome-v0.1.json','utf8'));
const text=await readFile('docs/contracts/ONLINE_CENTER_HOST_CITY_ACTION_OUTCOME_v0.1.md','utf8');
const reference=r.delivery_contracts.find(x=>x.id===c.id);

test('S01 contract points to existing requirement IDs rather than creating a second register',()=>{
  assert(reference);
  assert.equal(c.id,'FK-S01');
  assert.equal(c.registry_count,132);
  assert.equal(r.entries.length,132);
  assert.deepEqual(c.requirement_ids,reference.requirement_ids);
  assert.equal(new Set(c.requirement_ids).size,c.requirement_ids.length);
  const valid=new Set(r.entries.map(x=>x.id));
  c.requirement_ids.forEach(id=>assert(valid.has(id),id));
  assert.equal(c.contract,'ONLINE_CENTER_HOST_CITY_ACTION_OUTCOME_v0.1.md');
  assert.match(c.unselected_requirements_policy,/does not cancel/);
});

test('S01 covers all five stages and builds on the existing Center navigation',()=>{
  assert.deepEqual(c.stages,['online_center','host_optional','source_backed_city_resource','deliberate_joint_action','qualified_outcome']);
  assert.equal(c.current_baseline.online_center_navigation,'implemented_v0');
  assert.equal(c.current_baseline.primary_mobile_navigation_items,5);
  assert.match(c.current_baseline.host_request_referral_outcome,/not_established/);
  assert.match(text,/Online Center v0 already exists/);
});

test('all 24 acceptance cases remain planned and each selected requirement has an explicit test association',()=>{
  assert.equal(c.acceptance_cases.length,24);
  assert.equal(new Set(c.acceptance_cases.map(x=>x.id)).size,24);
  const selected=new Set(c.requirement_ids), covered=new Set();
  for(let i=0;i<24;i++){
    const item=c.acceptance_cases[i];
    assert.equal(item.id,'S01-AC-'+String(i+1).padStart(2,'0'));
    assert.equal(item.status,'not_run');
    assert(item.test.length>30);
    assert(item.requirement_ids.length>0);
    for(const id of item.requirement_ids){assert(selected.has(id),id);covered.add(id);}
  }
  assert.deepEqual([...selected].filter(id=>!covered.has(id)),[]);
  assert.equal(c.runtime_tests_performed,false);
  assert.equal(c.status,'design_contract_not_runtime_acceptance');
});

test('privacy, ordinary community life, Mura and no-loss safeguards are explicit',()=>{
  for(const key of ['private_request_default','host_assistance_optional','separate_recipient_and_publication_permissions',
    'ordinary_conversation_preserved','no_forum_import','source_not_authority_decision','issued_used_useful_separate',
    'no_answer_not_success','done_not_outcome_proof','mura_read_only','registration_only_after_mura_exit',
    'no_production_chain_activation','all_132_ids_retained','no_runtime_changes_by_contract']){
    assert.equal(c.safeguards[key],true,key);
  }
  assert.equal(c.external_forum_import_authorised,false);
  assert.equal(c.chain_provider_selected,false);
  assert.equal(c.funding_or_rights_policy_changed,false);
});

test('outcome states preserve unknown, partial and refused responses and typed evidence',()=>{
  assert.deepEqual(c.outcome_fields.use_status,['unknown','yes','partly','no']);
  assert.deepEqual(c.outcome_fields.usefulness,['not_answered','yes','partly','no','prefer_not_to_say']);
  assert(c.outcome_fields.separate_attribution.includes('participant_report'));
  assert(c.outcome_fields.separate_attribution.includes('cryptographic_integrity'));
  assert(c.outcome_fields.separate_attribution.includes('external_evidence'));
  assert(c.launch_gates.includes('real_account_and_real_device_acceptance'));
  assert.match(text,/structural test passing this document does not close any user scenario/);
});
