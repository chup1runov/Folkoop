'use strict';

const q = id => document.getElementById(id);
const M = window.MuraWebModel;
const STORAGE_KEY = 'mura-web-alpha6-stabilized-v1';
const LEGACY_KEY = 'mura-web-preview-alpha6-v1';

const assets = {
  idle:'look-center.webp', center:'look-center.webp', left:'look-left.webp', right:'look-right.webp',
  up:'look-up.webp', down:'look-down.webp', ul:'look-up-left.webp', ur:'look-up-right.webp',
  dl:'look-down-left.webp', dr:'look-down-right.webp',
  wave:'waving.webp', thinking:'thinking.webp', jump:'jumping.webp', inspect:'inspect.webp',
  confident:'confident.webp', rest:'rest.webp', idea:'idea.webp', wink:'wink.webp',
  'hands-behind':'hands-behind.webp', 'lean-in':'lean-in.webp'
};

function loadRaw() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current);
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return JSON.parse(legacy);
  } catch {}
  return null;
}

let state = M.normalizeState(loadRaw());
let currentFile = null;
let actionTimer = null;
let bubbleTimer = null;
let lastPointer = { x: innerWidth / 2, y: innerHeight / 2 };
let onboardingActive = state.preferences.onboardingCompleted !== true;
let onboardingStep = -1;
let onboardingResumeStep = null;
let onboardingTimer = null;

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  updateControls();
}
function reset() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
  location.reload();
}
function img(name) {
  const file = assets[name] || assets.center;
  return window.MURA_WEB_ASSETS && window.MURA_WEB_ASSETS[file] || '';
}
function setCharacter(name, animate) {
  const el = q('character');
  el.src = img(name || 'center');
  if (animate !== false) {
    el.classList.remove('action');
    void el.offsetWidth;
    el.classList.add('action');
  }
}
function showBubble(text, ms) {
  const b = q('bubble');
  clearTimeout(bubbleTimer);
  if (!text) {
    b.hidden = true;
    return;
  }
  b.textContent = text;
  b.hidden = false;
  bubbleTimer = setTimeout(() => { b.hidden = true; }, ms || 2600);
}
function doAction(name, message, ms) {
  clearTimeout(actionTimer);
  setCharacter(name);
  if (message) showBubble(message, (ms || 1800) + 600);
  actionTimer = setTimeout(() => {
    actionTimer = null;
    setCharacter('center', false);
  }, ms || 1800);
}
function formatBytes(n) {
  if (n < 1024) return n + ' Б';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' КБ';
  return (n / 1024 / 1024).toFixed(1) + ' МБ';
}
function formatRemaining(dueAt) {
  const ms = new Date(dueAt).getTime() - Date.now();
  if (ms <= 0) return 'почти готово';
  const minutes = Math.ceil(ms / 60000);
  return minutes < 60 ? minutes + ' мин' : Math.floor(minutes / 60) + ' ч ' + (minutes % 60) + ' мин';
}

function coach(title, text, buttons) {
  q('coachTitle').textContent = title;
  q('coachText').textContent = text;
  const actions = q('coachActions');
  actions.replaceChildren();
  for (const row of buttons) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = row[0];
    if (row[2]) b.className = 'primary';
    b.addEventListener('click', row[1]);
    actions.append(b);
  }
  q('coach').hidden = false;
}
function hideCoach() { q('coach').hidden = true; }
function scheduleCoach(step, delay) {
  clearTimeout(onboardingTimer);
  onboardingTimer = setTimeout(() => {
    onboardingTimer = null;
    if (onboardingActive) showOnboarding(step);
  }, delay || 0);
}
function showOnboarding(step) {
  onboardingActive = true;
  onboardingStep = step;
  q('desktop').dataset.onboarding = 'true';

  if (step === 0) {
    coach(
      'Привет. Я Ксюша.',
      'Я живу в этом мире прямо в браузере. Я замечаю курсор и помню только то, что ты сам решишь мне оставить.',
      [
        ['Познакомиться', () => {
          hideCoach();
          onboardingStep = 1;
          showBubble('Подвигай курсором. Потом нажми на меня.', 6500);
        }, true],
        ['Пропустить', () => finishOnboarding('skip'), false]
      ]
    );
    return;
  }

  if (step === 2) {
    coach(
      'Вот мои быстрые действия.',
      'Пока мы знакомимся, я подписала кнопки. Потом останутся только значки.',
      [['Дальше', () => showOnboarding(3), true]]
    );
    return;
  }

  if (step === 3) {
    coach(
      'Мне можно давать вещи.',
      'Перетащи сюда любой файл. Я увижу только его имя, размер и тип. В память он попадёт лишь после «Запомнить».',
      [['Дальше', () => showOnboarding(4), true]]
    );
    return;
  }

  coach(
    'В браузере у меня свой мир.',
    'Я могу показать, как живу на окнах, но настоящие окна macOS браузер видеть не может. Эта часть остаётся Desktop Mode.',
    [['Понятно', () => finishOnboarding('done'), true]]
  );
}
function beginOnboarding() {
  doAction('wave');
  scheduleCoach(0, 350);
}
function finishOnboarding(outcome) {
  onboardingActive = false;
  onboardingStep = -1;
  onboardingResumeStep = null;
  clearTimeout(onboardingTimer);
  q('desktop').dataset.onboarding = 'false';
  hideCoach();
  q('radial').hidden = true;
  state.preferences.onboardingCompleted = true;
  M.recordMoment(state, 'onboarding-completed', { salience:.34, data:{ outcome: outcome || 'done' } });
  save();
  showBubble('Я рядом.', 1800);
}
function pauseOnboardingForHandoff() {
  if (!onboardingActive || q('coach').hidden) return;
  onboardingResumeStep = onboardingStep === 3 ? 4 : onboardingStep;
  hideCoach();
}
function resumeOnboardingAfterHandoff(delay) {
  if (!onboardingActive || onboardingResumeStep == null) return;
  const step = onboardingResumeStep;
  onboardingResumeStep = null;
  scheduleCoach(step, delay || 0);
}

function directionFor(x, y) {
  const r = q('character').getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * .42;
  const dx = x - cx;
  const dy = y - cy;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < 35 && ay < 35) return 'center';
  if (ax > ay * 1.5) return dx < 0 ? 'left' : 'right';
  if (ay > ax * 1.5) return dy < 0 ? 'up' : 'down';
  if (dx < 0 && dy < 0) return 'ul';
  if (dx > 0 && dy < 0) return 'ur';
  if (dx < 0 && dy > 0) return 'dl';
  return 'dr';
}
document.addEventListener('pointermove', event => {
  lastPointer = { x:event.clientX, y:event.clientY };
  if (!actionTimer) q('character').src = img(directionFor(event.clientX, event.clientY));
});

q('characterWrap').addEventListener('click', event => {
  if (event.target.closest('button')) return;
  q('radial').hidden = !q('radial').hidden;
  if (onboardingActive && onboardingStep === 1 && !q('radial').hidden) scheduleCoach(2, 700);
});
q('radial').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  event.stopPropagation();
  q('radial').hidden = true;
  const action = button.dataset.action;
  if (action === 'home') return openHome();
  if (action === 'focus') return startFocus();
  if (action === 'perch') return doAction('jump', 'В Web Mode это демонстрация. Настоящие окна доступны только Desktop Mode.');
  doAction(action);
});

const desktop = q('desktop');
desktop.addEventListener('dragover', event => {
  event.preventDefault();
  q('dropHint').hidden = false;
  event.dataTransfer.dropEffect = 'copy';
});
desktop.addEventListener('dragleave', event => {
  if (!desktop.contains(event.relatedTarget)) q('dropHint').hidden = true;
});
desktop.addEventListener('drop', event => {
  event.preventDefault();
  q('dropHint').hidden = true;
  const file = event.dataTransfer.files && event.dataTransfer.files[0];
  if (!file) return;
  currentFile = { name:file.name, size:file.size, type:file.type || 'file' };
  q('handoffName').textContent = file.name;
  q('handoffMeta').textContent = (file.type || 'файл') + ' · ' + formatBytes(file.size) + ' · содержимое не читается и не загружается';
  pauseOnboardingForHandoff();
  q('handoff').hidden = false;
  doAction('inspect');
});
q('rememberButton').addEventListener('click', () => {
  if (currentFile) M.rememberFileMeta(state, currentFile);
  currentFile = null;
  q('handoff').hidden = true;
  save();
  doAction('confident', 'Запомнила.');
  resumeOnboardingAfterHandoff(650);
});
q('cancelHandoff').addEventListener('click', () => {
  currentFile = null;
  q('handoff').hidden = true;
  setCharacter('center');
  resumeOnboardingAfterHandoff();
});

function startFocus(minutes) {
  const existing = M.activeFocus(state);
  if (existing) {
    showBubble('Фокус уже идёт · ' + formatRemaining(existing.dueAt));
    return existing;
  }
  const timer = M.startFocus(state, minutes || 25);
  save();
  doAction('confident', 'Фокус ' + (minutes || 25) + ' минут. Я постараюсь не отвлекать.');
  updateControls();
  return timer;
}
function completeCurrentFocus() {
  const focus = M.activeFocus(state);
  if (!focus) {
    showBubble('Активного фокуса сейчас нет.');
    return;
  }
  M.completeFocus(state, focus.id);
  save();
  doAction('confident', '🎯 Фокус завершён.');
  renderHomeIfOpen();
}
function toggleQuiet() {
  if (M.isQuiet(state)) {
    M.clearQuiet(state);
    save();
    showBubble('Тихий период закончен.');
  } else {
    M.setQuiet(state, 30 * 60 * 1000);
    save();
    doAction('rest', 'Буду тихо рядом.');
  }
  renderHomeIfOpen();
}
q('quietButton').addEventListener('click', toggleQuiet);

q('callButton').addEventListener('click', () => {
  M.incrementInteraction(state, 'called-to-cursor');
  save();
  const wrap = q('characterWrap');
  const x = Math.max(20, Math.min(innerWidth - 244, lastPointer.x - 112));
  wrap.style.left = x + 'px';
  doAction('wave', 'Я здесь.');
});
q('homeButton').addEventListener('click', openHome);

function canDeliverContinuity() {
  return state.preferences.onboardingCompleted === true &&
    !M.isQuiet(state) &&
    !M.activeFocus(state) &&
    !onboardingActive &&
    !actionTimer;
}
function deliverContinuity(delay) {
  if (!canDeliverContinuity()) return null;
  const beat = M.chooseFirstWeekMoment(state);
  if (!beat) return null;
  setTimeout(() => {
    if (!canDeliverContinuity() || M.hasDiscovery(state, beat.id)) return;
    M.discover(state, beat.id, { source:'first-week-web' });
    M.recordMoment(state, 'continuity-return', { salience:.58, data:{ eventId:beat.id } });
    save();
    doAction(beat.action, beat.message, 2400);
  }, delay || 0);
  return beat;
}
function latestActiveDayMs() {
  const values = (state.identity.activeDays || [])
    .map(x => new Date(x + 'T12:00:00Z').getTime())
    .filter(Number.isFinite);
  return values.length ? Math.max(...values) : Date.now();
}
function nextActiveDay() {
  const next = latestActiveDayMs() + M.DAY_MS;
  M.markActiveDay(state, next);
  state.identity.sessions = Number(state.identity.sessions || 0) + 1;
  state.identity.lastSeenAt = M.iso(next);
  M.syncEpisode(state, next);
  save();
  renderHomeIfOpen();
  deliverContinuity();
}
q('nextDay').addEventListener('click', nextActiveDay);
q('completeFocus').addEventListener('click', completeCurrentFocus);
q('resetPreview').addEventListener('click', reset);

function openHome() {
  renderHome();
  if (!q('homeDialog').open) q('homeDialog').showModal();
}
function renderHomeIfOpen() {
  if (q('homeDialog').open) renderHome();
}
function renderHome() {
  const completed = M.completeDueTimers(state);
  if (completed.length) save();
  const relationship = M.deriveRelationship(state);
  const episodesDetailed = M.describeEpisodes(state);
  const viewState = { ...state, relationship, episodesDetailed };
  const scene = M.deriveHomeScene(viewState);
  const props = M.roomProps(viewState);
  const room = q('room');
  const hc = q('homeCharacter');

  room.dataset.scene = scene.id;
  hc.src = img(scene.pose);
  q('roomSceneTitle').textContent = {
    focus:'Ксюша занята рядом',
    quiet:'Тихий период',
    episode:'Дома что-то происходит',
    memory:'Появились свои вещи',
    settling:'Ксюша осваивается'
  }[scene.id] || 'Ксюша дома';
  q('roomSceneNote').textContent = scene.note;

  const current = episodesDetailed[0] || null;
  q('plant').textContent = current && current.stageEmoji || '';
  q('storyTitle').textContent = current && current.title || 'Пока тихо';
  q('storyText').textContent = current ? current.stageLabel + '. ' + current.stageNote : 'Маленькие истории появляются постепенно.';

  const focus = M.activeFocus(state);
  if (focus) {
    q('nowTitle').textContent = 'Фокус';
    q('nowText').textContent = focus.label + ' · ещё ' + formatRemaining(focus.dueAt);
  } else if (M.isQuiet(state)) {
    q('nowTitle').textContent = 'Тихий период';
    q('nowText').textContent = 'Ксюша остаётся рядом, но не инициирует лишние действия.';
  } else {
    q('nowTitle').textContent = 'Компаньон';
    q('nowText').textContent = 'Ксюша просто рядом и не требует внимания.';
  }

  q('relationshipLabel').textContent = relationship.stage.label;
  q('relationshipText').textContent = relationship.stage.description;

  const roomProps = q('roomProps');
  roomProps.replaceChildren();
  for (const prop of props) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'room-prop ' + prop.slot;
    button.textContent = prop.emoji;
    button.title = prop.label;
    button.addEventListener('click', () => showBubble(prop.label, 2200));
    roomProps.append(button);
  }

  const list = q('memoryList');
  list.replaceChildren();
  if (!state.files.length) {
    list.innerHTML = '<div class="memory-item">Пока ничего не доверено.</div>';
  } else {
    for (const item of state.files) {
      const row = document.createElement('div');
      row.className = 'memory-item';
      row.textContent = '📎 ' + item.name;
      list.append(row);
    }
  }
}
function updateControls() {
  const focus = M.activeFocus(state);
  const quiet = M.isQuiet(state);
  q('quietButton').textContent = quiet ? 'Снять тишину' : 'Тихо 30 мин';
  q('dayValue').textContent = M.activeDayCount(state);
  q('sessionValue').textContent = state.identity.sessions;
  q('itemValue').textContent = state.files.length + state.objects.length;
  q('focusValue').textContent = focus
    ? 'идёт · ' + formatRemaining(focus.dueAt)
    : M.completedFocusCount(state) > 0 ? 'завершён' : 'нет';
}
q('previewToggle').addEventListener('click', () => { q('testPanel').hidden = !q('testPanel').hidden; });
q('testClose').addEventListener('click', () => { q('testPanel').hidden = true; });

window.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!q('handoff').hidden) {
    currentFile = null;
    q('handoff').hidden = true;
    setCharacter('center');
    resumeOnboardingAfterHandoff();
    return;
  }
  if (!q('radial').hidden) {
    q('radial').hidden = true;
    return;
  }
  if (!q('coach').hidden && onboardingActive) hideCoach();
});

setCharacter('center', false);
M.completeDueTimers(state);
M.syncEpisode(state);
save();

if (onboardingActive) {
  q('desktop').dataset.onboarding = 'true';
  setTimeout(beginOnboarding, 600);
} else {
  q('desktop').dataset.onboarding = 'false';
  state.identity.sessions = Number(state.identity.sessions || 0) + 1;
  M.markActiveDay(state);
  state.identity.lastSeenAt = M.iso();
  M.syncEpisode(state);
  save();
  setTimeout(() => deliverContinuity(0), 900);
}

setInterval(() => {
  const completed = M.completeDueTimers(state);
  if (completed.length) {
    save();
    doAction('confident', '🎯 Фокус завершён.');
  }
  updateControls();
  renderHomeIfOpen();
}, 1000);
