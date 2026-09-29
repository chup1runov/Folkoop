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
const onboarding = document.getElementById('onboarding');
const onboardingTitle = document.getElementById('onboardingTitle');
const onboardingText = document.getElementById('onboardingText');
const onboardingActions = document.getElementById('onboardingActions');

let pack = null;
let interactive = false;
let action = 'idle';
let actionUntil = 0;
let pending = null;
let timerMode = 'timer';
let bubbleTimer = null;
let currentHead = '';
let currentEyes = '';
let onboardingActive = false;
let onboardingStep = -1;
let onboardingResumeStep = null;
let onboardingTimer = null;

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
function coachButton(label, action, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.dataset.onboarding = action;
  if (className) button.className = className;
  return button;
}
function showOnboarding(step, override = null) {
  onboardingActive = true;
  onboardingStep = step;
  stage.dataset.onboarding = 'true';
  let title = '';
  let text = '';
  let buttons = [];
  if (step === 0) {
    title = 'Привет. Я Ксюша.';
    text = 'Я живу прямо на рабочем столе. Я замечаю курсор, могу устраиваться на окнах и помню только то, что ты сам решишь мне оставить.';
    buttons = [coachButton('Познакомиться', 'next', 'primary'), coachButton('Пропустить', 'skip', 'secondary')];
  } else if (step === 2) {
    title = 'Вот мои быстрые действия.';
    text = 'Сейчас я подписала кнопки, чтобы было проще познакомиться. Потом останутся только значки.';
    buttons = [coachButton('Дальше', 'next', 'primary')];
  } else if (step === 3) {
    title = 'Мне можно давать вещи.';
    text = 'Перетащи на меня файл или ссылку. Я сначала только посмотрю. В память это попадёт лишь после твоего «Запомнить».';
    buttons = [coachButton('Дальше', 'next', 'primary')];
  } else if (step === 4) {
    title = 'Я могу сидеть на окнах.';
    text = 'Это выключено по умолчанию. Если разрешишь, я увижу только положение и размер окон — не их названия и не содержимое.';
    buttons = [coachButton('Разрешить', 'surface', 'primary'), coachButton('Не сейчас', 'later', 'secondary')];
  } else {
    title = override?.title || 'Готово.';
    text = override?.text || 'Сейчас я снова перестану мешать обычным кликам. Позвать меня: Cmd/Ctrl+Shift+K. Взаимодействие: Cmd/Ctrl+Shift+I. Дом: Cmd/Ctrl+Shift+H.';
    buttons = [coachButton('Живи тут', 'done', 'primary')];
  }
  onboardingTitle.textContent = title;
  onboardingText.textContent = text;
  onboardingActions.replaceChildren(...buttons);
  onboarding.hidden = false;
}
function hideOnboarding() { onboarding.hidden = true; }
function scheduleOnboarding(step, delay = 0) {
  clearTimeout(onboardingTimer);
  onboardingTimer = setTimeout(() => {
    onboardingTimer = null;
    if (onboardingActive) showOnboarding(step);
  }, delay);
}
function pauseOnboardingForHandoff(nextStep = 4) {
  if (!onboardingActive) return;
  onboardingResumeStep = nextStep;
  hideOnboarding();
}
function resumeOnboardingAfterHandoff(delay = 0) {
  if (!onboardingActive || onboardingResumeStep == null) return;
  const step = onboardingResumeStep;
  onboardingResumeStep = null;
  scheduleOnboarding(step, delay);
}
async function finishOnboarding(outcome = 'done') {
  onboardingActive = false;
  onboardingStep = -1;
  onboardingResumeStep = null;
  clearTimeout(onboardingTimer);
  onboardingTimer = null;
  stage.dataset.onboarding = 'false';
  onboarding.hidden = true;
  radial.hidden = true;
  const result = await api.completeOnboarding(outcome);
  if (!result?.ok) showBubble(result?.error || 'Не получилось завершить знакомство.');
  else showBubble('Я рядом.', 1800);
}
function startOnboarding() {
  showAction('wave');
  onboardingActive = true;
  scheduleOnboarding(0, 280);
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
  else if (name === 'cancel') { pending = null; handoff.hidden = true; restoreIdle(); resumeOnboardingAfterHandoff(); return; }
  if (!result?.ok) return showBubble(result?.error || 'Не получилось.');
  if (name === 'remember') { pending = null; handoff.hidden = true; showAction('confident', 'Запомнила.'); resumeOnboardingAfterHandoff(700); }
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
  stage.dataset.onboarding = 'false';
  if (state.preferences?.onboardingCompleted !== true) setTimeout(startOnboarding, 650);

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
    if (onboardingActive && onboardingStep === 1 && !radial.hidden) scheduleOnboarding(2, 1100);
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
  onboarding.addEventListener('click', async event => {
    const button = event.target.closest('[data-onboarding]');
    if (!button) return;
    const command = button.dataset.onboarding;
    if (command === 'skip') return finishOnboarding('skip');
    if (command === 'done') return finishOnboarding('done');
    if (command === 'next' && onboardingStep === 0) {
      hideOnboarding(); onboardingStep = 1; showBubble('Подвигай курсором. Потом нажми на меня.', 7000); return;
    }
    if (command === 'next' && onboardingStep === 2) return showOnboarding(3);
    if (command === 'next' && onboardingStep === 3) return showOnboarding(4);
    if (command === 'later' && onboardingStep === 4) return showOnboarding(5);
    if (command === 'surface' && onboardingStep === 4) {
      const result = await api.setSurfaceGeometry(true);
      const status = result?.status || {};
      if (status.permissionRequired) return showOnboarding(5, { title: 'Почти готово.', text: 'Геометрия включена, но macOS ещё требует системный доступ. Mura всё равно не читает названия или содержимое окон. Разрешение можно закончить позже.' });
      if (result?.ok === false) return showOnboarding(5, { title: 'Не получилось включить окна.', text: 'Ничего страшного — это можно повторить позже из Дома или меню Mura. Остальные функции работают без геометрии окон.' });
      return showOnboarding(5, { title: 'Теперь я знаю, где края окон.', text: 'Я вижу только нужную геометрию. Названия и содержимое окон не сохраняются. После знакомства я снова перестану мешать обычным кликам.' });
    }
  });

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
    if (onboardingActive && onboardingStep === 3) pauseOnboardingForHandoff(4);
    showHandoff(result);
  });
  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!handoff.hidden || !timerSheet.hidden || !radial.hidden) {
      const wasHandoff = !handoff.hidden;
      handoff.hidden = true; timerSheet.hidden = true; radial.hidden = true; pending = null; restoreIdle();
      if (wasHandoff) resumeOnboardingAfterHandoff();
    } else if (interactive) api.toggleInteraction();
  });
}

boot().catch(error => { console.error(error); showBubble('Не удалось загрузить Ксюшу.', 5000); });
