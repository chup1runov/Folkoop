(() => {
  const ENDPOINT = 'https://geo-netinfo.trafikverket.se/MapService/wms.axd/NetInfo_1_8';
  const SOURCE_URL = 'https://www.trafikverket.se/resa-och-trafik/vag/vem-ansvarar-for-vagen/';
  const MAP_URL = 'https://www.trafikverket.se/e-tjanster/sveriges-vagar-pa-karta-via-nvdb/';
  const HOLDER_TYPES = { 1: 'statlig', 2: 'kommunal', 3: 'enskild' };

  const attempts = [
    { span: 0.0012, size: 81 },
    { span: 0.0025, size: 61 },
    { span: 0.0045, size: 41 },
    { span: 0.0080, size: 31 }
  ];

  function featureInfoUrl(lat, lon, span, size) {
    const params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.1.1',
      REQUEST: 'GetFeatureInfo',
      LAYERS: 'Vaghallare',
      QUERY_LAYERS: 'Vaghallare',
      STYLES: '',
      SRS: 'EPSG:4326',
      BBOX: [lon - span, lat - span, lon + span, lat + span].join(','),
      WIDTH: String(size),
      HEIGHT: String(size),
      X: String(Math.floor(size / 2)),
      Y: String(Math.floor(size / 2)),
      FORMAT: 'image/png',
      INFO_FORMAT: 'application/json',
      FEATURE_COUNT: '30'
    });

    return `${ENDPOINT}?${params}`;
  }

  function localDistanceMeters(targetLat, targetLon, lat, lon) {
    const metersLat = 111320;
    const metersLon = 111320 * Math.cos(targetLat * Math.PI / 180);
    const x = (lon - targetLon) * metersLon;
    const y = (lat - targetLat) * metersLat;
    return Math.hypot(x, y);
  }

  function coordinateAsLatLon(coordinate, targetLat, targetLon) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) return null;
    const a = Number(coordinate[0]);
    const b = Number(coordinate[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

    const direct = localDistanceMeters(targetLat, targetLon, a, b);
    const reversed = localDistanceMeters(targetLat, targetLon, b, a);
    return direct <= reversed ? { lat: a, lon: b } : { lat: b, lon: a };
  }

  function distanceToSegmentMeters(targetLat, targetLon, a, b) {
    const metersLat = 111320;
    const metersLon = 111320 * Math.cos(targetLat * Math.PI / 180);
    const ax = (a.lon - targetLon) * metersLon;
    const ay = (a.lat - targetLat) * metersLat;
    const bx = (b.lon - targetLon) * metersLon;
    const by = (b.lat - targetLat) * metersLat;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;

    if (!lengthSquared) return Math.hypot(ax, ay);

    const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
    return Math.hypot(ax + t * dx, ay + t * dy);
  }

  function lineDistanceMeters(coordinates, targetLat, targetLon) {
    const points = coordinates
      .map(coordinate => coordinateAsLatLon(coordinate, targetLat, targetLon))
      .filter(Boolean);

    if (!points.length) return Infinity;
    if (points.length === 1) {
      return localDistanceMeters(targetLat, targetLon, points[0].lat, points[0].lon);
    }

    let best = Infinity;
    for (let index = 1; index < points.length; index += 1) {
      best = Math.min(best, distanceToSegmentMeters(targetLat, targetLon, points[index - 1], points[index]));
    }
    return best;
  }

  function geometryDistanceMeters(geometry, targetLat, targetLon) {
    if (!geometry) return Infinity;
    if (geometry.type === 'LineString') {
      return lineDistanceMeters(geometry.coordinates || [], targetLat, targetLon);
    }
    if (geometry.type === 'MultiLineString') {
      return Math.min(...(geometry.coordinates || []).map(line =>
        lineDistanceMeters(line, targetLat, targetLon)
      ));
    }
    return Infinity;
  }

  function isCurrentlyValid(properties) {
    const today=Number(SverinavCore.stockholmDay().replaceAll('-',''));
    const from=properties?.VALID_FROM, to=properties?.VALID_TO;
    if (from != null && from !== '' && (!Number.isFinite(Number(from)) || Number(from)>today)) return false;
    if (to != null && to !== '' && (!Number.isFinite(Number(to)) || Number(to)<today)) return false;
    return true;
  }

  function normalizeFeature(feature, targetLat, targetLon) {
    const properties = feature?.properties || {};
    const code = Number(properties.Vaghallartyp);
    if (!HOLDER_TYPES[code] || !isCurrentlyValid(properties)) return null;

    const distanceMeters = geometryDistanceMeters(feature.geometry, targetLat, targetLon);
    if (!Number.isFinite(distanceMeters)) return null;

    const holderType = HOLDER_TYPES[code];
    let holderName = typeof properties.Vaghallarnamn === 'string'
      ? properties.Vaghallarnamn.trim()
      : '';

    if (!holderName && holderType === 'statlig') holderName = 'Trafikverket';
    if (!holderName && holderType === 'enskild') holderName = 'Enskild väghållare';

    return {
      id: String(feature.id || ''),
      holderCode: code,
      holderType,
      holderName,
      organizationNumber: typeof properties.Organisationsnummer === 'string'
        ? properties.Organisationsnummer.trim()
        : '',
      distanceMeters,
      validFrom: properties.VALID_FROM || null,
      validTo: properties.VALID_TO || null
    };
  }

  async function fetchFeatures(lat, lon, attempt) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(featureInfoUrl(lat, lon, attempt.span, attempt.size), {
        headers: { accept: 'application/json' },
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`NetInfo returned ${response.status}`);
      const payload = await response.json();
      return Array.isArray(payload?.features) ? payload.features : [];
    } finally {
      clearTimeout(timer);
    }
  }

  function uniqueCandidates(candidates) {
    const seen = new Set();
    return candidates.filter(candidate => {
      const key = [
        candidate.holderType,
        candidate.holderName,
        candidate.organizationNumber,
        Math.round(candidate.distanceMeters)
      ].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function resolveRoadHolder(lat, lon, options = {}) {
    if (lat == null || lon == null || lat === '' || lon === '') throw new Error('INVALID_COORDINATES');
    const latitude = Number(lat);
    const longitude = Number(lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude)>90 || Math.abs(longitude)>180) {
      throw new Error('INVALID_COORDINATES');
    }

    let candidates = [];

    for (const attempt of attempts) {
      const features = await fetchFeatures(latitude, longitude, attempt);
      candidates = uniqueCandidates(
        features
          .map(feature => normalizeFeature(feature, latitude, longitude))
          .filter(Boolean)
          .sort((a, b) => a.distanceMeters - b.distanceMeters)
      );

      if (candidates.length) break;
    }

    if (!candidates.length || candidates[0].distanceMeters > 120) {
      const error = new Error('NO_NEARBY_ROAD');
      error.code = 'NO_NEARBY_ROAD';
      throw error;
    }

    const best = candidates[0];
    const competing = candidates.find(candidate =>
      [candidate.holderType,candidate.holderName,candidate.organizationNumber].join('|') !== [best.holderType,best.holderName,best.organizationNumber].join('|') &&
      candidate.distanceMeters <= 35 &&
      candidate.distanceMeters - best.distanceMeters <= 8
    );

    const accuracyMeters = typeof options.accuracyMeters === 'number' && Number.isFinite(options.accuracyMeters) && options.accuracyMeters >= 0
      ? Number(options.accuracyMeters)
      : null;

    return {
      ...best,
      accuracyMeters,
      ambiguous: Boolean(competing),
      alternatives: competing ? [best, competing] : [best],
      sourceId: 'trafikverket_nvdb_netinfo_vaghallare',
      sourceName: 'Trafikverket / NVDB NetInfo',
      sourceUrl: SOURCE_URL,
      mapUrl: MAP_URL,
      checkedAt: new Date().toISOString()
    };
  }

  window.SverinavNVDB = {
    resolveRoadHolder,
    sourceUrl: SOURCE_URL,
    mapUrl: MAP_URL
  };
})();
