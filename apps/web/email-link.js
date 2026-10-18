/* Runs before analytics and routing. Credentials stay in this page's memory. */
(() => {
 'use strict';
 const p=new URLSearchParams(location.hash.slice(1));
 if(!['access_token','refresh_token','error','error_code'].some(k=>p.has(k)))return;
 const now=Date.now(),seconds=Number(p.get('expires_in')),absolute=Number(p.get('expires_at'))*1000;
 const token=p.get('access_token')||'';
 const valid=!p.has('error')&&['magiclink','signup'].includes(p.get('type'))&&p.get('token_type')==='bearer'
  &&p.getAll('access_token').length===1&&token.length>=20&&token.length<=12000
  &&Number.isFinite(seconds)&&seconds>0&&seconds<=86400;
 let pending=valid?{token,expiresAt:Math.min(now+seconds*1000,absolute>0?absolute:Infinity)}:{error:true};
 if(pending.expiresAt<=now)pending={error:true};
 // Remove the complete callback, including refresh tokens and error descriptions.
 try{history.replaceState(null,'',location.pathname+'?intro=0#/me');}
 catch{pending={error:true};location.replace(location.pathname+'?intro=0#/me');return;}
 try{sessionStorage.setItem('folkoop-entry-mode-v1','account');}catch{}
 globalThis.FolkoopEmailLink=Object.freeze({take(){const result=pending;pending=null;return result;}});
})();
