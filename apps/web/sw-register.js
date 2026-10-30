/* Shared FOLKOOP service-worker update lifecycle.
   Never reload an existing page without an explicit participant action:
   Auth tokens and unsaved forms live in memory and could otherwise be lost. */
(() => {
'use strict';
if(!('serviceWorker' in navigator))return;

const COPY={
 sv:['En uppdatering finns','En ny version av FOLKOOP är tillgänglig. Uppdatera när du är klar med det du gör.','Uppdatera nu','Senare','Ändringar i formulär kan gå förlorade. Vill du uppdatera nu?'],
 en:['Update available','A new FOLKOOP version is available. Update when you are finished with your current task.','Update now','Later','Unsaved form changes may be lost. Update now?'],
 ru:['Доступно обновление','Новая версия FOLKOOP готова. Обнови, когда закончишь текущее действие.','Обновить сейчас','Позже','Несохранённые изменения в формах могут пропасть. Обновить сейчас?'],
 uk:['Доступне оновлення','Нова версія FOLKOOP готова. Онови, коли завершиш поточну дію.','Оновити зараз','Пізніше','Незбережені зміни у формах можуть зникнути. Оновити зараз?'],
 es:['Actualización disponible','Hay una nueva versión de FOLKOOP. Actualiza al terminar lo que estás haciendo.','Actualizar ahora','Más tarde','Podrías perder cambios de formularios sin guardar. ¿Actualizar ahora?'],
 fi:['Päivitys saatavilla','FOLKOOPin uusi versio on saatavilla. Päivitä, kun olet valmis.','Päivitä nyt','Myöhemmin','Tallentamattomat lomakemuutokset voivat kadota. Päivitetäänkö nyt?'],
 bs:['Dostupno ažuriranje','Nova verzija FOLKOOP-a je spremna. Ažuriraj kada završiš trenutni posao.','Ažuriraj sada','Kasnije','Nesačuvane promjene u obrascima mogu nestati. Ažurirati sada?'],
 ar:['يتوفر تحديث','يتوفر إصدار جديد من FOLKOOP. حدّثه بعد الانتهاء مما تفعله.','حدّث الآن','لاحقًا','قد تضيع تغييرات النماذج غير المحفوظة. هل تريد التحديث الآن؟'],
 fa:['به‌روزرسانی موجود است','نسخهٔ جدید FOLKOOP آماده است. پس از پایان کارتان به‌روزرسانی کنید.','اکنون به‌روزرسانی کن','بعداً','تغییرات ذخیره‌نشدهٔ فرم‌ها ممکن است از بین بروند. اکنون به‌روزرسانی شود؟'],
 so:['Cusboonaysiin ayaa jirta','Nooc cusub oo FOLKOOP ah ayaa diyaar ah. Cusboonaysii markaad hawsha dhammayso.','Hadda cusboonaysii','Mar dambe','Isbeddellada aan la kaydin way lumi karaan. Hadda ma cusboonaysiinaysaa?'],
 ku:['Nûvekirin heye','Guhertoyeke nû ya FOLKOOP amade ye. Dema karê xwe qedandî nû bike.','Niha nû bike','Paşê','Guhertinên tomarnekirî dikarin winda bibin. Niha nû bike?']
};
const copy=()=>COPY[document.documentElement.lang]||COPY.en;
let hasControlledPage=!!navigator.serviceWorker.controller;
let registration=null,waiting=null,banner=null,parts=null;
let dismissed=false,requestedActivation=false,reloaded=false,possiblyUnsaved=false;

// Form/City edits are intentionally NOT persisted by the updater.
const onEditableChange=event=>{
 if(!event.isTrusted)return;
 const el=event.target;
 if(el?.matches?.('input:not([type="hidden"]),textarea,select,[contenteditable="true"]')
    ||el?.closest?.('[contenteditable="true"]'))possiblyUnsaved=true;
};
document.addEventListener('input',onEditableChange,true);
document.addEventListener('change',onEditableChange,true);

// Embedded City is a same-origin iframe. Its reportDescription/reportPlace
// controls are not children of a <form>, and iframe events do not reach the
// outer document. Watch each new City document without reading draft values.
const watchedCityDocuments=new WeakSet();
function attachCityDraftGuard(frame){
 try{
  const city=frame?.contentDocument;
  if(!city){if(frame)possiblyUnsaved=true;return;}
  if(watchedCityDocuments.has(city))return;
  watchedCityDocuments.add(city);
  city.addEventListener('input',onEditableChange,true);
  city.addEventListener('change',onEditableChange,true);
 }catch{possiblyUnsaved=true;}
}
document.addEventListener('load',event=>{
 if(event.target?.id==='cityFrame')attachCityDraftGuard(event.target);
},true);
attachCityDraftGuard(document.getElementById('cityFrame'));

function showAvailable(){
 if(!hasControlledPage||dismissed||reloaded)return;
 if(!banner){
  banner=document.createElement('aside');
  banner.className='folkoop-update-notice';
  banner.setAttribute('role','status');
  banner.setAttribute('aria-live','polite');
  const title=document.createElement('strong');
  const description=document.createElement('span');
  const update=document.createElement('button');
  update.type='button';update.className='button';
  const later=document.createElement('button');
  later.type='button';later.className='button secondary';
  parts={title,description,update,later};
  banner.append(title,description,update,later);
  document.body.append(banner);
  update.addEventListener('click',()=>{
   if(possiblyUnsaved&&!window.confirm(copy()[4]))return;
   requestedActivation=true;
   banner.hidden=true;
   const active=registration?.waiting||waiting;
   if(active&&active.state==='installed')active.postMessage({type:'SKIP_WAITING'});
   else{
    reloaded=true;
    location.reload();
   }
  });
  later.addEventListener('click',()=>{
   dismissed=true;
   banner.hidden=true;
  });
 }
 const text=copy();
 parts.title.textContent=text[0];
 parts.description.textContent=text[1];
 parts.update.textContent=text[2];
 parts.later.textContent=text[3];
 banner.hidden=false;
}

navigator.serviceWorker.addEventListener('controllerchange',()=>{
 const firstControl=!hasControlledPage;
 hasControlledPage=hasControlledPage||!!navigator.serviceWorker.controller;
 if(firstControl||reloaded)return;
 if(requestedActivation){
  reloaded=true;
  location.reload();
 }else{
  // Another tab may have activated the worker. Do not destroy local drafts.
  dismissed=false;
  waiting=null;
  showAvailable();
 }
});

window.addEventListener('load',async()=>{
 try{
  registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  const installed=worker=>{
   if(worker?.state==='installed'&&hasControlledPage){
    waiting=worker;
    showAvailable();
   }
  };
  const watch=worker=>{
   if(!worker)return;
   worker.addEventListener('statechange',()=>installed(worker));
   installed(worker);
  };
  watch(registration.waiting);
  registration.addEventListener('updatefound',()=>watch(registration.installing));
  watch(registration.installing);
  await registration.update();
 }catch{}
});

// Keep the passive notice in the currently selected interface language.
new MutationObserver(()=>{
 if(banner&&!banner.hidden)showAvailable();
}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
