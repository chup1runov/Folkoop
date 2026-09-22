const ENDPOINT = 'https://geoserverextern.miljoforvaltningen.goteborg.se/geoserver/luft/wms';
const ORIGIN = 'https://chup1runov.github.io';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractLayerNames(xml) {
  return [...xml.matchAll(/<Name>([^<]+)<\/Name>/gi)]
    .map(match => match[1].trim())
    .filter(name => /2023/i.test(name));
}

async function getCapabilities() {
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({
    service:'WMS',
    request:'GetCapabilities',
    version:'1.3.0'
  });

  const response = await fetch(url, {
    headers:{
      accept:'text/xml',
      origin:ORIGIN,
      'user-agent':'Sverinav-Goteborg-Air-Probe/0.6 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  console.log('AIR_CAP_STATUS', response.status);
  console.log('AIR_CAP_CORS', response.headers.get('access-control-allow-origin'));
  console.log('AIR_CAP_TYPE', response.headers.get('content-type'));

  assert(response.ok, `Air-quality GetCapabilities returned ${response.status}`);

  const xml = await response.text();
  const layers = extractLayerNames(xml);
  console.log('AIR_2023_LAYERS', JSON.stringify(layers));

  assert(layers.length >= 4, 'Expected 2023 air-quality layers were not found');
  assert(layers.some(name => /NO2.*2023.*year|2023.*NO2.*year/i.test(name)), '2023 NO2 yearly layer missing');
  assert(layers.some(name => /PM10.*2023.*year|2023.*PM10.*year/i.test(name)), '2023 PM10 yearly layer missing');

  return { xml, layers };
}

function featureInfoUrl(layer) {
  // Kungsportsavenyen test point in SWEREF 99 TM / EPSG:3006.
  const x = 319667.121;
  const y = 6399360.192;
  const span = 150;

  const params = new URLSearchParams({
    SERVICE:'WMS',
    VERSION:'1.1.1',
    REQUEST:'GetFeatureInfo',
    LAYERS:layer,
    QUERY_LAYERS:layer,
    STYLES:'',
    SRS:'EPSG:3006',
    BBOX:[x-span,y-span,x+span,y+span].join(','),
    WIDTH:'101',
    HEIGHT:'101',
    X:'50',
    Y:'50',
    FORMAT:'image/png',
    INFO_FORMAT:'application/json',
    FEATURE_COUNT:'10'
  });

  return `${ENDPOINT}?${params}`;
}

async function probeLayer(layer) {
  const response = await fetch(featureInfoUrl(layer), {
    headers:{
      accept:'application/json',
      origin:ORIGIN,
      'user-agent':'Sverinav-Goteborg-Air-Probe/0.6 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  const body=await response.text();
  console.log('AIR_INFO_LAYER', layer);
  console.log('AIR_INFO_STATUS', response.status);
  console.log('AIR_INFO_CORS', response.headers.get('access-control-allow-origin'));
  console.log('AIR_INFO_TYPE', response.headers.get('content-type'));
  console.log('AIR_INFO_BODY', JSON.stringify(body.slice(0,3000)));

  assert(response.ok, `GetFeatureInfo failed for ${layer}`);
  assert(!/ServiceException|ExceptionReport/i.test(body), `WMS exception for ${layer}`);

  const json=JSON.parse(body);
  const features=Array.isArray(json?.features)?json.features:[];
  assert(features.length>0, `No air-quality feature returned for ${layer}`);

  return json;
}

const { layers }=await getCapabilities();

const no2=layers.find(name => /NO2.*2023.*year|2023.*NO2.*year/i.test(name));
const pm10=layers.find(name => /PM10.*2023.*year|2023.*PM10.*year/i.test(name));

await probeLayer(no2);
await probeLayer(pm10);

console.log('Göteborg air-quality WMS contract OK.');
