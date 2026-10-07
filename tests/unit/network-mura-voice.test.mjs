import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const ctx={};ctx.globalThis=ctx;
vm.runInNewContext(readFileSync('apps/web/network-mura-voice.js','utf8'),ctx);
const v=ctx.FolkoopMuraVoice;
const langs=['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku'];
const steps=['welcome','home','together','projects','people','city','center','quick'];
test('Mura tells eight first-person chapters in all eleven languages',()=>{
 for(const lang of langs){
  const copy=v.walkCopy(lang);
  for(const key of steps){assert(copy[key]?.length>25,lang+' '+key);assert(v.walkTitle(lang,key).length>2);}
  const center=v.centerCopy(lang);
  for(const k of ['title','body','localTitle','localText','helper'])assert(center[k]?.length>8,lang+' '+k);
 }
});
test('visible chapter copy never exposes development or participation fiction as system truth',()=>{
 for(const lang of langs){
  const visible=Object.values(v.walkCopy(lang)).join(' ')+Object.values(v.centerCopy(lang)).join(' ');
  for(const banned of ['demo','prototype','pseudouser','учебн','прототип','псевдоаккаунт']){
   assert(!visible.toLowerCase().includes(banned),lang+': '+banned);
  }
 }
});
test('Mura Center does not claim a real venue, synchronised forum or payment',()=>{
 const ru=v.centerCopy('ru'),en=v.centerCopy('en');
 assert(ru.title.includes('Göteborg'));
 assert(en.localText.includes('GBG Forum'));
 assert(!/opened physical venue|real forum synchronization|payment complete/i.test(JSON.stringify({ru,en})));
});
test('all Mura voice input is authored data with no Auth or persistence code',()=>{
 const src=readFileSync('apps/web/network-mura-voice.js','utf8');
 assert.doesNotMatch(src,/fetch\s*\(|localStorage|sessionStorage|auth\/v1|createUser/);
});
