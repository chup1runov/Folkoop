/* Authored fictional Mura story. Pure rendering: no account, storage or network writes. */
(()=>{
'use strict';
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const ids=Object.freeze({project:id(320),room:id(321),tool:id(322),need:id(323),offer:id(324),community:id(103),mura:id(1),anna:id(2),omar:id(3),johan:id(5)});
const copy={
 ru:{title:'Общая мастерская: первый день ремонта',goal:'Соседи собираются починить три стула и решить, стоит ли повторять мастерскую.',disclosure:'Вымышленный пример Муры. Люди, место, договорённости и результат придуманы. Просмотр ничего не бронирует, не отправляет и не подтверждает от вашего имени.',limits:'Это сценарий для обсуждения. Бронирование и цикл передачи/возврата реализованы и проверены локально; опубликованная версия ещё не прошла итоговую проверку.',context:'Люди и сообщество',community:'Кружок ремонта и повторного использования',people:'Мура — организатор; Anna — владелец инструмента; Omar — доставка; Johan — ремонт. Место в Göteborg условное, адреса действующей мастерской здесь нет.',resources:'Связанные потребности и предложения',room:'Помещение для мастерской',tool:'Дрель Anna',need:'Нужны материалы и помощь с ремонтом',offer:'Johan предлагает два часа ремонта',roomDescription:'Вымышленное помещение на четыре часа. Доступ отдельно согласует уполномоченный.',toolDescription:'Одна дрель во временное пользование. Право собственности остаётся у Anna.',needDescription:'Нужны 12 креплений и 4 часа работы; единицы учитываются отдельно.',offerDescription:'Два часа работы Johan, только после личного согласия с условиями.',story:'Как проходит одно общее дело',next:'Следующее действие в начале истории: Мура уточняет доступ к помещению и ответственного за ключи.',steps:[
 ['Общая потребность','Мура предлагает отремонтировать три стула. Кружок помогает найти участников. Нужны помещение на 4 часа, одна дрель, 12 креплений и 4 часа труда. Это разные потребности, их нельзя складывать в одну сумму.'],
 ['Предложения людей','Anna готова дать дрель, Johan — 2 часа ремонта, Omar — доставить стулья. Обещание ещё не означает, что инструмент получен или работа выполнена. Не хватает ещё 2 часов работы и подтверждения помещения.'],
 ['Вопрос и изменение условий','Anna спрашивает: «Кто отвечает за дрель и когда вернёт?» Мура записывает в редакции 2: принимает Omar, возвращает до 18:00, состояние проверяют вместе. Согласие с редакцией 1 не переносится на редакцию 2; каждый отвечает лично. Можно отказаться.'],
 ['Полномочия и решение','Мура как организатор фиксирует решение после ответа на вопрос Anna. Anna разрешает пользование своим инструментом; Мура не может сделать это за неё. Решение связано с задачей Omar: получить дрель по редакции 2. Это не голосование и не готовая модель демократии кругов.'],
 ['Запрос ресурса','В сюжете Anna согласует одну дрель с 12:00 до 18:00. Сервер проверяет вместимость и пересечение резервов. Этот вымышленный сюжет не создаёт настоящую бронь.'],
 ['Передача и частичное выполнение','Anna отмечает выдачу, Omar отдельно подтверждает получение. Для креплений подтверждено 8 из 12: ещё нужны 4. Выполненная работа и переданные материалы учитываются отдельно от обещаний. Передача дрели не меняет собственника.'],
 ['Возврат и замечание','Omar сообщает о возврате. Anna замечает недостающую насадку: возврат ещё не подтверждён, дрель нельзя автоматически считать свободной. После возврата насадки Anna подтверждает комплектность. Это вымышленный пример ресурсного цикла, а не запись реальной передачи.'],
 ['Результат и повтор','В вымышленном итоге два стула починены; для третьего нужна деталь. Мура записывает этот ограниченный результат и спрашивает участников, подтверждают ли они его. Следующая встреча получает новые сроки, условия и согласия; прежние резервы не копируются.']
 ]},
 en:{title:'Shared workshop: the first repair day',goal:'Neighbours plan to repair three chairs and decide whether to hold another workshop.',disclosure:'Fictional Mura example. People, place, agreements and outcome are authored. Viewing does not reserve, send or consent on your behalf.',limits:'A scenario for discussion. Reservations and the handover/return cycle are implemented and tested locally; the published version has not yet passed final verification.',context:'People and community',community:'Repair and reuse circle',people:'Mura organises; Anna owns the tool; Omar transports; Johan repairs. The Göteborg venue is fictional; no operating workshop address is implied.',resources:'Linked needs and offers',room:'Workshop room',tool:'Anna’s drill',need:'Repair materials and help needed',offer:'Johan offers two repair hours',roomDescription:'Fictional room for four hours. Access requires separate agreement with an authorised person.',toolDescription:'One drill for temporary use. Anna retains ownership.',needDescription:'12 fasteners and 4 work hours needed; units remain separate.',offerDescription:'Two hours from Johan, subject to personal consent to the terms.',story:'One shared effort, from need to outcome',next:'First next action: Mura checks room access and who holds the keys.',steps:[
 ['Shared need','Mura proposes repairing three chairs. The circle helps find participants. They need a room for 4 hours, one drill, 12 fasteners and 4 work hours. These are separate needs, not one combined quantity.'],
 ['People’s offers','Anna offers a drill, Johan 2 repair hours and Omar transport. A promise is not receipt or completed work. Another 2 work hours and room confirmation are still needed.'],
 ['Question and revised terms','Anna asks who will take responsibility for the drill and return it. In revision 2, Mura records: Omar receives it, returns it by 18:00 and checks its condition together with Anna. Revision 1 consent does not transfer; everyone responds personally and may decline.'],
 ['Authority and decision','As organiser, Mura records the decision after answering Anna. Anna authorises use of her tool; Mura cannot do so for her. The decision links to Omar’s task under revision 2. This is not voting or a completed circle-governance model.'],
 ['Resource request','In the story, Anna agrees to one drill from 12:00 to 18:00. The server checks capacity and overlapping reservations. This fictional story creates no real reservation.'],
 ['Handover and partial fulfilment','Anna records handover; Omar separately confirms receipt. Only 8 of 12 fasteners are confirmed: 4 remain. Completed work and received materials remain distinct from promises. The drill does not change ownership.'],
 ['Return and issue','Omar reports return. Anna finds a missing bit: return is not confirmed and the drill must not automatically become available. After the bit is returned, Anna confirms completeness. This is a fictional resource-cycle example, not a real handover record.'],
 ['Outcome and repeat','In the fictional outcome, two chairs are repaired; the third needs a part. Mura records that limited outcome and asks participants to confirm it. The next event gets new dates, terms and consents, without copying old reservations.']
 ]}
};
function language(value){return value==='ru'?'ru':'en';}
function text(value){return copy[language(value)];}
function fixture(lang){
 const c=text(lang),created_at='2026-11-09T10:00:00Z';
 const item=(key,kind,title,description,owner)=>({id:ids[key],owner_id:ids[owner],kind,title,description,location_text:'Göteborg · demo',status:'open',target_quantity:null,unit:'',created_at,updated_at:created_at});
 return {cooperations:[item('project','project',c.title,c.goal,'mura'),item('room','resource',c.room,c.roomDescription,'johan'),item('tool','resource',c.tool,c.toolDescription,'anna'),item('need','need',c.need,c.needDescription,'mura'),item('offer','offer',c.offer,c.offerDescription,'johan')],members:['mura','anna','omar','johan'].map(person=>({cooperation_id:ids.project,user_id:ids[person],role:person==='mura'?'owner':'member',joined_at:created_at}))};
}
const progressKey='folkoop-workshop-progress-v1';
let progress={step:0,paused:false};
try{const saved=JSON.parse(globalThis.sessionStorage?.getItem(progressKey)||'null');if(saved&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<8&&typeof saved.paused==='boolean')progress=saved;}catch{}
const shortRoute=()=>{try{return new URL(globalThis.location.href).searchParams.get('demo')==='workshop';}catch{return false;}};
function entry(lang){const ru=lang==='ru';return {title:text(lang).title,body:text(lang).disclosure,note:ru?'8 коротких шагов. Можно сделать паузу и свободно исследовать Муру. Аккаунт не нужен.':'8 short steps. Pause and explore Mura freely. No account needed.',start:ru?'Посмотреть мастерскую':'Explore the workshop'};}
function controls(lang){return lang==='ru'?['Назад','Далее','Пауза — исследовать Муру','Продолжить мастерскую','Повторить сначала','Выйти из демо']:['Back','Next','Pause — explore Mura','Resume workshop','Restart','Exit demo'];}
function save(){try{globalThis.sessionStorage?.setItem(progressKey,JSON.stringify(progress));}catch{}}
function render({lang='en',escape}){
 const c=text(lang),e=escape,short=shortRoute(),labels=controls(lang);
 const button=(action,label,disabled=false)=>`<button type="button" class="button secondary" data-workshop="${action}"${disabled?' disabled':''}>${e(label)}</button>`;
 const navigation=short?`<nav aria-label="${e(c.story)}" class="actions">${button('back',labels[0],progress.step===0)}${button('next',labels[1],progress.step===7)}${button('pause',labels[2])}${button('restart',labels[4])}${button('exit',labels[5])}</nav>`:'';
 const link=(key,label,action='openCoop')=>`<button type="button" class="button secondary" data-home="${action}" data-id="${ids[key]}">${e(label)}</button>`;
 return `<section class="card workshop-story" lang="${language(lang)}" aria-labelledby="workshopTitle"><p class="notice">${e(c.disclosure)}</p><h2 id="workshopTitle">${e(c.title)}</h2><p>${e(c.goal)}</p><p class="meta">${e(c.limits)}</p><h3>${e(c.context)}</h3><p>${e(c.people)}</p>${link('community',c.community,'openCommunity')}<h3>${e(c.resources)}</h3><div class="actions">${['room','tool','need','offer'].map(key=>link(key,c[key])).join('')}</div><p class="notice">${e(c.next)}</p><h3>${e(c.story)}</h3><ol${short?` start="${progress.step+1}"`:''}>${c.steps.filter((_,i)=>!short||i===progress.step).map(([title,body])=>`<li><h4>${e(title)}</h4><p>${e(body)}</p></li>`).join('')}</ol>${short?`<p role="status">${progress.step+1} / 8</p>`:''}${navigation}</section>`+(short&&progress.step===5?budgetExample(lang,escape):'')+(!short||progress.step===7?(globalThis.FolkoopFeedback?.render(lang)||''):'');
}
function budgetExample(lang,escape){
 const ru=lang==='ru',needs=[{id:'materials',title:ru?'Крепления':'Fasteners',kind:'items',amount:1200},{id:'labour',title:ru?'Ремонт':'Repair work',kind:'time',amount:400},{id:'space',title:ru?'Помещение':'Room',kind:'space',amount:400},{id:'tool',title:ru?'Дрель Anna':'Anna’s drill',kind:'items',amount:100}];
 const contributions=[{id:'received-materials',need_id:'materials',amount:800,status:'received',contributor_id:ids.omar},{id:'pending-materials',need_id:'materials',amount:400,status:'submitted',contributor_id:ids.johan},{id:'labour-pledge',need_id:'labour',amount:200,status:'promised',contributor_id:ids.johan},{id:'space-pledge',need_id:'space',amount:400,status:'promised',contributor_id:ids.johan},{id:'tool-received',need_id:'tool',amount:100,status:'received',contributor_id:ids.anna}];
 return globalThis.FolkoopBudget.renderOverview({coop:{owner_id:ids.mura,description:ru?'Вымышленный снимок после частичной передачи: починить три стула.':'Fictional snapshot after partial delivery: repair three chairs.'},snapshot:{needs,contributions,loadedAt:Date.now()},online:true,name:id=>({[ids.mura]:ru?'Мура':'Mura',[ids.anna]:'Anna',[ids.omar]:'Omar',[ids.johan]:'Johan'}[id]||'—')});
}
globalThis.FolkoopWorkshop=Object.freeze({ids,fixture,render,entry,isPaused:()=>progress.paused});
if(globalThis.document&&globalThis.window){
 document.addEventListener('click',event=>{
  const action=event.target.closest('[data-workshop]')?.dataset.workshop;
  if(!action||!document.querySelector('#networkPanel.guest-demo'))return;
  if(action==='exit'){try{sessionStorage.removeItem('folkoop-workshop-visit');}catch{}window.dispatchEvent(new CustomEvent('folkoop:open-entry',{detail:{source:'guest-exit'}}));return;}
  if(action==='pause'){progress.paused=true;save();location.hash='#/home';return;}
  if(action==='next')progress.step=Math.min(7,progress.step+1);
  if(action==='back')progress.step=Math.max(0,progress.step-1);
  if(action==='restart')progress.step=0;
  progress.paused=false;save();
  window.dispatchEvent(new CustomEvent('folkoop:workshop-open'));
 });
 window.addEventListener('folkoop:network-rendered',event=>{
  document.querySelector('#workshopResume')?.remove();
  if(!shortRoute()||!event.detail?.guestDemo)return;
  try{sessionStorage.setItem('folkoop-workshop-language',document.documentElement.lang);}catch{}
  const story=document.querySelector('.workshop-story');
  if(story){const title=story.querySelector('li h4')||story.querySelector('h2');title.tabIndex=-1;title.focus({preventScroll:true});return;}
  const bar=document.createElement('aside');bar.id='workshopResume';bar.className='card';
  const button=document.createElement('button');button.type='button';button.className='button secondary';button.dataset.workshop='resume';button.textContent=controls(document.documentElement.lang)[3];bar.append(button);
  document.querySelector('main.content')?.prepend(bar);
 });
}
})();
