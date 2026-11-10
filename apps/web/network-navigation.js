/* Route-local UI navigation state only; no account, network or persistence writes. */
(() => {
'use strict';
const SUBSECTION_KEY='folkoop-subsection-v1';
function create({getHash,setHash,getActiveSubsection,readSavedSubsection}={}){
 if([getHash,setHash,getActiveSubsection,readSavedSubsection].some(fn=>typeof fn!=='function'))
  throw new TypeError('FOLKOOP navigation requires explicit browser adapters');
 // The pending hash distinguishes internal navigation from browser/user navigation.
 let pendingInternalHash='';
 function currentSubsection(parent){
  let key=getActiveSubsection()||'';
  if(!key){try{key=readSavedSubsection(SUBSECTION_KEY)||'';}catch{}}
  if(parent==='home'&&key.startsWith('home-'))return key;
  if(parent==='projects'&&key.startsWith('projects-'))return key;
  if(parent==='messages'&&key.startsWith('messages-'))return key;
  return parent==='home'?'home-overview':parent==='projects'?'projects-overview':'messages-chats';
 }
 function navigate(hash){
  pendingInternalHash=hash;
  setHash(hash);
 }
 function consumeHashChange(){
  if(pendingInternalHash&&getHash()===pendingInternalHash){
   pendingInternalHash='';
   return false;
  }
  pendingInternalHash='';
  return true;
 }
 return Object.freeze({currentSubsection,navigate,consumeHashChange});
}
globalThis.FolkoopNetworkNavigation=Object.freeze({create});
})();
