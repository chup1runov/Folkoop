import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../home-welcome.js',import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(source,context);
const {markup}=context.FolkoopHomeWelcome;
test('public Home has no invented activity, credentials, API or storage',()=>{
 assert(!/\b(fetch|WebSocket|sendBeacon|localStorage|sessionStorage)\b/.test(source));
 for(const language of ['sv','en','ru']){
  const html=markup(language);
  assert.equal((html.match(/class="card home-attention-card"/g)||[]).length,4);
  for(const path of ['me','people','communities','city','center'])assert(html.includes(`href="#/${path}"`));
  assert(html.includes('data-create="project"'));
  assert(!/net-count|data-home="openCoop"|<img/.test(html));
 }
});
test('unsupported locale uses declared English fallback, not supplied markup',()=>{
 assert.equal(markup('uk'),markup('en'));
 assert.equal(markup('constructor'),markup('en'));
 assert(!markup('<img src=x onerror=alert(1)>').includes('<img'));
});
test('public Home never takes over network visibility or authorization',()=>{
 assert(!/\.hidden\s*=|\.style\.|auth\.uid|access_token|\.user\(/.test(source));
 assert(source.includes("root.querySelector('[data-home-welcome]')"));
});
