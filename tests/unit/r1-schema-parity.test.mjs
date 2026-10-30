import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';

const name='20261007121210_folkoop_resource_planning_r1.sql';
const path='supabase/migrations/'+name;
const sql=await readFile(path,'utf8');
const files=(await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql'));
const cfg=await readFile('apps/web/network-config.js','utf8');

test('the exact already-applied hosted R1 migration is retained once in main',()=>{
 assert.equal(files.filter(x=>x===name).length,1);
 assert.match(sql,/Generated name by pinned Supabase CLI 2\.117\.0/);
 assert.match(sql,/create table public\.fk_resource_requirements/i);
 assert.match(sql,/create table public\.fk_resource_availability/i);
 assert.match(sql,/create table folkoop_private\.resource_plan_removals/i);
 assert.match(sql,/revoke all on public\.fk_resource_requirements,public\.fk_resource_availability from public,anon,authenticated/i);
 assert.match(sql,/grant select on public\.fk_resource_requirements,public\.fk_resource_availability to authenticated/i);
 assert.match(sql,/alter table public\.fk_resource_requirements enable row level security/i);
 assert.match(sql,/alter table public\.fk_resource_availability enable row level security/i);
});

test('schema parity never auto-activates the R1 participant UI',async()=>{
 // Main deliberately omits the draft R1 UI field; omission is OFF.
 // A future explicit flag must also remain false until separately approved.
 assert.doesNotMatch(cfg,/resourcePlanningEnabled\s*:\s*true/);
 const r1Flag=cfg.match(/resourcePlanningEnabled\s*:\s*(true|false)/);
 if(r1Flag)assert.equal(r1Flag[1],'false');
 const network=await readFile('scripts/ci/test-database.sh','utf8');
 assert.match(network,/data-api-assert-after-migration\.sql/);
 const sqlTest=await readFile('supabase/tests/network-r1-schema-parity.sql','utf8');
 assert.match(sqlTest,/R1_ALREADY_HOSTED_SCHEMA_PARITY_VERIFIED/);
 assert.match(sqlTest,/folkoop_private\.resource_plan_removals/);
});
