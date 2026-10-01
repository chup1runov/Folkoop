'use strict';

const ECHOES = Object.freeze([
  Object.freeze({
    id: 'memory-echo:trusted',
    kind: 'trusted',
    minSessions: 3,
    cooldownDays: 3,
    weight: 1.25,
    action: 'inspect',
    message: 'Иногда я возвращаюсь мыслями к тому, что ты мне доверил.'
  }),
  Object.freeze({
    id: 'memory-echo:focus',
    kind: 'focus',
    minSessions: 4,
    cooldownDays: 4,
    weight: 1.05,
    action: 'confident',
    message: 'У нас уже получается работать рядом без лишних слов.'
  }),
  Object.freeze({
    id: 'memory-echo:call-ritual',
    kind: 'call-ritual',
    minSessions: 4,
    cooldownDays: 4,
    weight: 0.95,
    action: 'lean-in',
    message: 'Я уже начинаю понимать, когда ты зовёшь меня просто побыть рядом.'
  }),
  Object.freeze({
    id: 'memory-echo:episode',
    kind: 'episode',
    minSessions: 5,
    cooldownDays: 5,
    weight: 0.9,
    action: 'hands-behind',
    message: 'Некоторые вещи дома уже ощущаются как наши.'
  }),
  Object.freeze({
    id: 'memory-echo:history',
    kind: 'history',
    minSessions: 6,
    cooldownDays: 7,
    weight: 0.65,
    action: 'wink',
    message: 'Забавно, сколько всего здесь появилось не сразу.'
  })
]);

function daysBetween(a, b) {
  const aa = new Date(a).getTime();
  const bb = new Date(b).getTime();
  if (!Number.isFinite(aa) || !Number.isFinite(bb)) return Infinity;
  return Math.abs(bb - aa) / 86_400_000;
}

function latestSessionStartAt(state = {}) {
  const moments = [...(state.moments || [])].reverse();
  const found = moments.find(item => item.kind === 'session-start');
  const time = found ? new Date(found.at).getTime() : NaN;
  return Number.isFinite(time) ? time : null;
}

function completedFocusCount(state = {}) {
  return (state.timers || []).filter(item => item.status === 'done' && item.meta?.focus === true).length;
}

function callCount(state = {}) {
  return (state.moments || []).filter(item => item.kind === 'called-to-cursor').length;
}

function trustedCount(state = {}) {
  return Number((state.files || []).length + (state.objects || []).length);
}

function episodeHasHistory(state = {}) {
  return (state.episodes || []).some(item => item.complete === true || Number(item.stageIndex || 0) >= 2);
}

function relationshipHasHistory(state = {}) {
  return ['shared-history', 'long-term'].includes(state.relationship?.stage?.id);
}

function alreadyEchoedThisSession(state = {}) {
  const session = Number(state.identity?.sessions || 0);
  return (state.moments || []).some(item => item.kind === 'memory-echo' && Number(item.data?.session || -1) === session);
}

function qualifies(echo, state = {}) {
  const sessions = Number(state.identity?.sessions || 0);
  if (sessions < echo.minSessions) return false;
  if (echo.kind === 'trusted') return trustedCount(state) > 0;
  if (echo.kind === 'focus') return completedFocusCount(state) >= 2;
  if (echo.kind === 'call-ritual') return callCount(state) >= 4;
  if (echo.kind === 'episode') return episodeHasHistory(state);
  if (echo.kind === 'history') return relationshipHasHistory(state);
  return false;
}

function eligibleEchoes(state = {}, now = Date.now()) {
  if (state.preferences?.onboardingCompleted !== true) return [];
  if (alreadyEchoedThisSession(state)) return [];

  const discoveries = state.discoveries || [];
  return ECHOES.filter(echo => {
    if (!qualifies(echo, state)) return false;
    const previous = discoveries.find(item => item.id === echo.id);
    if (!previous?.lastSeenAt) return true;
    return daysBetween(previous.lastSeenAt, now) >= echo.cooldownDays;
  });
}

function weightedPick(items, rng = Math.random) {
  const total = items.reduce((sum, item) => sum + Math.max(0, Number(item.weight || 0)), 0);
  if (total <= 0) return null;
  let cursor = rng() * total;
  for (const item of items) {
    cursor -= Math.max(0, Number(item.weight || 0));
    if (cursor <= 0) return item;
  }
  return items.at(-1) || null;
}

class MemoryEchoEngine {
  constructor(store, options = {}) {
    this.store = store;
    this.rng = options.rng || Math.random;
    this.baseChance = options.baseChance ?? 0.14;
    this.minSessionAgeMs = options.minSessionAgeMs ?? 180_000;
  }

  maybePick(context = {}, now = Date.now()) {
    if (context.quiet || context.focus || context.interactive || context.moving) return null;

    const state = this.store.snapshot();
    const startedAt = latestSessionStartAt(state);
    if (startedAt !== null && now - startedAt < this.minSessionAgeMs) return null;

    const eligible = eligibleEchoes(state, now);
    if (!eligible.length || this.rng() > this.baseChance) return null;

    const picked = weightedPick(eligible, this.rng);
    if (!picked) return null;

    const session = Number(state.identity?.sessions || 0);
    this.store.recordDiscovery(picked.id, { kind: picked.kind, action: picked.action, session });
    this.store.recordMoment('memory-echo', {
      salience: 0.56,
      data: { echoId: picked.id, kind: picked.kind, session }
    });

    return picked;
  }
}

module.exports = {
  ECHOES,
  daysBetween,
  latestSessionStartAt,
  completedFocusCount,
  callCount,
  trustedCount,
  episodeHasHistory,
  relationshipHasHistory,
  alreadyEchoedThisSession,
  qualifies,
  eligibleEchoes,
  weightedPick,
  MemoryEchoEngine
};
