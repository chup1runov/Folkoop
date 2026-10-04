(()=>{'use strict';
const screens=[...document.querySelectorAll('.screen')];
const nav=[...document.querySelectorAll('[data-screen]')];
function show(id){
  screens.forEach(x=>x.classList.toggle('active',x.id==='screen-'+id));
  nav.forEach(x=>x.classList.toggle('active',x.dataset.screen===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
nav.forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));
document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.jump)));
const sub=[...document.querySelectorAll('[data-panel]')];
sub.forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.panel;
  sub.forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('[data-panel-id]').forEach(x=>x.classList.toggle('active',x.dataset.panelId===id));
}));
const layers=document.querySelector('#layers');
document.querySelector('#toggleLayers').addEventListener('click',()=>layers.hidden=!layers.hidden);
document.querySelector('#closeLayers').addEventListener('click',()=>layers.hidden=true);
})();