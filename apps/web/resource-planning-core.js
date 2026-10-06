/* R1 planning only. No network, persistence, authorization, reservation or outcome claims.
   Reuse existing project/resource IDs; the server must authorize every future write. */
(() => {
  'use strict';
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const UNITS = Object.freeze({
    consumable: Object.freeze(['piece', 'kg', 'litre', 'metre', 'm2', 'm3', 'pack']),
    equipment: Object.freeze(['piece']),
    work: Object.freeze(['hour'])
  });
  const MAX = 1000000000000n; // 1e9 units, represented in thousandths.
  const error = code => Object.assign(new Error(code), {code});
  function record(value, allowed) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw error('INVALID_INPUT');
    if (Object.keys(value).some(key => !allowed.includes(key))) throw error('UNKNOWN_FIELD');
    return value;
  }
  function id(value) {
    if (typeof value !== 'string' || !UUID.test(value)) throw error('INVALID_ID');
    return value.toLowerCase();
  }
  function text(value, max, required = false) {
    if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw error('INVALID_TEXT');
    const result = value.trim();
    if (required && !result) throw error('INVALID_TEXT');
    return result;
  }
  function quantity(value, allowZero = false) {
    // Decimal strings deliberately avoid binary rounding, exponent syntax and coercion.
    if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,9})(\.[0-9]{1,3})?$/.test(value)) throw error('INVALID_QUANTITY');
    const [whole, fraction = ''] = value.split('.');
    const n = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'));
    if (n > MAX || (allowZero ? n < 0n : n <= 0n)) throw error('INVALID_QUANTITY');
    return decimal(n);
  }
  function decimal(n) {
    const fraction = String(n % 1000n).padStart(3, '0').replace(/0+$/, '');
    return String(n / 1000n) + (fraction ? '.' + fraction : '');
  }
  function thousandths(value) {
    const [whole, fraction = ''] = value.split('.');
    return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'));
  }
  function timestamp(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'string') throw error('INVALID_TIME');
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
    if (!m) throw error('INVALID_TIME');
    const [, year, month, day, hour, minute, second] = m;
    const parts = [year, month, day, hour, minute, second].map(Number);
    if (parts[0] < 1 || parts[0] > 9999 || parts[1] < 1 || parts[1] > 12 || parts[2] < 1 || parts[2] > 31 || parts[3] > 23 || parts[4] > 59 || parts[5] > 59) throw error('INVALID_TIME');
    // Date.parse alone silently normalizes dates such as 30 February.
    const civil = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    if (!Number.isFinite(civil.getTime()) || civil.getUTCDate() !== parts[2]) throw error('INVALID_TIME');
    if (m[8] !== 'Z' && (Number(m[10]) > 14 || Number(m[11]) > 59 || (Number(m[10]) === 14 && Number(m[11]) !== 0) || m[8] === '-00:00')) throw error('INVALID_TIME');
    const result = new Date(value);
    if (!Number.isFinite(result.getTime()) || result.getUTCFullYear() < 1 || result.getUTCFullYear() > 9999) throw error('INVALID_TIME');
    return result.toISOString();
  }
  function dimensions(value, allowZero) {
    const units = Object.hasOwn(UNITS, value.kind) ? UNITS[value.kind] : null;
    if (!units || !units.includes(value.unit)) throw error('INVALID_DIMENSION');
    const q = quantity(value.quantity, allowZero);
    if (['piece', 'pack'].includes(value.unit) && thousandths(q) % 1000n !== 0n) throw error('INDIVISIBLE_QUANTITY');
    const from = timestamp(value.from), until = timestamp(value.until);
    if ((from === null) !== (until === null)) throw error('INCOMPLETE_WINDOW');
    if (value.kind !== 'consumable' && from === null) throw error('WINDOW_REQUIRED');
    if (from !== null && Date.parse(until) <= Date.parse(from)) throw error('INVALID_WINDOW');
    return {kind: value.kind, quantity: q, unit: value.unit, from, until};
  }
  function requirement(value) {
    record(value, ['id', 'projectId', 'flowId', 'title', 'kind', 'quantity', 'unit', 'from', 'until', 'conditions']);
    return Object.freeze({
      id: id(value.id), projectId: id(value.projectId),
      flowId: value.flowId === null || value.flowId === undefined ? null : id(value.flowId),
      title: text(value.title, 160, true), ...dimensions(value, false),
      conditions: text(value.conditions ?? '', 1000)
    });
  }
  function availability(value) {
    record(value, ['resourceId', 'kind', 'quantity', 'unit', 'from', 'until', 'conditions']);
    return Object.freeze({resourceId: id(value.resourceId), ...dimensions(value, true), conditions: text(value.conditions ?? '', 1000)});
  }
  function revision(value) {
    if (!Number.isInteger(value) || value < 0 || value >= 2147483647) throw error('INVALID_REVISION');
    return value;
  }
  function requirementArgs(value, expectedRevision) {
    const r = requirement(value);
    return Object.freeze({p_id: r.id, p_project: r.projectId, p_flow: r.flowId, p_title: r.title,
      p_kind: r.kind, p_quantity: r.quantity, p_unit: r.unit, p_from: r.from, p_until: r.until,
      p_conditions: r.conditions, p_expected_revision: revision(expectedRevision)});
  }
  function availabilityArgs(value, expectedRevision) {
    const r = availability(value);
    return Object.freeze({p_resource: r.resourceId, p_kind: r.kind, p_quantity: r.quantity,
      p_unit: r.unit, p_from: r.from, p_until: r.until, p_conditions: r.conditions,
      p_expected_revision: revision(expectedRevision)});
  }
  function compareDeclared(requirementValue, availabilityValue) {
    const r = requirement(requirementValue);
    const boundary = {basis: 'declared_only', reservation: 'not_checked', agreement: 'not_checked', fulfilment: 'not_checked'};
    if (availabilityValue === null || availabilityValue === undefined) return Object.freeze({...boundary, requirementId: r.id, resourceId: null, compatibility: 'unknown', reason: 'NO_DECLARATION'});
    const a = availability(availabilityValue);
    const identity = {requirementId: r.id, resourceId: a.resourceId};
    if (r.kind !== a.kind || r.unit !== a.unit) return Object.freeze({...boundary, ...identity, compatibility: 'incompatible', reason: 'DIMENSION_MISMATCH'});
    let time = 'not_requested';
    if (r.from !== null) time = a.from === null ? 'unknown' : Date.parse(a.from) <= Date.parse(r.from) && Date.parse(a.until) >= Date.parse(r.until) ? 'covers' : 'outside';
    const needed = thousandths(r.quantity), declared = thousandths(a.quantity);
    return Object.freeze({...boundary, ...identity, compatibility: time === 'outside' || declared === 0n ? 'incompatible' : 'needs_confirmation',
      time, quantity: declared === 0n ? 'none' : declared < needed ? 'partial' : 'sufficient',
      unit: r.unit, requested: r.quantity, declared: a.quantity, planningGap: decimal(needed > declared ? needed - declared : 0n)});
  }
  globalThis.FolkoopResourcePlanning = Object.freeze({requirement, availability, quantity, timestamp, requirementArgs, availabilityArgs, compareDeclared});
})();
