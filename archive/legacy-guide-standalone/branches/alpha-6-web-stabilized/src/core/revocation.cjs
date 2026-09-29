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

function canonicalVariant(a, b) {
  const aa = normalizeRecord(a);
  const bb = normalizeRecord(b);
  const sa = aa.signature == null ? null : String(aa.signature);
  const sb = bb.signature == null ? null : String(bb.signature);

  if (sa === sb) return aa;
  if (sa == null) return bb;
  if (sb == null) return aa;
  return sa.localeCompare(sb) <= 0 ? aa : bb;
}

function mergeRevocations(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const item of list || []) {
      const normalized = normalizeRecord(item);
      const id = recordId(normalized);
      const existing = byId.get(id);
      byId.set(id, existing ? canonicalVariant(existing, normalized) : normalized);
    }
  }
  return [...byId.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, value]) => value);
}

function revokedPeers(records = []) {
  return [...new Set(records.map(item => normalizeRecord(item).peerId))].sort();
}

module.exports = { normalizeRecord, recordId, canonicalVariant, mergeRevocations, revokedPeers };
