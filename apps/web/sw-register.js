/* Shared service-worker registration/update lifecycle for FOLKOOP.
   Existing clients should receive a new shell without manual site-data cleanup. */
(() => {
'use strict';
if(!('serviceWorker' in navigator))return;
const RELOAD_KEY='folkoop-sw-controller-reload-v1';
let refreshing=false;

navigator.serviceWorker.addEventListener('controllerchange',()=>{
 if(refreshing)return;
 refreshing=true;
 try{
  if(sessionStorage.getItem(RELOAD_KEY)==='1'){sessionStorage.removeItem(RELOAD_KEY);return;}
  sessionStorage.setItem(RELOAD_KEY,'1');
 }catch{}
 location.reload();
});

window.addEventListener('load',async()=>{
 try{
  const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  const activate=worker=>{if(worker?.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'});};
  if(registration.waiting&&navigator.serviceWorker.controller)registration.waiting.postMessage({type:'SKIP_WAITING'});
  registration.addEventListener('updatefound',()=>{
   const worker=registration.installing;
   if(worker)worker.addEventListener('statechange',()=>activate(worker));
  });
  await registration.update();
 }catch{}
});
})();
