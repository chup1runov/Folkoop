/* FOLKOOP City embedding adapter. */
(() => {
'use strict';
if(new URL(location.href).searchParams.get('embedded')!=='1')return;

// In the embedded City view, the legacy bottom-fixed navigation could sit
// outside the iframe viewport. Reuse the same controls, but place them before
// the City content and keep them sticky at the top. No handlers or labels are
// replaced, so the existing City behaviour stays intact.
const tabs=document.querySelector('.bottom-nav');
const content=document.querySelector('#view');
if(tabs&&content)content.before(tabs);
const style=document.createElement('style');
style.textContent='.topbar{position:static}.bottom-nav{position:sticky;top:0;bottom:auto;left:auto;transform:none;width:100%;padding-bottom:7px}.app-shell{padding-bottom:20px}';
document.head.append(style);

const cityNames={sv:'Stad',en:'City',ar:'المدينة',so:'Magaalada',fa:'شهر',fi:'Kaupunki',bs:'Grad',ku:'Bajar',es:'Ciudad',ru:'Город',uk:'Місто'};
let lastLanguage='', wasHidden=false;
function refreshBrand(){
 const mark=document.querySelector('.brand-lockup img');if(mark&&!mark.src.endsWith('/folkoop-mark.png'))mark.src='./folkoop-mark.png';
 const lang=document.documentElement.lang;
 document.title=(cityNames[lang]||'City')+' · FOLKOOP';
 if(parent!==window&&lang!==lastLanguage){lastLanguage=lang;parent.postMessage({type:'folkoop:city-language',language:lang},location.origin);}
}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='folkoop:city')return;
 const v=e.data;
 if(cityNames[v.language]&&v.language!==document.documentElement.lang&&typeof applyLanguage==='function')applyLanguage(v.language);
 if(v.visible===false){globalThis.FolkoopToday?.stop();wasHidden=true;}
 if(v.visible===true&&wasHidden){wasHidden=false;if(typeof render==='function')render(currentScreen,false);}
});
new MutationObserver(refreshBrand).observe(document.body,{childList:true,subtree:true});
new MutationObserver(refreshBrand).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
refreshBrand();
})();
