import {readFile} from 'node:fs/promises';

const REQUIRED_GUARDS = new Set([
  'G01','G02','G03','G04','G05','G06','G07','G08','G09','G10'
]);
const ALLOWED_MAPPINGS = new Set(['contextual','direct-role','future']);
const REQUIRED_OUTCOME_CLASSES = new Set([
  'self_reported','participant_confirmed','not_completed','unclear'
]);
const REQUIRED_EVIDENCE_QUALIFIERS = new Set([
  'participant_only','external_evidence_present'
]);

export async function loadBridge(url = new URL('../docs/architecture/sdcf-bridge-v0.2.json', import.meta.url)) {
  return JSON.parse(await readFile(url, 'utf8'));
}

export function validateBridge(bridge) {
  const errors = [];
  if (bridge?.schemaVersion !== 2) errors.push('schemaVersion must be 2');
  if (bridge?.bridgeVersion !== '0.2') errors.push('bridgeVersion must be 0.2');
  if (bridge?.supersedes !== 'docs/architecture/sdcf-bridge-v0.1.json') errors.push('v0.2 must identify the v0.1 bridge it supersedes');
  if (bridge?.runtimeDependency !== false) errors.push('runtimeDependency must remain false for the Göteborg pilot');
  if (bridge?.status !== 'advisory') errors.push('status must remain advisory before a separately approved runtime integration');

  const mappingIds = new Set();
  for (const m of bridge?.mappings || []) {
    if (!m?.id || mappingIds.has(m.id)) errors.push('mapping ids must be present and unique');
    mappingIds.add(m.id);
    if (!ALLOWED_MAPPINGS.has(m.mapping)) errors.push(`unsupported mapping mode: ${m?.mapping}`);
    if (!Array.isArray(m.sdcf) || !m.sdcf.length) errors.push(`mapping ${m?.id || '?'} must name SDCF semantics`);
  }

  const guardIds = new Set((bridge?.guards || []).map(g => g?.id));
  for (const id of REQUIRED_GUARDS) if (!guardIds.has(id)) errors.push(`missing required guard ${id}`);
  if (guardIds.size !== (bridge?.guards || []).length) errors.push('guard ids must be unique');

  const names = new Set((bridge?.guards || []).map(g => g?.name));
  for (const required of [
    'done_is_not_confirmed_outcome',
    'organic_and_facilitated_matches_remain_distinct',
    'recommendation_requires_provenance',
    'no_sensitive_matching_by_default',
    'no_runtime_semantic_stack_before_evidence'
  ]) {
    if (!names.has(required)) errors.push(`missing semantic guard: ${required}`);
  }

  const triggerText = JSON.stringify(bridge?.futureTriggers || []);
  for (const required of ['algorithmic or AI matching', 'City routing', 'multi-city']) {
    if (!triggerText.includes(required)) errors.push(`missing future integration trigger: ${required}`);
  }

  const city = bridge?.cityProvenanceContract;
  if (city?.version !== '1.0') errors.push('city provenance contract version must be 1.0');
  for (const key of ['schemaVersion','sourceId','fetchedAt','adapterVersion','items']) {
    if (!city?.feedEnvelope?.required?.includes(key)) errors.push(`city feed envelope must require ${key}`);
  }
  for (const key of ['id','sourceId','sourceUrl']) {
    if (!city?.item?.required?.includes(key)) errors.push(`city item must require ${key}`);
  }
  for (const key of ['fetchedAt','adapterVersion']) {
    if (!city?.feedEnvelope?.itemInheritance?.includes(key)) errors.push(`city items must inherit ${key} from the envelope when not materialized per item`);
  }
  const cityRules = JSON.stringify(city?.semanticRules || []);
  for (const phrase of ['provenance, not the claim itself','not source truth','unknown or unavailable']) {
    if (!cityRules.includes(phrase)) errors.push(`city provenance rule missing: ${phrase}`);
  }

  const outcome = bridge?.outcomeContract;
  if (outcome?.version !== '1.0') errors.push('outcome contract version must be 1.0');
  const outcomeIds = new Set((outcome?.classifications || []).map(x => x?.id));
  for (const id of REQUIRED_OUTCOME_CLASSES) if (!outcomeIds.has(id)) errors.push(`missing outcome classification ${id}`);
  const evidenceIds = new Set((outcome?.evidenceQualifiers || []).map(x => x?.id));
  for (const id of REQUIRED_EVIDENCE_QUALIFIERS) if (!evidenceIds.has(id)) errors.push(`missing evidence qualifier ${id}`);

  const confirmed = (outcome?.classifications || []).find(x => x?.id === 'participant_confirmed');
  if (!/owner/i.test(confirmed?.requires || '') || !/other involved participant/i.test(confirmed?.requires || '')) {
    errors.push('participant_confirmed must require owner plus another involved participant');
  }
  const invariants = JSON.stringify(outcome?.invariants || []);
  for (const phrase of [
    'cooperation status done alone cannot produce participant_confirmed',
    'activity journal entries alone cannot produce participant_confirmed',
    'conflicting participant accounts default to unclear',
    'SDCF does not create a broader retention purpose'
  ]) {
    if (!invariants.includes(phrase)) errors.push(`outcome invariant missing: ${phrase}`);
  }
  for (const ref of [
    'docs/GOTEBORG_CORE_LOOP_PILOT.md',
    'docs/PRE_PILOT_PRIVACY_DECISIONS.md',
    'docs/PRE_PILOT_PRIVACY_DATA_MAP.md'
  ]) {
    if (!outcome?.policyRefs?.includes(ref)) errors.push(`missing outcome policy reference: ${ref}`);
  }

  return errors;
}

export async function validateRepositoryBindings(bridge) {
  const errors = [];
  for (const adapter of bridge?.cityProvenanceContract?.currentAdapters || []) {
    let source;
    try {
      source = await readFile(new URL('../' + adapter.path, import.meta.url), 'utf8');
    } catch {
      errors.push(`missing adapter file: ${adapter.path}`);
      continue;
    }
    if (!source.includes(adapter.sourceId)) errors.push(`${adapter.path} does not contain sourceId ${adapter.sourceId}`);
    if (!source.includes(adapter.expectedAdapterVersion)) errors.push(`${adapter.path} does not contain adapterVersion ${adapter.expectedAdapterVersion}`);
    if (!source.includes('fetchedAt')) errors.push(`${adapter.path} does not record fetchedAt`);
    if (!source.includes(adapter.locator)) errors.push(`${adapter.path} does not record locator ${adapter.locator}`);
  }

  for (const ref of bridge?.outcomeContract?.policyRefs || []) {
    try {
      await readFile(new URL('../' + ref, import.meta.url), 'utf8');
    } catch {
      errors.push(`missing policy reference: ${ref}`);
    }
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bridge = await loadBridge();
  const errors = [...validateBridge(bridge), ...await validateRepositoryBindings(bridge)];
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`SDCF bridge ${bridge.bridgeVersion}: OK (${bridge.mappings.length} mappings, ${bridge.guards.length} guards, City provenance + outcome contracts)`);
  }
}
