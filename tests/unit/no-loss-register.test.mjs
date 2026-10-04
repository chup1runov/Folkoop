import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const register=JSON.parse(await readFile('docs/NO_LOSS_REQUIREMENTS_REGISTER.json','utf8'));
const receipt=JSON.parse(await readFile('docs/requirements/SOURCE_RECOVERY_20261004.json','utf8'));
const entries=register.entries;

// Fixed digest from the exact pre-update Git blob 16b0db68..., not derived
// from the updated file. Revert only the explicitly authorised recovery field.
const ORIGINAL_ENTRIES_SHA256='758242773cb238d5eb5ef3b1f4caa925fe938d09314592ef7236ed0d60b542a7';
const PREVIOUS_STATUS='full_original_json_not_found; compact_projection_preserved';
const RECOVERED_STATUS='prior_register_recovered; compact_projection_preserved; primary_sources_incomplete';

test('no-loss register keeps the recovered stable-ID baseline intact',()=>{
  assert.equal(register.schema_version,'1.0');
  assert.equal(register.controlling_decision,'FK-FOUNDATION-2026-10-04');
  assert.equal(register.entry_count,132);
  assert.equal(register.independent_requirement_count,131);
  assert.equal(register.cross_reference_count,1);
  assert.equal(entries.length,132);
  assert.equal(new Set(entries.map(x=>x.id)).size,132);
});

test('no-loss register preserves expected origin and architecture families',()=>{
  const expected={ID:2,SV:12,FN:21,KP:12,FX:11,AR:9,FO:6,GBG:8,MU:5,BC:8,IN:5,SDCF:14,W34:19};
  assert.deepEqual(register.prefix_counts,expected);
  for(const [prefix,count] of Object.entries(expected)){
    assert.equal(entries.filter(x=>x.id.startsWith(prefix+'-')).length,count,prefix);
  }
});

test('recovery receipt records exact prior-register hashes and retains the old search result',()=>{
  const p=register.provenance.missing_full_json;
  assert.equal(p.status,'recovered_exact_bytes_2026-10-04');
  assert.equal(p.previous_status,'not_found_in_box_search_2026-10-04');
  assert.equal(p.expected_size_bytes,91268);
  assert.equal(p.expected_sha256,'34c9e1a63cbd4e7e3e23d8fa5b8f86d44d732a6053f64fb763f106546c763e70');
  assert.equal(p.recovery_receipt,'requirements/SOURCE_RECOVERY_20261004.json');
  const original=receipt.artifacts.find(x=>x.id==='prior99');
  const prior63=receipt.artifacts.find(x=>x.id==='prior63');
  assert.equal(original.bytes,91268);
  assert.equal(original.sha256,p.expected_sha256);
  assert.equal(original.record_count,99);
  assert.equal(prior63.bytes,37651);
  assert.equal(prior63.record_count,63);
  assert.equal(prior63.sha256,register.provenance.original_63_hash.sha256);
  assert.equal(receipt.private_originals_published,false);
  assert.equal(receipt.runtime_tests_performed_by_this_recovery,false);
  assert(receipt.unresolved_primary_sources.length>0);
  assert.equal(receipt.baseline_entries_json_sha256,ORIGINAL_ENTRIES_SHA256);
  // These checks validate the receipt, not remote private artifact bytes.
});

test('only source recovery plus reviewed E01 traceability changed in protected rows',()=>{
  const original=structuredClone(entries);
  let changed=0;
  for(const row of original){
    if(row.provenance==='box_coverage_99'){
      assert.equal(row.source_recovery_status,RECOVERED_STATUS);
      row.source_recovery_status=PREVIOUS_STATUS;
      changed++;
    }
  }
  assert.equal(changed,99);

  const e01={
    'FO-06':{status:'partial_backend_economic_flow_only',evidence:['supabase/migrations/20261004194921_folkoop_economic_flow_v0.sql']},
    'KP-05':{status:'partial_backend_flow_roles_only_production_and_sales_fulfilment_pending',evidence:['supabase/migrations/20261004194921_folkoop_economic_flow_v0.sql']},
    'KP-06':{status:'design_only_not_runtime',evidence:['docs/architecture/FULFILMENT_LOGISTICS_V0_DESIGN.md (design only; no runtime)']},
    'IN-02':{status:'partial_backend_economic_flow_only_logistics_and_decision_links_pending',evidence:['supabase/migrations/20261004194921_folkoop_economic_flow_v0.sql','docs/architecture/FULFILMENT_LOGISTICS_V0_DESIGN.md (design only; no runtime)']},
    'FX-06':{status:'partial_runtime_boundary_closed_is_not_confirmed_outcome',evidence:['supabase/migrations/20261004194921_folkoop_economic_flow_v0.sql','tests/database/network-economic-flow-migration.sql']}
  };
  for(const [id,expected] of Object.entries(e01)){
    const row=original.find(x=>x.id===id);
    assert(row,id);
    assert.equal(row.implementation_status,expected.status,id);
    assert.deepEqual(row.code_evidence,expected.evidence,id);
    row.implementation_status=null;
    row.code_evidence=[];
  }

  assert.equal(createHash('sha256').update(JSON.stringify(original),'utf8').digest('hex'),ORIGINAL_ENTRIES_SHA256,
    'IDs, order, statements, types or other original row fields changed outside the authorised recovery edit');
});

test('W34-18 remains a cross-reference rather than duplicate blockchain scope',()=>{
  const row=entries.find(x=>x.id==='W34-18');
  assert(row);
  assert.equal(row.record_type,'cross_reference');
  assert.match(row.preserved_summary,/blockchain|integrity anchoring/i);
});

test('blank traceability fields remain work gaps except the reviewed E01 partial evidence',()=>{
  const e01Ids=new Set(['FO-06','KP-05','KP-06','IN-02','FX-06']);
  for(const row of entries){
    assert.equal(row.destination,null);
    if(!e01Ids.has(row.id)){
      assert.deepEqual(row.code_evidence,[]);
      assert.equal(row.implementation_status,null);
    }else{
      assert(row.code_evidence.length>0,row.id);
      assert(row.implementation_status,row.id);
    }
    assert.equal(row.acceptance_test,null);
  }
});

test('the selected delivery contract neither removes nor renumbers unselected requirements',()=>{
  const s=register.delivery_contracts.find(x=>x.id==='FK-S01');
  assert(s);
  assert.equal(s.status,'design_contract_not_runtime_acceptance');
  assert.equal(new Set(s.requirement_ids).size,s.requirement_ids.length);
  const ids=new Set(entries.map(x=>x.id));
  for(const id of s.requirement_ids)assert(ids.has(id),id);
  assert(entries.filter(x=>!s.requirement_ids.includes(x.id)).length>0);
  assert.match(s.scope_rule,/not a reduction/);
});
