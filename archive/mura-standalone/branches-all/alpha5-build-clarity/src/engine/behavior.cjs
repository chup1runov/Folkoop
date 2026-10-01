'use strict';

const MODES = Object.freeze({
  ambient: Object.freeze({ minDelayMs: 42_000, maxDelayMs: 92_000, initiative: 0.45 }),
  companion: Object.freeze({ minDelayMs: 24_000, maxDelayMs: 58_000, initiative: 1 }),
  active: Object.freeze({ minDelayMs: 18_000, maxDelayMs: 44_000, initiative: 1.25 })
});

const BASE_WEIGHTS = Object.freeze({
  rest: 1.2,
  thinking: 1.35,
  phone: 0.65,
  inspect: 0.55,
  confident: 0.55,
  shy: 0.4,
  idea: 0.45,
  wave: 0.5,
  jump: 0.24,
  wander: 0.9,
  peek: 0.34,
  perch: 0.3
});

const COOLDOWNS = Object.freeze({
  rest: 45_000,
  thinking: 35_000,
  phone: 75_000,
  inspect: 80_000,
  confident: 90_000,
  shy: 90_000,
  idea: 120_000,
  wave: 70_000,
  jump: 100_000,
  wander: 35_000,
  peek: 110_000,
  perch: 95_000
});

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function weightedPick(items, rng = Math.random) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  if (total <= 0) return null;
  let cursor = rng() * total;
  for (const item of items) {
    const weight = Math.max(0, item.weight);
    if (weight <= 0) continue;
    cursor -= weight;
    if (cursor <= 0) return item.value;
  }
  return items.at(-1)?.value ?? null;
}

class BehaviorEngine {
  constructor(options = {}) {
    this.rng = options.rng ?? Math.random;
    this.mode = MODES[options.mode] ? options.mode : 'companion';
    this.drives = {
      energy: clamp01(options.drives?.energy ?? 0.72),
      curiosity: clamp01(options.drives?.curiosity ?? 0.68),
      sociability: clamp01(options.drives?.sociability ?? 0.58),
      playfulness: clamp01(options.drives?.playfulness ?? 0.56),
      focus: clamp01(options.drives?.focus ?? 0.62)
    };
    this.lastActionAt = new Map();
    this.recentActions = [];
  }

  setMode(mode) {
    if (!MODES[mode]) throw new Error(`Unknown behavior mode: ${mode}`);
    this.mode = mode;
  }

  nextDelayMs() {
    const config = MODES[this.mode];
    return Math.round(config.minDelayMs + this.rng() * (config.maxDelayMs - config.minDelayMs));
  }

  updateDrives(elapsedMs, context = {}) {
    const minutes = Math.max(0, elapsedMs) / 60_000;
    const userActive = context.userActive === true;
    this.drives.energy = clamp01(this.drives.energy + minutes * (userActive ? -0.002 : 0.0015));
    this.drives.curiosity = clamp01(this.drives.curiosity + minutes * 0.004);
    this.drives.sociability = clamp01(this.drives.sociability + minutes * (userActive ? 0.003 : 0.001));
    this.drives.playfulness = clamp01(this.drives.playfulness + minutes * 0.0015);
    this.drives.focus = clamp01(this.drives.focus + minutes * (userActive ? 0.001 : -0.001));
  }

  recordAction(action, now = Date.now()) {
    this.lastActionAt.set(action, now);
    this.recentActions.push(action);
    this.recentActions = this.recentActions.slice(-4);

    if (action === 'jump') this.drives.energy = clamp01(this.drives.energy - 0.06);
    if (['wander', 'peek', 'perch'].includes(action)) this.drives.energy = clamp01(this.drives.energy - 0.025);
    if (action === 'rest') this.drives.energy = clamp01(this.drives.energy + 0.08);
    if (['thinking', 'inspect', 'idea'].includes(action)) this.drives.curiosity = clamp01(this.drives.curiosity - 0.08);
    if (['wave', 'shy'].includes(action)) this.drives.sociability = clamp01(this.drives.sociability - 0.06);
  }

  chooseAction(context = {}, now = Date.now()) {
    const modeConfig = MODES[this.mode];
    const entries = Object.entries(BASE_WEIGHTS).map(([action, base]) => {
      const last = this.lastActionAt.get(action) ?? -Infinity;
      const onCooldown = now - last < (COOLDOWNS[action] ?? 30_000);
      let weight = onCooldown ? 0 : base * modeConfig.initiative;

      if (action === 'rest') weight *= 0.4 + (1 - this.drives.energy) * 2.2;
      if (['thinking', 'inspect', 'idea'].includes(action)) weight *= 0.45 + this.drives.curiosity * 1.8;
      if (['wave', 'shy'].includes(action)) weight *= 0.35 + this.drives.sociability * 1.5;
      if (['jump', 'wander', 'peek', 'perch'].includes(action)) weight *= 0.35 + this.drives.playfulness * 1.5;
      if (action === 'phone') weight *= 0.5 + this.drives.focus;

      if (context.userActive === false && action === 'wave') weight *= 0.25;
      if (context.interactive === true && ['wander', 'peek', 'perch'].includes(action)) weight = 0;
      if (context.moving === true && ['wander', 'peek', 'perch'].includes(action)) weight = 0;
      if (action === 'perch' && context.surfaceAvailable !== true) weight = 0;

      const repeats = this.recentActions.filter(item => item === action).length;
      weight *= Math.pow(0.24, repeats);
      return { value: action, weight };
    });

    const picked = weightedPick(entries, this.rng) || 'thinking';
    this.recordAction(picked, now);
    return picked;
  }

  snapshot() {
    return { mode: this.mode, drives: { ...this.drives } };
  }
}

module.exports = { MODES, BASE_WEIGHTS, COOLDOWNS, clamp01, weightedPick, BehaviorEngine };
