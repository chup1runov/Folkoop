'use strict';

function overlapLength(a1, a2, b1, b2) {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

function visibleOnWorkArea(bounds, workArea, minVisible = 48) {
  if (!bounds || !workArea) return false;
  const width = overlapLength(bounds.x, bounds.x + bounds.width, workArea.x, workArea.x + workArea.width);
  const height = overlapLength(bounds.y, bounds.y + bounds.height, workArea.y, workArea.y + workArea.height);
  return width >= Math.min(minVisible, bounds.width) && height >= Math.min(minVisible, bounds.height);
}

function recoveryPosition(bounds, displays = [], windowSize, margin = 14) {
  const valid = (displays || []).filter(display => display?.workArea);
  if (!valid.length) return null;
  if (valid.some(display => visibleOnWorkArea(bounds, display.workArea))) return null;

  const targetDisplay = valid.find(display => display.primary === true) || valid[0];
  const area = targetDisplay.workArea;
  const width = Number(windowSize?.width || bounds?.width || 0);
  const height = Number(windowSize?.height || bounds?.height || 0);
  const maxX = area.x + Math.max(0, area.width - width);
  const x = Math.round(Math.max(area.x, Math.min(maxX, Number(bounds?.x ?? area.x))));
  const y = Math.round(area.y + Math.max(0, area.height - height - margin));
  return { x, y };
}

module.exports = { overlapLength, visibleOnWorkArea, recoveryPosition };
