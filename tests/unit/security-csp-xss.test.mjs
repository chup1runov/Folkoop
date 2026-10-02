import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const shells=['apps/web/index.html','apps/web/folkoop.html'];
for(const path of shells)test(path+' ships a restrictive CSP',async()=>{
 const html=await readFile(path,'utf8');
 const csp=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1]||'';
 assert.match(csp,/default-src 'self'/);
 assert.match(csp,/script-src 'self'/);
 assert.match(csp,/object-src 'none'/);
 assert.match(csp,/base-uri 'none'/);
 assert.match(csp,/frame-ancestors 'none'/);
 assert.match(csp,/worker-src 'self'/);
 assert.match(csp,/connect-src[^;]*cwvhkdqsrbllsykhccmb\.supabase\.co/);
 assert.doesNotMatch(csp,/script-src[^;]*'unsafe-inline'/);
 assert.doesNotMatch(csp,/script-src[^;]*'unsafe-eval'/);
});

test('OAuth callback remains stricter than the main application shell',async()=>{
 const html=await readFile('apps/web/auth-callback.html','utf8');
 const csp=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1]||'';
 assert.match(csp,/default-src 'none'/);
 assert.match(csp,/script-src 'self'/);
 assert.match(csp,/form-action 'none'/);
});

test('network renderers retain explicit HTML escaping at their two sink boundaries',async()=>{
 const ui=await readFile('apps/web/network-ui.js','utf8');
 assert.match(ui,/host\.innerHTML=.*esc\(t\('title'\)\)/s);
 assert.match(ui,/host\.innerHTML=demoBanner\+html\+.*esc\(notice\)/s);
 assert((ui.match(/\besc\(/g)||[]).length>350,'network UI escaping coverage unexpectedly collapsed');
});
