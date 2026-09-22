const ENDPOINT = 'https://geoserverextern.miljoforvaltningen.goteborg.se/geoserver/mstrat_luftovervakning/wms';
const ORIGIN = 'https://chup1runov.github.io';

const CANDIDATES = [
  'matstationer_luft',
  'mstrat_luftovervakning:matstationer_luft',
  'mf_luft_matstationer',
  'mstrat_luftovervakning:mf_luft_matstationer'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function capabilities() {
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

  assert(response.ok, `Air-station GetCapabilities returned ${response.status}`);
  assert(response.headers.get('access-control-allow-origin') === '*', 'Air-station WMS CORS does not allow GitHub Pages');

  const xml = await response.text();
  assert(/application\/json/i.test(xml), 'GetFeatureInfo JSON support missing');
}

function featureInfoUrl(layer) {
  // Central Göteborg in SWEREF 99 TM / EPSG:3006.
  const x = 319758.020;
  const y = 6400326.036;
  const span = 7000;
  const size = 201;

  const params = new URLSearchParams({
    SERVICE:'WMS',
    VERSION:'1.1.1',
    REQUEST:'GetFeatureInfo',
    LAYERS:layer,
    QUERY_LAYERS:layer,
    STYLES:'',
    SRS:'EPSG:3006',
    BBOX:[x-span,y-span,x+span,y+span].join(','),
    WIDTH:String(size),
    HEIGHT:String(size),
    X:String(Math.floor(size/2)),
    Y:String(Math.floor(size/2)),
    FORMAT:'image/png',
    INFO_FORMAT:'application/json',
    FEATURE_COUNT:'20'
  });

  return `${ENDPOINT}?${params}`;
}

async function testLayer(layer) {
  const response = await fetch(featureInfoUrl(layer), {
    headers:{
      accept:'application/json',
      origin:ORIGIN,
      'user-agent':'Sverinav-Goteborg-Air-Probe/0.6 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  const body = await response.text();
  const isException = /ServiceException|ExceptionReport/i.test(body);

  console.log('AIR_LAYER_TEST', JSON.stringify({
    layer,
    status:response.status,
    contentType:response.headers.get('content-type'),
    cors:response.headers.get('access-control-allow-origin'),
    exception:isException,
    prefix:body.slice(0,700)
  }));

  if (!response.ok || isException) return null;

  try {
    const payload = JSON.parse(body);
    const features = Array.isArray(payload?.features) ? payload.features : [];
    if (!features.length) return null;
    return { layer, payload };
  } catch {
    return null;
  }
}

await capabilities();

let success = null;
for (const candidate of CANDIDATES) {
  success = await testLayer(candidate);
  if (success) break;
}

assert(success, 'None of the documented/legacy Göteborg air-station layer names returned usable features');

console.log('AIR_WORKING_LAYER', success.layer);
console.log('AIR_FIRST_PROPERTIES', JSON.stringify(success.payload.features[0]?.properties || {}));
console.log('Göteborg air-monitoring station WMS contract OK.');
