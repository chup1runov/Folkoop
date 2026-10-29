import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('apps/web/email-link.js','utf8');
function run(hash,pathname='/Folkoop/'){const writes=[],ctx=vm.createContext({URLSearchParams,Date,location:{hash,pathname},history:{replaceState(...v){writes.push(v);}},sessionStorage:{setItem(k,v){assert.equal(k,'folkoop-entry-mode-v1');assert.equal(v,'account');}}});vm.runInContext(source,ctx);return {ctx,writes,value:ctx.FolkoopEmailLink?.take()};}
const valid='#access_token='+('x'.repeat(32))+'&refresh_token=never-persist&expires_in=3600&token_type=bearer&type=magiclink';
test('email callback is consumed once; URL scrubbed before application code',()=>{const r=run(valid);assert.equal(r.value.token,'x'.repeat(32));assert.equal(r.writes[0][2],'/Folkoop/?intro=0#/me');assert.equal(r.ctx.FolkoopEmailLink.take(),null);assert(!JSON.stringify(r.value).includes('never-persist'));});
test('normal routes are untouched',()=>{const r=run('#/projects');assert.equal(r.value,undefined);assert.equal(r.writes.length,0);});
test('expired, recovery, provider errors and malformed callbacks fail closed and scrub',()=>{for(const hash of [valid+'&expires_at=1',valid.replace('magiclink','recovery'),valid+'&access_token=another',valid.replace('3600','NaN'),'#error=denied&error_description=private',valid.replace('bearer','other')]){const r=run(hash);assert.equal(r.value.error,true);assert.equal(r.value.token,undefined);assert.equal(r.writes.length,1);}});
test('email callback capture precedes analytics and all other application scripts',()=>{const html=readFileSync('apps/web/folkoop.html','utf8');assert.equal([...html.matchAll(/<script[^>]+src="([^"]+)"/g)][0][1],'./email-link.js');});

test('Cloudflare root callback returns to account and scrubs tokens',()=>{const r=run(valid,'/');assert.equal(r.value.token,'x'.repeat(32));assert.equal(r.writes[0][2],'/?intro=0#/me');assert.equal(r.ctx.FolkoopEmailLink.take(),null);});
