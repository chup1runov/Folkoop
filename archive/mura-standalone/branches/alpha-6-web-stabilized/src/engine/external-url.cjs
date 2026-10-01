'use strict';

function normalizeWebUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw || raw.length > 4096) return null;
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;

  let url;
  try { url = new URL(raw); } catch { return null; }

  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (url.username || url.password) return null;
  return url.href;
}

module.exports = { normalizeWebUrl };
