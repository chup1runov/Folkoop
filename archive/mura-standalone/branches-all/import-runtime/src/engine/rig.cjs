'use strict';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(current, target, alpha) {
  return current + (target - current) * alpha;
}

function attentionGain(level) {
  if (level === 'engaged') return 1;
  if (level === 'head') return 0.62;
  if (level === 'eyes') return 0.26;
  return 0;
}

function rigTargets(attention = {}, options = {}) {
  const reducedMotion = options.reducedMotion === true;
  const attending = attention.attending === true;
  const gain = attending ? attentionGain(attention.level) : 0;
  const dx = clamp(Number(attention.dx || 0), -1, 1);
  const dy = clamp(Number(attention.dy || 0), -1, 1);

  if (reducedMotion) {
    return {
      eyeX: 0,
      eyeY: 0,
      headX: 0,
      headY: 0,
      headRotate: 0,
      bodyX: 0,
      bodyY: 0,
      bodyRotate: 0
    };
  }

  return {
    eyeX: dx * (2.2 + gain * 2.4),
    eyeY: dy * (1.25 + gain * 1.35),
    headX: dx * (0.55 + gain * 3.15),
    headY: dy * (0.25 + gain * 1.45),
    headRotate: dx * (0.2 + gain * 1.75),
    bodyX: dx * Math.max(0, gain - 0.54) * 1.7,
    bodyY: Math.max(0, dy) * Math.max(0, gain - 0.58) * 0.55,
    bodyRotate: dx * Math.max(0, gain - 0.58) * 0.72
  };
}

class RigController {
  constructor(options = {}) {
    this.smoothingMs = options.smoothingMs ?? 95;
    this.minBlinkMs = options.minBlinkMs ?? 2600;
    this.maxBlinkMs = options.maxBlinkMs ?? 6200;
    this.blinkDurationMs = options.blinkDurationMs ?? 118;
    this.doubleBlinkChance = options.doubleBlinkChance ?? 0.14;
    this.rng = options.rng ?? Math.random;
    this.values = {
      eyeX: 0, eyeY: 0,
      headX: 0, headY: 0, headRotate: 0,
      bodyX: 0, bodyY: 0, bodyRotate: 0
    };
    this.lastUpdateAt = Date.now();
    this.nextBlinkAt = this.#nextBlink(this.lastUpdateAt);
    this.blinkUntil = 0;
    this.pendingSecondBlinkAt = 0;
  }

  #nextBlink(now) {
    return now + this.minBlinkMs + this.rng() * Math.max(1, this.maxBlinkMs - this.minBlinkMs);
  }

  reset(now = Date.now()) {
    for (const key of Object.keys(this.values)) this.values[key] = 0;
    this.lastUpdateAt = now;
    this.blinkUntil = 0;
    this.pendingSecondBlinkAt = 0;
    this.nextBlinkAt = this.#nextBlink(now);
  }

  update(attention = {}, now = Date.now(), options = {}) {
    const dt = Math.max(1, now - this.lastUpdateAt);
    const targets = rigTargets(attention, options);
    const alpha = options.reducedMotion === true ? 1 : 1 - Math.exp(-dt / this.smoothingMs);

    for (const [key, target] of Object.entries(targets)) {
      this.values[key] = lerp(this.values[key], target, alpha);
    }

    if (this.pendingSecondBlinkAt && now >= this.pendingSecondBlinkAt) {
      this.blinkUntil = now + this.blinkDurationMs;
      this.pendingSecondBlinkAt = 0;
    } else if (now >= this.nextBlinkAt) {
      this.blinkUntil = now + this.blinkDurationMs;
      if (this.rng() < this.doubleBlinkChance) this.pendingSecondBlinkAt = this.blinkUntil + 105;
      this.nextBlinkAt = this.#nextBlink(now);
    }

    const blink = now < this.blinkUntil;
    this.lastUpdateAt = now;

    return {
      ...this.values,
      blink,
      direction8: attention.direction8 || 'center',
      direction16: attention.direction16 || 'center',
      attentionLevel: attention.level || 'soft',
      attending: attention.attending === true
    };
  }
}

module.exports = { clamp, lerp, attentionGain, rigTargets, RigController };
