(() => {
'use strict';
const status=document.getElementById('oauthStatus');
const result=globalThis.FolkoopOAuthCallback?.parse(location.hash)||{ok:false,error:'invalid_callback',errorDescription:''};
try{history.replaceState(null,'',location.pathname);}catch{}
if(!window.opener||window.opener.closed){
 status.textContent='Return to the FOLKOOP tab and start sign-in again.';
 return;
}
const payload=result.ok
 ? {type:'folkoop-oauth',ok:true,accessToken:result.accessToken,expiresIn:result.expiresIn}
 : {type:'folkoop-oauth',ok:false,error:result.error,errorDescription:result.errorDescription};
window.opener.postMessage(payload,location.origin);
status.textContent=result.ok?'Authentication received. Returning to FOLKOOP…':'Authentication failed. Returning to FOLKOOP…';
setTimeout(()=>window.close(),50);
})();