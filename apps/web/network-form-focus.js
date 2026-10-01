/* Keep an in-progress cooperation input focused across network-panel renders.
   No storage: the detached control survives only until the next DOM update. */
(() => {
'use strict';
const host=document.getElementById('networkPanel');if(!host)return;
let editing=null;
const editable=el=>el?.matches?.('input:not([type="hidden"]),textarea,select');
document.addEventListener('focusin',e=>{
 const field=e.target,form=field.form;
 editing=editable(field)&&form?.id==='netCoopCreate'&&host.contains(form)
  ?{field,hash:location.hash}:null;
});
new MutationObserver(()=>{
 if(!editing||editing.field.isConnected)return;
 const saved=editing;editing=null;
 // A navigation or an intentional focus move must not be undone.
 if(saved.hash!==location.hash)return;
 const active=document.activeElement;
 if(active&&active!==document.body&&active!==document.documentElement)return;
 const form=host.querySelector('#netCoopCreate');
 const next=form?.elements.namedItem(saved.field.name);
 if(!editable(next)||next.disabled||next.type==='hidden')return;
 const changed=next.value!==saved.field.value;
 next.value=saved.field.value;
 next.focus({preventScroll:true});
 if(typeof saved.field.selectionStart==='number'){
  next.setSelectionRange(saved.field.selectionStart,saved.field.selectionEnd,saved.field.selectionDirection);
 }
 next.scrollTop=saved.field.scrollTop;
 next.scrollLeft=saved.field.scrollLeft;
 // Keep the application's existing draft handler in sync if replacement
 // occurred between the browser updating the value and its input event.
 if(changed)next.dispatchEvent(new Event('input',{bubbles:true}));
}).observe(host,{childList:true});
})();
