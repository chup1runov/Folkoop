'use strict';

const api = window.mura || window.ksyusha;

const together = document.getElementById('together');
const keepsakes = document.getElementById('keepsakes');
const files = document.getElementById('files');
const objects = document.getElementById('objects');
const timers = document.getElementById('timers');
const keepsakeCount = document.getElementById('keepsakeCount');
const fileCount = document.getElementById('fileCount');
const relationshipScore = document.getElementById('relationshipScore');
const relationshipStage = document.getElementById('relationshipStage');
const relationshipDescription = document.getElementById('relationshipDescription');
const relationshipProgress = document.getElementById('relationshipProgress');
const relationshipFacts = document.getElementById('relationshipFacts');
const episode = document.getElementById('episode');
const room = document.getElementById('room');
const plant = document.getElementById('plant');
const roomProps = document.getElementById('roomProps');
const homeCharacter = document.getElementById('homeCharacter');
const roomSceneTitle = document.getElementById('roomSceneTitle');
const roomNote = document.getElementById('roomNote');
const roomMemoryCard = document.getElementById('roomMemoryCard');
const roomMemoryClose = document.getElementById('roomMemoryClose');
const roomMemoryEmoji = document.getElementById('roomMemoryEmoji');
const roomMemoryTitle = document.getElementById('roomMemoryTitle');
const roomMemoryText = document.getElementById('roomMemoryText');
const roomMemoryOpen = document.getElementById('roomMemoryOpen');
const presenceStatus = document.getElementById('presenceStatus');
const timeline = document.getElementById('timeline');
const shareButton = document.getElementById('shareButton');
const shareStatus = document.getElementById('shareStatus');

let lastState = null;

function daysTogether(metAt) { return Math.max(1, Math.ceil((Date.now() - new Date(metAt).getTime()) / 86_400_000)); }
function dateLabel(value) { try { return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(value)); } catch { return ''; } }
function timeRemaining(dueAt) { const ms = new Date(dueAt).getTime() - Date.now(); if (ms <= 0) return 'почти готово'; const minutes = Math.ceil(ms / 60_000); return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`; }
function escapeHtml(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function empty(target, text) { target.innerHTML = `<div class="empty">${text}</div>`; }
function momentLabel(item) { const labels = {'file-given':'Ты доверил Ксюше файл','object-given':'Ты доверил Ксюше цифровую вещь','timer-completed':'Совместный таймер завершён','focus-completed':'Фокус-сессия завершена','episode-start':'Началась маленькая история','episode-advance':'История продолжилась','episode-complete':'Маленькая история завершилась','rare-event':'Случился редкий момент','memory-echo':'Ксюша вспомнила что-то из вашей истории','share-card-saved':'Сохранён момент Ксюши'}; return labels[item.kind] || item.kind.replaceAll('-',' '); }

function renderRelationship(state) {
  const rel = state.relationship; if (!rel) return;
  relationshipScore.textContent = `${Math.round(rel.score * 100)}%`;
  relationshipStage.textContent = rel.stage.label;
  relationshipDescription.textContent = rel.stage.description;
  relationshipProgress.style.width = `${Math.max(4, rel.score * 100)}%`;
  relationshipFacts.innerHTML = [`${rel.activeDays} активн. дн.`,`${rel.sessions} встреч`,`${rel.trustedItems} вещей`,`${rel.timersDone} таймеров`].map(text=>`<span>${text}</span>`).join('');
}

function renderEpisode(state) {
  const current = state.episodesDetailed?.[0];
  if (!current) {
    episode.innerHTML='<div class="story-empty">Пока тихо. Маленькие истории появляются сами.</div>';
    plant.textContent=''; plant.dataset.stage='none';
    return;
  }
  episode.innerHTML = `<div class="episode-card"><div class="episode-emoji">${current.stageEmoji || current.emoji || '✦'}</div><div><strong>${escapeHtml(current.title)}</strong><small>${escapeHtml(current.stageLabel)}</small><p>${escapeHtml(current.stageNote)}</p></div></div>`;
  plant.textContent = current.stageEmoji || '🌱';
  plant.dataset.stage = current.stageId || 'seed';
}

function renderHomeScene(state) {
  const scene = state.homeScene || { id:'settling', spot:'center', pose:'idle', note:'Ксюша осваивается.' };
  room.dataset.scene = scene.id || 'settling';
  homeCharacter.dataset.spot = scene.spot || 'center';
  homeCharacter.src = scene.pose === 'idle'
    ? '../../assets/character/idle.gif'
    : `../../assets/character/${scene.pose}.webp`;
  const titles = {
    focus: 'Ксюша занята рядом',
    quiet: 'Тихий период',
    episode: 'Дома что-то происходит',
    memory: 'Появились свои вещи',
    settling: 'Ксюша осваивается'
  };
  roomSceneTitle.textContent = titles[scene.id] || 'Ксюша дома';
  roomNote.textContent = scene.note || '';
}

function renderRoomProps(state) {
  const props = state.roomProps || [];
  if (!props.length) { roomProps.innerHTML = ''; return; }
  roomProps.innerHTML = props.map(item => `<button type="button" class="room-prop ${escapeHtml(item.slot || '')}" data-room-prop="${escapeHtml(item.id)}" title="${escapeHtml(item.label || '')}">${escapeHtml(item.emoji || '✦')}</button>`).join('');
}

function roomPropSource(prop, state) {
  if (!prop?.sourceId) return null;
  return (state.files || []).find(item => item.id === prop.sourceId)
    || (state.objects || []).find(item => item.id === prop.sourceId)
    || (state.timers || []).find(item => item.id === prop.sourceId)
    || null;
}

function showRoomMemory(prop, state) {
  const source = roomPropSource(prop, state);
  roomMemoryEmoji.textContent = prop.emoji || '✦';
  roomMemoryTitle.textContent = prop.label || 'Воспоминание';
  let detail = 'Эта вещь появилась здесь из вашей общей истории.';
  if (source?.name) detail = `Связано с: ${source.name}`;
  else if (source?.title) detail = `Связано с: ${source.title}`;
  else if (source?.label) detail = source.label;
  roomMemoryText.textContent = detail;
  roomMemoryOpen.hidden = !(source && ((state.files || []).some(item => item.id === source.id) || (state.objects || []).some(item => item.id === source.id && item.kind === 'link')));
  roomMemoryOpen.dataset.sourceId = source?.id || '';
  roomMemoryOpen.dataset.sourceKind = (state.files || []).some(item => item.id === source?.id) ? 'file' : (source?.kind || '');
  roomMemoryCard.hidden = false;
}

function renderPresence(state) {
  const runtime = state.runtime || {}; const activeFocus = state.timers.find(item=>item.status==='active' && item.meta?.focus===true); const surface = runtime.surfaceStatus || {};
  let surfaceLine='Геометрия окон выключена.';
  if (runtime.surfaceGeometryEnabled && surface.permissionRequired) surfaceLine='Для поверхностей нужен доступ Accessibility.';
  else if (runtime.surfaceGeometryEnabled && surface.error) surfaceLine='Адаптер поверхностей сейчас недоступен.';
  else if (runtime.surfaceGeometryEnabled && runtime.surfaceAttached) surfaceLine='Ксюша сейчас привязана к поверхности окна.';
  else if (runtime.surfaceGeometryEnabled) surfaceLine=`Видимых поверхностей: ${surface.surfaceCount || 0}.`;
  if (activeFocus) presenceStatus.innerHTML=`<strong>Фокус</strong><span>${escapeHtml(activeFocus.label)} · ещё ${timeRemaining(activeFocus.dueAt)}<br>${escapeHtml(surfaceLine)}</span>`;
  else if (runtime.quiet) presenceStatus.innerHTML=`<strong>Тихий период</strong><span>Ксюша остаётся рядом, но не инициирует лишние действия.<br>${escapeHtml(surfaceLine)}</span>`;
  else { const mode = runtime.behaviorMode==='ambient'?'Тихий':runtime.behaviorMode==='active'?'Активный':'Компаньон'; presenceStatus.innerHTML=`<strong>${mode}</strong><span>Автономные реакции работают с ограничениями против навязчивости.<br>${escapeHtml(surfaceLine)}</span>`; }
}

function renderTimeline(state) { const moments=state.meaningfulMoments||[]; if(!moments.length) return empty(timeline,'Значимые моменты появятся сами по мере использования.'); timeline.innerHTML=moments.slice(0,8).map(item=>`<article class="timeline-item"><span class="timeline-dot"></span><div><strong>${escapeHtml(momentLabel(item))}</strong><small>${dateLabel(item.at)}</small></div></article>`).join(''); }

function render(state) {
  lastState=state; together.textContent=`Вместе ${daysTogether(state.identity.metAt)} дн.`; renderRelationship(state); renderEpisode(state); renderHomeScene(state); renderRoomProps(state); renderPresence(state); renderTimeline(state);
  keepsakeCount.textContent=String(state.keepsakes.length);
  if(!state.keepsakes.length) empty(keepsakes,'Здесь появятся вещи, связанные с настоящими совместными событиями.');
  else keepsakes.innerHTML=state.keepsakes.map(item=>`<article class="keepsake"><span class="emoji">${item.emoji||'✦'}</span><strong>${escapeHtml(item.title)}</strong><small>${dateLabel(item.createdAt)}</small></article>`).join('');
  fileCount.textContent=String(state.files.length+(state.objects?.length||0));
  if(!state.files.length) empty(files,'Перетащи файл на Ксюшу и выбери «Запомнить». Она не читает его содержимое без отдельного разрешения.');
  else files.innerHTML=state.files.map(item=>`<article class="file" data-file-id="${item.id}"><div class="file-icon">${item.kind==='folder'?'▣':'◻'}</div><div class="file-main"><strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong><small>${dateLabel(item.rememberedAt)}</small></div><div class="file-actions"><button type="button" data-file-action="open">Открыть</button><button type="button" data-file-action="reveal">Найти</button><button type="button" data-file-action="forget">Забыть</button></div></article>`).join('');
  const rememberedObjects=state.objects||[]; if(!rememberedObjects.length) objects.innerHTML=''; else objects.innerHTML=rememberedObjects.map(item=>`<article class="file" data-object-id="${item.id}" data-object-kind="${item.kind}"><div class="file-icon">${item.kind==='link'?'↗':'¶'}</div><div class="file-main"><strong title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</strong><small>${item.kind==='link'?'ссылка':'текст'} · ${dateLabel(item.rememberedAt)}</small></div><div class="file-actions">${item.kind==='link'?'<button type="button" data-object-action="open">Открыть</button>':''}<button type="button" data-object-action="forget">Забыть</button></div></article>`).join('');
  const active=state.timers.filter(item=>item.status==='active'); if(!active.length) empty(timers,'Сейчас Ксюша ничего не отсчитывает.'); else timers.innerHTML=active.map(item=>`<article class="timer" data-timer-id="${item.id}"><div class="file-icon">${item.meta?.focus?'◎':'⏱'}</div><div class="file-main"><strong>${escapeHtml(item.label)}</strong><small>${timeRemaining(item.dueAt)}</small></div><button type="button" data-timer-action="cancel">Отменить</button></article>`).join('');
}

files.addEventListener('click',async event=>{const button=event.target.closest('[data-file-action]'); const row=event.target.closest('[data-file-id]'); if(!button||!row)return; const id=row.dataset.fileId; const action=button.dataset.fileAction; if(action==='open')await api.openMemoryFile(id); if(action==='reveal')await api.revealMemoryFile(id); if(action==='forget')await api.forgetMemoryFile(id);});
objects.addEventListener('click',async event=>{const button=event.target.closest('[data-object-action]'); const row=event.target.closest('[data-object-id]'); if(!button||!row)return; const id=row.dataset.objectId; const action=button.dataset.objectAction; if(action==='open'&&row.dataset.objectKind==='link')await api.openMemoryLink(id); if(action==='forget')await api.forgetMemoryObject(id);});
timers.addEventListener('click',async event=>{const button=event.target.closest('[data-timer-action="cancel"]'); const row=event.target.closest('[data-timer-id]'); if(button&&row)await api.cancelTimer(row.dataset.timerId);});

roomProps.addEventListener('click',event=>{
  const button=event.target.closest('[data-room-prop]');
  if(!button||!lastState)return;
  const prop=(lastState.roomProps||[]).find(item=>item.id===button.dataset.roomProp);
  if(prop)showRoomMemory(prop,lastState);
});
roomMemoryClose.addEventListener('click',()=>{roomMemoryCard.hidden=true;});
roomMemoryOpen.addEventListener('click',async()=>{
  const id=roomMemoryOpen.dataset.sourceId;
  const kind=roomMemoryOpen.dataset.sourceKind;
  if(!id)return;
  if(kind==='file')await api.openMemoryFile(id);
  else if(kind==='link')await api.openMemoryLink(id);
});

document.addEventListener('click',async event=>{const focus=event.target.closest('[data-focus]'); if(focus)return api.createFocus(Number(focus.dataset.focus)); const surface=event.target.closest('[data-surface]'); if(surface){if(surface.dataset.surface==='perch')return api.attachNearestSurface(); if(surface.dataset.surface==='leave')return api.leaveSurface(); if(surface.dataset.surface==='toggle'){const state=await api.getState(); return api.setSurfaceGeometry(!state.runtime?.surfaceGeometryEnabled);}} const quiet=event.target.closest('[data-quiet]'); if(!quiet)return; if(quiet.dataset.quiet==='clear')await api.clearQuiet(); else await api.setQuiet(Number(quiet.dataset.quiet));});

async function imageForShare(){return new Promise((resolve,reject)=>{const image=new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src='../../assets/character/look-center.png';});}
async function makeShareCard(state){const canvas=document.createElement('canvas'); canvas.width=1200; canvas.height=630; const ctx=canvas.getContext('2d'); const gradient=ctx.createLinearGradient(0,0,1200,630); gradient.addColorStop(0,'#f7efe6'); gradient.addColorStop(1,'#e7f0ff'); ctx.fillStyle=gradient; ctx.fillRect(0,0,1200,630); ctx.fillStyle='rgba(255,255,255,.72)'; ctx.beginPath(); ctx.roundRect(70,65,1060,500,34); ctx.fill(); const image=await imageForShare(); ctx.drawImage(image,760,105,290,360); ctx.fillStyle='#9a7659'; ctx.font='700 22px system-ui'; ctx.fillText('MURA COMPANION · KSYUSHA',130,145); ctx.fillStyle='#283245'; ctx.font='700 58px system-ui'; ctx.fillText(state.relationship?.stage?.label||'Наша история',130,225); ctx.font='400 28px system-ui'; ctx.fillStyle='#677184'; ctx.fillText(`Вместе ${daysTogether(state.identity.metAt)} дн. · ${state.keepsakes.length} воспоминаний`,130,280); ctx.fillText((state.homeScene?.note || 'Ксюша осваивается рядом.').slice(0,68),130,322); const currentEpisode=state.episodesDetailed?.[0]; if(currentEpisode){ctx.fillStyle='#355a49'; ctx.font='600 25px system-ui'; ctx.fillText(`${currentEpisode.stageEmoji||'🌱'} ${currentEpisode.title}: ${currentEpisode.stageLabel}`,130,400);} ctx.fillStyle='#8c929b'; ctx.font='400 20px system-ui'; ctx.fillText('SEE · REACT · LIVE · REMEMBER · ACT · GROW · CONNECT',130,495); return canvas.toDataURL('image/png');}
shareButton.addEventListener('click',async()=>{if(!lastState)return; shareButton.disabled=true; try{const dataUrl=await makeShareCard(lastState); const result=await api.saveShareCard(dataUrl); if(result?.ok){shareStatus.textContent=`Сохранено: ${result.name}`; shareStatus.hidden=false; setTimeout(()=>{shareStatus.hidden=true;},2800);}}finally{shareButton.disabled=false;}});

api.onStateChanged(render); api.getState().then(render); setInterval(async()=>render(await api.getState()),30_000);
