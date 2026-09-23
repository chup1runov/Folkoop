import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const script=await readFile('about-project.js','utf8');
const ctx=vm.createContext({console});vm.runInContext(script,ctx);
const A=ctx.SverinavProjectAbout;
test('about: eleven complete localized FAQ sets',()=>{
 assert.deepEqual(Object.keys(A.COPY).sort(),['ar','bs','en','es','fa','fi','ku','ru','so','sv','uk']);
 for(const [lang,L] of Object.entries(A.COPY)){
  assert.equal(L.questions.length,9,lang);
  for(const [key,value] of Object.entries(L)){
   if(key==='questions')for(const pair of value){assert.equal(pair.length,2);pair.forEach(text=>assert(text.trim().length>4));}
   else assert.equal(typeof value,'string',lang+key);
  }
  assert.deepEqual(Object.keys(L).sort(),Object.keys(A.COPY.sv).sort());
 }
});
test('about: verified repository date is not an invented biography',()=>{
 assert.equal(A.REPOSITORY_CREATED,'2026-09-21');assert.equal(A.AUTHOR.name,'Pavel Chuprunov');
 assert.equal(A.AUTHOR.profile,'https://github.com/chup1runov');
 assert(A.COPY.sv.dateNote.includes('inte'));assert(A.COPY.en.created.includes('repository'));
});
test('about: public author contact never pre-fills user content',()=>{
 const u=new URL(A.CONTACT);assert.equal(u.origin,'https://github.com');
 assert.equal(u.pathname,'/chup1runov/Sverinav/issues/new');
 assert.deepEqual([...u.searchParams.keys()],['template']);
 assert.equal(u.searchParams.get('template'),'contact-author.yml');
 assert(A.COPY.en.contactNote.includes('Public'));assert(A.COPY.sv.contactNote.includes('Offentlig'));
 assert(!script.includes('mailto:'));assert(!script.includes('navigator.geolocation'));assert(!script.includes('localStorage'));
});
test('about: assets linked, built and in the scoped offline cache',async()=>{
 const [html,build,sw,form]=await Promise.all(['index.html','scripts/build-site.mjs','sw.js','.github/ISSUE_TEMPLATE/contact-author.yml'].map(f=>readFile(f,'utf8')));
 for(const f of ['about-project.js','about-project.css']){assert(html.includes(f));assert(build.includes(f));assert(sw.includes(f));}
 assert(html.indexOf('about-project.js')>html.indexOf('./app.js'));
 assert(form.includes('public-consent'));assert(form.includes('required: true'));
});
