const SOURCE_URL = 'https://goteborg.se/planochbyggprojekt';
const SOURCE_NAME = 'Göteborgs Stad';
const SOURCE_ID = 'goteborg_open_plans';

function decodeEntities(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&aring;/gi, 'å')
    .replace(/&auml;/gi, 'ä')
    .replace(/&ouml;/gi, 'ö')
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

async function fetchWithRetry(url, options, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt === attempts) break;
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError;
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

function extractSection(html) {
  const startNeedle = 'Planer öppna för synpunkter';
  const endNeedles = ['Byggs just nu', 'Markanvisningar'];

  const start = html.indexOf(startNeedle);
  if (start < 0) throw new Error('Open-for-comments section not found on Göteborgs Stad page');

  let end = html.length;
  for (const needle of endNeedles) {
    const index = html.indexOf(needle, start + startNeedle.length);
    if (index >= 0) end = Math.min(end, index);
  }

  if (end <= start) throw new Error('Could not determine Göteborg open-plans section boundary');
  return html.slice(start, end);
}

function parsePlans(sectionHtml) {
  const today = stockholmDate();
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

  const seen = new Set();
  return items.filter(item => {
    const key = item.sourceUrl + '|' + item.deadline;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.deadline.localeCompare(b.deadline));
}

async function main() {
  const response = await fetchWithRetry(SOURCE_URL, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Sverinav/0.7 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  if (!response.ok) throw new Error(`Göteborgs Stad returned ${response.status}`);

  const html = await response.text();
  const section = extractSection(html);
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

main().catch(error => {
  console.error(error);
  process.exit(1);
});
