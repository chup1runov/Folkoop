import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const base=process.env.PROJECT_SOURCE_DIR||'apps/web';
const ctx={document:{documentElement:{lang:'ru'}}};ctx.globalThis=ctx;
vm.runInNewContext(readFileSync(base+'/project-presentation.js','utf8'),ctx);
vm.runInNewContext(readFileSync(base+'/network-messaging.js','utf8'),ctx);
const presentation=ctx.FolkoopProjectPresentation;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const user={id:'self'};
function render({member=true,project=true,guestDemo=true,title='Our plant exchange',body='I can bring a table.'}={}){
 const data={chats:[{id:'chat',kind:'group',owner_id:'self',title:'Work conversation'}],chatMembers:member?[{conversation_id:'chat',user_id:'self'},{conversation_id:'chat',user_id:'anna'}]:[],coopChats:[{cooperation_id:'project',conversation_id:'chat'}],cooperations:project?[{id:'project',kind:'project',title}]:[],chatMessages:[{id:'msg',conversation_id:'chat',author_id:'anna',body,created_at:'2026-10-01'},{id:'own',conversation_id:'chat',author_id:'self',body:'Thank you',created_at:'2026-10-02'}]};
 const domain=ctx.FolkoopNetworkMessaging.create({escape:esc,getData:()=>data,getProfile:id=>({name:id==='self'?'Mura':'Anna'}),generalText:k=>k,chatText:k=>k,activityText:k=>k,formatWhen:x=>x,networkButton:(action,label,id)=>`<button data-net="${action}" data-id="${id}">${label}</button>`,activityButton:(action,label,id)=>`<button data-coop="${action}" data-id="${id}">${label}</button>`});
 return domain.render(user,{selectedChat:'chat',guestDemo});
}
test('project return and overview copy covers all eleven languages',()=>{
 for(const language of ['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku']){
  assert(presentation.text(language,0).length>5,language);
  assert(presentation.text(language,1).length>2,language);
 }
 assert.equal(presentation.text('unknown',0),'Back to project');
 for(const language of ['sv','en','ru','es','uk','fi','bs','ar','fa','so','ku'])assert(presentation.text(language,2).length>6,language+' person link');
});
test('layout exits for unavailable roots and non-project routes',()=>{
 assert.equal(presentation.enhanceProject(null),false);
 assert.equal(presentation.enhanceProject({hidden:true},{route:'projects'}),false);
 assert.equal(presentation.enhanceProject({hidden:false},{route:'home'}),false);
});
test('existing visible parent labels the work chat and keeps its exact return ID',()=>{
 const html=render();
 assert.match(html,/conversation-project-context/);
 assert.match(html,/Our plant exchange/);
 assert.match(html,/data-coop="openNotify" data-id="project"/);
 assert.match(html,/Вернуться к проекту/);
 assert.match(html,/I can bring a table\./);
 assert.match(html,/chat-message is-mine/);
 assert.doesNotMatch(html,/id="netMessage"/);
});
test('missing visible parent does not invent a project title',()=>{
 const html=render({project:false});
 assert.doesNotMatch(html,/conversation-project-context/);
 assert.match(html,/data-coop="openNotify" data-id="project"/);
});
test('membership denial still prevents message body and composer',()=>{
 const html=render({member:false});
 assert.match(html,/denied/);
 assert.doesNotMatch(html,/I can bring a table|chat-messages|id="netMessage"/);
});
test('real participants retain composer and non-collapsed member controls',()=>{
 const html=render({guestDemo:false});
 assert.match(html,/id="netMessage"/);
 assert.doesNotMatch(html,/<details class="conversation-members"/);
 assert.doesNotMatch(html,/id="netChatInvite"/); // linked chat admission remains project-managed
});
test('project titles and chat bodies remain escaped, never HTML',()=>{
 const html=render({title:'<img src=x onerror=alert(1)>',body:'<script>alert(2)</script>'});
 assert.doesNotMatch(html,/<img|<script>/);
 assert.match(html,/&lt;img/);assert.match(html,/&lt;script&gt;/);
});
test('presentation owns no storage, cloned data, network or mutation APIs',()=>{
 const source=readFileSync(base+'/project-presentation.js','utf8');
 assert.doesNotMatch(source,/fetch\s*\(|localStorage|sessionStorage|cloneNode|innerHTML|\.click\(\)|\.submit\(/);
 assert.match(source,/folkoop:network-rendered/);
 assert.match(source,/target\.open=true/);
});

test('project → person → project is ephemeral and only for visible directory profiles',()=>{
 const source=readFileSync(base+'/network-ui.js','utf8');
 assert(source.includes('data-home="openPerson"'));
 assert(source.includes('data-person-focused="true"'));
 assert(source.includes('data.directory.some(x=>x.id===m.user_id)'));
 assert(source.includes('data.coopMembers.some(x=>x.cooperation_id===parent.id&&x.user_id===id)'));
 assert(source.includes('personFocus=id;personSourceProject=parent.id'));
 assert(source.includes('personFocus=null;personSourceProject=null'));
 assert.doesNotMatch(readFileSync(base+'/project-presentation.js','utf8'),/localStorage|sessionStorage|fetch\s*\(/);
});
