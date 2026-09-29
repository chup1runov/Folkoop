'use strict';

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function uniqueCalendarDays(values = []) {
  return [...new Set(values
    .map(value => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
    })
    .filter(Boolean))];
}

function completedTimerCount(state) {
  return (state.timers || []).filter(item => item.status === 'done').length;
}

function meaningfulMomentCount(state) {
  return (state.moments || []).filter(item => Number(item.salience || 0) >= 0.45).length;
}

const STAGES = Object.freeze([
  { id: 'meeting', min: 0, label: 'Знакомство', description: 'Mura ещё привыкает к твоему ритму.' },
  { id: 'familiar', min: 0.18, label: 'Освоились', description: 'Уже появились повторяющиеся совместные действия.' },
  { id: 'presence', min: 0.4, label: 'Привычное присутствие', description: 'Mura становится частью повседневной цифровой среды.' },
  { id: 'shared-history', min: 0.66, label: 'Своя история', description: 'У вас накопились вещи, события и маленькие ритуалы.' },
  { id: 'long-term', min: 0.86, label: 'Долгое знакомство', description: 'История уже заметно отражается в поведении и доме.' }
]);

function deriveRelationship(state, now = Date.now()) {
  const metAt = new Date(state?.identity?.metAt || now).getTime();
  const elapsedDays = Math.max(1, Math.ceil((now - metAt) / 86_400_000));
  const activeDays = uniqueCalendarDays(state?.identity?.activeDays || [state?.identity?.metAt]).length;
  const sessions = Number(state?.identity?.sessions || 0);
  const interactions = Number(state?.stats?.interactionCount || 0);
  const trustedItems = Number((state?.files || []).length + (state?.objects || []).length);
  const timersDone = completedTimerCount(state || {});
  const meaningful = meaningfulMomentCount(state || {});

  const score = clamp01(
    0.24 * (1 - Math.exp(-activeDays / 9)) +
    0.18 * (1 - Math.exp(-sessions / 16)) +
    0.18 * (1 - Math.exp(-interactions / 34)) +
    0.15 * (1 - Math.exp(-trustedItems / 7)) +
    0.12 * (1 - Math.exp(-timersDone / 8)) +
    0.13 * (1 - Math.exp(-meaningful / 12))
  );

  let stage = STAGES[0];
  for (const candidate of STAGES) if (score >= candidate.min) stage = candidate;
  const next = STAGES[STAGES.indexOf(stage) + 1] || null;

  return { score, stage, next, elapsedDays, activeDays, sessions, interactions, trustedItems, timersDone, meaningfulMoments: meaningful };
}

module.exports = { STAGES, clamp01, uniqueCalendarDays, completedTimerCount, meaningfulMomentCount, deriveRelationship };
