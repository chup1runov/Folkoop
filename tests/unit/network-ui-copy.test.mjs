import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const code=await readFile('apps/web/network-ui-copy.js','utf8');
function loadCopy(){
 const sandbox={};
 runInNewContext(code,sandbox,{timeout:1000});
 return sandbox.FolkoopNetworkUiCopy;
}

test('static UI copy module exposes the existing independent packs',()=>{
 const copy=loadCopy();
 assert(copy&&Object.isFrozen(copy));
 for(const name of ['en','ru','sv','muraGuestCopy','chatCopy','coopCopy','offerCopy','lifecycleCopy','activityCopy','homeCopy','homeModesCopy']){
  assert(copy[name]&&typeof copy[name]==='object',name);
 }
 assert.equal(copy.en.title,'Network account');
 assert.equal(copy.ru.title,'Сетевой аккаунт');
 assert.equal(copy.sv.title,'Nätverkskonto');
 for(const lang of ['en','ru','sv']){
  assert.equal(copy.muraGuestCopy[lang].base.profile,lang==='ru'?'Мура':'Mura');
  for(const name of ['chatCopy','coopCopy','offerCopy','lifecycleCopy','activityCopy','homeCopy']){
   assert(copy[name][lang]&&Object.keys(copy[name][lang]).length>0,`${name} missing ${lang}`);
  }
 }
});

test('home-mode prompts remain available in all eleven interface languages',()=>{
 const packs=loadCopy().homeModesCopy;
 const locales=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];
 assert.deepEqual(Object.keys(packs).sort(),locales.sort());
 const keys=Object.keys(packs.en).sort();
 for(const lang of locales){
  assert.deepEqual(Object.keys(packs[lang]).sort(),keys,`missing home mode keys for ${lang}`);
  for(const value of Object.values(packs[lang]))assert.equal(typeof value,'string');
 }
});

test('UI runtime consumes the copy boundary rather than defining its own base tables',async()=>{
 const ui=await readFile('apps/web/network-ui.js','utf8');
 assert.match(ui,/const networkUiCopy=globalThis\.FolkoopNetworkUiCopy;/);
 assert.match(ui,/if\(!networkUiCopy\)throw new Error/);
 assert.doesNotMatch(ui,/const en=\{title:'Network account'/);
 assert.match(ui,/globalThis\.FolkoopHomeModesCopy=Object\.freeze\(homeModesCopy\)/);
});
