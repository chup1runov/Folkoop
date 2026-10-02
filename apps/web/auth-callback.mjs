import {parse} from './auth-callback-core.mjs';

const copyByLanguage={
 en:{title:'FOLKOOP sign-in',completing:'Completing sign-in…',returnToTab:'Return to the FOLKOOP tab and start sign-in again.',received:'Authentication received. Returning to FOLKOOP…',failed:'Authentication failed. Returning to FOLKOOP…'},
 sv:{title:'FOLKOOP-inloggning',completing:'Slutför inloggningen…',returnToTab:'Gå tillbaka till FOLKOOP-fliken och starta inloggningen igen.',received:'Autentisering mottagen. Återgår till FOLKOOP…',failed:'Autentiseringen misslyckades. Återgår till FOLKOOP…'},
 ru:{title:'Вход в FOLKOOP',completing:'Завершаем вход…',returnToTab:'Вернись на вкладку FOLKOOP и начни вход заново.',received:'Аутентификация получена. Возвращаемся в FOLKOOP…',failed:'Аутентификация не удалась. Возвращаемся в FOLKOOP…'}
};
const supported=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];

export function completeOAuthCallback(env=globalThis){
 const document=env.document;
 const status=document.getElementById('oauthStatus');
 const extra=env.FolkoopExtraCopy?.languages||{};
 const localized={...copyByLanguage};
 for(const code of Object.keys(extra))if(extra[code]?.auth)localized[code]=extra[code].auth;

 let lang='en';
 try{
  const saved=env.localStorage?.getItem('folkoop-language');
  const browser=(env.navigator?.language||'en').split('-')[0];
  lang=supported.includes(saved)?saved:(supported.includes(browser)?browser:'en');
 }catch{}
 const copy=localized[lang]||localized.en;
 document.documentElement.lang=lang;
 document.documentElement.dir=['ar','fa'].includes(lang)?'rtl':'ltr';
 document.title=copy.title;
 status.textContent=copy.completing;

 const result=parse(env.location?.hash||'');
 try{env.history?.replaceState(null,'',env.location?.pathname||'');}catch{}

 const windowRef=env.window||env;
 if(!windowRef.opener||windowRef.opener.closed){
  status.textContent=copy.returnToTab;
  return {delivered:false,result};
 }
 const payload=result.ok
  ? {type:'folkoop-oauth',ok:true,accessToken:result.accessToken,expiresIn:result.expiresIn}
  : {type:'folkoop-oauth',ok:false,error:result.error,errorDescription:result.errorDescription};
 windowRef.opener.postMessage(payload,env.location.origin);
 status.textContent=result.ok?copy.received:copy.failed;
 const later=typeof env.setTimeout==='function'?env.setTimeout.bind(env):globalThis.setTimeout;
 later(()=>windowRef.close?.(),50);
 return {delivered:true,result,payload};
}

if(typeof document!=='undefined'&&typeof window!=='undefined'){
 completeOAuthCallback(globalThis);
}
