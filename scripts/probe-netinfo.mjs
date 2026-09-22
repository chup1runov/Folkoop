const url = 'https://geo-netinfo.trafikverket.se/MapService/wms.axd/NetInfo_1_8?Service=WMS&request=GetCapabilities';

function extractFormats(xml) {
  const block = xml.match(/<GetFeatureInfo>[\s\S]*?<\/GetFeatureInfo>/i)?.[0] || '';
  return [...block.matchAll(/<Format>([^<]+)<\/Format>/gi)].map(match => match[1].trim());
}

function extractCors(headers) {
  return {
    allowOrigin: headers.get('access-control-allow-origin'),
    allowMethods: headers.get('access-control-allow-methods'),
    contentType: headers.get('content-type')
  };
}

async function fetchCapabilities() {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Sverinav-NVDB-Probe/0.5 (+https://github.com/chup1runov/Sverinav)',
      'origin': 'https://chup1runov.github.io'
    }
  });

  console.log('CAPABILITIES_STATUS', response.status);
  console.log('CAPABILITIES_HEADERS', JSON.stringify(extractCors(response.headers)));

  const text = await response.text();
  console.log('CAPABILITIES_LENGTH', text.length);
  console.log('FEATUREINFO_FORMATS', JSON.stringify(extractFormats(text)));
  console.log('HAS_VAGHALLARE_LAYER', /<Name>Vaghallare<\/Name>/i.test(text));

  if (!response.ok || !/<Name>Vaghallare<\/Name>/i.test(text)) {
    throw new Error('NetInfo capabilities unavailable or Vaghallare layer missing');
  }

  return { text, formats: extractFormats(text) };
}

function featureInfoUrl({ lon, lat, infoFormat }) {
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
    WIDTH: '101',
    HEIGHT: '101',
    X: '50',
    Y: '50',
    FORMAT: 'image/png',
    INFO_FORMAT: infoFormat,
    FEATURE_COUNT: '10'
  });
  return 'https://geo-netinfo.trafikverket.se/MapService/wms.axd/NetInfo_1_8?' + params;
}

async function probePoint(name, lon, lat, formats) {
  const candidates = [
    ...formats,
    'application/json',
    'application/vnd.ogc.gml',
    'text/xml',
    'text/html',
    'text/plain'
  ].filter((value, index, values) => value && values.indexOf(value) === index);

  for (const infoFormat of candidates) {
    const response = await fetch(featureInfoUrl({ lon, lat, infoFormat }), {
      headers: {
        'user-agent': 'Sverinav-NVDB-Probe/0.5 (+https://github.com/chup1runov/Sverinav)',
        'origin': 'https://chup1runov.github.io'
      }
    });
    const text = await response.text();
    console.log('POINT', name, 'FORMAT', infoFormat, 'STATUS', response.status);
    console.log('POINT_HEADERS', name, JSON.stringify(extractCors(response.headers)));
    console.log('POINT_BODY', name, JSON.stringify(text.slice(0, 2500)));

    if (response.ok && text && !/ServiceException|ExceptionReport/i.test(text)) {
      return { infoFormat, text, headers: extractCors(response.headers) };
    }
  }

  throw new Error('No usable GetFeatureInfo response for ' + name);
}

const { formats } = await fetchCapabilities();

// Approximate road points used only to validate the public service contract.
// E6/Tingstad: expected statlig. Avenyn: expected kommunal.
await probePoint('E6_TINGSTAD', 11.9907, 57.7207, formats);
await probePoint('AVENYN', 11.9738, 57.7002, formats);
