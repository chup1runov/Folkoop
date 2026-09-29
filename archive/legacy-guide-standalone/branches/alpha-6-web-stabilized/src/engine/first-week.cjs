'use strict';

function activeDayCount(state = {}) {
  return new Set((state.identity?.activeDays || []).filter(Boolean)).size;
}

function hasDiscovery(state = {}, id) {
  return (state.discoveries || []).some(item => item.id === id);
}

function completedFocusCount(state = {}) {
  return (state.timers || []).filter(item => item.status === 'done' && item.meta?.focus).length;
}

function momentCount(state = {}, kind) {
  return (state.moments || []).filter(item => item.kind === kind).length;
}

function trustedCount(state = {}) {
  return Number((state.files || []).length + (state.objects || []).length);
}

function currentEpisode(state = {}) {
  return (state.episodes || [])[0] || null;
}

const FIRST_SEVEN_ACTIVE_DAYS = Object.freeze([
  Object.freeze({
    id: 'continuity:return-hello',
    minSessions: 2,
    minActiveDays: 1,
    action: 'wave',
    message: 'Ты вернулся.'
  }),
  Object.freeze({
    id: 'continuity:remembered-gift',
    minSessions: 2,
    minActiveDays: 2,
    requireTrusted: true,
    action: 'inspect',
    message: 'Я помню, что ты мне кое-что оставил.'
  }),
  Object.freeze({
    id: 'continuity:called-ritual',
    minSessions: 3,
    minActiveDays: 2,
    requireCalls: 2,
    action: 'lean-in',
    message: 'Кажется, я уже узнаю твой способ меня звать.'
  }),
  Object.freeze({
    id: 'continuity:focus-memory',
    minSessions: 3,
    minActiveDays: 3,
    requireFocus: true,
    action: 'confident',
    message: 'Мы уже умеем работать рядом. Если захочешь — снова устроим фокус.'
  }),
  Object.freeze({
    id: 'continuity:home-changed',
    minSessions: 3,
    minActiveDays: 4,
    requireEpisode: true,
    action: 'idea',
    message: 'Загляни домой. Там уже кое-что изменилось.'
  }),
  Object.freeze({
    id: 'continuity:shared-history',
    minSessions: 4,
    minActiveDays: 5,
    requireMeaningfulMoments: 2,
    action: 'hands-behind',
    message: 'У нас уже есть несколько своих маленьких историй.'
  }),
  Object.freeze({
    id: 'continuity:week-settled',
    minSessions: 5,
    minActiveDays: 7,
    action: 'wink',
    message: 'Кажется, я тут уже освоилась.'
  })
]);

function eligibleBeat(beat, state = {}) {
  const sessions = Number(state.identity?.sessions || 0);
  const days = activeDayCount(state);
  if (sessions < beat.minSessions || days < beat.minActiveDays) return false;
  if (beat.requireTrusted && trustedCount(state) < 1) return false;
  if (beat.requireCalls && momentCount(state, 'called-to-cursor') < beat.requireCalls) return false;
  if (beat.requireFocus && completedFocusCount(state) < 1) return false;
  if (beat.requireEpisode && !currentEpisode(state)) return false;
  if (beat.requireMeaningfulMoments) {
    const meaningful = (state.moments || []).filter(item => Number(item.salience || 0) >= 0.45).length;
    if (meaningful < beat.requireMeaningfulMoments) return false;
  }
  return !hasDiscovery(state, beat.id);
}

function chooseFirstWeekMoment(state = {}) {
  const days = activeDayCount(state);
  if (days < 1 || days > 7) return null;
  return FIRST_SEVEN_ACTIVE_DAYS.find(beat => eligibleBeat(beat, state)) || null;
}

function roomProps(state = {}) {
  const props = [];
  const keepsakes = state.keepsakes || [];
  const firstGift = keepsakes.find(item => item.kind === 'first-gift');
  const firstFocus = keepsakes.find(item => item.kind === 'first-focus');
  const firstTimer = keepsakes.find(item => item.kind === 'first-timer');

  if (firstGift) props.push({ id: 'first-gift', slot: 'shelf-left', emoji: firstGift.emoji || '📎', label: 'Первая доверенная вещь', sourceId: firstGift.sourceId || null });
  if (firstFocus) props.push({ id: 'first-focus', slot: 'desk-left', emoji: '🎯', label: 'Первая совместная фокус-сессия', sourceId: firstFocus.sourceId || null });
  else if (firstTimer) props.push({ id: 'first-timer', slot: 'desk-left', emoji: '⏱️', label: 'Первый совместный таймер', sourceId: firstTimer.sourceId || null });

  const rel = state.relationship?.stage?.id;
  if (['shared-history', 'long-term'].includes(rel)) props.push({ id: 'history-star', slot: 'shelf-right', emoji: '✦', label: 'У вас уже есть своя история' });

  return props;
}

module.exports = {
  FIRST_SEVEN_ACTIVE_DAYS,
  activeDayCount,
  hasDiscovery,
  completedFocusCount,
  momentCount,
  trustedCount,
  eligibleBeat,
  chooseFirstWeekMoment,
  roomProps
};
