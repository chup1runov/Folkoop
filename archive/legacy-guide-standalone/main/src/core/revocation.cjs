'use strict';

const { stableHash } = require('./canonical.cjs');

function normalizeRecord(record = {}) {
  if (!record.peerId || !record.revokedBy || !record.revokedAt) throw new Error('Invalid revocation record.');
  return {
    peerId: String(record.peerId),
    revokedBy: String(record.revokedBy),
    revokedAt: new Date(record.revokedAt).toISOString(),
    reason: String(record.reason || '').slice(0, 300),
    signature: record.signature ? String(record.signature) : null
  };
}

function recordId(record) {
  const r = normalizeRecord(record);
  return stableHash({ peerId: r.peerId, revokedBy: r.revokedBy, revokedAt: r.revokedAt, reason: r.reason });
}

function mergeRevocations(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const item of list || []) {
      const normalized = normalizeRecord(item);
      byId.set(recordId(normalized), normalized);
    }
  }
  return [...byId.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, value]) => value);
}

function revokedPeers(records = []) {
  return [...new Set(records.map(item => normalizeRecord(item).peerId))].sort();
}

module.exports = { normalizeRecord, recordId, mergeRevocations, revokedPeers };
