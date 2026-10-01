'use strict';

const ALLOWED_CAPABILITIES = new Set(['read-content', 'remember', 'remind']);

class PermissionLedger {
  constructor(memoryStore) {
    this.memory = memoryStore;
    if (!this.memory.state.permissions || typeof this.memory.state.permissions !== 'object') {
      this.memory.state.permissions = {};
    }
  }

  get(objectId, capability) {
    return Boolean(this.memory.state.permissions?.[objectId]?.[capability]?.granted);
  }

  grant(objectId, capability, metadata = {}) {
    if (!objectId) throw new Error('Object id required.');
    if (!ALLOWED_CAPABILITIES.has(capability)) throw new Error(`Unsupported capability: ${capability}`);
    const bucket = this.memory.state.permissions[objectId] || {};
    bucket[capability] = { granted: true, grantedAt: new Date().toISOString(), ...metadata };
    this.memory.state.permissions[objectId] = bucket;
    this.memory.save();
    return bucket[capability];
  }

  revoke(objectId, capability) {
    const bucket = this.memory.state.permissions?.[objectId];
    if (!bucket || !bucket[capability]) return false;
    delete bucket[capability];
    if (!Object.keys(bucket).length) delete this.memory.state.permissions[objectId];
    this.memory.save();
    return true;
  }

  revokeAll(objectId) {
    if (!this.memory.state.permissions?.[objectId]) return false;
    delete this.memory.state.permissions[objectId];
    this.memory.save();
    return true;
  }

  publicFor(objectId) {
    const bucket = this.memory.state.permissions?.[objectId] || {};
    return Object.fromEntries(Object.entries(bucket).map(([key, value]) => [key, Boolean(value?.granted)]));
  }
}

module.exports = { PermissionLedger, ALLOWED_CAPABILITIES };
