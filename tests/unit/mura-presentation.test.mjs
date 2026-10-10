import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('apps/web/mura-presentation.js','utf8');
const box={};vm.runInNewContext(source,box);
const {nextIndex}=box.FolkoopMuraPresentation;
for(const rtl of [false,true]){
 test('chapter keyboard direction '+(rtl?'RTL':'LTR'),()=>{
  assert.equal(nextIndex(0,'ArrowRight',9,rtl),rtl?8:1);
  assert.equal(nextIndex(0,'ArrowLeft',9,rtl),rtl?1:8);
  assert.equal(nextIndex(4,'Home',9,rtl),0);
  assert.equal(nextIndex(4,'End',9,rtl),8);
  assert.equal(nextIndex(4,'Enter',9,rtl),null);
 });
}
test('invalid or empty tab set is not navigable',()=>{
 for(const n of [0,-1,NaN,1.5])assert.equal(nextIndex(0,'ArrowRight',n),null);
 assert.equal(nextIndex(0,'ArrowRight',1),0);
});
test('enhancement is local, user-operated and preserves original account navigation',()=>{
 assert(Object.isFrozen(box.FolkoopMuraPresentation));
 assert.doesNotMatch(source,/fetch\s*\(|localStorage|sessionStorage|setInterval|auth\/v1|innerHTML/);
 assert.match(source,/aria-controls/);assert.match(source,/aria-selected/);
 assert.match(source,/panel\.hidden|panels\[i\]\.hidden/);
 assert.match(source,/selectedChapter='need'/);
});
test('new notes and current-language Home are composed without undoing main translations',()=>{
 const home=readFileSync('apps/web/network-mura-home.js','utf8');
 assert.match(home,/FolkoopMuraLife\?\.render/);
 assert.match(home,/FolkoopExtraCopy\?\.muraHome/);
 const shell=readFileSync('apps/web/folkoop.js','utf8');
 assert.match(shell,/FolkoopExtraCopy\?\.muraNarrative/);
 assert.match(shell,/first-contact/);
});
