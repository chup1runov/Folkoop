import {test} from 'node:test';import assert from 'node:assert/strict';
import {requireDatabaseCheck} from '../../scripts/ci/require-database-check.mjs';
const sha='a'.repeat(40),env={CF_PAGES:'1',CF_PAGES_COMMIT_SHA:sha};
const run={id:1,head_sha:sha,path:'.github/workflows/network.yml',event:'push',head_branch:'main',status:'completed',conclusion:'success'};
const opts=runs=>({attempts:1,fetch:async()=>Response.json({workflow_runs:runs})});
test('Cloudflare requires successful SQL run at exact SHA',async()=>{await requireDatabaseCheck(env,opts([run]));for(const patch of [{head_sha:'b'.repeat(40)},{conclusion:'failure'},{status:'queued'},{event:'pull_request'},{head_branch:'other'},{path:'fake.yml'}])await assert.rejects(requireDatabaseCheck(env,opts([{...run,...patch}])));});
test('missing SHA, API outage and newest failed rerun fail closed',async()=>{await assert.rejects(requireDatabaseCheck({CF_PAGES:'1'},opts([])));await assert.rejects(requireDatabaseCheck(env,{fetch:async()=>new Response('',{status:403})}));await assert.rejects(requireDatabaseCheck(env,opts([run,{...run,id:2,conclusion:'failure'}])));});
test('local/static build does not require remote checks',async()=>{await requireDatabaseCheck({}, {fetch:()=>{throw Error('must not fetch');}});});
