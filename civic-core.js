/* Shared civic primitives. No analytics, credentials or location history. */
(() => {
  'use strict';
  const paths = {
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    weather:'<path d="M7 15a4 4 0 1 1 6-5 4 4 0 0 1 1 0 5 5 0 1 1 0 10H7a3 3 0 0 1 0-6Z"/><path d="M6 2v2M1 7h2M2.5 2.5 4 4"/>',
    route:'<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M5 16v-3a3 3 0 0 1 3-3h8a3 3 0 0 0 3-3"/>',
    camera:'<path d="M3 7h5l2-3h4l2 3h5v13H3Z"/><circle cx="12" cy="13" r="4"/>',
    pin:'<path d="M12 21s7-6 7-12A7 7 0 0 0 5 9c0 6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    road:'<path d="M8 3 5 21M16 3l3 18M12 3v4m0 4v3m0 4v3"/>',
    air:'<path d="M3 8h12a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h6"/>',
    consult:'<path d="M4 3h16v14H9l-5 4Z"/><path d="M8 7h8M8 11h5"/>',
    file:'<path d="M5 2h9l5 5v15H5Z"/><path d="M14 2v6h5M9 12h6M9 16h6"/>',
    database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7"/>',
    bus:'<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M4 11h16M8 19v2m8-2v2M8 6h8"/><circle cx="8" cy="15" r=".7"/><circle cx="16" cy="15" r=".7"/>',
    warning:'<path d="m12 3 10 18H2Z"/><path d="M12 8v6m0 3h.01"/>',
    water:'<path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
    ticket:'<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Z"/><path d="M15 5v3m0 3v2m0 3v3"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    language:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 7a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h3m4 0h3"/>'
  };
  function icon(name) {
    return `<svg class="svg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">${paths[name] || paths.file}</svg>`;
  }
  function escape(value) { return String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])); }
  function timestamp(value) {
    if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
    const n=Date.parse(value); return Number.isFinite(n) ? n : null;
  }
  function dateOnly(value) {
    if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d=new Date(value+'T12:00:00Z'); return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value;
  }
  function stockholmDay(now=Date.now()) { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
  function officialUrl(value, hosts) {
    try { const u=new URL(value);return u.protocol==='https:' && !u.username && !u.password && hosts.includes(u.hostname) ? u.href : null; } catch { return null; }
  }
  const storage={get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}};
  async function fetchJSON(url,{signal,timeout=10000}={}) {
    const controller=new AbortController();
    const abort=()=>controller.abort();
    if(signal?.aborted) controller.abort(); else signal?.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(abort,timeout);
    try {
      const r=await fetch(url,{headers:{accept:'application/json'},cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
      if(!r.ok) throw new Error('SOURCE_HTTP_'+r.status);
      if(!/\bjson\b/i.test(r.headers.get('content-type')||'')) throw new Error('SOURCE_NOT_JSON');
      return {payload:await r.json(),cached:r.headers.get('x-sverinav-cache')==='fallback',fetchedAt:new Date().toISOString()};
    } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  function feed(payload, sourceId, hosts) {
    const ts=timestamp(payload?.fetchedAt);
    if(!payload || payload.error || payload.schemaVersion!==1 || payload.sourceId!==sourceId || ts===null || ts>Date.now()+300000 || !Array.isArray(payload.items)) throw new Error('INVALID_FEED');
    if(payload.items.some(i=>!i || typeof i.title!=='string' || !i.title.trim() || !officialUrl(i.sourceUrl,hosts))) throw new Error('INVALID_ITEM');
    return payload;
  }
  globalThis.SverinavCore={icon,escape,timestamp,dateOnly,stockholmDay,officialUrl,storage,fetchJSON,feed};
})();
