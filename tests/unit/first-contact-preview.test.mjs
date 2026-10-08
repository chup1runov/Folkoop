import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const ctx=vm.createContext({});
vm.runInContext(await readFile('apps/web/first-contact-preview.js','utf8'),ctx);
const preview=ctx.FolkoopFirstContactPreview;
const langs=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];
const network=await readFile('apps/web/network-ui.js','utf8');
const match=network.match(/const homeModesCopy=(\{[\s\S]*?\n\});/);
assert(match,'Existing 11-language Home-mode translations must be reused');
const modeDict=Function('return ('+match[1]+')')();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const icon=name=>'<svg aria-hidden="true" data-icon="'+escape(name)+'"></svg>';

test('preview uses the same three equal Home-mode translations for all 11 locales',()=>{
 assert.deepEqual([...preview.LANGS],langs);
 assert.deepEqual(Object.keys(preview.copy).sort(),langs.slice().sort());
 assert.deepEqual(Object.keys(modeDict).sort(),langs.slice().sort());
 for(const l of langs){
  const html=preview.render(l,modeDict,escape,icon);
  assert.equal((html.match(/class="entry-three-card"/g)||[]).length,3,l+' must have three equal entry paths');
  assert.equal((html.match(/data-entry-path=/g)||[]).length,4,l+' must preserve both Need and Offer choices');
  for(const key of ['browseTitle','browseText','solveTitle','solveText','organizeTitle','organizeText',
                    'browseAction','needAction','offerAction','organizeAction']){
   assert(html.includes(escape(modeDict[l][key])),l+' missing '+key);
  }
  for(const action of ['center','need','offer','projects'])
   assert(html.includes('data-entry-path="'+action+'"'),l+' missing '+action);
  assert(preview.copy[l].title.length>5,l+' must have an authored localized question');
  assert(preview.copy[l].intro.length>15,l+' must have product/guest description');
  assert(!html.includes('data-entry="email"'),l+' must not expose registration during exploration');
  assert(!html.includes('<form'),l+' preview must not create objects');
 }
});

test('untrusted dynamic copy cannot introduce executable markup or clickable actions',()=>{
 const synthetic=structuredClone(modeDict);
 synthetic.en.browseTitle='<img src=x onerror=alert(1)>';
 const html=preview.render('en',synthetic,escape,icon);
 assert(!html.includes('<img src=x'));
 assert(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert.throws(()=>preview.render('bad',modeDict,escape,icon),/UNSUPPORTED_FIRST_CONTACT_LANGUAGE/);
});

test('opt-in URL leaves ordinary first-contact, sign-in and Mura tour paths intact',async()=>{
 const shell=await readFile('apps/web/folkoop.js','utf8');
 const html=await readFile('apps/web/folkoop.html','utf8');
 const sw=await readFile('apps/web/sw.js','utf8');
 const pkg=JSON.parse(await readFile('package.json','utf8'));
 const manifest=await readFile('scripts/build/public-assets.mjs','utf8');
 assert(shell.includes("searchParams.get('first-contact')==='three-paths'"));
 assert(shell.includes('const trial=firstContactPreview&&!afterMuraExit'));
 assert(shell.includes("setEntryMode('guest',choice==='center'"));
 assert(shell.includes("if(target){current=target"));
 assert(shell.includes("else if(!onboardingDone&&!firstContactPreview)"));
 assert(shell.includes("setEntryMode('guest');return;"),'traditional Mura tour entry should be preserved');
 assert(html.includes('<script defer src="./first-contact-preview.js"></script>'));
 assert(sw.includes("'first-contact-preview.js'"));
 assert(manifest.includes("'first-contact-preview.js'"));
 assert(sw.includes("const VERSION='"+pkg.version+"'"));
});

test('URL entry path is confined to read-only Mura and keeps explicit exit boundary',()=>{
 assert(network.includes("['center','together','projects'].includes(detail.target)"));
 assert(network.includes("['need','offer'].includes(detail.focusKind)"));
 assert(network.includes("if(guestDemo){showLocalGuest=false;"));
 assert(!preview.render('en',modeDict,escape,icon).includes('type="submit"'));
});
