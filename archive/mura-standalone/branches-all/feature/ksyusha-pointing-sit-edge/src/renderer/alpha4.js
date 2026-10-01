'use strict';

const api = window.mura || window.ksyusha;
const stage = document.getElementById('stage');
const wrap = document.getElementById('characterWrap');
const visual = document.getElementById('visual');
const body = document.getElementById('body');
const head = document.getElementById('rigHead');
const eyes = document.getElementById('rigEyes');
const bubble = document.getElementById('bubble');
const dropHint = document.getElementById('dropHint');
const radial = document.getElementById('radial');
const handoff = document.getElementById('handoff');
const handoffName = document.getElementById('handoffName');
const handoffMeta = document.getElementById('handoffMeta');
const timerSheet = document.getElementById('timerSheet');
const timerTitle = document.getElementById('timerTitle');

let pack = null;
let interactive = false;
let action = 'idle';
let actionUntil = 0;
let pending = null;
let timerMode = 'timer';
let bubbleTimer = null;
let currentHead = '';
let currentEyes = '';

function asset(name) {
  if (!name) return '';
  return pack?.assetData?.[name] || `../../assets/character/${name}`;
}
function actionSpec(name) { return pack?.actions?.[name] || pack?.actions?.idle; }
function lookAsset(direction = 'center') { return asset(pack?.attention?.assets?.[direction] || pack?.attention?.assets?.center); }
function showBubble(text, ms = 2200) {
  clearTimeout(bubbleTimer);
  if (!text) { bubble.hidden = true; return; }
  bubble.textContent = text; bubble.hidden = false;
  bubbleTimer = setTimeout(() => { bubble.hidden = true; }, ms);
}
function setLayerImage(el, src, key) {
  if (!src) return;
  if (key === 'head' && currentHead === src) return;
  if (key === 'eyes' && currentEyes === src) return;
  if (key === 'head') currentHead = src; else currentEyes = src;
  el.src = src;
}
function applyRig(rig = {}) {
  visual.style.setProperty('--hx', `${Number(rig.headX || 0).toFixed(2)}px`);
  visual.style.setProperty('--hy', `${Number(rig.headY || 0).toFixed(2)}px`);
  visual.style.setProperty('--hr', `${Number(rig.headRotate || 0).toFixed(2)}deg`);
  visual.style.setProperty('--ex', `${Number(rig.eyeX || 0).toFixed(2)}px`);
  visual.style.setProperty('--ey', `${Number(rig.eyeY || 0).toFixed(2)}px`);
  visual.style.setProperty('--bx', `${Number(rig.bodyX || 0).toFixed(2)}px`);
  visual.style.setProperty('--by', `${Number(rig.bodyY || 0).toFixed(2)}px`);
  visual.style.setProperty('--br', `${Number(rig.bodyRotate || 0).toFixed(2)}deg`);
}
function showRig(direction = 'center', blink = false, level = 'soft') {
  const base = asset(pack?.rig?.baseAsset || pack?.attention?.assets?.center);
  const directionSrc = lookAsset(direction);
  const headSrc = ['soft','eyes'].includes(level) ? base : directionSrc;
  setLayerImage(head, headSrc, 'head');
  setLayerImage(eyes, blink ? asset(pack?.rig?.blinkAsset || pack?.actions?.rest?.asset) : directionSrc, 'eyes');
  body.src = base; body.hidden = false; head.hidden = false; eyes.hidden = false;
}
function showAction(name, message = null, autonomous = false) {
  if (autonomous && Date.now() < actionUntil) return;
  const spec = actionSpec(name); if (!spec) return;
  action = name;
  const duration = Number(spec.durationMs || 0);
  actionUntil = duration > 0 ? Date.now() + duration : Number.POSITIVE_INFINITY;
  body.src = asset(spec.asset); body.hidden = false; head.hidden = true; eyes.hidden = true; applyRig({});
  if (message) showBubble(message);
  if (duration > 0) setTimeout(() => { if (action === name && Date.now() >= actionUntil) restoreIdle(); }, duration + 35);
}
function restoreIdle() {
  action = 'idle'; actionUntil = 0; applyRig({}); showRig('center', false, 'soft');
}
function onAction(payload = {}) {
  const name = payload.type || payload.action || 'idle';
  if (name === 'idle') return restoreIdle();
  showAction(name, payload.message, payload.autonomous === true);
}
function onPresence(payload = {}) {
  const attention = payload.attention || payload;
  const rig = payload.rig || attention.rig || {};
  const budget = payload.budget || {};
  stage.dataset.quiet = String(Boolean(budget.quiet || budget.focus || attention.quiet || attention.focus));
  stage.dataset.surfaceAttached = String(Boolean(payload.surfaceAttached || attention.surfaceAttached));
  if (action !== 'idle' || Date.now() < actionUntil) return;
  applyRig(rig);
  const direction = attention.attending === false ? 'center' : (rig.direction8 || attention.direction8 || attention.direction || 'center');
  showRig(direction, rig.blink === true, rig.attentionLevel || attention.level || 'soft');
}
function setInteractive(value) {
  interactive = Boolean(value?.interactive ?? value);
  stage.dataset.interactive = String(interactive);
  wrap.dataset.mode = interactive ? 'interactive' : 'passive';
  if (!interactive) { radial.hidden = true; handoff.hidden = true; timerSheet.hidden = true; pending = null; }
}
function formatBytes(n) {
  if (!Number.isFinite(n)) return '';
  if (n < 1024) return `${n} Б`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`;
  return `${(n / 1024 / 1024).toFixed(1)} МБ`;
}
function showHandoff(result) {
  pending = result;
  const d = result.descriptor || {};
  handoffName.textContent = d.name || d.preview || 'Цифровая вещь';
  handoffMeta.textContent = [d.kind, d.preview, formatBytes(d.size)].filter(Boolean).join(' · ');
  handoff.querySelector('[data-handoff="open"]').hidden = d.canOpen === false;
  handoff.querySelector('[data-handoff="reveal"]').hidden = d.canReveal === false;
  radial.hidden = true; timerSheet.hidden = true; handoff.hidden = false;
  showAction('inspect');
}
async function doHandoff(name) {
  if (!pending) return;
  let result = { ok: true };
  if (name === 'remember') result = await api.rememberHandoff(pending.token);
  else if (name === 'open') result = await api.openHandoff(pending.token);
  else if (name === 'reveal') result = await api.revealHandoff(pending.token);
  else if (name === 'cancel') { pending = null; handoff.hidden = true; restoreIdle(); return; }
  if (!result?.ok) return showBubble(result?.error || 'Не получилось.');
  if (name === 'remember') { pending = null; handoff.hidden = true; showAction('confident', 'Запомнила.'); }
}
function openTimer(mode) {
  timerMode = mode; timerTitle.textContent = mode === 'focus' ? 'Фокус' : 'Таймер';
  radial.hidden = true; handoff.hidden = true; timerSheet.hidden = false;
}

async function boot() {
  pack = await api.getCharacterPack();
  const base = asset(pack.rig?.baseAsset || pack.attention?.assets?.center);
  body.src = base; head.src = base; eyes.src = base; restoreIdle();
  const state = await api.getState();
  setInteractive(state.runtime?.interactive === true);
  stage.dataset.surfaceAttached = String(Boolean(state.runtime?.surfaceAttached || state.runtime?.surface?.attached));

  api.onPresence(onPresence);
  api.onAction(onAction);
  api.onMode(setInteractive);
  api.onStateChanged(next => {
    if (next?.runtime) {
      setInteractive(next.runtime.interactive === true);
      stage.dataset.surfaceAttached = String(Boolean(next.runtime.surfaceAttached || next.runtime.surface?.attached));
      stage.dataset.quiet = String(Boolean(next.runtime.quiet || next.runtime.focus));
    }
  });

  wrap.addEventListener('click', event => {
    if (!interactive || event.target.closest('button')) return;
    radial.hidden = !radial.hidden; timerSheet.hidden = true; handoff.hidden = true;
  });
  radial.addEventListener('click', async event => {
    const button = event.target.closest('[data-command]'); if (!button) return;
    event.stopPropagation(); radial.hidden = true;
    const command = button.dataset.command;
    if (command === 'timer') return openTimer('timer');
    if (command === 'focus') return openTimer('focus');
    if (command === 'home') return api.openHome();
    const result = await api.perform(command);
    if (command === 'perch' && result?.ok === false) showBubble(result.error === 'geometry-disabled' ? 'Сначала включи геометрию окон.' : 'Не нашла подходящее окно.');
  });
  timerSheet.addEventListener('click', async event => {
    const button = event.target.closest('[data-minutes]'); if (!button) return;
    const minutes = Number(button.dataset.minutes);
    const result = timerMode === 'focus' ? await api.createFocus(minutes) : await api.createTimer(minutes);
    timerSheet.hidden = true; if (!result?.ok) showBubble(result?.error || 'Не получилось.'); else showAction('confident', timerMode === 'focus' ? `Фокус ${minutes} минут.` : `Засекла ${minutes} минут.`);
  });
  handoff.addEventListener('click', event => { const b = event.target.closest('[data-handoff]'); if (b) void doHandoff(b.dataset.handoff); });

  stage.addEventListener('dragenter', event => { if (!interactive) return; event.preventDefault(); dropHint.hidden = false; });
  stage.addEventListener('dragover', event => { if (!interactive) return; event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; });
  stage.addEventListener('dragleave', event => { if (!stage.contains(event.relatedTarget)) dropHint.hidden = true; });
  stage.addEventListener('drop', async event => {
    if (!interactive) return; event.preventDefault(); dropHint.hidden = true;
    const file = event.dataTransfer?.files?.[0];
    let result;
    if (file) result = await api.inspectDroppedFile(file);
    else {
      const uri = event.dataTransfer?.getData('text/uri-list')?.split('\n').find(x => x && !x.startsWith('#'));
      const text = uri || event.dataTransfer?.getData('text/plain'); if (!text) return;
      result = await api.inspectDroppedText(text, uri ? 'link' : 'text');
    }
    if (!result?.ok) return showBubble(result?.error || 'Не получилось принять объект.');
    showHandoff(result);
  });
  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!handoff.hidden || !timerSheet.hidden || !radial.hidden) { handoff.hidden = true; timerSheet.hidden = true; radial.hidden = true; pending = null; restoreIdle(); }
    else if (interactive) api.toggleInteraction();
  });
}

boot().catch(error => { console.error(error); showBubble('Не удалось загрузить Ксюшу.', 5000); });
