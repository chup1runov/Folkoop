import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from '../../apps/web/auth-callback-core.mjs';

test('OAuth callback parser accepts access token and finite expiry',()=>{
 const r=parse('#access_token='+('a'.repeat(32))+'&expires_in=3600&refresh_token=must-not-be-used');
 assert.equal(r.ok,true);assert.equal(r.accessToken,'a'.repeat(32));assert.equal(r.expiresIn,3600);
 assert(!('refreshToken' in r));
});

test('OAuth callback parser surfaces provider errors without tokens',()=>{
 const r=parse('#error=access_denied&error_description=cancelled');
 assert.deepEqual(r,{ok:false,error:'access_denied',errorDescription:'cancelled'});
});

test('OAuth callback parser rejects malformed or excessive token data',()=>{
 for(const hash of ['', '#access_token=x&expires_in=3600', '#access_token='+('a'.repeat(32))+'&expires_in=0', '#access_token='+('a'.repeat(32))+'&expires_in=999999']){
  assert.equal(parse(hash).ok,false);
 }
});

test('OAuth callback document has restrictive token handling and one explicit module entrypoint',async()=>{
 const html=await readFile('apps/web/auth-callback.html','utf8');
 const runtime=await readFile('apps/web/auth-callback.mjs','utf8');
 assert.match(html,/name="referrer" content="no-referrer"/);
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(html,/http-equiv="Content-Security-Policy"/);
 assert.match(html,/default-src 'none'/);
 assert.match(html,/script-src 'self'/);
 assert.match(html,/base-uri 'none'/);
 assert.match(html,/<script type="module" src="\.\/auth-callback\.mjs"><\/script>/);
 assert(!html.includes('auth-callback-core.js'));
 assert.match(runtime,/import\s*\{\s*parse\s*\}\s*from\s*['"]\.\/auth-callback-core\.mjs['"]/);
 assert(!/https?:\/\/[^"' ]+\.(?:js|mjs)/i.test(html));
});
