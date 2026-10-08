/* Progressive presentation of Mura's existing authored notes. No network or persistence.
   Original links remain ordinary links/actions into the same read-only account. */
(() => {
'use strict';
let selectedChapter='need';
function nextIndex(current,key,length,rtl=false){
 if(!Number.isInteger(length)||length<1)return null;
 if(key==='Home')return 0;
 if(key==='End')return length-1;
 if(key!=='ArrowLeft'&&key!=='ArrowRight')return null;
 const delta=(key==='ArrowRight'?1:-1)*(rtl?-1:1);
 return (current+delta+length)%length;
}
function enhance(root){
 if(!root||root.dataset.presentationReady)return;
 const panels=Array.from(root.querySelectorAll('[data-mura-chapter]'));
 if(!panels.length)return;
 const heading=root.querySelector('#muraLifeTitle');
 const list=document.createElement('div');
 list.className='mura-chapter-nav';list.setAttribute('role','tablist');
 list.setAttribute('aria-labelledby',heading?.id||'muraLifeTitle');
 const tabs=panels.map((panel,index)=>{
  const key=panel.dataset.muraChapter,tab=document.createElement('button');
  tab.type='button';tab.className='mura-chapter-tab';tab.id='mura-tab-'+key;
  tab.dataset.muraSelect=key;tab.setAttribute('role','tab');
  tab.setAttribute('aria-controls','mura-panel-'+key);
  const number=document.createElement('span');number.className='mura-chapter-number';
  number.textContent=String(index+1).padStart(2,'0');number.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.textContent=panel.querySelector('.mura-life-kicker')?.textContent||key;
  tab.append(number,label);list.append(tab);
  panel.id='mura-panel-'+key;panel.setAttribute('role','tabpanel');
  panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;
  return tab;
 });
 function select(index,focus){
  selectedChapter=panels[index].dataset.muraChapter;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
  if(focus){tabs[index].focus({preventScroll:true});tabs[index].scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
 }
 list.addEventListener('click',event=>{const tab=event.target.closest('[role="tab"]');const index=tabs.indexOf(tab);if(index>=0)select(index,true);});
 list.addEventListener('keydown',event=>{
  const index=tabs.indexOf(event.target);if(index<0)return;
  const next=nextIndex(index,event.key,tabs.length,getComputedStyle(list).direction==='rtl');
  if(next!==null){event.preventDefault();select(next,true);}
 });
 root.querySelector('.mura-life-timeline').before(list);
 root.dataset.presentationReady='true';
 select(Math.max(0,panels.findIndex(panel=>panel.dataset.muraChapter===selectedChapter)),false);
}
globalThis.FolkoopMuraPresentation=Object.freeze({enhance,nextIndex});
if(typeof document==='undefined')return;
function refresh(){document.querySelectorAll('.mura-home .mura-life:not([data-presentation-ready])').forEach(enhance);}
const host=document.getElementById('networkPanel');
if(host){new MutationObserver(refresh).observe(host,{childList:true,subtree:true});refresh();}
window.addEventListener('folkoop:guest-demo',event=>{if(event.detail?.enabled===false)selectedChapter='need';});
})();
