(()=>{'use strict';

const q=(s,root=document)=>root.querySelector(s);
const qa=(s,root=document)=>[...root.querySelectorAll(s)];
const state={
  currentScreen:'home',
  previousScreen:'home',
  ladderStep:'draft',
  ladderPublished:false,
  ladderMatchSelected:false,
  ladderTalked:false,
  ladderReturned:false,
  workshopLinked:false,
  walkJoined:false,
  hostDrafted:false,
  projectPinned:false,
  workspaceTab:'overview',
  designMode:false
};

const screens=qa('[data-screen-id]');
const nav=qa('[data-screen]');
const toast=q('#toast');

function announce(message){
  toast.textContent=message;
  toast.hidden=false;
  clearTimeout(announce.timer);
  announce.timer=setTimeout(()=>toast.hidden=true,3200);
}

function showScreen(id,{remember=true}={}){
  if(remember && state.currentScreen!==id) state.previousScreen=state.currentScreen;
  state.currentScreen=id;
  screens.forEach(s=>s.classList.toggle('active',s.dataset.screenId===id));
  nav.forEach(b=>b.classList.toggle('active',b.dataset.screen===id));
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='home') renderLadder();
}

function openWorkspace(){
  state.previousScreen=state.currentScreen==='workspace'?'together':state.currentScreen;
  showScreen('workspace',{remember:false});
  setWorkspaceTab(state.workspaceTab);
}

function setWorkspaceTab(id){
  state.workspaceTab=id;
  qa('[data-workspace-tab]').forEach(b=>b.classList.toggle('active',b.dataset.workspaceTab===id));
  qa('[data-workspace-panel]').forEach(p=>p.classList.toggle('active',p.dataset.workspacePanel===id));
}

function renderLadder(){
  const section=q('#ladderFlow');
  if(!section || section.hidden) return;
  qa('[data-ladder-step]').forEach(b=>b.classList.toggle('active',b.dataset.ladderStep===state.ladderStep));
  const panel=q('#ladderPanel');
  const summary=q('#ladderSummary');
  let html='';
  if(state.ladderStep==='draft'){
    html='<h3>С чего начать?</h3><p>Достаточно одной фразы. Пока это приватный черновик.</p><label class="draft-field">Запрос<input value="Нужна лестница на субботу" aria-label="Текст запроса"></label><div class="inline-actions"><button data-action="publish-ladder">'+(state.ladderPublished?'Опубликовано':'Показать подходящим людям')+'</button><button class="secondary" data-action="ladder-next">Сначала посмотреть варианты</button></div>';
    summary.textContent=state.ladderPublished?'Опубликован выбранной аудитории':'Черновик · ещё не опубликован';
  } else if(state.ladderStep==='matches'){
    html='<h3>Подходящие варианты</h3><p>Человек видит, почему вариант показан, и сам выбирает следующий шаг.</p><article class="match-card"><b>Юхан · складная лестница</b><small>Олофсторп · свободна в субботу · сам сообщил</small><button data-action="select-ladder-match">'+(state.ladderMatchSelected?'Выбрано':'Посмотреть и выбрать')+'</button></article><div class="inline-actions"><button class="secondary" data-action="ladder-prev">← Назад</button><button data-action="ladder-next">Договориться →</button></div>';
  } else if(state.ladderStep==='talk'){
    html='<h3>Договориться</h3><p>Сообщение не означает автоматическое обязательство. Проект создавать не нужно.</p><div class="mini-chat"><div>Вы: Можно забрать около 10:00?</div><div>Юхан: Да, оставлю у гаража.</div></div><div class="inline-actions"><button data-action="confirm-talk">'+(state.ladderTalked?'Договорились':'Отметить: договорились')+'</button><button class="secondary" data-action="ladder-prev">← Назад</button><button data-action="ladder-next">После использования →</button></div>';
  } else {
    const status=state.ladderReturned?'Вы сообщили: лестница возвращена. Подтверждения владельца в макете нет.':'Можно закончить без оценки. Если хотите — сообщить о возврате.';
    html='<h3>После использования</h3><p>'+status+'</p><div class="inline-actions"><button data-action="mark-return">'+(state.ladderReturned?'Сообщено о возврате':'Сообщить о возврате')+'</button><button class="secondary" data-action="ladder-prev">← Назад</button><button class="secondary" data-action="close-ladder">Готово</button></div>';
    summary.textContent=state.ladderReturned?'Вы сообщили о возврате':'Договорённость с Юханом';
  }
  panel.innerHTML=html;
}

function setLadderStep(id){
  state.ladderStep=id;
  renderLadder();
}

function openLadder(){
  showScreen('home');
  const section=q('#ladderFlow');
  section.hidden=false;
  renderLadder();
  requestAnimationFrame(()=>section.scrollIntoView({behavior:'smooth',block:'start'}));
}

function renderProjectLinks(){
  const btn=q('#linkWorkshopButton');
  const resource=q('#projectWorkshopResource');
  const thread=q('#threadPlace');
  const next=q('#projectNextStep');
  if(state.workshopLinked){
    btn.textContent='Связано с Repair Day';
    resource.innerHTML='<b>Площадка</b><small>Мастерская из «Города» · ожидает подтверждения доступности</small><span class="claim">вариант выбран</span>';
    thread.textContent='Мастерская связана как выбранный вариант; доступность ещё не подтверждена';
    next.textContent='Получить подтверждение площадки';
  }else{
    btn.textContent='Связать с Repair Day';
    resource.innerHTML='<b>Площадка</b><small>ещё не выбрана</small><span class="claim neutral">нет подтверждения</span>';
    thread.textContent='Площадка ещё не связана';
    next.textContent='Подтвердить площадку';
  }
}

function openDeepTool(kind){
  const panel=q('#deepToolPanel');
  panel.hidden=false;
  if(kind==='economy'){
    panel.innerHTML='<h3>Экономика · Repair Day</h3><p>В production Economic Flow v0 уже имеет клиентский UI. В этом workspace мы показываем его как инструмент дела, а не отдельный технологический продукт.</p><div class="evidence-line"><span>Закупка расходников</span><b>черновик</b></div><div class="evidence-line"><span>Роль: координатор закупки</span><b>Мура</b></div><div class="evidence-line"><span>Fulfilment / логистика</span><b>планируется</b></div>';
  }else if(kind==='decisions'){
    panel.innerHTML='<h3>Решения</h3><p>Пользователь видит человеческий вопрос, а SDCF сохраняет структуру под ним.</p><div class="evidence-line"><span>Вопрос</span><b>Какую площадку выбрать?</b></div><div class="evidence-line"><span>Варианты</span><b>2</b></div><div class="evidence-line"><span>Кто может принять решение</span><b>организаторы</b></div><button data-action="prototype-only">Предложить вариант</button>';
  }else{
    panel.innerHTML='<h3>Результат и доказательства</h3><p>Не одна «галочка успеха», а понятные утверждения с источником.</p><div class="evidence-line"><span>Мура сообщила: встреча состоялась</span><b>нет подтверждения</b></div><div class="evidence-line"><span>Анна подтвердила участие</span><b>иллюстративно</b></div><div class="evidence-line"><span>Внешний документ / attestation</span><b>не добавлен</b></div><button data-action="prototype-only">Добавить подтверждение</button>';
  }
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function openHost(){
  state.hostDrafted=true;
  q('#hostStatus').textContent='В макете создан приватный черновик запроса Host. Никакой реальный запрос не отправлен.';
  showScreen('center');
  announce('Создан только макет приватного запроса Host — ничего не отправлено.');
}

function toggleDesign(){
  state.designMode=!state.designMode;
  document.body.classList.toggle('design-mode',state.designMode);
  const b=q('#designToggle');
  b.setAttribute('aria-pressed',String(state.designMode));
  q('#designDrawer').hidden=!state.designMode;
}

nav.forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));
qa('[data-go]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.go)));

document.addEventListener('click',e=>{
  const b=e.target.closest('button,[data-action],[data-workspace-open]');
  if(!b)return;
  const action=b.dataset.action;
  if(b.dataset.workspaceOpen){ setWorkspaceTab(b.dataset.workspaceOpen); return; }
  if(!action)return;

  if(action==='open-mura'){ q('#muraDrawer').hidden=false; return; }
  if(action==='close-mura'){ q('#muraDrawer').hidden=true; return; }
  if(action==='close-design'){ state.designMode=false;document.body.classList.remove('design-mode');q('#designToggle').setAttribute('aria-pressed','false');q('#designDrawer').hidden=true;return; }
  if(action==='start-ladder'||action==='open-ladder-flow'){ openLadder(); return; }
  if(action==='start-offer'){ showScreen('together'); announce('В v0.2 это вход «Предложить»: дальше будет короткий черновик предложения.'); return; }
  if(action==='open-repair-project'){ openWorkspace(); return; }
  if(action==='workspace-back'){ showScreen(state.previousScreen||'home',{remember:false}); return; }
  if(action==='pin-project'){ state.projectPinned=!state.projectPinned;b.textContent=state.projectPinned?'★ Закреплено':'☆ Закрепить';announce(state.projectPinned?'Repair Day закреплён в «Моё».':'Закрепление снято.');return; }
  if(action==='link-workshop'){ state.workshopLinked=true;renderProjectLinks();announce('Мастерская связана с Repair Day как вариант. Доступность не считается подтверждённой.');return; }
  if(action==='join-walk'){ state.walkJoined=!state.walkJoined;b.textContent=state.walkJoined?'Вы хотите присоединиться ✓':'Хочу присоединиться';announce(state.walkJoined?'В макете отмечено намерение участвовать. Реальной записи нет.':'Намерение отменено.');return; }
  if(action==='host-help'){ openHost(); return; }
  if(action==='open-economy'){ openDeepTool('economy'); return; }
  if(action==='open-decisions'){ openDeepTool('decisions'); return; }
  if(action==='open-outcome'){ openDeepTool('outcome'); return; }
  if(action==='prototype-only'){ announce('Это визуальный прототип: реальное действие не выполняется.');return; }
  if(action==='close-ladder'){ q('#ladderFlow').hidden=true;return; }
  if(action==='publish-ladder'){ state.ladderPublished=true;renderLadder();announce('В макете запрос отмечен как опубликованный выбранной аудитории.');return; }
  if(action==='select-ladder-match'){ state.ladderMatchSelected=true;renderLadder();return; }
  if(action==='confirm-talk'){ state.ladderTalked=true;renderLadder();return; }
  if(action==='mark-return'){ state.ladderReturned=true;renderLadder();return; }
  if(action==='ladder-next'){
    const order=['draft','matches','talk','return'];const i=order.indexOf(state.ladderStep);setLadderStep(order[Math.min(i+1,order.length-1)]);return;
  }
  if(action==='ladder-prev'){
    const order=['draft','matches','talk','return'];const i=order.indexOf(state.ladderStep);setLadderStep(order[Math.max(i-1,0)]);return;
  }
});

qa('[data-ladder-step]').forEach(b=>b.addEventListener('click',()=>setLadderStep(b.dataset.ladderStep)));
qa('[data-workspace-tab]').forEach(b=>b.addEventListener('click',()=>setWorkspaceTab(b.dataset.workspaceTab)));

q('#designToggle').addEventListener('click',toggleDesign);

qa('[data-conversation]').forEach(b=>b.addEventListener('click',()=>{
  qa('[data-conversation]').forEach(x=>x.classList.toggle('active',x===b));
  const id=b.dataset.conversation;
  const title=q('#conversationTitle'), meta=q('#conversationMeta'), body=q('#messageBody');
  if(id==='johan'){
    title.textContent='Юхан';meta.textContent='Личный разговор';
    body.innerHTML='<div class="bubble other">Я посмотрю площадку после работы.</div><div class="bubble me">Спасибо. Если подходит, свяжем её с Repair Day.</div>';
  }else if(id==='local'){
    title.textContent='Локальный чат';meta.textContent='Обычное сообщество';
    body.innerHTML='<div class="bubble other">Кто хочет на прогулку в субботу?</div><div class="bubble other">Я, если погода нормальная.</div><button class="linked-context" data-go="center">↗ Посмотреть встречу в Center</button>';
    qa('[data-go]',body).forEach(x=>x.addEventListener('click',()=>showScreen(x.dataset.go)));
  }else{
    title.textContent='Repair Day';meta.textContent='Связано с проектом';
    body.innerHTML='<div class="bubble other">Я могу принести паяльник и удлинитель.</div><div class="bubble me">Отлично. Я добавлю это в ресурсы проекта.</div><button class="linked-context" data-action="open-repair-project">↗ Ресурс «инструменты» в Repair Day</button>';
  }
}));

q('#globalSearch').addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    e.preventDefault();
    const value=e.currentTarget.value.trim();
    if(!value)return;
    showScreen('together');
    announce('Поиск в макете: «'+value+'». В следующем проходе подключим общий список результатов.');
  }
});

renderLadder();
renderProjectLinks();
})();