const ENDPOINT = 'https://geo-netinfo.trafikverket.se/MapService/wms.axd/NetInfo_1_8';
const ORIGIN = 'https://chup1runov.github.io';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchWithRetry(url, options, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise(resolve => setTimeout(resolve, attempt * 750));
    }
  }
  throw lastError;
}

async function capabilities() {
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({
    Service: 'WMS',
    request: 'GetCapabilities'
  });

  const response = await fetchWithRetry(url, {
    headers: {
      origin: ORIGIN,
      'user-agent': 'Sverinav-NVDB-Contract-Test/0.5 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  assert(response.ok, `GetCapabilities returned ${response.status}`);
  assert(response.headers.get('access-control-allow-origin') === '*', 'NetInfo CORS no longer allows GitHub Pages');

  const xml = await response.text();
  assert(/<Name>Vaghallare<\/Name>/i.test(xml), 'Vaghallare layer missing from NetInfo');

  const featureInfoBlock = xml.match(/<GetFeatureInfo>[\s\S]*?<\/GetFeatureInfo>/i)?.[0] || '';
  assert(/<Format>application\/json<\/Format>/i.test(featureInfoBlock), 'GetFeatureInfo JSON support missing');
}

function featureInfoUrl(lat, lon) {
  const span = 0.0025;
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetFeatureInfo',
    LAYERS: 'Vaghallare',
    QUERY_LAYERS: 'Vaghallare',
    STYLES: '',
    SRS: 'EPSG:4326',
    BBOX: [lon - span, lat - span, lon + span, lat + span].join(','),
    WIDTH: '61',
    HEIGHT: '61',
    X: '30',
    Y: '30',
    FORMAT: 'image/png',
    INFO_FORMAT: 'application/json',
    FEATURE_COUNT: '20'
  });
  return `${ENDPOINT}?${params}`;
}

async function assertGothenburgMunicipalRoad() {
  const response = await fetchWithRetry(featureInfoUrl(57.7002, 11.9738), {
    headers: {
      accept: 'application/json',
      origin: ORIGIN,
      'user-agent': 'Sverinav-NVDB-Contract-Test/0.5 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  assert(response.ok, `GetFeatureInfo returned ${response.status}`);
  assert(response.headers.get('access-control-allow-origin') === '*', 'GetFeatureInfo CORS no longer allows GitHub Pages');

  const payload = await response.json();
  const features = Array.isArray(payload?.features) ? payload.features : [];
  assert(features.length > 0, 'No Vaghallare feature returned for Göteborg test point');

  const gothenburg = features.find(feature =>
    Number(feature?.properties?.Vaghallartyp) === 2 &&
    /göteborg/i.test(String(feature?.properties?.Vaghallarnamn || ''))
  );

  assert(gothenburg, 'Göteborg test point no longer resolves to a municipal Göteborg road');
}

await capabilities();
await assertGothenburgMunicipalRoad();

console.log('NetInfo Vaghallare contract OK: CORS, JSON and Göteborg municipal road verified.');
