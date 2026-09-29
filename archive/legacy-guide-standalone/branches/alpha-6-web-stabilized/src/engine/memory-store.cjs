'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function nowIso() {
  return new Date().toISOString();
}

function dayKey(value = Date.now()) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function describeFile(filePath) {
  const exists = fs.existsSync(filePath);
  const stat = exists ? fs.statSync(filePath) : null;
  return {
    name: path.basename(filePath),
    path: filePath,
    extension: path.extname(filePath).toLowerCase(),
    size: stat?.isFile() ? stat.size : null,
    kind: stat?.isDirectory() ? 'folder' : 'file',
    exists
  };
}

class MemoryStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.recoveryWriteBlocked = false;
    this.recoveryBackupPath = null;
    this.state = this.#read();
  }

  #defaultState() {
    const now = nowIso();
    return {
      schemaVersion: 3,
      identity: {
        metAt: now,
        lastSeenAt: now,
        sessions: 0,
        activeDays: [dayKey(now)]
      },
      stats: {
        interactionCount: 0
      },
      preferences: {
        autonomousIdle: true,
        interactionMode: false,
        behaviorMode: 'companion',
        privacyTier: 0,
        quietUntil: null,
        reducedMotion: false,
        surfaceGeometryEnabled: false,
        onboardingCompleted: false,
        onboardingVersion: 0,
        lastWindowPosition: null
      },
      files: [],
      objects: [],
      moments: [],
      keepsakes: [],
      timers: [],
      episodes: [],
      discoveries: [],
      permissions: {}
    };
  }

  #migrate(parsed) {
    const base = this.#defaultState();
    if (!parsed || typeof parsed !== 'object') return base;

    if (parsed.schemaVersion === 1 || !parsed.identity) {
      base.identity.metAt = parsed.metAt || base.identity.metAt;
      base.identity.lastSeenAt = parsed.lastSeenAt || base.identity.lastSeenAt;
      base.identity.sessions = Number(parsed.sessions || 0);
      base.identity.activeDays = [dayKey(base.identity.metAt), dayKey(base.identity.lastSeenAt)].filter(Boolean);
      base.stats.interactionCount = Number(parsed.interactionCount || 0);
      base.preferences = { ...base.preferences, ...(parsed.preferences || {}) };
      base.files = Array.isArray(parsed.files) ? parsed.files.map(item => ({ id: item.id || crypto.randomUUID(), ...item })) : [];
      base.objects = Array.isArray(parsed.objects) ? parsed.objects : [];
      base.moments = Array.isArray(parsed.moments) ? parsed.moments.map(item => ({ id: item.id || crypto.randomUUID(), salience: item.salience ?? 0.2, ...item })) : [];
      return base;
    }

    const identity = { ...base.identity, ...(parsed.identity || {}) };
    identity.activeDays = Array.isArray(identity.activeDays) && identity.activeDays.length
      ? [...new Set(identity.activeDays.map(dayKey).filter(Boolean))]
      : [dayKey(identity.metAt), dayKey(identity.lastSeenAt)].filter(Boolean);

    return {
      ...base,
      ...parsed,
      schemaVersion: 3,
      identity,
      stats: { ...base.stats, ...(parsed.stats || {}) },
      preferences: { ...base.preferences, ...(parsed.preferences || {}) },
      files: Array.isArray(parsed.files) ? parsed.files : [],
      objects: Array.isArray(parsed.objects) ? parsed.objects : [],
      moments: Array.isArray(parsed.moments) ? parsed.moments : [],
      keepsakes: Array.isArray(parsed.keepsakes) ? parsed.keepsakes : [],
      timers: Array.isArray(parsed.timers) ? parsed.timers : [],
      episodes: Array.isArray(parsed.episodes) ? parsed.episodes : [],
      discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries : [],
      permissions: parsed.permissions && typeof parsed.permissions === 'object' ? parsed.permissions : {}
    };
  }

  #preserveCorruptState(rawBytes) {
    try {
      const backup = `${this.filePath}.corrupt-${Date.now()}-${crypto.randomUUID()}.bak`;
      fs.writeFileSync(backup, rawBytes, { flag: 'wx' });
      this.recoveryBackupPath = backup;
      return true;
    } catch {
      this.recoveryWriteBlocked = true;
      return false;
    }
  }

  #read() {
    if (!fs.existsSync(this.filePath)) return this.#defaultState();

    let rawBytes;
    try {
      rawBytes = fs.readFileSync(this.filePath);
    } catch {
      this.recoveryWriteBlocked = true;
      return this.#defaultState();
    }

    try {
      const parsed = JSON.parse(rawBytes.toString('utf8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid state root.');
      return this.#migrate(parsed);
    } catch {
      this.#preserveCorruptState(rawBytes);
      return this.#defaultState();
    }
  }

  save() {
    if (this.recoveryWriteBlocked) throw new Error('State recovery backup failed; refusing to overwrite existing state.');
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temp = `${this.filePath}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(this.state, null, 2), 'utf8');
    fs.renameSync(temp, this.filePath);
  }

  beginSession(now = Date.now()) {
    this.state.identity.sessions += 1;
    this.markActiveDay(now, false);
    this.touch(false);
    this.recordMoment('session-start', { salience: 0.05, save: false });
    this.save();
  }

  markActiveDay(value = Date.now(), save = true) {
    const key = dayKey(value);
    if (key && !this.state.identity.activeDays.includes(key)) {
      this.state.identity.activeDays.push(key);
      this.state.identity.activeDays = this.state.identity.activeDays.slice(-3650);
      if (save) this.save();
      return true;
    }
    return false;
  }

  touch(save = true) {
    this.state.identity.lastSeenAt = nowIso();
    this.markActiveDay(Date.now(), false);
    if (save) this.save();
  }

  recordMoment(kind, options = {}) {
    const moment = {
      id: crypto.randomUUID(),
      kind,
      at: nowIso(),
      salience: Math.max(0, Math.min(1, Number(options.salience ?? 0.2))),
      data: options.data || {}
    };
    this.state.moments.push(moment);
    this.state.moments = this.state.moments.slice(-400);
    if (options.save !== false) this.save();
    return moment;
  }

  incrementInteraction(kind = 'generic', data = {}) {
    this.state.stats.interactionCount += 1;
    this.touch(false);
    this.recordMoment(kind, { salience: 0.25, data, save: false });
    this.save();
    return this.state.stats.interactionCount;
  }

  meaningfulMoments(limit = 12) {
    return [...this.state.moments]
      .filter(item => Number(item.salience || 0) >= 0.45)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, limit);
  }

  inspectFile(filePath) {
    return describeFile(filePath);
  }

  #purgeReferences(id) {
    if (this.state.permissions) delete this.state.permissions[id];
    this.state.moments = this.state.moments.filter(moment => {
      const data = moment.data || {};
      return data.fileId !== id && data.objectId !== id && data.sourceId !== id;
    });
    this.state.keepsakes = this.state.keepsakes.filter(item => item.sourceId !== id);
    this.state.discoveries = this.state.discoveries.filter(item => {
      const metadata = item.metadata || {};
      return metadata.fileId !== id && metadata.objectId !== id && metadata.sourceId !== id;
    });
  }

  rememberFile(filePath) {
    const descriptor = describeFile(filePath);
    if (!descriptor.exists) throw new Error('File no longer exists.');
    const previous = this.state.files.find(item => item.path === filePath);
    const item = {
      id: previous?.id || crypto.randomUUID(),
      ...descriptor,
      rememberedAt: previous?.rememberedAt || nowIso(),
      lastGivenAt: nowIso()
    };

    this.state.files = [item, ...this.state.files.filter(existing => existing.path !== filePath)].slice(0, 80);
    this.incrementInteraction('file-given', { fileId: item.id, name: item.name });

    if (!this.state.keepsakes.some(k => k.kind === 'first-gift')) {
      this.addKeepsake({
        kind: 'first-gift',
        title: 'Первая вещь, которую ты доверил Ксюше',
        emoji: '📎',
        sourceId: item.id,
        save: false
      });
      this.save();
    }
    return item;
  }

  forgetFile(idOrPath) {
    const existing = this.state.files.find(item => item.id === idOrPath || item.path === idOrPath);
    if (!existing) return false;
    this.state.files = this.state.files.filter(item => item.id !== existing.id);
    this.#purgeReferences(existing.id);
    this.save();
    return true;
  }

  rememberObject(kind, value, title = null) {
    if (!['link', 'text'].includes(kind)) throw new Error(`Unsupported object kind: ${kind}`);
    const safeValue = String(value ?? '').slice(0, 20_000);
    if (!safeValue.trim()) throw new Error('Empty object.');
    const previous = this.state.objects.find(item => item.kind === kind && item.value === safeValue);
    const item = {
      id: previous?.id || crypto.randomUUID(),
      kind,
      title: title || (kind === 'link' ? safeValue : safeValue.slice(0, 80)),
      value: safeValue,
      rememberedAt: previous?.rememberedAt || nowIso(),
      lastGivenAt: nowIso()
    };
    this.state.objects = [item, ...this.state.objects.filter(existing => existing.id !== item.id)].slice(0, 80);
    this.incrementInteraction('object-given', { objectId: item.id, kind: item.kind, title: item.title });
    if (!this.state.keepsakes.some(k => k.kind === 'first-gift')) {
      this.addKeepsake({
        kind: 'first-gift',
        title: 'Первая вещь, которую ты доверил Ксюше',
        emoji: kind === 'link' ? '🔗' : '📝',
        sourceId: item.id,
        save: false
      });
      this.save();
    }
    return item;
  }

  forgetObject(id) {
    const existing = this.state.objects.find(item => item.id === id);
    if (!existing) return false;
    this.state.objects = this.state.objects.filter(item => item.id !== id);
    this.#purgeReferences(id);
    this.save();
    return true;
  }

  annotateObject(id, note) {
    const item = this.state.files.find(entry => entry.id === id) || this.state.objects.find(entry => entry.id === id);
    if (!item) return null;
    item.note = String(note || '').trim().slice(0, 4000);
    item.noteUpdatedAt = nowIso();
    this.recordMoment('object-note', { salience: 0.35, data: { objectId: id }, save: false });
    this.save();
    return item;
  }

  setObjectContentIndex(id, payload = {}) {
    const item = this.state.files.find(entry => entry.id === id) || this.state.objects.find(entry => entry.id === id);
    if (!item) return null;
    item.contentExcerpt = String(payload.text || '').slice(0, 12000);
    item.contentDigest = payload.digest || null;
    item.contentIndexedAt = nowIso();
    item.contentTruncated = Boolean(payload.truncated);
    this.recordMoment('object-read', { salience: 0.45, data: { objectId: id }, save: false });
    this.save();
    return item;
  }

  allTrustedObjects() {
    return [...this.state.files, ...this.state.objects];
  }

  addKeepsake({ kind, title, emoji = '✦', sourceId = null, metadata = {}, save = true }) {
    const existing = this.state.keepsakes.find(item => item.kind === kind && item.sourceId === sourceId);
    if (existing) return existing;
    const item = {
      id: crypto.randomUUID(),
      kind,
      title,
      emoji,
      sourceId,
      metadata,
      createdAt: nowIso()
    };
    this.state.keepsakes.unshift(item);
    this.state.keepsakes = this.state.keepsakes.slice(0, 120);
    if (save) this.save();
    return item;
  }

  addTimer(durationMs, label = 'Таймер', meta = {}) {
    const timer = {
      id: crypto.randomUUID(),
      label,
      createdAt: nowIso(),
      dueAt: new Date(Date.now() + durationMs).toISOString(),
      durationMs,
      status: 'active',
      meta: { ...meta }
    };
    this.state.timers.unshift(timer);
    this.state.timers = this.state.timers.slice(0, 80);
    this.incrementInteraction(meta.focus ? 'focus-started' : 'timer-created', { timerId: timer.id, durationMs });
    return timer;
  }

  completeTimer(id) {
    const timer = this.state.timers.find(item => item.id === id);
    if (!timer) return null;
    timer.status = 'done';
    timer.completedAt = nowIso();
    this.recordMoment(timer.meta?.focus ? 'focus-completed' : 'timer-completed', {
      salience: timer.meta?.focus ? 0.7 : 0.55,
      data: { timerId: id, label: timer.label },
      save: false
    });
    const keepsakeKind = timer.meta?.focus ? 'first-focus' : 'first-timer';
    if (!this.state.keepsakes.some(k => k.kind === keepsakeKind)) {
      this.addKeepsake({
        kind: keepsakeKind,
        title: timer.meta?.focus ? 'Первая совместная фокус-сессия' : 'Первый совместный таймер',
        emoji: timer.meta?.focus ? '🎯' : '⏱️',
        sourceId: id,
        save: false
      });
    }
    this.save();
    return timer;
  }

  cancelTimer(id) {
    const timer = this.state.timers.find(item => item.id === id);
    if (!timer || timer.status !== 'active') return false;
    timer.status = 'cancelled';
    timer.cancelledAt = nowIso();
    this.save();
    return true;
  }

  activeTimers() {
    return this.state.timers.filter(item => item.status === 'active');
  }

  upsertEpisode(episode) {
    const index = this.state.episodes.findIndex(item => item.id === episode.id);
    if (index >= 0) this.state.episodes[index] = { ...this.state.episodes[index], ...episode };
    else this.state.episodes.unshift({ ...episode });
    this.save();
    return this.state.episodes.find(item => item.id === episode.id);
  }

  recordDiscovery(id, metadata = {}) {
    const existing = this.state.discoveries.find(item => item.id === id);
    if (existing) {
      existing.count = Number(existing.count || 0) + 1;
      existing.lastSeenAt = nowIso();
      existing.metadata = { ...(existing.metadata || {}), ...metadata };
    } else {
      this.state.discoveries.unshift({
        id,
        count: 1,
        firstSeenAt: nowIso(),
        lastSeenAt: nowIso(),
        metadata: { ...metadata }
      });
    }
    this.state.discoveries = this.state.discoveries.slice(0, 200);
    this.save();
    return this.state.discoveries.find(item => item.id === id);
  }

  setPreference(key, value) {
    this.state.preferences[key] = value;
    this.save();
  }

  getPreference(key, fallback = undefined) {
    return this.state.preferences[key] ?? fallback;
  }

  setWindowPosition(position) {
    this.state.preferences.lastWindowPosition = position ? { ...position } : null;
    this.save();
  }

  snapshot() {
    return JSON.parse(JSON.stringify(this.state));
  }
}

module.exports = { MemoryStore, describeFile, dayKey };
