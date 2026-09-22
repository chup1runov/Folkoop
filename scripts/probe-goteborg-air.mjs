const ENDPOINT = 'https://geoserverextern.miljoforvaltningen.goteborg.se/geoserver/mstrat_luftovervakning/wms';
const ORIGIN = 'https://chup1runov.github.io';
const LAYER = 'mstrat_luftovervakning:matstationer_luft';

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

  const xml = await response.text();
  assert(/application\/json/i.test(xml), 'GetFeatureInfo JSON support missing');
  const stationIndex = xml.search(/matstation|mätstation|luftovervak/i);
  console.log('AIR_LAYER_INDEX', stationIndex);
  console.log('AIR_LAYER_CONTEXT', JSON.stringify(
    stationIndex >= 0 ? xml.slice(Math.max(0, stationIndex - 1800), stationIndex + 2600) : xml.slice(-5000)
  ));
  console.log('AIR_CAPABILITIES_OK', true);

  return xml;
}

function featureInfoUrl() {
  // Central Göteborg in SWEREF 99 TM / EPSG:3006.
  // Query a wide box because this is a station layer, not a continuous surface.
  const x = 319758.020;
  const y = 6400326.036;
  const span = 7000;
  const size = 201;

  const params = new URLSearchParams({
    SERVICE:'WMS',
    VERSION:'1.1.1',
    REQUEST:'GetFeatureInfo',
    LAYERS:LAYER,
    QUERY_LAYERS:LAYER,
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

async function featureInfo() {
  const response = await fetch(featureInfoUrl(), {
    headers:{
      accept:'application/json',
      origin:ORIGIN,
      'user-agent':'Sverinav-Goteborg-Air-Probe/0.6 (+https://github.com/chup1runov/Sverinav)'
    }
  });

  const body = await response.text();
  console.log('AIR_INFO_STATUS', response.status);
  console.log('AIR_INFO_CORS', response.headers.get('access-control-allow-origin'));
  console.log('AIR_INFO_TYPE', response.headers.get('content-type'));
  console.log('AIR_INFO_BODY', JSON.stringify(body.slice(0,5000)));

  assert(response.ok, `Air-station GetFeatureInfo returned ${response.status}`);
  assert(!/ServiceException|ExceptionReport/i.test(body), 'Air-station WMS returned an exception');

  const payload = JSON.parse(body);
  const features = Array.isArray(payload?.features) ? payload.features : [];
  assert(features.length > 0, 'No air-monitoring station returned around central Göteborg');

  const props = features[0]?.properties || {};
  console.log('AIR_FIRST_PROPERTIES', JSON.stringify(props));
}

await capabilities();
await featureInfo();

console.log('Göteborg air-monitoring station WMS contract OK.');
