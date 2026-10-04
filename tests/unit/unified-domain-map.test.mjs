import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const map=JSON.parse(await readFile('docs/architecture/unified-domain-map-v1.json','utf8'));
const noLoss=JSON.parse(await readFile('docs/NO_LOSS_REQUIREMENTS_REGISTER.json','utf8'));
const objectIds=new Set(map.objects.map(x=>x.id));
const requirementIds=new Set(noLoss.entries.map(x=>x.id));

test('unified domain map keeps object/relation identities unique and resolvable',()=>{
  assert.equal(map.schema_version,'1.0');
  assert.equal(map.controlling_decision,'FK-FOUNDATION-2026-10-04');
  assert.equal(new Set(map.objects.map(x=>x.id)).size,map.objects.length);
  assert.equal(new Set(map.relations.map(x=>x.id)).size,map.relations.length);
  for(const relation of map.relations){
    assert(objectIds.has(relation.from),relation.id+' missing from '+relation.from);
    assert(objectIds.has(relation.to),relation.id+' missing to '+relation.to);
  }
});

test('all live FOLKOOP/private application tables are accounted for exactly in the verified baseline',()=>{
  assert.equal(map.verified_database.application_table_count,27);
  assert.equal(map.verified_database.tables.length,27);
  assert.equal(new Set(map.verified_database.tables).size,27);
  const accounted=new Set(
    map.objects.flatMap(x=>x.storage||[])
      .filter(x=>x.startsWith('public.')||x.startsWith('folkoop_private.'))
  );
  assert.deepEqual([...accounted].sort(),[...map.verified_database.tables].sort());
});

test('current cooperation variants and statuses match the verified database contract',()=>{
  assert.deepEqual(map.current_cooperation_contract.kinds,['need','offer','purchase','resource','project']);
  assert.deepEqual(map.current_cooperation_contract.statuses,['open','active','done','cancelled']);
  const variants={
    need:"public.fk_cooperations.kind='need'",
    offer:"public.fk_cooperations.kind='offer'",
    resource_cooperation:"public.fk_cooperations.kind='resource'",
    shared_purchase:"public.fk_cooperations.kind='purchase'",
    project:"public.fk_cooperations.kind='project'"
  };
  for(const [id,representation] of Object.entries(variants)){
    const row=map.objects.find(x=>x.id===id);
    assert.equal(row.status,'implemented_variant',id);
    assert(row.representation.includes(representation),id);
    assert.deepEqual(row.storage,[],id+' must not pretend to be a separate table');
  }
});

test('target objects do not masquerade as shipped first-class records',()=>{
  const targetIds=['resource','organisation','service','city_process','center','place','activity','host','referral','agreement','decision_record','outcome','attestation','passport_credential','node','action_graph','software_agent'];
  for(const id of targetIds){
    const row=map.objects.find(x=>x.id===id);
    assert(row,id);
    assert(['approved_target','partial_representation'].includes(row.status),id+' status '+row.status);
    if(row.status==='approved_target')assert.deepEqual(row.storage,[],id+' unexpectedly has operational storage');
  }
  const outcome=map.objects.find(x=>x.id==='outcome');
  assert.equal(outcome.status,'approved_target');
  assert.match(outcome.invariant,/done.*not.*confirmed real-world outcome/i);
});

test('private local state and Mura stay outside shared operational truth',()=>{
  const draft=map.objects.find(x=>x.id==='local_private_draft');
  assert.equal(draft.status,'implemented_local_only');
  assert.match(draft.invariant,/Never silently uploaded/i);
  const mura=map.objects.find(x=>x.id==='mura_illustrative_account');
  assert.equal(mura.status,'illustrative_only');
  assert.deepEqual(mura.storage,[]);
  assert.match(mura.invariant,/Illustrative data never proves/i);
});

test('Center and City bridge gaps remain explicit rather than being marked implemented',()=>{
  const center=map.objects.find(x=>x.id==='center');
  assert.equal(center.status,'approved_target');
  assert.match(center.current_gap,/ONLINE, PHYSICAL or HYBRID/i);
  const city=map.objects.find(x=>x.id==='city_process');
  assert.equal(city.status,'approved_target');
  assert.match(city.gap,/not yet connected first-class processes/i);
});

test('every requirement reference resolves to the canonical no-loss register',()=>{
  const refs=[];
  for(const row of map.objects)refs.push(...(row.requirements||[]));
  for(const row of map.relations)refs.push(...(row.requirements||[]));
  for(const row of map.sdcf_semantics)refs.push(row.requirement);
  for(const row of map.priority_gaps)refs.push(...(row.requirements||[]));
  const missing=[...new Set(refs)].filter(id=>!requirementIds.has(id));
  assert.deepEqual(missing,[]);
});

test('SDCF stays a semantic layer and PostgreSQL remains operational truth',()=>{
  assert.equal(map.sdcf_semantics.length,14);
  assert(map.sdcf_semantics.every(x=>x.status==='approved_semantic_layer'));
  assert(map.architectural_invariants.some(x=>/PostgreSQL\/Supabase remains operational truth/i.test(x)));
  assert(map.architectural_invariants.some(x=>/Action Graph is derived/i.test(x)));
});
