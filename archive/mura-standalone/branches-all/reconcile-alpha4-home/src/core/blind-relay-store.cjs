'use strict';

const crypto = require('node:crypto');

class BlindRelayStore {
  constructor(options = {}) {
    this.maxBytes = Number(options.maxBytes || 512 * 1024);
    this.maxPerRoute = Number(options.maxPerRoute || 64);
    this.now = options.now || (() => Date.now());
    this.routes = new Map();
  }

  put({ routeToken, messageId, ciphertext, expiresAt }) {
    const route = String(routeToken || '');
    const id = String(messageId || crypto.randomUUID());
    if (route.length < 16 || route.length > 256) throw new Error('Invalid route token.');
    const body = Buffer.isBuffer(ciphertext) ? ciphertext : Buffer.from(String(ciphertext || ''), 'base64');
    if (!body.length || body.length > this.maxBytes) throw new Error('Invalid capsule size.');
    const expiry = Number(new Date(expiresAt).getTime());
    if (!Number.isFinite(expiry) || expiry <= this.now()) throw new Error('Invalid expiry.');

    const queue = this.routes.get(route) || [];
    if (queue.some(item => item.messageId === id)) return { accepted: false, duplicate: true };
    queue.push({ messageId: id, ciphertext: body.toString('base64'), expiresAt: new Date(expiry).toISOString() });
    queue.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt) || a.messageId.localeCompare(b.messageId));
    while (queue.length > this.maxPerRoute) queue.shift();
    this.routes.set(route, queue);
    return { accepted: true, messageId: id };
  }

  pull(routeToken, limit = 20) {
    const route = String(routeToken || '');
    const now = this.now();
    const queue = (this.routes.get(route) || []).filter(item => new Date(item.expiresAt).getTime() > now);
    const count = Math.max(1, Math.min(Number(limit || 20), 100));
    const taken = queue.slice(0, count);
    const takenIds = new Set(taken.map(item => item.messageId));
    const remaining = queue.filter(item => !takenIds.has(item.messageId));
    if (remaining.length) this.routes.set(route, remaining); else this.routes.delete(route);
    return taken.map(item => ({ ...item }));
  }

  purgeExpired() {
    const now = this.now();
    let purged = 0;
    for (const [route, queue] of this.routes) {
      const kept = queue.filter(item => {
        const live = new Date(item.expiresAt).getTime() > now;
        if (!live) purged += 1;
        return live;
      });
      if (kept.length) this.routes.set(route, kept); else this.routes.delete(route);
    }
    return purged;
  }
}

module.exports = { BlindRelayStore };
