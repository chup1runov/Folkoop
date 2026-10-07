/* Named R1 operations using the EXISTING memory-only HTTP client.
   No second Auth client, tokens, storage, automatic retries or analytics. */
(() => {
  'use strict';
  const fail = code => Object.assign(new Error(code), {code});
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  function id(value) {
    if (typeof value !== 'string' || !UUID.test(value)) throw fail('INVALID_ID');
    return value.toLowerCase();
  }
  function revision(value, zero = false) {
    if (!Number.isInteger(value) || value < (zero ? 0 : 1) || value >= 2147483647) throw fail('INVALID_RESPONSE');
    return value;
  }
  function create({request, context, onChange}) {
    const core = globalThis.FolkoopResourcePlanning, lifecycle = globalThis.FolkoopResourceLifecycle;
    if (!core || !lifecycle || typeof request !== 'function' || typeof context !== 'function' || typeof onChange !== 'function') throw fail('RESOURCE_SCHEMA_UNAVAILABLE');
    async function call(path, body) {
      const before = context();
      if (!before?.userId) throw fail('AUTH_REQUIRED');
      const current = () => {const after = context(); return after?.userId === before.userId && after?.epoch === before.epoch;};
      try {
        const result = await request('/rest/v1/' + path, {method: body === undefined ? 'GET' : 'POST', body, resource: true});
        if (!current()) throw fail('STALE');
        return result;
      } catch (error) {
        if (!current()) throw fail('STALE');
        throw error;
      }
    }
    const rpc = (name, args) => call('rpc/' + name, args);
    const dim = row => ({kind: row.kind, quantity: row.quantity, unit: row.unit, conditions: row.conditions});
    function requirementRow(row, projectId) {
      if (!row || row.cooperation_id !== projectId) throw fail('INVALID_RESPONSE');
      try {
        const value = core.requirement({id: row.id, projectId: row.cooperation_id, flowId: row.flow_id,
          title: row.title, ...dim(row), from: row.needed_from, until: row.needed_until});
        return Object.freeze({value, revision: revision(row.revision)});
      } catch {throw fail('INVALID_RESPONSE');}
    }
    async function requirements(projectId) {
      const pid = id(projectId);
      // Cast in PostgREST, BEFORE JSON decoding. Do not reconstruct decimal text from a Number.
      const rows = await call('fk_resource_requirements?select=id,cooperation_id,flow_id,title,kind,quantity::text,unit,needed_from,needed_until,conditions,revision&cooperation_id=eq.' + pid + '&order=id.asc&limit=101');
      if (!Array.isArray(rows) || rows.length > 100) throw fail('INVALID_RESPONSE');
      const seen = new Set();
      return Object.freeze(rows.map(row => {
        const result = requirementRow(row, pid);
        if (seen.has(result.value.id)) throw fail('INVALID_RESPONSE');
        seen.add(result.value.id); return result;
      }));
    }
    async function availability(resourceId) {
      const rid = id(resourceId), start = context();
      const generation = () => rpc('fk_resource_availability_revision', lifecycle.availabilityRevisionArgs(rid));
      const before = revision(await generation(), true);
      const rows = await call('fk_resource_availability?select=resource_id,kind,quantity::text,unit,available_from,available_until,conditions,revision&resource_id=eq.' + rid + '&limit=2');
      const after = revision(await generation(), true);
      if (context()?.epoch !== start?.epoch || context()?.userId !== start?.userId) throw fail('STALE');
      if (before !== after) throw fail('RESOURCE_CONFLICT');
      if (!Array.isArray(rows) || rows.length > 1) throw fail('INVALID_RESPONSE');
      if (!rows.length) return Object.freeze({value: null, revision: after});
      const row = rows[0];
      if (row.resource_id !== rid || row.revision !== after) throw fail('RESOURCE_CONFLICT');
      try {return Object.freeze({value: core.availability({resourceId: rid, ...dim(row), from: row.available_from, until: row.available_until}), revision: revision(row.revision)});}
      catch {throw fail('INVALID_RESPONSE');}
    }
    async function saveRequirement(value, expectedRevision) {
      return revision(await rpc('fk_save_resource_requirement', core.requirementArgs(value, expectedRevision)));
    }
    async function saveAvailability(value, expectedRevision) {
      return revision(await rpc('fk_save_resource_availability', core.availabilityArgs(value, expectedRevision)));
    }
    async function removeRequirement(projectId, requirementId, expectedRevision) {
      const result = await rpc('fk_remove_resource_requirement', lifecycle.removeRequirementArgs(projectId, requirementId, expectedRevision));
      if (typeof result !== 'boolean') throw fail('INVALID_RESPONSE'); return result;
    }
    async function removeAvailability(resourceId, expectedRevision) {
      const result = await rpc('fk_remove_resource_availability', lifecycle.removeAvailabilityArgs(resourceId, expectedRevision));
      if (typeof result !== 'boolean') throw fail('INVALID_RESPONSE'); return result;
    }
    async function exportPage(kind, after = null, limit = 100) {
      const args = lifecycle.exportArgs(kind, after, limit);
      const page = lifecycle.exportPage(await rpc('fk_export_resource_planning', args), kind);
      const first = page.records[0];
      if (after !== null && first && (kind === 'requirements' ? first.id : first.resource_id) <= after) throw fail('INVALID_EXPORT_CURSOR');
      return page;
    }
    return Object.freeze({requirements, availability, saveRequirement, saveAvailability,
      removeRequirement, removeAvailability, exportPage, onChange, context});
  }
  globalThis.FolkoopResourceTransport = Object.freeze({create});
})();
