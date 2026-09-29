'use strict';

const DIRECTIONS_8 = Object.freeze([
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right'
]);

const DIRECTIONS_16 = Object.freeze([
  'e', 'ese', 'se', 'sse', 's', 'ssw', 'sw', 'wsw',
  'w', 'wnw', 'nw', 'nnw', 'n', 'nne', 'ne', 'ene'
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngleDegrees(angle) {
  let value = angle % 360;
  if (value < 0) value += 360;
  return value;
}

function shortestAngleDelta(a, b) {
  const delta = normalizeAngleDegrees(a - b);
  return delta > 180 ? delta - 360 : delta;
}

function sector16FromAngle(angle) {
  return Math.round(normalizeAngleDegrees(angle) / 22.5) % 16;
}

function direction8FromSector16(sector) {
  return DIRECTIONS_8[Math.floor((sector + 1) / 2) % 8];
}

function classifyAttention(cursor, bounds, options = {}) {
  const deadZone = options.deadZone ?? 38;
  const fullIntensityDistance = options.fullIntensityDistance ?? 560;
  const focalY = options.focalY ?? 0.42;

  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height * focalY;
  const rawDx = cursor.x - centerX;
  const rawDy = cursor.y - centerY;
  const distance = Math.hypot(rawDx, rawDy);

  if (distance <= deadZone) {
    return {
      direction: 'center',
      direction8: 'center',
      direction16: 'center',
      sector16: null,
      dx: 0,
      dy: 0,
      rawDx,
      rawDy,
      angle: null,
      distance,
      intensity: 0
    };
  }

  const dx = clamp(rawDx / fullIntensityDistance, -1, 1);
  const dy = clamp(rawDy / fullIntensityDistance, -1, 1);
  const angle = normalizeAngleDegrees(Math.atan2(rawDy, rawDx) * 180 / Math.PI);
  const sector16 = sector16FromAngle(angle);
  const direction8 = direction8FromSector16(sector16);

  return {
    direction: direction8,
    direction8,
    direction16: DIRECTIONS_16[sector16],
    sector16,
    dx,
    dy,
    rawDx,
    rawDy,
    angle,
    distance,
    intensity: clamp((distance - deadZone) / Math.max(1, fullIntensityDistance - deadZone), 0, 1)
  };
}

function shouldEscalateAttention(attention, hoverDurationMs) {
  if (!attention || attention.direction8 === 'center' || attention.attending === false) return 'soft';
  if (attention.distance < 125 && hoverDurationMs > 1250) return 'engaged';
  if (attention.distance < 250 && hoverDurationMs > 560) return 'head';
  return 'eyes';
}

class AttentionController {
  constructor(options = {}) {
    this.options = {
      smoothingMs: options.smoothingMs ?? 115,
      hysteresisDegrees: options.hysteresisDegrees ?? 6,
      disengageAfterMs: options.disengageAfterMs ?? 6200,
      movementEpsilonPx: options.movementEpsilonPx ?? 2.5,
      startleSpeedPxPerSec: options.startleSpeedPxPerSec ?? 1500,
      startleDistancePx: options.startleDistancePx ?? 175,
      ...options
    };
    this.reset();
  }

  reset(now = Date.now()) {
    this.lastCursor = null;
    this.lastUpdateAt = now;
    this.lastMovementAt = now;
    this.dwellStartedAt = now;
    this.stableSector = null;
    this.smoothedDx = 0;
    this.smoothedDy = 0;
  }

  update(cursor, bounds, now = Date.now()) {
    const raw = classifyAttention(cursor, bounds, this.options);
    const dt = Math.max(1, now - this.lastUpdateAt);

    let cursorSpeed = 0;
    if (this.lastCursor) {
      const movement = Math.hypot(cursor.x - this.lastCursor.x, cursor.y - this.lastCursor.y);
      cursorSpeed = movement / dt * 1000;
      if (movement >= this.options.movementEpsilonPx) this.lastMovementAt = now;
    } else {
      this.lastMovementAt = now;
    }

    let sector = raw.sector16;
    if (sector !== null && this.stableSector !== null && sector !== this.stableSector && raw.angle !== null) {
      const previousCenter = this.stableSector * 22.5;
      const fromPrevious = Math.abs(shortestAngleDelta(raw.angle, previousCenter));
      const threshold = 11.25 + this.options.hysteresisDegrees;
      if (fromPrevious < threshold) sector = this.stableSector;
    }

    if (sector !== this.stableSector) {
      this.stableSector = sector;
      this.dwellStartedAt = now;
    }

    const stationaryForMs = now - this.lastMovementAt;
    const cursorIsClose = raw.distance < 190;
    const attending = raw.direction8 !== 'center' && (stationaryForMs < this.options.disengageAfterMs || cursorIsClose);

    const alpha = 1 - Math.exp(-dt / this.options.smoothingMs);
    const targetDx = attending ? raw.dx : 0;
    const targetDy = attending ? raw.dy : 0;
    this.smoothedDx += (targetDx - this.smoothedDx) * alpha;
    this.smoothedDy += (targetDy - this.smoothedDy) * alpha;

    const direction8 = attending && sector !== null ? direction8FromSector16(sector) : 'center';
    const direction16 = attending && sector !== null ? DIRECTIONS_16[sector] : 'center';
    const hoverDurationMs = attending ? now - this.dwellStartedAt : 0;
    const attention = {
      ...raw,
      direction: direction8,
      direction8,
      direction16,
      sector16: attending ? sector : null,
      dx: this.smoothedDx,
      dy: this.smoothedDy,
      attending,
      stationaryForMs,
      cursorSpeed,
      hoverDurationMs
    };
    attention.level = shouldEscalateAttention(attention, hoverDurationMs);
    attention.startled = attending && cursorSpeed >= this.options.startleSpeedPxPerSec && raw.distance <= this.options.startleDistancePx;

    this.lastCursor = { x: cursor.x, y: cursor.y };
    this.lastUpdateAt = now;
    return attention;
  }
}

module.exports = {
  DIRECTIONS_8,
  DIRECTIONS_16,
  clamp,
  normalizeAngleDegrees,
  shortestAngleDelta,
  sector16FromAngle,
  direction8FromSector16,
  classifyAttention,
  shouldEscalateAttention,
  AttentionController
};
