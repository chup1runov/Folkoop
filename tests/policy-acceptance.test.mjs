import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const TERMS='2026-09-29-v1';
const PRIVACY='2026-09-29-v1';

test('pilot policy versions stay aligned across server, client and participant docs',async()=>{
 const [client,migration,termsEn,termsSv,privacy,ui,workflow]=await Promise.all([
  readFile('network-client.js','utf8'),
  readFile('supabase/migrations/202609290003_pilot_terms_acceptance.sql','utf8'),
  readFile('docs/PILOT_TERMS_EN.md','utf8'),
  readFile('docs/PILOT_TERMS_SV.md','utf8'),
  readFile('docs/PILOT_PRIVACY_NOTICE_DRAFT.md','utf8'),
  readFile('network-ui.js','utf8'),
  readFile('.github/workflows/network.yml','utf8')
 ]);
 assert(client.includes(`termsVersion:'${TERMS}'`));
 assert(client.includes(`privacyVersion:'${PRIVACY}'`));
 assert(migration.includes(`required_terms constant text:='${TERMS}'`));
 assert(migration.includes(`required_privacy constant text:='${PRIVACY}'`));
 assert(termsEn.includes(`version **${TERMS}**`));
 assert(termsSv.includes(`version **${TERMS}**`));
 assert(privacy.includes(`Privacy Notice version: **${PRIVACY}**`));
 assert(ui.includes('name="policyAccepted"'));
 assert(ui.includes("termsAccepted:policyAccepted"));
 assert(ui.includes("privacyAcknowledged:policyAccepted"));
 assert(workflow.includes('202609290003_pilot_terms_acceptance.sql'));
});

test('legacy one-argument invite claim is explicitly removed by the acceptance migration',async()=>{
 const migration=await readFile('supabase/migrations/202609290003_pilot_terms_acceptance.sql','utf8');
 assert(migration.includes('drop function public.fk_claim_pilot_invite(text);'));
 assert(migration.includes('p_accept_terms boolean'));
 assert(migration.includes('p_ack_privacy boolean'));
});
