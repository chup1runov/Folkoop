import { fetchBounded } from './http.mjs';
import { pathToFileURL } from 'node:url';
const SOURCE_URL = 'https://goteborg.se/planochbyggprojekt';
const SOURCE_FETCH_URLS = [
  SOURCE_URL,
  'https://goteborg.se/wps/portal?uri=gbglnk%3Agbg.page.bb7386fd-1152-47cb-9da4-d06bd7780a77'
];
const SOURCE_NAME = 'Göteborgs Stad';
const SOURCE_ID = 'goteborg_open_plans';

export function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&aring;/g, 'å')
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&Aring;/g, 'Å')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function textFromHtml(value) {
  return decodeEntities(
    String(value)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

function stockholmDate() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function toAbsoluteUrl(href) {
  try {
    const url = new URL(decodeEntities(href), SOURCE_URL);
    if (url.protocol !== 'https:') return null;
    if (url.hostname !== 'goteborg.se' && !url.hostname.endsWith('.goteborg.se')) return null;
    return url.href;
  } catch {
    return null;
  }
}

function escapeRegex(value) {
  return String(value).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function phrasePattern(phrase) {
  const words = String(phrase).trim().split(/\s+/).map(escapeRegex);
  return new RegExp(words.join('(?:\\s|<[^>]*>)+'), 'i');
}

function phraseIndex(html, phrase, from = 0) {
  const match = phrasePattern(phrase).exec(html.slice(from));
  return match ? from + match.index : -1;
}
export function extractSection(html) {
  const decodedHtml = decodeEntities(html);
  const startNeedle = 'Planer öppna för synpunkter';
  const endNeedles = ['Byggs just nu', 'Markanvisningar'];

  const start = phraseIndex(decodedHtml, startNeedle);
  if (start < 0) throw new Error('Open-for-comments section not found on Göteborgs Stad page');

  let end = decodedHtml.length;
  for (const needle of endNeedles) {
    const index = phraseIndex(decodedHtml, needle, start + startNeedle.length);
    if (index >= 0) end = Math.min(end, index);
  }

  if (end <= start) throw new Error('Could not determine Göteborg open-plans section boundary');
  return decodedHtml.slice(start, end);
}

export function parsePlans(sectionHtml, today = stockholmDate()) {
  const anchors = [...sectionHtml.matchAll(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)];
  const items = [];

  for (let index = 0; index < anchors.length; index += 1) {
    const match = anchors[index];
    const title = textFromHtml(match[3]);
    if (!title || title.length < 12 || /^(Image|Bild|Visa|Läs mer)$/i.test(title)) continue;

    const currentEnd = (match.index || 0) + match[0].length;
    const nextStart = anchors[index + 1]?.index ?? sectionHtml.length;
    const tailHtml = sectionHtml.slice(currentEnd, Math.min(nextStart, currentEnd + 6000));
    const tailText = textFromHtml(tailHtml);

    const deadlineMatch = tailText.match(/Synpunkter\s+tas\s+emot\s+till\s+och\s+med\s+(\d{4}-\d{2}-\d{2})/i);
    if (!deadlineMatch) continue;

    const deadline = deadlineMatch[1];
    if (deadline < today) continue;

    const sourceUrl = toAbsoluteUrl(match[2]);
    if (!sourceUrl) continue;

    const stageMatch = tailText.match(/((?:Plan|Program)[^.!?]{0,140}(?:samråd|granskning|granskning II|utställning)[^.!?]{0,80})/i);
    const area = title.includes(' - ') ? title.split(' - ')[0].trim() : '';

    items.push({
      id: sourceUrl,
      kind: 'public_consultation',
      title,
      area,
      stage: stageMatch ? stageMatch[1].trim() : '',
      deadline,
      sourceId: SOURCE_ID,
      sourceName: SOURCE_NAME,
      sourceUrl
    });
  }

  const advertised = [...textFromHtml(sectionHtml).matchAll(/Synpunkter\s+tas\s+emot\s+till\s+och\s+med\s+(\d{4}-\d{2}-\d{2})/gi)].filter(m=>m[1]>=today);
  if(advertised.length && !items.length) throw new Error('OPEN_PLANS_PARSE_MISMATCH');
  const seen = new Set();
  return items.filter(item => {
    const key = item.sourceUrl + '|' + item.deadline;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.deadline.localeCompare(b.deadline));
}

async function fetchOpenPlansSection() {
  let lastError;
  for (const url of SOURCE_FETCH_URLS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetchBounded(url, {
          headers: {
            accept: 'text/html,application/xhtml+xml',
            'accept-language': 'sv-SE,sv;q=0.9',
            'cache-control': 'no-cache',
            'user-agent': 'FOLKOOP/0.7 (+https://github.com/chup1runov/Folkoop)'
          }
        });
        if (!response.ok) throw new Error(`Göteborgs Stad returned ${response.status}`);
        return extractSection(await response.text());
      } catch (error) {
        lastError = error;
        if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 750));
      }
    }
  }
  throw lastError || new Error('Göteborg open-plans source unavailable');
}

async function main() {
  const section = await fetchOpenPlansSection();
  const sectionText = textFromHtml(section);

  if (!/samråd|granskning/i.test(sectionText)) {
    throw new Error('Göteborg open-plans section no longer contains expected consultation terminology');
  }

  const items = parsePlans(section);

  const output = {
    schemaVersion: 1,
    sourceId: SOURCE_ID,
    sourceName: SOURCE_NAME,
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    effectiveDate: stockholmDate(),
    adapterVersion: 'goteborg-open-plans-v1',
    itemCount: items.length,
    items
  };

  const { mkdir, writeFile } = await import('node:fs/promises');
  await mkdir('data', { recursive: true });
  await writeFile('data/goteborg-open-plans.json', JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${items.length} active Göteborg consultation plan(s)`);
  for (const item of items) {
    console.log(`PLAN ${item.deadline} | ${item.title}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => {
  console.error(error);
  process.exit(1);
});
