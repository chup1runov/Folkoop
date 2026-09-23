import { fetchBounded } from './http.mjs';
const API_URL = new URL('https://data.riksdagen.se/dokumentlista/');

const params = {
  avd: 'dokument',
  doktyp: 'bet',
  beslutad: '1',
  sort: 'beslutsdag',
  sortorder: 'desc',
  utformat: 'json',
  sz: '8'
};

for (const [key, value] of Object.entries(params)) {
  API_URL.searchParams.set(key, value);
}

const COMMITTEES = {
  AU: 'Arbetsmarknadsutskottet',
  CU: 'Civilutskottet',
  FiU: 'Finansutskottet',
  FöU: 'Försvarsutskottet',
  JuU: 'Justitieutskottet',
  KU: 'Konstitutionsutskottet',
  KrU: 'Kulturutskottet',
  MJU: 'Miljö- och jordbruksutskottet',
  NU: 'Näringsutskottet',
  SfU: 'Socialförsäkringsutskottet',
  SkU: 'Skatteutskottet',
  SoU: 'Socialutskottet',
  TU: 'Trafikutskottet',
  UbU: 'Utbildningsutskottet',
  UU: 'Utrikesutskottet'
};

const toArray = value => Array.isArray(value) ? value : value ? [value] : [];
const asText = value => typeof value === 'string' ? value.trim() : '';
const asDate = value => asText(value).slice(0, 10);

function originalUrl(document) {
  const id = asText(document.dok_id);
  if (!id) return 'https://www.riksdagen.se/sv/dokument-och-lagar/';
  return `https://data.riksdagen.se/dokument/${encodeURIComponent(id)}.html`;
}

function normalize(document) {
  const organCode = asText(document.organ);
  const id = asText(document.dok_id);

  return {
    id,
    kind: 'decided_committee_report',
    title: asText(document.titel) || asText(document.beteckning) || 'Riksdagsbeslut',
    documentType: 'Betänkande',
    reference: asText(document.beteckning),
    session: asText(document.rm),
    organCode,
    responsibleActor: Object.entries(COMMITTEES).find(([code])=>code.toLowerCase()===organCode.toLowerCase())?.[1] || organCode || 'Sveriges riksdag',
    decisionDate: asDate(document.beslutsdag),
    publishedDate: asDate(document.datum || document.systemdatum),
    status: asText(document.status),
    sourceId: 'riksdagen_open_data',
    sourceName: 'Sveriges riksdag',
    sourceUrl: originalUrl(document),
    adapterVersion: 'riksdagen-decisions-v2'
  };
}

async function main() {
  const response = await fetchBounded(API_URL, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Sverinav/0.11 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  if (!response.ok) {
    throw new Error(`Riksdagen API returned ${response.status}`);
  }

  const payload = await response.json();
  const documents = toArray(payload?.dokumentlista?.dokument)
    .map(normalize)
    .filter(item => item.id && item.title)
    .slice(0, 8);

  if (!documents.length) {
    throw new Error('Riksdagen API returned no decided committee reports');
  }

  const output = {
    schemaVersion: 1,
    sourceId: 'riksdagen_open_data',
    sourceName: 'Sveriges riksdag',
    sourceQuery: API_URL.toString(),
    fetchedAt: new Date().toISOString(),
    adapterVersion: 'riksdagen-decisions-v2',
    items: documents
  };

  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir('data', { recursive: true });
  await writeFile('data/riksdagen-decisions.json', JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${documents.length} Riksdagen decisions to data/riksdagen-decisions.json`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
