/* Shared service-worker registration/update lifecycle for FOLKOOP.
   Existing clients should receive a new shell without manual site-data cleanup. */
(() => {
'use strict';
if(!('serviceWorker' in navigator))return;
const hadController=!!navigator.serviceWorker.controller;
let refreshing=false;

navigator.serviceWorker.addEventListener('controllerchange',()=>{
 if(refreshing||!hadController)return;
 refreshing=true;
 location.reload();
});

window.addEventListener('load',async()=>{
 try{
  const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  const activate=worker=>{if(worker?.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'});};
  const watch=worker=>{if(!worker)return;worker.addEventListener('statechange',()=>activate(worker));activate(worker);};
  if(registration.waiting&&navigator.serviceWorker.controller)registration.waiting.postMessage({type:'SKIP_WAITING'});
  registration.addEventListener('updatefound',()=>watch(registration.installing));
  watch(registration.installing);
  await registration.update();
 }catch{}
});
})();
