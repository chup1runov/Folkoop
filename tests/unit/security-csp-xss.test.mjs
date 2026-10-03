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
 assert.match(csp,/worker-src 'self'/);
 assert.match(csp,/connect-src[^;]*cwvhkdqsrbllsykhccmb\.supabase\.co/);
 assert.doesNotMatch(csp,/script-src[^;]*'unsafe-inline'/);
 assert.doesNotMatch(csp,/script-src[^;]*'unsafe-eval'/);
 assert.doesNotMatch(csp,/frame-ancestors/,'frame-ancestors is ignored in meta CSP; enforce it with an HTTP header when hosting supports headers');
 assert.doesNotMatch(csp,/upgrade-insecure-requests/,'meta CSP must not rewrite localhost HTTP QA URLs to HTTPS');
});

test('OAuth callback remains stricter than the main application shell',async()=>{
 const html=await readFile('apps/web/auth-callback.html','utf8');
 const csp=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1]||'';
 assert.match(csp,/default-src 'none'/);
 assert.match(csp,/script-src 'self'/);
 assert.match(csp,/form-action 'none'/);
});

test('network renderers retain explicit HTML escaping at their sink boundaries',async()=>{
 const files=[
  'apps/web/network-ui.js',
  'apps/web/network-activity.js',
  'apps/web/network-messaging.js',
  'apps/web/network-profile.js',
  'apps/web/network-communities.js',
  'apps/web/network-mura-home.js',
  'apps/web/network-purchase-lifecycle.js'
 ];
 const sources=await Promise.all(files.map(path=>readFile(path,'utf8')));
 const ui=sources[0];
 assert.match(ui,/host\.innerHTML=.*esc\(t\('title'\)\)/s);
 assert.match(ui,/host\.innerHTML=demoBanner\+html\+.*esc\(notice\)/s);
 const explicitEscapes=sources.reduce((sum,source)=>sum+(source.match(/\b(?:esc|escape)\(/g)||[]).length,0);
 assert(explicitEscapes>350,'network presentation escaping coverage unexpectedly collapsed');
});
