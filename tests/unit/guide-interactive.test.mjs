import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {FOLKOOP_LANGUAGES} from '../../scripts/i18n/schema.mjs';

const source=readFileSync('apps/web/folkoop.js','utf8');
const network=readFileSync('apps/web/network-ui.js','utf8');

test('all eleven locales have five short story scenes and specific actions',()=>{
 const copy=JSON.parse(source.match(/const muraStoryCopy=([\s\S]*?);\nconst muraTutorialCopy=/)[1]);
 assert.deepEqual(Object.keys(copy).sort(),[...FOLKOOP_LANGUAGES].sort());
 for(const lang of FOLKOOP_LANGUAGES){
  assert.deepEqual(Object.keys(copy[lang]),['welcome','project','chat','next','quick']);
  for(const row of Object.values(copy[lang])){
   assert.equal(row.length,3);
   assert(row.every(text=>typeof text==='string'&&text.length>3));
   assert(row[1].length<260,lang+' explanation is too long');
  }
 }
 assert(!source.includes('function showMuraExample('));
});

test('story adapter selects only linked fixture objects and ignores non-Mura sessions',()=>{
 const start=network.indexOf("window.addEventListener('folkoop:mura-story'");
 const end=network.indexOf("window.addEventListener('folkoop:guest-demo'",start);
 let handler;
 const scope={guestDemo:true,selected:'old',selectedCoop:null,selectedChat:null,data:null,
  window:{addEventListener:(_,fn)=>{handler=fn;}},render:()=>{},
  demoSnapshot:()=>({cooperations:[{id:'00000000-0000-4000-8000-000000000301'}],coopChats:[{cooperation_id:'00000000-0000-4000-8000-000000000301',conversation_id:'linked-chat'}]})};
 runInNewContext(network.slice(start,end),scope);
 handler({detail:{scene:'chat',id:'untrusted'}});
 assert.equal(scope.selectedChat,'linked-chat');
 assert.equal(scope.selectedCoop,'00000000-0000-4000-8000-000000000301');
 handler({detail:{scene:'project'}});
 assert.equal(scope.selectedChat,null);
 handler({detail:{scene:'profile'}});
 assert.equal(scope.selectedCoop,null);
 scope.guestDemo=false;scope.selectedChat='real-account';
 handler({detail:{scene:'chat'}});
 assert.equal(scope.selectedChat,'real-account');
 scope.guestDemo=true;
 handler({detail:{scene:'delete'}});
 assert.equal(scope.selectedChat,'real-account');
});

test('chapter picker escapes titles and preserves direct navigation and shared breakpoint',()=>{
 assert(source.includes('esc(tutorialTitle(entry))'));
 assert(source.includes("picker.addEventListener('change',()=>showOnboarding(Number(picker.value)))"));
 const guide=readFileSync('apps/web/folkoop-guide.js','utf8');
 assert(!/innerWidth[<=>]+720/.test(guide));
 assert(!readFileSync('apps/web/folkoop-guide.css','utf8').includes('max-width:720px'));
});
