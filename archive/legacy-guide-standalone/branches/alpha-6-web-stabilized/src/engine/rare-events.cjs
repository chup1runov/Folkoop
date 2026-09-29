'use strict';

const RARE_EVENTS = Object.freeze([
  Object.freeze({ id: 'tiny-thought', minSessions: 2, cooldownDays: 4, weight: 1.2, action: 'puzzled', message: 'Я, кажется, только что придумала что-то… и потеряла мысль.' }),
  Object.freeze({ id: 'quiet-wink', minSessions: 3, cooldownDays: 7, weight: 0.9, action: 'wink', message: null }),
  Object.freeze({ id: 'small-victory', minSessions: 4, cooldownDays: 6, weight: 0.75, action: 'jump', message: 'Иногда можно просто порадоваться без причины.' }),
  Object.freeze({ id: 'curious-inspection', minSessions: 3, cooldownDays: 5, weight: 1.0, action: 'inspect', message: 'Что тут у нас…' }),
  Object.freeze({ id: 'daydream', minSessions: 5, cooldownDays: 8, weight: 0.7, action: 'thinking', message: 'Задумалась.' })
]);

function daysBetween(a, b) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;
}

function weightedPick(items, rng = Math.random) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.weight || 0), 0);
  if (total <= 0) return null;
  let cursor = rng() * total;
  for (const item of items) {
    cursor -= Math.max(0, item.weight || 0);
    if (cursor <= 0) return item;
  }
  return items.at(-1) || null;
}

class RareEventEngine {
  constructor(store, options = {}) {
    this.store = store;
    this.rng = options.rng || Math.random;
    this.baseChance = options.baseChance ?? 0.08;
  }

  eligible(state, now = Date.now()) {
    const discoveries = state.discoveries || [];
    const sessions = Number(state.identity?.sessions || 0);
    return RARE_EVENTS.filter(event => {
      if (sessions < event.minSessions) return false;
      const previous = discoveries.find(item => item.id === event.id);
      if (!previous?.lastSeenAt) return true;
      return daysBetween(previous.lastSeenAt, now) >= event.cooldownDays;
    });
  }

  maybePick(context = {}, now = Date.now()) {
    if (context.quiet || context.interactive || context.moving || context.focus) return null;
    const state = this.store.snapshot();
    const eligible = this.eligible(state, now);
    if (!eligible.length || this.rng() > this.baseChance) return null;
    const picked = weightedPick(eligible, this.rng);
    if (!picked) return null;
    this.store.recordDiscovery(picked.id, { action: picked.action });
    this.store.recordMoment('rare-event', {
      salience: 0.58,
      data: { eventId: picked.id, action: picked.action }
    });
    return picked;
  }
}

module.exports = { RARE_EVENTS, daysBetween, weightedPick, RareEventEngine };
