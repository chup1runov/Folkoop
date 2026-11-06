import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sessionConfig} from '../../scripts/build/session-config.mjs';
const source="{serverSession:false,url:'https://abcdefghijklmnopqrst.supabase.co',publishableKey:'sb_publishable_test'}";
const env={CF_PAGES:'1',FOLKOOP_SERVER_SESSION:'1',SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',SESSION_KEY:'a'.repeat(64)};
test('static and unconfigured builds retain memory-only mode',()=>{assert.equal(sessionConfig(source,{}),source);assert.equal(sessionConfig(source,{CF_PAGES:'1'}),source);});
test('configured Pages build activates without exposing encryption key',()=>{const result=sessionConfig(source,env);assert.match(result,/serverSession:true/);assert.ok(!result.includes(env.SESSION_KEY));});
test('activation fails closed on wrong host, missing key or provider mismatch',()=>{for(const change of [{CF_PAGES:'0'},{SESSION_KEY:''},{SUPABASE_URL:'https://zzzzzzzzzzzzzzzzzzzz.supabase.co'},{SUPABASE_PUBLISHABLE_KEY:'sb_publishable_other'}])assert.throws(()=>sessionConfig(source,{...env,...change}));});
