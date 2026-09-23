import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const copy=await readFile('about-copy.js','utf8'),script=await readFile('about-project.js','utf8');
const ctx=vm.createContext({console});vm.runInContext(copy,ctx);vm.runInContext(script,ctx);
const A=ctx.SverinavProjectAbout;
test('about: eleven complete localizations with eleven practical answers',()=>{
 assert.deepEqual(Object.keys(A.COPY).sort(),['ar','bs','en','es','fa','fi','ku','ru','so','sv','uk']);
 for(const [lang,L] of Object.entries(A.COPY)){
  assert.equal(L.questions.length,11,lang);
  assert.deepEqual(Object.keys(L).sort(),Object.keys(A.COPY.sv).sort());
  for(const [key,value] of Object.entries(L)){
   if(key==='questions')for(const pair of value){assert.equal(pair.length,2);pair.forEach(text=>assert(text.trim().length>4));}
   else assert.equal(typeof value,'string',lang+key);
  }
 }
});
test('about: idea year attributed separately from repository creation',()=>{
 assert.equal(A.IDEA_YEAR,2021);assert.equal(A.REPOSITORY_CREATED,'2026-09-21');
 assert.equal(A.AUTHOR.name,'Pavel Chuprunov');
 assert(A.COPY.en.dateNote.includes('According to'));assert(A.COPY.ru.dateNote.includes('по словам'));
 assert.equal(new URL(A.BIO_SOURCE).hostname,'www.mittskifte.org');
});
test('about: approved contacts contain no automatic message or position payload',()=>{
 assert.equal(A.CONTACT.email,'mailto:chup1runov@gmail.com');
 assert.equal(A.CONTACT.telegram,'https://t.me/chup1runov');
 assert.equal(new URL(A.CONTACT.email).search,'');assert.equal(new URL(A.CONTACT.telegram).search,'');
 assert(!script.includes('navigator.geolocation'));assert(!script.includes('localStorage'));
 assert(!script.includes('fetch('));assert(!script.includes('issues/new'));
});
test('about: activities and finance remain plans, not a launched rewards service',()=>{
 assert(A.COPY.en.questions[7][1].includes('not available'));
 assert(A.COPY.en.questions[8][1].includes('not promised'));
 assert(A.COPY.sv.purpose.includes('ännu inte'));
 assert(A.COPY.ru.purpose.includes('ещё не'));
});
test('about: copy loads before renderer and is included in offline shell/build',async()=>{
 const [html,build,sw]=await Promise.all(['index.html','scripts/build-site.mjs','sw.js'].map(f=>readFile(f,'utf8')));
 for(const f of ['about-copy.js','about-project.js','about-project.css']){assert(html.includes(f));assert(build.includes(f));assert(sw.includes(f));}
 assert(html.indexOf('./about-copy.js')<html.indexOf('./about-project.js'));
 assert(script.includes("stack.querySelector('.about-meta a')?.remove()"));
});
