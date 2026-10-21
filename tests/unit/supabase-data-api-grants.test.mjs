import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';

const dir='supabase/migrations';
const migrations=(await readdir(dir)).filter(file=>file.endsWith('.sql')).sort();
const projectTable=/\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?public\.fk_[a-z_][a-z_0-9]*/gi;

test('every current public FK table creation migration expressly opts into narrow Data API read access',async()=>{
 let tableCount=0,checkedMigrations=0;
 for(const file of migrations){
  const content=await readFile(dir+'/'+file,'utf8');
  const tables=[...content.matchAll(projectTable)].map(match=>match[0]);
  if(!tables.length)continue;
  checkedMigrations++;
  tableCount+=tables.length;
  assert.match(content,/\bgrant\s+select\s+on\s+public\./i,
    file+' must explicitly GRANT SELECT to its chosen Data API role');
  assert.match(content,/\brevoke\s+all\s+on\s+public\./i,
    file+' must revoke implicit broad table grants');
  assert.match(content,/\benable\s+row\s+level\s+security\b/i,
    file+' must enable RLS before relying on row-filtered Data API SELECT');
 }
 assert(tableCount>=25,'Unexpectedly incomplete public FOLKOOP schema migration set');
 assert(checkedMigrations>=5,'Expected multiple explicit-permission table migrations');
});

test('migration history cannot silently restore broad Data API default grants',async()=>{
 for(const file of migrations){
  const content=await readFile(dir+'/'+file,'utf8');
  assert.doesNotMatch(content,/\bgrant\s+(?:all|select\s*,\s*insert)[\s\S]{0,160}?\bon\s+all\s+tables\s+in\s+schema\s+public\b/i,
   file+' must not blanket-expose every public table');
  assert.doesNotMatch(content,/\balter\s+default\s+privileges[\s\S]{0,200}?\bgrant\s+(?:all|select\s*,\s*insert)[\s\S]{0,160}?\bto\s+(?:anon|authenticated)\b/i,
   file+' must not reintroduce automatic broad Data API permissions');
 }
});

test('disposable SQL acceptance probes the post-30-October opt-in and direct-write boundary',async()=>{
 const testSql=await readFile('supabase/tests/network-z-data-api-grants.sql','utf8');
 const runner=await readFile('scripts/ci/test-database.sh','utf8');
 assert.match(runner,/supabase\/tests\/network-\*\.sql/);
 assert.match(testSql,/DATA_API_EXPLICIT_GRANTS_VERIFIED/);
 assert.match(testSql,/EXPLICIT_AUTH_SELECT_GRANT_REQUIRED/);
 assert.match(testSql,/DIRECT_CLIENT_DML_FORBIDDEN/);
 assert.match(testSql,/create table public\.fk_data_api_opt_in_probe/);
 assert.match(testSql,/grant select on public\.fk_data_api_opt_in_probe to authenticated/);
 assert.match(testSql,/^rollback;/m,'synthetic table must never survive disposable test');
});
