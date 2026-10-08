import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FOLKOOP_LANGUAGES} from '../../scripts/i18n/schema.mjs';

const shell=await readFile('apps/web/folkoop.js','utf8');
const network=await readFile('apps/web/network-ui.js','utf8');
const css=await readFile('apps/web/folkoop.css','utf8');

test('three equal paths are an explicit opt-in first-contact experiment only',()=>{
 assert(shell.includes("get('firstContact')==='three'"));
 assert(shell.includes("gate.dataset.entryVariant=preview?'three':'default'"));
 assert(shell.includes("entryThree.hidden=!preview"));
 assert(shell.includes("preview=THREE_MODE_PREVIEW&&!afterMuraExit"));
 assert(shell.includes("guestButton.className=(preview||afterMuraExit)?'button secondary':'button'"));
});

test('all eleven languages have local first-contact introductory copy and reuse current three-mode copy',()=>{
 const match=/const THREE_MODE_ENTRY_COPY=(\{[^\n;]+\});/.exec(shell);
 assert(match,'candidate intro registry missing');
 const copy=JSON.parse(match[1]);
 for(const lang of FOLKOOP_LANGUAGES){
  assert(copy[lang]?.title?.length>=8,lang+' title missing');
  assert(copy[lang]?.intro?.length>=24,lang+' intent explanation missing');
  assert(new RegExp('(?:^|\\n) '+lang+':\\{browseTitle:').test(network),lang+' three-mode text missing');
 }
 assert(network.includes('globalThis.FolkoopHomeModesCopy=Object.freeze(homeModesCopy)'));
});

test('browse, need, offer and project start from explicit choice with local-only semantics',()=>{
 for(const kind of ['browse','need','offer','project'])
  assert(shell.includes('data-entry-intent="'+kind+'"'),kind+' control missing');
 assert(shell.includes("if(!['browse','need','offer','project'].includes(intent))return;"));
 assert(shell.includes("setEntryMode('local')"));
 assert(shell.includes("if(intent==='browse'){current='center'"));
 assert(shell.includes("else startFromShell(intent)"));
 assert(css.includes('.entry-three-modes{display:grid'));
 assert(css.includes('.entry-three-card .button{display:inline-flex'));
 assert(css.includes('min-height:44px'));
});

test('the real sample-based evidence gate remains separate from visible prototype',async()=>{
 const field=await readFile('docs/research/FIRST_CONTACT_STUDY_20261008.md','utf8');
 const product=await readFile('docs/research/FIRST_CONTACT_THREE_MODE_PREVIEW_20261008.md','utf8');
 assert(field.includes('5–10'));
 assert(field.includes('20–30'));
 assert(product.includes('Not the default welcome'));
 assert(product.includes('not externally comprehension-validated'));
});
