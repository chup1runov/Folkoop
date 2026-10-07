import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const sandbox = {};
vm.runInNewContext(readFileSync('apps/web/resource-planning-core.js', 'utf8'), sandbox);
const core = sandbox.FolkoopResourcePlanning;
const PROJECT='11111111-1111-4111-8111-111111111111';
const RESOURCE='22222222-2222-4222-8222-222222222222';
const ID='33333333-3333-4333-8333-333333333333';
const from='2026-10-10T09:00:00+02:00', until='2026-10-10T13:00:00+02:00';
const req=(v={})=>({id:ID,projectId:PROJECT,title:'Two drills',kind:'equipment',quantity:'2',unit:'piece',from,until,...v});
const avail=(v={})=>({resourceId:RESOURCE,kind:'equipment',quantity:'2',unit:'piece',from,until,...v});
const rejects=(fn,code)=>assert.throws(fn,e=>e.code===code);

test('module has no I/O and does not publish mutable API',()=>assert.ok(Object.isFrozen(core)));
test('requirement reuses project ID, normalizes timezone, keeps missing flow null',()=>{
 const r=core.requirement(req());assert.equal(r.projectId,PROJECT);assert.equal(r.flowId,null);assert.equal(r.from,'2026-10-10T07:00:00.000Z');assert.ok(Object.isFrozen(r));
});
test('validation does not mutate source',()=>{const r=req();const before=JSON.stringify(r);core.requirement(r);assert.equal(JSON.stringify(r),before);});
test('zero capacity is explicit, not missing capacity',()=>assert.equal(core.availability(avail({quantity:'0'})).quantity,'0'));
test('missing capacity is not silently zero',()=>rejects(()=>core.availability(avail({quantity:undefined})),'INVALID_QUANTITY'));
test('decimal quantities normalize without rounding',()=>assert.equal(core.quantity('2.500'),'2.5'));
test('quantity upper boundary is exact',()=>assert.equal(core.quantity('1000000000.000'),'1000000000'));
for(const value of ['', '0', '-1', '01', '1e3', 'NaN', 'Infinity', '0.0001', '1.0000', '1000000000.001', 1, true, null, ' 1 ']){
 test(`requirement quantity rejects ${JSON.stringify(value)}`,()=>rejects(()=>core.quantity(value),'INVALID_QUANTITY'));
}
for(const value of ['2026-02-30T10:00:00Z','2026-13-01T10:00:00Z','2026-01-01T24:00:00Z','2026-01-01T10:00:00','2026-01-01','2026-01-01T10:00:60Z','2026-01-01T10:00:00-00:00','2026-01-01T10:00:00+14:01']){
 test(`timestamp rejects ${value}`,()=>rejects(()=>core.timestamp(value),'INVALID_TIME'));
}
test('leap day valid only in leap year',()=>{assert.equal(core.timestamp('2024-02-29T12:00:00Z'),'2024-02-29T12:00:00.000Z');rejects(()=>core.timestamp('2026-02-29T12:00:00Z'),'INVALID_TIME');});
test('equipment requires full interval',()=>rejects(()=>core.requirement(req({from:null,until:null})),'WINDOW_REQUIRED'));
test('work requires full interval',()=>rejects(()=>core.requirement(req({kind:'work',unit:'hour',from:null,until:null})),'WINDOW_REQUIRED'));
test('one missing endpoint rejected',()=>rejects(()=>core.requirement(req({until:null})),'INCOMPLETE_WINDOW'));
test('empty or reversed interval rejected',()=>{for(const u of [from,'2026-10-10T08:00:00+02:00'])rejects(()=>core.requirement(req({until:u})),'INVALID_WINDOW');});
test('consumables allow unspecified time without assuming unlimited availability',()=>{const r=core.requirement(req({kind:'consumable',unit:'kg',from:null,until:null}));assert.equal(r.from,null);});
test('fractional pieces rejected',()=>rejects(()=>core.requirement(req({quantity:'1.5'})),'INDIVISIBLE_QUANTITY'));
test('hours are not pieces',()=>rejects(()=>core.requirement(req({kind:'work',unit:'piece'})),'INVALID_DIMENSION'));
test('unknown resource kind rejected',()=>rejects(()=>core.requirement(req({kind:'money'})),'INVALID_DIMENSION'));
test('unknown unit requires explicit future adaptation',()=>rejects(()=>core.requirement(req({unit:'drills'})),'INVALID_DIMENSION'));
test('inherited object key is not a kind',()=>rejects(()=>core.requirement(req({kind:'toString'})),'INVALID_DIMENSION'));
test('spoofed ownership or accepted fields rejected',()=>{for(const key of ['ownerId','accepted','delivered','reserved'])rejects(()=>core.requirement({...req(),[key]:true}),'UNKNOWN_FIELD');});
test('invalid IDs rejected without creating local identities',()=>rejects(()=>core.requirement(req({id:'new'})),'INVALID_ID'));
test('plain conditions preserved as text, never evaluated',()=>{assert.equal(core.requirement(req({conditions:'<script>doNotRun()</script>'})).conditions,'<script>doNotRun()</script>');assert.equal(sandbox.doNotRun,undefined);});
test('long and control-character text rejected',()=>{rejects(()=>core.requirement(req({title:'x'.repeat(161)})),'INVALID_TEXT');rejects(()=>core.requirement(req({conditions:'bad\0data'})),'INVALID_TEXT');});
test('requirement RPC args carry revision but never actor or consent',()=>{const a=core.requirementArgs(req(),0);assert.equal(a.p_expected_revision,0);assert.equal(a.p_project,PROJECT);assert.equal(a.p_id,ID);assert.equal(a.actor,undefined);assert.equal(a.accepted,undefined);});
test('availability RPC args carry existing resource ID',()=>assert.equal(core.availabilityArgs(avail(),3).p_resource,RESOURCE));
for(const revision of [-1,1.5,'1',null,2147483647])test(`revision rejects ${JSON.stringify(revision)}`,()=>rejects(()=>core.requirementArgs(req(),revision),'INVALID_REVISION'));
test('unknown availability remains unknown',()=>{const c=core.compareDeclared(req(),null);assert.equal(c.compatibility,'unknown');assert.equal(c.quantity,undefined);});
test('sufficient declaration is not a reservation or verified match',()=>{const c=core.compareDeclared(req(),avail());assert.equal(c.compatibility,'needs_confirmation');assert.equal(c.reservation,'not_checked');assert.equal(c.agreement,'not_checked');assert.equal(c.fulfilment,'not_checked');assert.equal(c.time,'covers');});
test('different units are not added or converted',()=>{const c=core.compareDeclared(req(),avail({kind:'work',unit:'hour'}));assert.equal(c.reason,'DIMENSION_MISMATCH');assert.equal(c.planningGap,undefined);});
test('partial declaration shows gap in the same unit',()=>{const c=core.compareDeclared(req(),avail({quantity:'1'}));assert.equal(c.quantity,'partial');assert.equal(c.planningGap,'1');assert.equal(c.unit,'piece');});
test('decimal gap is exact for materials',()=>{const r=req({kind:'consumable',unit:'kg',quantity:'0.3'}),a=avail({kind:'consumable',unit:'kg',quantity:'0.1'});assert.equal(core.compareDeclared(r,a).planningGap,'0.2');});
test('adjacent non-overlapping windows do not cover the need',()=>{const c=core.compareDeclared(req(),avail({from:until,until:'2026-10-10T18:00:00+02:00'}));assert.equal(c.time,'outside');assert.equal(c.compatibility,'incompatible');});
test('partial overlap does not silently satisfy full interval',()=>assert.equal(core.compareDeclared(req(),avail({until:'2026-10-10T11:00:00+02:00'})).time,'outside'));
test('no amount declared is not an available candidate',()=>assert.equal(core.compareDeclared(req(),avail({quantity:'0'})).compatibility,'incompatible'));
test('material timing unknown needs confirmation, not promise',()=>{const r=req({kind:'consumable',unit:'kg'}),a=avail({kind:'consumable',unit:'kg',from:null,until:null});const c=core.compareDeclared(r,a);assert.equal(c.time,'unknown');assert.equal(c.compatibility,'needs_confirmation');});
test('each requirement is compared independently without global total',()=>{const first=core.compareDeclared(req(),avail()),second=core.compareDeclared(req({id:'44444444-4444-4444-8444-444444444444',kind:'work',unit:'hour',quantity:'4'}),avail({kind:'work',unit:'hour',quantity:'1'}));assert.equal(first.unit,'piece');assert.equal(second.unit,'hour');assert.equal(second.planningGap,'3');});
