/* Lightweight local Ksyusha presence for FOLKOOP. No network/API calls. */
(() => {
'use strict';
const ASSETS=Object.freeze({
 welcome:'./ksyusha-wave.webp',
 calm:'./ksyusha-idle.webp',
 point:'./ksyusha-idle.webp',
 idle:'./ksyusha-idle.webp'
});
const prepared=new Map();
function transparentAsset(src){
 if(prepared.has(src))return prepared.get(src);
 const promise=new Promise((resolve,reject)=>{
  const source=new Image();
  source.onload=()=>{
   try{
    const w=source.naturalWidth,h=source.naturalHeight,canvas=document.createElement('canvas');
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)throw new Error('CANVAS_UNAVAILABLE');
    ctx.drawImage(source,0,0);
    const frame=ctx.getImageData(0,0,w,h),data=frame.data,seen=new Uint8Array(w*h),stack=[];
    const dark=i=>{
     const p=i*4,r=data[p],g=data[p+1],b=data[p+2],a=data[p+3],hi=Math.max(r,g,b),lo=Math.min(r,g,b);
     return a>0&&hi<105&&(hi-lo)<34;
    };
    const push=i=>{if(i>=0&&i<w*h&&!seen[i]&&dark(i)){seen[i]=1;stack.push(i);}};
    for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}
    for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
    while(stack.length){
     const i=stack.pop(),p=i*4,x=i%w,y=(i/w)|0;data[p+3]=0;
     if(x>0)push(i-1);if(x<w-1)push(i+1);if(y>0)push(i-w);if(y<h-1)push(i+w);
    }
    ctx.putImageData(frame,0,0);
    resolve(canvas.toDataURL('image/png'));
   }catch(error){reject(error);}
  };
  source.onerror=()=>reject(new Error('KSYUSHA_ASSET_FAILED'));
  source.src=src;
 });
 prepared.set(src,promise);return promise;
}
// Reuse prepared art without blanking it on every step/resize. A late image
// result must never replace a newer requested pose.
const artRequests=new WeakMap();
function setArt(el,src){
 if(artRequests.get(el)?.src===src)return;
 const request={src};artRequests.set(el,request);
 if(!el.getAttribute('src'))el.style.visibility='hidden';
 const install=(value,fallback=false)=>{
  if(!el.isConnected||artRequests.get(el)!==request)return;
  el.src=value;el.style.visibility='visible';
  el.classList.toggle('ksyusha-source-fallback',fallback);
 };
 transparentAsset(src).then(value=>install(value)).catch(()=>install(src,true));
}
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
let actor=null,img=null,arm=null,currentTarget=null,currentMode='home',teleportTimer=0,motionGeneration=0,refreshFrame=0;

function ensureActor(){
 if(actor)return actor;
 actor=document.createElement('button');
 actor.id='ksyushaActor';
 actor.className='ksyusha-actor is-home';
 actor.type='button';
 actor.setAttribute('aria-label','Ksyusha · FOLKOOP helper');
 actor.setAttribute('aria-expanded','false');
 actor.setAttribute('aria-controls','folkoopHelperPanel');
 actor.innerHTML='<span class="ksyusha-puff" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="ksyusha-point-arm" aria-hidden="true"><i></i></span><img alt="" width="192" height="208" decoding="async">';
 document.body.append(actor);
 img=actor.querySelector('img');setArt(img,ASSETS.idle);
 arm=actor.querySelector('.ksyusha-point-arm');
 actor.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('folkoop:helper-toggle')));
 actor.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();actor.click();}});
 return actor;
}
function pose(name){
 ensureActor();
 setArt(img,ASSETS[name]||ASSETS.idle);
 actor.dataset.pose=name;
}
function dims(){
 const mobile=innerWidth<720||innerHeight<520;
 const w=mobile?86:118;
 return {w,h:w*(208/192)};
}
function setPoint(targetRect,actorRect){
 const ax=actorRect.width*.55, ay=actorRect.height*.39;
 const fromX=actorRect.left+ax,fromY=actorRect.top+ay;
 const tx=targetRect.left+targetRect.width/2,ty=targetRect.top+targetRect.height/2;
 const dx=tx-fromX,dy=ty-fromY;
 const dist=clamp(Math.hypot(dx,dy),34,Math.min(150,innerWidth*.28));
 const angle=Math.atan2(dy,dx)*180/Math.PI;
 arm.style.setProperty('--point-angle',angle+'deg');
 arm.style.setProperty('--point-length',dist+'px');
 arm.hidden=false;
 actor.dataset.pointSide=dx<0?'left':'right';
}
// Both dialogs are local presentation UI. Only their own controls are observed;
// no messages, account data or user activity history are inspected or retained.
let modal=null,returnFocus=null,redirectingFocus=false;
const inertBefore=new Map();
const focusables=root=>Array.from(root.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(e=>!e.closest('[hidden],[inert]')&&e.getClientRects().length);
function focusModal(){
 if(!modal)return;
 const preferred=modal.querySelector('[data-onboarding="next"]')||modal.querySelector('.is-current')||focusables(modal)[0];
 (preferred||modal).focus({preventScroll:true});
}
function closeModal(restore=true){
 if(!modal)return;
 const previous=returnFocus;modal=null;returnFocus=null;
 for(const [el,value] of inertBefore)if(el.isConnected)el.inert=value;
 inertBefore.clear();
 document.body.classList.remove('guide-tour-open');
 document.body.style.removeProperty('--guide-card-height');
 if(restore){
  const destination=previous?.isConnected&&!previous.closest('[hidden],[inert]')&&previous!==document.body?previous:actor;
  destination?.focus({preventScroll:true});
 }
}
function openModal(root){
 if(modal===root){if(!root.contains(document.activeElement))focusModal();return;}
 closeModal(false);returnFocus=document.activeElement;modal=root;
 root.tabIndex=-1;
 document.body.classList.toggle('guide-tour-open',root.id==='onboarding');
 for(const el of document.body.children){
  if(el===root||['SCRIPT','STYLE','LINK'].includes(el.tagName))continue;
  inertBefore.set(el,el.inert);el.inert=true;
 }
 focusModal();
}
document.addEventListener('focusin',event=>{
 if(!modal||modal.hidden||modal.contains(event.target)||redirectingFocus)return;
 redirectingFocus=true;focusModal();redirectingFocus=false;
},true);
document.addEventListener('keydown',event=>{
 if(!modal||modal.hidden||event.key!=='Tab')return;
 const controls=focusables(modal);
 if(!controls.length){event.preventDefault();modal.focus({preventScroll:true});return;}
 const first=controls[0],last=controls[controls.length-1],active=document.activeElement;
 if(event.shiftKey&&(active===first||!controls.includes(active))){event.preventDefault();last.focus({preventScroll:true});}
 else if(!event.shiftKey&&(active===last||!controls.includes(active))){event.preventDefault();first.focus({preventScroll:true});}
},true);
function overlap(a,b){
 return b?Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)):0;
}
function activeTour(){const root=document.getElementById('onboarding');return root&&!root.hidden?root:null;}
function updateSpotlight(target){
 const root=activeTour(),spot=root?.querySelector('#onboardingSpotlight');
 if(!spot||!target?.isConnected)return;
 const r=target.getBoundingClientRect(),left=Math.max(6,r.left-7),top=Math.max(6,r.top-7);
 spot.style.left=left+'px';spot.style.top=top+'px';
 spot.style.width=Math.max(0,Math.min(innerWidth-6,r.right+7)-left)+'px';
 spot.style.height=Math.max(0,Math.min(innerHeight-6,r.bottom+7)-top)+'px';
}
function layoutTour(target){
 const root=activeTour();
 if(!root){if(modal?.id==='onboarding')closeModal();return;}
 openModal(root);
 const card=root.querySelector('.onboarding-card');
 if(!card||!target?.isConnected)return;
 card.setAttribute('aria-describedby','onboardingBody');
 const copy=root.querySelector('#onboardingBody'),step=root.querySelector('#onboardingProgress')?.textContent;
 if(copy){
  copy.tabIndex=0;
  copy.setAttribute('role','region');
  copy.setAttribute('aria-labelledby','onboardingTitle');
  if(card.dataset.guideStep!==step){card.scrollTop=0;copy.scrollTop=0;card.dataset.guideStep=step;}
 }
 const mobile=innerWidth<=720,short=innerHeight<520,gap=mobile||short?12:24;
 const helper=target===actor;
 let r=target.getBoundingClientRect();
 const left=r.left+r.width/2>=innerWidth/2;
 card.style.width=(mobile?innerWidth-24:Math.min(500,innerWidth-48))+'px';
 card.style.maxHeight=Math.floor((mobile||short)?innerHeight*.44:Math.min(innerHeight*.72,620))+'px';
 card.style.left=left||mobile?gap+'px':'auto';
 card.style.right=left&&!mobile?'auto':gap+'px';
 card.style.top=helper&&mobile?gap+'px':'auto';
 card.style.bottom=helper&&mobile?'auto':gap+'px';
 const c=card.getBoundingClientRect();
 document.body.style.setProperty('--guide-card-height',Math.ceil(c.height)+'px');
 if(!helper){
  const sidebar=target.closest('.sidebar');
  const top=Math.max(12,sidebar?sidebar.getBoundingClientRect().top+10:12);
  const crossesCard=r.left<c.right&&r.right>c.left;
  const bottom=crossesCard?c.top-12:innerHeight-12;
  if(bottom>top&&r.height<=bottom-top&&(r.top<top||r.bottom>bottom)){
   const delta=r.top+r.height/2-(top+bottom)/2;
   if(sidebar)sidebar.scrollTop+=delta;
   else window.scrollBy({top:delta,behavior:'instant'});
  }
 }
 updateSpotlight(target);
}
function applyPosition(target,mode='point'){
 ensureActor();currentTarget=target||null;currentMode=mode;
 const {w,h}=dims();actor.style.setProperty('--ksyusha-w',w+'px');
 actor.classList.toggle('is-perched',mode==='perch');
 actor.classList.toggle('is-home',mode==='home');
 actor.classList.toggle('is-tour',mode!=='home');
 if(mode==='home'||!target){
  actor.style.left='auto';actor.style.top='auto';actor.style.right=innerWidth<720?'10px':'18px';actor.style.bottom=innerWidth<720?'10px':'18px';
  arm.hidden=true;pose('idle');actor.disabled=false;actor.setAttribute('aria-expanded',String(document.getElementById('folkoopHelperPanel')?.hidden===false));return;
 }
 actor.style.right='auto';actor.style.bottom='auto';actor.disabled=true;
 const r=target.getBoundingClientRect(),card=activeTour()?.querySelector('.onboarding-card')?.getBoundingClientRect();
 const candidates=mode==='perch'?[[r.left+r.width/2-w/2,r.top-h*.62]]:[];
 candidates.push([r.right+16,r.top+r.height/2-h/2],[r.left-w-16,r.top+r.height/2-h/2],[r.left+r.width/2-w/2,r.top-h-16],[r.left+r.width/2-w/2,r.bottom+16],[12,12],[innerWidth-w-12,12]);
 const best=candidates.map(([x,y],index)=>{
  x=clamp(x,12,innerWidth-w-12);y=clamp(y,12,innerHeight-h-12);
  const box={left:x,top:y,right:x+w,bottom:y+h};
  const distance=Math.hypot(x+w/2-r.left-r.width/2,y+h/2-r.top-r.height/2);
  return {x,y,score:overlap(box,card)*10000+(mode==='perch'?0:overlap(box,r)*100)+distance+index*.01};
 }).sort((a,b)=>a.score-b.score)[0];
 actor.style.left=best.x+'px';actor.style.top=best.y+'px';pose(mode==='perch'?'calm':'point');
 const generation=motionGeneration;
 requestAnimationFrame(()=>{
  if(generation!==motionGeneration||currentTarget!==target||currentMode!==mode)return;
  if(mode==='point'&&target.isConnected)setPoint(target.getBoundingClientRect(),actor.getBoundingClientRect());
  else arm.hidden=true;
 });
}
function cancelTeleport(){
 clearTimeout(teleportTimer);teleportTimer=0;motionGeneration++;
 actor?.classList.remove('teleport-in','teleport-out');
}
function teleportTo(target,opts={}){
 const mode=opts.mode||'point';ensureActor();cancelTeleport();
 currentTarget=target||null;currentMode=mode;
 if(mode==='home'){
  applyPosition(null,'home');layoutTour(actor);
  // Returning to the helper must be immediately usable, even when a previous
  // teleport was interrupted by Skip, Escape, resize, or a fast Next click.
  return;
 }
 layoutTour(target);
 if(reduced()||opts.instant){applyPosition(target,mode);return;}
 const generation=motionGeneration;actor.classList.add('teleport-out');
 teleportTimer=setTimeout(()=>{
  if(generation!==motionGeneration)return;
  applyPosition(target,mode);actor.classList.remove('teleport-out');
  void actor.offsetWidth;actor.classList.add('teleport-in');
  teleportTimer=setTimeout(()=>{if(generation===motionGeneration)actor.classList.remove('teleport-in');},380);
 },150);
}
function home(opts={}){ensureActor();teleportTo(null,{mode:'home',instant:opts.instant});}
function welcome(){
 ensureActor();cancelTeleport();actor.hidden=true;actor.disabled=true;arm.hidden=true;actor.classList.add('is-welcome');pose('welcome');
}
function leaveWelcome(){
 ensureActor();actor.hidden=false;actor.classList.remove('is-welcome');
}
function element(){return ensureActor();}
function refresh(){
 cancelTeleport();
 if(currentMode==='home'){applyPosition(null,'home');layoutTour(actor);}
 else if(currentTarget?.isConnected){layoutTour(currentTarget);applyPosition(currentTarget,currentMode);}
}
function setExpanded(value){
 ensureActor().setAttribute('aria-expanded',String(!!value));
 queueMicrotask(()=>{
  const title=document.getElementById('folkoopHelperTitle')?.textContent,label=document.getElementById('folkoopHelperLabel')?.textContent;
  if(title&&label)actor.setAttribute('aria-label',title+' · '+label);
 });
}

function ensureLanguageGate(){
 let gate=document.getElementById('ksyushaLanguageGate');
 if(gate)return gate;
 gate=document.createElement('section');
 gate.id='ksyushaLanguageGate';
 gate.className='ksyusha-language-gate';
 gate.hidden=true;
 gate.setAttribute('role','dialog');
 gate.setAttribute('aria-modal','true');
 gate.setAttribute('aria-labelledby','ksyushaLanguageTitle');
 gate.innerHTML='<div class="ksyusha-language-backdrop"></div><div class="ksyusha-language-card"><div class="ksyusha-language-character"><img alt="" width="192" height="208"></div><div class="ksyusha-language-copy"><p class="eyebrow">FOLKOOP</p><h1 id="ksyushaLanguageTitle">Hej! · Hi! · Привет!</h1><p class="ksyusha-language-hello">Jag heter Ksyusha · I’m Ksyusha · Меня зовут Ксюша</p><p class="ksyusha-language-prompt">Välj språk · Choose language · Выбери язык</p><div id="ksyushaLanguageChoices" class="ksyusha-language-choices"></div></div></div>';
 document.body.append(gate);
 setArt(gate.querySelector('.ksyusha-language-character img'),ASSETS.welcome);
 gate.addEventListener('click',e=>{
  const b=e.target.closest('[data-ksyusha-lang]');
  if(!b)return;
  const language=b.dataset.ksyushaLang;
  window.dispatchEvent(new CustomEvent('folkoop:language-picked',{detail:{language}}));
 });
 return gate;
}
function showLanguageGate(langs,names,current){
 const gate=ensureLanguageGate(),choices=gate.querySelector('#ksyushaLanguageChoices');
 choices.innerHTML=langs.map(code=>'<button type="button" class="ksyusha-language-choice'+(code===current?' is-current':'')+'" data-ksyusha-lang="'+code+'"><strong>'+String(names[code]||code).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))+'</strong><span>'+code.toUpperCase()+'</span></button>').join('');
 gate.hidden=false;document.body.classList.add('language-gate-open');welcome();openModal(gate);
 requestAnimationFrame(()=>choices.querySelector('.is-current,button')?.focus());
}
function hideLanguageGate(){
 const gate=ensureLanguageGate();gate.hidden=true;document.body.classList.remove('language-gate-open');closeModal(false);leaveWelcome();
}
window.addEventListener('resize',refresh,{passive:true});
window.visualViewport?.addEventListener('resize',refresh,{passive:true});
window.addEventListener('scroll',()=>{
 if(refreshFrame||!activeTour())return;
 refreshFrame=requestAnimationFrame(()=>{
  refreshFrame=0;
  const target=currentMode==='home'?actor:currentTarget;
  if(target?.isConnected){updateSpotlight(target);if(currentMode!=='home')applyPosition(target,currentMode);}
 });
},{passive:true,capture:true});
globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',refresh);
globalThis.FolkoopKsyushaGuide=Object.freeze({element,teleportTo,home,welcome,showLanguageGate,hideLanguageGate,refresh,setExpanded});
})();