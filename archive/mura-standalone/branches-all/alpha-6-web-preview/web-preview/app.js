'use strict';

const q = id => document.getElementById(id);
const KEY = 'mura-web-preview-alpha6-v1';
const assets = {
  idle: 'look-center.webp', center:'look-center.webp', left:'look-left.webp', right:'look-right.webp',
  up:'look-up.webp', down:'look-down.webp', ul:'look-up-left.webp', ur:'look-up-right.webp',
  dl:'look-down-left.webp', dr:'look-down-right.webp',
  wave:'waving.webp', thinking:'thinking.webp', jump:'jumping.webp', inspect:'inspect.webp',
  confident:'confident.webp', rest:'rest.webp', idea:'idea.webp', wink:'wink.webp',
  'hands-behind':'hands-behind.webp', 'lean-in':'lean-in.webp'
};

const initial = () => ({
  onboardingCompleted:false, activeDay:1, sessions:1, remembered:[], focusCompleted:false,
  calls:0, firstWeekSeen:[], quiet:false
});
let state = load();
let currentFile = null;
let actionTimer = null;
let lastPointer = {x:innerWidth/2,y:innerHeight/2};

function load(){
  try { return {...initial(), ...JSON.parse(localStorage.getItem(KEY)||'{}')}; }
  catch { return initial(); }
}
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  updateTestPanel();
}
function reset(){
  try { localStorage.removeItem(KEY); } catch {}
  state=initial(); location.reload();
}
function img(name){
  const file = assets[name] || assets.center;
  return window.MURA_WEB_ASSETS?.[file] || '';
}
function setCharacter(name='center'){
  const el=q('character'); el.src=img(name); el.classList.remove('action'); void el.offsetWidth; el.classList.add('action');
}
function showBubble(text, ms=2600){
  const b=q('bubble'); b.textContent=text; b.hidden=false; clearTimeout(showBubble.t);
  showBubble.t=setTimeout(()=>b.hidden=true,ms);
}
function doAction(name, message=null, ms=1800){
  clearTimeout(actionTimer); setCharacter(name); if(message) showBubble(message,ms+600);
  actionTimer=setTimeout(()=>{ actionTimer=null; setCharacter('center'); },ms);
}
function coach(title,text,buttons){
  q('coachTitle').textContent=title; q('coachText').textContent=text;
  const a=q('coachActions'); a.replaceChildren();
  buttons.forEach(([label,fn,primary])=>{
    const b=document.createElement('button'); b.type='button'; b.textContent=label;
    if(primary)b.className='primary'; b.addEventListener('click',fn); a.append(b);
  });
  q('coach').hidden=false;
}
function hideCoach(){ q('coach').hidden=true; }

function beginOnboarding(){
  q('desktop').dataset.onboarding='true';
  doAction('wave');
  setTimeout(()=>coach(
    'Привет. Я Ксюша.',
    'Я живу прямо на рабочем столе. Я замечаю курсор, могу устраиваться на окнах и помню только то, что ты сам решишь мне оставить.',
    [['Познакомиться',()=>{
      hideCoach(); showBubble('Подвигай курсором. Потом нажми на меня.',6000);
    },true],['Пропустить',finishOnboarding,false]]
  ),350);
}
function continueCoach(){
  coach('Вот мои быстрые действия.','На настоящем Mac после знакомства подписи исчезнут, а обычные клики снова будут проходить сквозь меня.',[
    ['Дальше',()=>coach('Мне можно давать вещи.','Перетащи сюда любой файл. В браузерной версии я увижу только его имя и размер и не отправлю содержимое на сервер.',[
      ['Дальше',()=>coach('Я могу сидеть на окнах.','В desktop-версии это отдельное разрешение на геометрию окон. В браузере настоящие окна системы недоступны.',[
        ['Понятно',finishOnboarding,true]
      ]),true]
    ]),true]
  ]);
}
function finishOnboarding(){
  state.onboardingCompleted=true; q('desktop').dataset.onboarding='false'; save(); hideCoach(); q('radial').hidden=true;
  showBubble('Я рядом.',1800);
}

function directionFor(x,y){
  const r=q('character').getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height*.42;
  const dx=x-cx, dy=y-cy; const ax=Math.abs(dx), ay=Math.abs(dy);
  if(ax<35&&ay<35)return 'center';
  if(ax>ay*1.5)return dx<0?'left':'right';
  if(ay>ax*1.5)return dy<0?'up':'down';
  if(dx<0&&dy<0)return 'ul'; if(dx>0&&dy<0)return 'ur';
  if(dx<0&&dy>0)return 'dl'; return 'dr';
}
document.addEventListener('pointermove',e=>{
  lastPointer={x:e.clientX,y:e.clientY};
  if(!actionTimer) q('character').src=img(directionFor(e.clientX,e.clientY));
});

q('characterWrap').addEventListener('click',()=>{
  q('radial').hidden=!q('radial').hidden;
  if(!state.onboardingCompleted && !q('radial').hidden) setTimeout(continueCoach,700);
});
q('radial').addEventListener('click',e=>{
  const b=e.target.closest('[data-action]'); if(!b)return; e.stopPropagation(); q('radial').hidden=true;
  const a=b.dataset.action;
  if(a==='home') return openHome();
  if(a==='focus'){ state.focusCompleted=true; save(); doAction('confident','Фокус можно сделать частью нашей общей истории.'); return; }
  if(a==='perch'){ doAction('jump','В браузере это только демонстрация. Настоящее окно я увижу только в desktop-версии.'); return; }
  doAction(a);
});

const desktop=q('desktop');
desktop.addEventListener('dragover',e=>{e.preventDefault();q('dropHint').hidden=false;e.dataTransfer.dropEffect='copy';});
desktop.addEventListener('dragleave',e=>{if(!desktop.contains(e.relatedTarget))q('dropHint').hidden=true;});
desktop.addEventListener('drop',e=>{
  e.preventDefault();q('dropHint').hidden=true;
  const f=e.dataTransfer.files?.[0]; if(!f)return;
  currentFile={name:f.name,size:f.size,type:f.type||'file'};
  q('handoffName').textContent=f.name;
  q('handoffMeta').textContent=`${f.type||'файл'} · ${formatBytes(f.size)} · содержимое не загружается`;
  q('handoff').hidden=false; doAction('inspect');
});
q('rememberButton').addEventListener('click',()=>{
  if(currentFile && !state.remembered.some(x=>x.name===currentFile.name)) state.remembered.unshift({...currentFile,rememberedAt:Date.now()});
  currentFile=null;q('handoff').hidden=true;save();doAction('confident','Запомнила.');
});
q('cancelHandoff').addEventListener('click',()=>{currentFile=null;q('handoff').hidden=true;setCharacter('center');});
function formatBytes(n){if(n<1024)return n+' Б';if(n<1024*1024)return (n/1024).toFixed(1)+' КБ';return (n/1024/1024).toFixed(1)+' МБ';}

q('callButton').addEventListener('click',()=>{
  state.calls++;save();const wrap=q('characterWrap');
  const x=Math.max(20,Math.min(innerWidth-244,lastPointer.x-112));
  wrap.style.left=x+'px'; doAction('wave','Я здесь.');
});
q('homeButton').addEventListener('click',openHome);

function continuityBeat(){
  const seen=new Set(state.firstWeekSeen);
  const candidates=[
    ['return',state.sessions>=2,'wave','Ты вернулся.'],
    ['gift',state.activeDay>=2&&state.remembered.length>0,'inspect','Я помню, что ты мне кое-что оставил.'],
    ['call',state.activeDay>=2&&state.calls>=2,'lean-in','Кажется, я уже узнаю твой способ меня звать.'],
    ['focus',state.activeDay>=3&&state.focusCompleted,'confident','Мы уже умеем работать рядом.'],
    ['home',state.activeDay>=4,'idea','Загляни домой. Там уже кое-что изменилось.'],
    ['history',state.activeDay>=5&&(state.remembered.length||state.focusCompleted),'hands-behind','У нас уже есть несколько своих маленьких историй.'],
    ['settled',state.activeDay>=7,'wink','Кажется, я тут уже освоилась.']
  ];
  const hit=candidates.find(([id,ok])=>ok&&!seen.has(id));
  if(!hit)return;
  state.firstWeekSeen.push(hit[0]);save();setTimeout(()=>doAction(hit[2],hit[3],2400),650);
}
function nextDay(){
  state.activeDay=Math.min(8,state.activeDay+1);state.sessions++;save();q('homeDialog').open&&renderHome();
  continuityBeat();
}
q('nextDay').addEventListener('click',nextDay);
q('completeFocus').addEventListener('click',()=>{state.focusCompleted=true;save();doAction('confident','Совместный Focus завершён.');});
q('resetPreview').addEventListener('click',reset);

function relationship(){
  if(state.activeDay>=7)return ['Своя история','Здесь уже накопились свои маленькие привычки и следы.'];
  if(state.activeDay>=4)return ['Привычное присутствие','Ксюша понемногу становится частью цифровой среды.'];
  if(state.activeDay>=2)return ['Освоились','Уже появились повторяющиеся совместные действия.'];
  return ['Знакомство','Ксюша ещё привыкает к твоему ритму.'];
}
function openHome(){ renderHome(); if(!q('homeDialog').open) q('homeDialog').showModal(); }
function renderHome(){
  const room=q('room'), hc=q('homeCharacter');
  let scene='settling', pose='idle', title='Ксюша осваивается', note='Комната будет меняться из вашей общей истории.';
  if(state.focusCompleted){scene='focus';pose='thinking';title='Вы уже работали рядом';note='Совместный Focus оставил след в комнате.';}
  if(state.remembered.length){scene='memory';pose='inspect';title='Появились свои вещи';note='На полке уже есть то, что ты сознательно доверил Ксюше.';}
  if(state.activeDay>=4){scene='episode';pose='hands-behind';title='Дома что-то происходит';note='История комнаты продолжилась — появились новые следы вашей жизни.';}
  room.dataset.scene=scene;hc.src=img(pose);
  q('roomSceneTitle').textContent=title;q('roomSceneNote').textContent=note;
  q('plant').textContent=state.activeDay>=5?'🌿':state.activeDay>=3?'🌱':state.activeDay>=2?'🪴':'';
  const props=q('roomProps');props.replaceChildren();
  const addProp=(emoji,cls,label)=>{const b=document.createElement('button');b.type='button';b.className='room-prop '+cls;b.textContent=emoji;b.title=label;b.onclick=()=>showBubble(label,2200);props.append(b);};
  if(state.remembered.length)addProp('📎','gift','Первая доверенная вещь');
  if(state.focusCompleted)addProp('🎯','focus','Первая совместная фокус-сессия');
  if(state.activeDay>=5)addProp('✦','history','У вас уже есть своя история');
  q('nowTitle').textContent=state.focusCompleted?'После фокуса':'Компаньон';
  q('nowText').textContent=state.focusCompleted?'Ксюша помнит, что вы уже работали рядом.':'Ксюша просто рядом и не требует внимания.';
  q('storyTitle').textContent=state.activeDay>=2?'Растение на подоконнике':'Пока тихо';
  q('storyText').textContent=state.activeDay>=5?'Росток уже стал частью комнаты.':state.activeDay>=3?'Показался первый зелёный росток.':state.activeDay>=2?'На подоконнике появился маленький горшок.':'Маленькие истории появляются постепенно.';
  const [rl,rt]=relationship();q('relationshipLabel').textContent=rl;q('relationshipText').textContent=rt;
  const list=q('memoryList');list.replaceChildren();
  if(!state.remembered.length) list.innerHTML='<div class="memory-item">Пока ничего не доверено.</div>';
  else state.remembered.forEach(m=>{const d=document.createElement('div');d.className='memory-item';d.textContent='📎 '+m.name;list.append(d);});
}
function updateTestPanel(){
  q('dayValue').textContent=state.activeDay;q('sessionValue').textContent=state.sessions;
  q('itemValue').textContent=state.remembered.length;q('focusValue').textContent=state.focusCompleted?'да':'нет';
}
q('previewToggle').addEventListener('click',()=>{q('testPanel').hidden=!q('testPanel').hidden;});
q('testClose').addEventListener('click',()=>q('testPanel').hidden=true);

q('desktop').dataset.onboarding=state.onboardingCompleted?'false':'true';
setCharacter('center');
updateTestPanel();
if(!state.onboardingCompleted)setTimeout(beginOnboarding,600);
else {state.sessions++;save();setTimeout(continuityBeat,900);}
