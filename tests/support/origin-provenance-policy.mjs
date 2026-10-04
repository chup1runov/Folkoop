// Foundation Charter / ADR-002 permit origin attribution in these exact provenance documents only.
// This exception applies to content, never to paths or runtime product branding.
const documents = Object.freeze([
  'AGENTS.md',
  'docs/FOUNDATION_CHARTER.md',
  'docs/UNIFICATION.md',
  'docs/NO_LOSS_REQUIREMENTS_REGISTER.md',
  'docs/NO_LOSS_REQUIREMENTS_REGISTER.json',
  'docs/architecture/adr/ADR-002-four-origin-foundation.md'
]);
const documentSet = new Set(documents);
const originNames = new Set([
  ['sver', 'inav'].join(''),
  ['folk', 'uno'].join('')
]);

export const originProvenanceDocuments = documents;

export function allowsOriginReference(file, word) {
  return typeof file === 'string' && typeof word === 'string'
    && documentSet.has(file)
    && originNames.has(word.toLowerCase());
}
