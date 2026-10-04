import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const register=JSON.parse(await readFile('docs/NO_LOSS_REQUIREMENTS_REGISTER.json','utf8'));
const entries=register.entries;

test('no-loss register keeps the recovered stable-ID baseline intact',()=>{
  assert.equal(register.schema_version,'1.0');
  assert.equal(register.controlling_decision,'FK-FOUNDATION-2026-10-04');
  assert.equal(register.entry_count,132);
  assert.equal(register.independent_requirement_count,131);
  assert.equal(register.cross_reference_count,1);
  assert.equal(entries.length,132);
  assert.equal(new Set(entries.map(x=>x.id)).size,132,'stable requirement IDs must be unique');
});

test('no-loss register preserves expected origin and architecture families',()=>{
  const expected={ID:2,SV:12,FN:21,KP:12,FX:11,AR:9,FO:6,GBG:8,MU:5,BC:8,IN:5,SDCF:14,W34:19};
  assert.deepEqual(register.prefix_counts,expected);
  for(const [prefix,count] of Object.entries(expected)){
    assert.equal(entries.filter(x=>x.id.startsWith(prefix+'-')).length,count,prefix);
  }
});

test('missing full historical JSON remains an explicit recovery gap',()=>{
  assert.equal(register.provenance.missing_full_json.status,'not_found_in_box_search_2026-10-04');
  assert.equal(register.provenance.missing_full_json.expected_size_bytes,91268);
  assert.equal(
    register.provenance.missing_full_json.expected_sha256,
    '34c9e1a63cbd4e7e3e23d8fa5b8f86d44d732a6053f64fb763f106546c763e70'
  );
  assert(entries.filter(x=>x.provenance==='box_coverage_99').every(
    x=>x.source_recovery_status.includes('compact_projection_preserved')
  ));
});

test('W34-18 remains a cross-reference rather than duplicate blockchain scope',()=>{
  const row=entries.find(x=>x.id==='W34-18');
  assert(row);
  assert.equal(row.record_type,'cross_reference');
  assert.match(row.preserved_summary,/blockchain|integrity anchoring/i);
});

test('blank traceability fields are retained as work gaps, not fabricated evidence',()=>{
  for(const row of entries){
    assert.equal(row.destination,null);
    assert.deepEqual(row.code_evidence,[]);
    assert.equal(row.acceptance_test,null);
  }
});
