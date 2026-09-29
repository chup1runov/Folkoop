(() => {
'use strict';
const status=document.getElementById('oauthStatus');
const copyByLanguage={
 en:{title:'FOLKOOP sign-in',completing:'Completing sign-in…',returnToTab:'Return to the FOLKOOP tab and start sign-in again.',received:'Authentication received. Returning to FOLKOOP…',failed:'Authentication failed. Returning to FOLKOOP…'},
 sv:{title:'FOLKOOP-inloggning',completing:'Slutför inloggningen…',returnToTab:'Gå tillbaka till FOLKOOP-fliken och starta inloggningen igen.',received:'Autentisering mottagen. Återgår till FOLKOOP…',failed:'Autentiseringen misslyckades. Återgår till FOLKOOP…'},
 ru:{title:'Вход в FOLKOOP',completing:'Завершаем вход…',returnToTab:'Вернись на вкладку FOLKOOP и начни вход заново.',received:'Аутентификация получена. Возвращаемся в FOLKOOP…',failed:'Аутентификация не удалась. Возвращаемся в FOLKOOP…'}
};
const extra=globalThis.FolkoopExtraCopy?.languages||{};
for(const code of Object.keys(extra))if(extra[code]?.auth)copyByLanguage[code]=extra[code].auth;
const supported=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];
let lang='en';
try{
 const saved=localStorage.getItem('sverinav-language');
 const browser=(navigator.language||'en').split('-')[0];
 lang=supported.includes(saved)?saved:(supported.includes(browser)?browser:'en');
}catch{}
const copy=copyByLanguage[lang]||copyByLanguage.en;
document.documentElement.lang=lang;
document.documentElement.dir=['ar','fa'].includes(lang)?'rtl':'ltr';
document.title=copy.title;
status.textContent=copy.completing;

const result=globalThis.FolkoopOAuthCallback?.parse(location.hash)||{ok:false,error:'invalid_callback',errorDescription:''};
try{history.replaceState(null,'',location.pathname);}catch{}
if(!window.opener||window.opener.closed){
 status.textContent=copy.returnToTab;
 return;
}
const payload=result.ok
 ? {type:'folkoop-oauth',ok:true,accessToken:result.accessToken,expiresIn:result.expiresIn}
 : {type:'folkoop-oauth',ok:false,error:result.error,errorDescription:result.errorDescription};
window.opener.postMessage(payload,location.origin);
status.textContent=result.ok?copy.received:copy.failed;
setTimeout(()=>window.close(),50);
})();