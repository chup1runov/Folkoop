/* Transitional City adapter. Original service code and sources remain unchanged. */
(() => {
'use strict';
if(new URL(location.href).searchParams.get('embedded')!=='1')return;
document.documentElement.dataset.folkoopEmbeddedCity='1';

// Embedded City is controlled by the shared shell navigation. Standalone keeps its tabs.
const tabs=document.querySelector('.bottom-nav');
const content=document.querySelector('#view');
if(tabs)tabs.hidden=true;

const cityNames={sv:'Stad',en:'City',ar:'المدينة',so:'Magaalada',fa:'شهر',fi:'Kaupunki',bs:'Grad',ku:'Bajar',es:'Ciudad',ru:'Город',uk:'Місто'};
let lastLanguage='', wasHidden=false;
function refreshBrand(){
 // Rebrand fixed UI only. Never rewrite a user's report, preview or historical biography.
 for(const root of document.querySelectorAll('.topbar,#installCard,#serviceDetails')){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
   if(['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(node.parentElement?.tagName))continue;
   if(/FOLKOOP/.test(node.nodeValue))node.nodeValue=node.nodeValue.replace(/FOLKOOP/g,'FOLKOOP');
  }
 }
 document.querySelectorAll('[aria-label]').forEach(el=>{const v=el.getAttribute('aria-label');if(v.includes('FOLKOOP'))el.setAttribute('aria-label',v.replace(/FOLKOOP/g,'FOLKOOP'));});
 const mark=document.querySelector('.brand-lockup img');if(mark&&!mark.src.endsWith('/folkoop-mark.png'))mark.src='./folkoop-mark.png';
 const lang=document.documentElement.lang;
 document.title=(cityNames[lang]||'City')+' · FOLKOOP';
 if(parent!==window&&lang!==lastLanguage){lastLanguage=lang;parent.postMessage({type:'folkoop:city-language',language:lang},location.origin);}
}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='folkoop:city')return;
 const v=e.data;
 if(['light','dark'].includes(v.theme))document.documentElement.dataset.theme=v.theme;
 document.documentElement.dataset.reduceMotion=String(v.reduceMotion===true);
 if(['home','ansvar','rapportera','nara','beslut'].includes(v.screen)&&v.screen!==currentScreen&&typeof navigate==='function')navigate(v.screen);
 if(cityNames[v.language]&&v.language!==document.documentElement.lang&&typeof applyLanguage==='function')applyLanguage(v.language);
 if(v.visible===false){globalThis.FolkoopCityToday?.stop();wasHidden=true;}
 if(v.visible===true&&wasHidden){wasHidden=false;if(typeof render==='function')render(currentScreen,false);}
});
new MutationObserver(refreshBrand).observe(document.body,{childList:true,subtree:true});
new MutationObserver(refreshBrand).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
// Measure the content box, never the iframe viewport (which would prevent shrinking).
const shell=document.querySelector('.app-shell');
let sizeFrame=0,lastHeight=0;
function reportSize(){
 cancelAnimationFrame(sizeFrame);
 sizeFrame=requestAnimationFrame(()=>{
  const height=Math.ceil(shell?.getBoundingClientRect().height||0);
  if(height>0&&height!==lastHeight){lastHeight=height;parent.postMessage({type:'folkoop:city-size',height},location.origin);}
 });
}
if(shell)new ResizeObserver(reportSize).observe(shell);
window.addEventListener('load',reportSize);
window.addEventListener('hashchange',()=>{reportSize();parent.postMessage({type:'folkoop:city-route',screen:location.hash.slice(1)},location.origin);});
refreshBrand();reportSize();
})();
