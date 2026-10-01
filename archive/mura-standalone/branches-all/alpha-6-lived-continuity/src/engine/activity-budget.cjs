'use strict';

const QUIET_PRESETS = Object.freeze({
  '30m': 30 * 60_000,
  '1h': 60 * 60_000,
  '2h': 2 * 60 * 60_000
});

function isQuietUntil(value, now = Date.now()) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time > now;
}

function activeFocusTimer(state, now = Date.now()) {
  return (state.timers || []).find(item => item.status === 'active' && item.meta?.focus === true && new Date(item.dueAt).getTime() > now) || null;
}

function presenceBudget(state, context = {}, now = Date.now()) {
  const quiet = isQuietUntil(state.preferences?.quietUntil, now);
  const focusTimer = activeFocusTimer(state, now);
  const visible = context.visible !== false;
  const interactive = context.interactive === true;

  return {
    quiet,
    focus: Boolean(focusTimer),
    focusTimer,
    allowAutonomous: visible && !quiet && !focusTimer && !interactive,
    attentionScale: quiet || focusTimer ? 0.45 : 1,
    pollMs: context.cursorSpeed > 700 ? 33 : context.cursorSpeed > 40 ? 50 : context.userActive ? 80 : 140
  };
}

module.exports = { QUIET_PRESETS, isQuietUntil, activeFocusTimer, presenceBudget };
