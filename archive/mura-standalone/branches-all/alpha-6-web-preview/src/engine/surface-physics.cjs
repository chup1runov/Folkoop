'use strict';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function floorPosition(workArea, windowSize, x, margin = 18) {
  return {
    x: Math.round(clamp(x, workArea.x, workArea.x + workArea.width - windowSize.width)),
    y: Math.round(workArea.y + workArea.height - windowSize.height - margin)
  };
}

function edgePeekPosition(workArea, windowSize, side = 'right', reveal = 0.38, margin = 8) {
  const visibleWidth = Math.round(windowSize.width * Math.max(0.2, Math.min(0.8, reveal)));
  const y = Math.round(workArea.y + workArea.height - windowSize.height - margin);
  if (side === 'left') {
    return { x: Math.round(workArea.x - windowSize.width + visibleWidth), y, side };
  }
  return {
    x: Math.round(workArea.x + workArea.width - visibleWidth),
    y,
    side: 'right'
  };
}

/**
 * Pick a nearby horizontal floor target.
 *
 * Preferred signature:
 *   wanderTarget(currentBounds, workArea, windowSize, rng?, margin?)
 *
 * Alpha.4 also accepts the short runtime form used by the Presence controller:
 *   wanderTarget(workArea, windowSize, currentX, margin?)
 *
 * Keeping both forms here makes the movement primitive reusable while the
 * runtime is consolidated, without duplicating geometry policy in main.cjs.
 */
function wanderTarget(a, b, c, d = Math.random, e = 18) {
  let currentBounds;
  let workArea;
  let windowSize;
  let rng;
  let margin;

  if (typeof c === 'number') {
    workArea = a;
    windowSize = b;
    currentBounds = { x: c };
    rng = Math.random;
    margin = Number.isFinite(Number(d)) ? Number(d) : 18;
  } else {
    currentBounds = a;
    workArea = b;
    windowSize = c;
    rng = typeof d === 'function' ? d : Math.random;
    margin = Number.isFinite(Number(e)) ? Number(e) : 18;
  }

  const sign = rng() < 0.5 ? -1 : 1;
  const distance = 90 + rng() * 190;
  return floorPosition(workArea, windowSize, currentBounds.x + sign * distance, margin);
}

module.exports = { clamp, floorPosition, edgePeekPosition, wanderTarget };
