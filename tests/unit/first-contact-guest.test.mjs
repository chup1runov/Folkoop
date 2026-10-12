import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const code=await readFile('apps/web/first-contact-preview.js','utf8');
const context=vm.createContext({});
vm.runInContext(code,context);
const preview=context.FolkoopFirstContactPreview;
const locales=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];
const shell=await readFile('apps/web/folkoop.js','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('C provides a short guest welcome in every established locale',()=>{
 assert.deepEqual(Object.keys(preview.guestCopy).sort(),locales.slice().sort());
 for(const locale of locales){
  const text=preview.guestCopy[locale];
  for(const key of ['title','intro','guest','choose','hide','language','note','demo']){
   assert(text[key]?.length>3,locale+' missing '+key);
  }
  assert(text.intro.length>=28,locale+' must explain social, help and cooperation');
  assert(text.note.length>=25,locale+' must disclose fictional guest experience');
 }
 assert.match(preview.guestCopy.ru.title,/FOLKOOP/);
 assert.match(preview.guestCopy.sv.title,/FOLKOOP/);
});

test('C is a separate opt-in URL, leaving A and B untouched',()=>{
 assert(shell.includes("searchParams.get('first-contact')==='guest-guide'"));
 assert(shell.includes("searchParams.get('first-contact')==='three-paths'"));
 assert(shell.includes('const trial=firstContactPreview&&!afterMuraExit;'));
 assert(shell.includes('const guideTrial=firstContactGuest&&!afterMuraExit;'));
 assert(shell.includes('const showModes=trial||(guideTrial&&guestPathsExpanded);'));
 assert(shell.includes('else if(!onboardingDone&&!firstContactTrial)'));
 assert(shell.includes("setEntryMode('guest');return;"),'Mura guest tour must use existing read-only route');
 assert(shell.includes("if(action==='paths'&&firstContactGuest&&!entryGateAfterMuraExit)"));
 assert(shell.includes("if(previewChoice&&!ensureEntryGate().hidden&&(firstContactPreview||(firstContactGuest&&guestPathsExpanded)))"));
 assert(shell.includes('guestPathsExpanded=false;entryGateAfterMuraExit=false'));
});

test('C preserves safe language selection, accessible focus and explicit demo boundary',()=>{
 assert(shell.includes('id="entryGuestLanguage" aria-labelledby="entryGuestLanguageTitle"'));
 assert(shell.includes('aria-controls="entryThreePaths" aria-expanded="false"'));
 assert(shell.includes("if(!C.LANGS.includes(code))return;"));
 assert(shell.includes("picker.innerHTML=C.LANGS.map(code=>"));
 assert(shell.includes("trialPanel.innerHTML=(guideTrial?'<p class=\"entry-guest-demo\">'+esc(guide.demo)"));
 assert(shell.includes("target?.focus({preventScroll:true})"));
 assert(shell.includes("pathsButton.setAttribute('aria-expanded',String(guideTrial&&guestPathsExpanded));"));
 assert(css.includes('.entry-guest-guide [data-entry="paths"][hidden]{display:none!important}'));
 assert(css.includes('.entry-guest-guide #entryGuestLanguage:focus-visible'));
 assert(css.includes('@media(max-width:380px) and (max-height:620px)'));
});

test('variant C does not add external write endpoints or real participant controls',async()=>{
 const markup=await readFile('apps/web/folkoop.html','utf8');
 const sw=await readFile('apps/web/sw.js','utf8');
 const pkg=JSON.parse(await readFile('package.json','utf8'));
 assert(markup.indexOf('src="./network-ui.js"')<markup.indexOf('src="./folkoop.js"'));
 assert(sw.includes("const VERSION='"+pkg.version+"'"));
 assert(!code.includes('fetch('),'copy module must never fetch');
 assert(!code.includes('XMLHttpRequest'));
 assert(!code.includes('localStorage'));
 assert(!code.includes('data-entry="email"'));
 assert(!code.includes('type="submit"'));
 assert(!shell.includes("new URL(location.href).searchParams.get('first-contact')==='guest-guide'&&enablePilot"));
});
