/* Cache only this app's public shell/feeds. Never cache coordinates or external APIs. */
const VERSION='0.14.0';
const BASE=new URL(self.registration.scope);
const PREFIX='sverinav:'+BASE.pathname+':';
const CACHE=PREFIX+VERSION;
const SHELL=new URL('index.html',BASE).href;
const CORE_PATHS=['','index.html','styles.css','compact.css','about-project.css','civic-core.js','daily-data.js','today.js','riksdagen.js','nvdb.js','goteborg-plans.js','app.js','about-copy.js','about-project.js','manifest.webmanifest','icon.svg','icon-180.png','icon-192.png','icon-512.png'];
const CORE=new Set(CORE_PATHS.map(p=>new URL(p,BASE).href));
const FEEDS=new Set(['data/riksdagen-decisions.json','data/goteborg-open-plans.json'].map(p=>new URL(p,BASE).href));
async function remember(request,response){
  try{await (await caches.open(CACHE)).put(request,response.clone());}catch{/* Storage denial must not discard a good network response. */}
  return response;
}
async function saved(request){return (await caches.open(CACHE)).match(request);}
async function dataResponse(request){
  try{
    const r=await fetch(request,{cache:'no-store'});
    if(!r.ok || !/\bjson\b/i.test(r.headers.get('content-type')||''))throw new Error('INVALID_SOURCE_RESPONSE');
    await r.clone().json();
    return await remember(request,r);
  }catch{
    const cached=await saved(request);
    if(cached){const headers=new Headers(cached.headers);headers.set('x-sverinav-cache','fallback');return new Response(await cached.arrayBuffer(),{status:200,headers});}
    return new Response(JSON.stringify({error:'offline',items:[]}),{status:503,headers:{'content-type':'application/json; charset=utf-8'}});
  }
}
async function navigationResponse(request){
  const cached=await saved(SHELL);if(cached)return cached;
  try{const r=await fetch(request);if(!r.ok)throw new Error('HTTP');return r;}catch{return new Response('Offline',{status:503,headers:{'content-type':'text/plain; charset=utf-8'}});}
}
async function coreResponse(request){return (await saved(request)) || fetch(request);}
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll([...CORE])));
  // Do not force-activate over an open draft/report in an older client.
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>(k.startsWith(PREFIX)||/^sverinav-v\d/.test(k))&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
  if(FEEDS.has(url.href)){event.respondWith(dataResponse(request));return;}
  if(request.mode==='navigate'&&(url.pathname===BASE.pathname||url.pathname===new URL('index.html',BASE).pathname)){event.respondWith(navigationResponse(request));return;}
  if(CORE.has(url.href))event.respondWith(coreResponse(request));
});
