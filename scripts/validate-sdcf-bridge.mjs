import {readFile} from 'node:fs/promises';

const REQUIRED_GUARDS = new Set([
  'G01','G02','G03','G04','G05','G06','G07','G08','G09','G10'
]);
const ALLOWED_MAPPINGS = new Set(['contextual','direct-role','future']);

export async function loadBridge(url = new URL('../docs/architecture/sdcf-bridge-v0.1.json', import.meta.url)) {
  return JSON.parse(await readFile(url, 'utf8'));
}

export function validateBridge(bridge) {
  const errors = [];
  if (bridge?.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (bridge?.bridgeVersion !== '0.1') errors.push('bridgeVersion must be 0.1');
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

  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bridge = await loadBridge();
  const errors = validateBridge(bridge);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`SDCF bridge ${bridge.bridgeVersion}: OK (${bridge.mappings.length} mappings, ${bridge.guards.length} guards)`);
  }
}
