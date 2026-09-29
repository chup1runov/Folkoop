'use strict';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRect(surface) {
  if (!surface || typeof surface !== 'object') return null;
  const x = Number(surface.x);
  const y = Number(surface.y);
  const width = Number(surface.width);
  const height = Number(surface.height);
  if (![x, y, width, height].every(Number.isFinite) || width < 80 || height < 45) return null;
  return {
    id: String(surface.id || `${surface.owner || 'window'}:${x}:${y}:${width}:${height}`),
    owner: String(surface.owner || ''),
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height)
  };
}

function topEdge(surface, padding = 18) {
  const inset = Math.min(Math.max(0, padding), Math.max(0, surface.width / 3));
  return {
    id: `${surface.id}:top`,
    surfaceId: surface.id,
    kind: 'top',
    x1: surface.x + inset,
    x2: surface.x + surface.width - inset,
    y: surface.y
  };
}

function sideEdges(surface, padding = 22) {
  const y1 = surface.y + Math.min(padding, surface.height / 3);
  const y2 = surface.y + surface.height - Math.min(padding, surface.height / 3);
  return [
    { id: `${surface.id}:left`, surfaceId: surface.id, kind: 'left', x: surface.x, y1, y2 },
    { id: `${surface.id}:right`, surfaceId: surface.id, kind: 'right', x: surface.x + surface.width, y1, y2 }
  ];
}

function landingPosition(surface, windowSize, preferredCenterX, options = {}) {
  const edgeMargin = options.edgeMargin ?? 24;
  const footInset = options.footInset ?? 7;
  const minX = surface.x - windowSize.width / 2 + edgeMargin;
  const maxX = surface.x + surface.width - windowSize.width / 2 - edgeMargin;
  const centerX = clamp(preferredCenterX, minX + windowSize.width / 2, maxX + windowSize.width / 2);
  return {
    x: Math.round(centerX - windowSize.width / 2),
    y: Math.round(surface.y - windowSize.height + footInset)
  };
}

function canLandOn(surface, windowSize, workArea, options = {}) {
  const footInset = options.footInset ?? 7;
  const y = surface.y - windowSize.height + footInset;
  const minimumWidth = options.minimumWidth ?? Math.max(120, windowSize.width * 0.55);
  return surface.width >= minimumWidth &&
    y >= workArea.y - 2 &&
    y + windowSize.height <= workArea.y + workArea.height + 12 &&
    surface.y >= workArea.y &&
    surface.y <= workArea.y + workArea.height;
}

function distanceToTopSurface(surface, point) {
  const nearestX = clamp(point.x, surface.x, surface.x + surface.width);
  return Math.hypot(point.x - nearestX, point.y - surface.y);
}

class SurfaceGraph {
  constructor(surfaces = []) {
    this.update(surfaces);
  }

  update(surfaces = []) {
    this.surfaces = surfaces.map(normalizeRect).filter(Boolean);
    this.byId = new Map(this.surfaces.map(surface => [surface.id, surface]));
    this.edges = this.surfaces.flatMap(surface => [topEdge(surface), ...sideEdges(surface)]);
    return this;
  }

  get(id) {
    return this.byId.get(String(id)) || null;
  }

  nearestTop(point, windowSize, workArea, options = {}) {
    const candidates = this.surfaces
      .filter(surface => canLandOn(surface, windowSize, workArea, options))
      .map(surface => ({ surface, distance: distanceToTopSurface(surface, point) }))
      .sort((a, b) => a.distance - b.distance);
    return candidates[0]?.surface || null;
  }

  landing(surfaceId, windowSize, preferredCenterX, options = {}) {
    const surface = this.get(surfaceId);
    return surface ? landingPosition(surface, windowSize, preferredCenterX, options) : null;
  }

  publicSummary() {
    return { surfaceCount: this.surfaces.length, edgeCount: this.edges.length };
  }
}

module.exports = {
  clamp,
  normalizeRect,
  topEdge,
  sideEdges,
  landingPosition,
  canLandOn,
  distanceToTopSurface,
  SurfaceGraph
};
