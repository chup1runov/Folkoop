import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const stories=JSON.parse(await readFile('docs/mura-whole-system-story-map-v1.json','utf8'));
const domain=JSON.parse(await readFile('docs/architecture/unified-domain-map-v1.json','utf8'));
const noLoss=JSON.parse(await readFile('docs/NO_LOSS_REQUIREMENTS_REGISTER.json','utf8'));

const storyIds=new Set(stories.stories.map(x=>x.id));
const domainIds=new Set(domain.objects.map(x=>x.id));
const requirementIds=new Set(noLoss.entries.map(x=>x.id));

test('whole-system Mura map contains exactly seven unique optional stories',()=>{
  assert.equal(stories.schema_version,'1.0');
  assert.equal(stories.controlling_decision,'FK-FOUNDATION-2026-10-04');
  assert.equal(stories.stories.length,7);
  assert.equal(storyIds.size,7);
  assert(stories.experience_rules.some(x=>/must not become one enormous mandatory tour/i.test(x)));
  assert(stories.experience_rules.some(x=>/Mura stays read-only/i.test(x)));
  assert(stories.experience_rules.some(x=>/No signup pressure/i.test(x)));
});

test('every story uses known domain objects and canonical no-loss requirement IDs',()=>{
  const badObjects=[],badRequirements=[];
  for(const story of stories.stories){
    for(const id of story.domain_objects||[])if(!domainIds.has(id))badObjects.push(story.id+':'+id);
    for(const id of story.requirements||[])if(!requirementIds.has(id))badRequirements.push(story.id+':'+id);
  }
  assert.deepEqual(badObjects,[]);
  assert.deepEqual(badRequirements,[]);
});

test('story cross-links resolve and each story has truth/acceptance boundaries',()=>{
  const bad=[];
  for(const story of stories.stories){
    assert((story.steps||[]).length>=4,story.id+' needs a real chain');
    assert((story.truth_boundary||[]).length>=2,story.id+' needs truth boundaries');
    assert((story.acceptance||[]).length>=2,story.id+' needs acceptance');
    for(const id of story.cross_links||[])if(!storyIds.has(id))bad.push(story.id+' -> '+id);
  }
  assert.deepEqual(bad,[]);
});

test('four origin families are represented without making legacy source names product brands',()=>{
  const origins=new Set(stories.stories.flatMap(x=>x.origin_coverage||[]));
  for(const id of ['origin-a-city','origin-b-center-methodology','origin-c-cooperative-network','origin-d-goteborg-community'])assert(origins.has(id),id);
});

test('Online Center story records v0 self-service coverage without pretending staffed/live/physical integration',()=>{
  const story=stories.stories.find(x=>x.id==='mura-06-online-center-host');
  assert.equal(story.status,'current_v0_partial');
  assert.match(story.current_gap,/connected self-service routes/i);
  assert.match(story.current_gap,/Staffed Host/i);
  assert(story.steps.some(x=>x.stage==='route'&&x.status==='current_v0_self_service'));
  assert(story.steps.some(x=>x.stage==='consent'&&x.status==='target_human_operation'));
  assert(story.truth_boundary.some(x=>/Do not claim a physical Center venue is open/i.test(x)));
  assert(story.truth_boundary.some(x=>/Do not claim a live Telegram\/forum integration exists/i.test(x)));
  assert(story.truth_boundary.some(x=>/Do not import\/copy\/link real forum members/i.test(x)));
  assert(story.truth_boundary.some(x=>/not force every interaction into a Need\/Project/i.test(x)));
});

test('City story records the v0 source-preserving bridge without upgrading it to first-class process truth',()=>{
  const story=stories.stories.find(x=>x.id==='mura-05-city-to-action');
  assert.equal(story.status,'current_v0_partial');
  assert(story.truth_boundary.some(x=>/source != claim/i.test(x)));
  assert(story.truth_boundary.some(x=>/must not claim.*official report was submitted/i.test(x)));
  assert(story.truth_boundary.some(x=>/never auto-publishes/i.test(x)));
  assert(story.steps.some(x=>x.stage==='choose_next_step'&&x.status==='current_v0'));
  assert(story.steps.some(x=>x.stage==='coordinate'&&x.status==='current_v0_navigation'));
  assert.match(story.current_gap,/does not persist a first-class City Process/i);
});

test('blockchain story is future-only and preserves privacy/independent-verification safeguards',()=>{
  const story=stories.stories.find(x=>x.id==='mura-07-agreement-decision-evidence');
  assert.equal(story.status,'approved_target_future_prototype');
  assert(story.steps.some(x=>x.stage==='testnet_anchor'&&x.status==='future_prototype'));
  assert(!story.steps.some(x=>/^current/.test(x.status)));
  assert(story.truth_boundary.some(x=>/No profile, private message, home address/i.test(x)));
  assert(story.truth_boundary.some(x=>/No mandatory wallet/i.test(x)));
  assert(story.truth_boundary.some(x=>/does not prove real-world truth/i.test(x)));
});

test('Center acceptance contract and runtime are aligned for v0 while later operations remain explicit gaps',()=>{
  assert.match(stories.current_contract_conflict.existing_contract,/Before Online Center Göteborg v0.*hid Center/i);
  assert.match(stories.current_contract_conflict.controlling_target,/Foundation Charter.*requires Mura to include Center/i);
  assert.match(stories.current_contract_conflict.handling,/Resolved for v0/i);
  assert.match(stories.current_contract_conflict.handling,/Staffed Host\/referral operation/i);
  assert.match(stories.current_contract_conflict.handling,/live forum synchronization/i);
});
