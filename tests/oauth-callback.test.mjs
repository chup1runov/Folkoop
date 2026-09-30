import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const ctx=vm.createContext({URLSearchParams});
vm.runInContext(await readFile('auth-callback-core.js','utf8'),ctx);
const P=ctx.FolkoopOAuthCallback;

test('OAuth callback parser accepts access token and finite expiry',()=>{
 const r=P.parse('#access_token='+('a'.repeat(32))+'&expires_in=3600&refresh_token=must-not-be-used');
 assert.equal(r.ok,true);assert.equal(r.accessToken,'a'.repeat(32));assert.equal(r.expiresIn,3600);
 assert(!('refreshToken' in r));
});

test('OAuth callback parser surfaces provider errors without tokens',()=>{
 const r=P.parse('#error=access_denied&error_description=cancelled');
 assert.deepEqual(JSON.parse(JSON.stringify(r)),{ok:false,error:'access_denied',errorDescription:'cancelled'});
});

test('OAuth callback parser rejects malformed or excessive token data',()=>{
 for(const hash of ['', '#access_token=x&expires_in=3600', '#access_token='+('a'.repeat(32))+'&expires_in=0', '#access_token='+('a'.repeat(32))+'&expires_in=999999']){
  assert.equal(P.parse(hash).ok,false);
 }
});


test('OAuth callback document has restrictive token-handling headers/meta',async()=>{
 const html=await readFile('auth-callback.html','utf8');
 assert.match(html,/name="referrer" content="no-referrer"/);
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(html,/http-equiv="Content-Security-Policy"/);
 assert.match(html,/default-src 'none'/);
 assert.match(html,/script-src 'self'/);
 assert.match(html,/base-uri 'none'/);
 assert(!/https?:\/\/[^"' ]+\.js/i.test(html));
});
