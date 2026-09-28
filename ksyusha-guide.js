/* Lightweight local Ksyusha presence for FOLKOOP. No network/API calls. */
(() => {
'use strict';
const SOURCE='./ksyusha-source.webp';
let preparedSrc='',preparedPromise=null;
function transparentAsset(){
 if(preparedSrc)return Promise.resolve(preparedSrc);
 if(preparedPromise)return preparedPromise;
 preparedPromise=new Promise((resolve,reject)=>{
  const source=new Image();
  source.onload=()=>{
   try{
    const canvas=document.createElement('canvas'),w=source.naturalWidth,h=source.naturalHeight;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)throw new Error('CANVAS_UNAVAILABLE');
    ctx.drawImage(source,0,0);
    const frame=ctx.getImageData(0,0,w,h),data=frame.data,seen=new Uint8Array(w*h),stack=[];
    const candidate=i=>{
     const p=i*4,r=data[p],g=data[p+1],b=data[p+2],a=data[p+3],hi=Math.max(r,g,b),lo=Math.min(r,g,b);
     return a>0&&hi<98&&(hi-lo)<30;
    };
    const push=i=>{if(i>=0&&i<w*h&&!seen[i]&&candidate(i)){seen[i]=1;stack.push(i);}};
    for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}
    for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
    while(stack.length){
     const i=stack.pop(),p=i*4,x=i%w,y=(i/w)|0;data[p+3]=0;
     if(x>0)push(i-1);if(x<w-1)push(i+1);if(y>0)push(i-w);if(y<h-1)push(i+w);
    }
    ctx.putImageData(frame,0,0);
    preparedSrc=canvas.toDataURL('image/png');
    resolve(preparedSrc);
   }catch(error){reject(error);}
  };
  source.onerror=()=>reject(new Error('KSYUSHA_ASSET_FAILED'));
  source.src=SOURCE;
 });
 return preparedPromise;
}
function hydrateArt(el){
 el.style.visibility='hidden';
 transparentAsset().then(src=>{if(!el.isConnected)return;el.src=src;el.style.visibility='visible';})
 .catch(()=>{if(!el.isConnected)return;el.src=SOURCE;el.style.visibility='visible';el.classList.add('ksyusha-source-fallback');});
}
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
let actor=null,img=null,arm=null,currentTarget=null,currentMode='home',teleportTimer=0;

function ensureActor(){
 if(actor)return actor;
 actor=document.createElement('button');
 actor.id='ksyushaActor';
 actor.className='ksyusha-actor is-home';
 actor.type='button';
 actor.setAttribute('aria-label','Ksyusha · FOLKOOP helper');
 actor.setAttribute('aria-expanded','false');
 actor.innerHTML='<span class="ksyusha-puff" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="ksyusha-point-arm" aria-hidden="true"><i></i></span><img alt="" width="192" height="208" decoding="async">';
 document.body.append(actor);
 img=actor.querySelector('img');
 hydrateArt(img);
 arm=actor.querySelector('.ksyusha-point-arm');
 actor.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('folkoop:helper-toggle')));
 actor.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();actor.click();}});
 return actor;
}
function pose(name){
 ensureActor();
 actor.dataset.pose=name;
}
function dims(){
 const mobile=innerWidth<720;
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
function applyPosition(target,mode='point'){
 ensureActor();
 currentTarget=target||null;currentMode=mode;
 const {w,h}=dims();
 actor.style.setProperty('--ksyusha-w',w+'px');
 actor.classList.toggle('is-perched',mode==='perch');
 actor.classList.toggle('is-home',mode==='home');
 actor.classList.toggle('is-tour',mode!=='home');
 if(mode==='home'||!target){
  actor.style.left='auto';actor.style.top='auto';actor.style.right=innerWidth<720?'10px':'18px';actor.style.bottom=innerWidth<720?'10px':'18px';
  arm.hidden=true;pose('idle');actor.disabled=false;actor.setAttribute('aria-expanded','false');return;
 }
 actor.style.right='auto';actor.style.bottom='auto';actor.disabled=true;
 const r=target.getBoundingClientRect();
 let x,y;
 if(mode==='perch'){
  x=clamp(r.left+r.width/2-w/2,8,innerWidth-w-8);
  y=clamp(r.top-h*.62,8,innerHeight-h-8);
 }else{
  const leftSpace=r.left,rightSpace=innerWidth-r.right;
  if(rightSpace>=w+34){x=r.right+20;y=r.top+r.height/2-h/2;}
  else if(leftSpace>=w+34){x=r.left-w-20;y=r.top+r.height/2-h/2;}
  else{x=clamp(r.left+r.width/2-w/2,8,innerWidth-w-8);y=clamp(r.top-h-18,8,innerHeight-h-8);}
  x=clamp(x,8,innerWidth-w-8);y=clamp(y,8,innerHeight-h-8);
 }
 actor.style.left=x+'px';actor.style.top=y+'px';
 pose(mode==='perch'?'calm':'point');
 requestAnimationFrame(()=>{
  if(mode==='point'&&target.isConnected)setPoint(target.getBoundingClientRect(),actor.getBoundingClientRect());
  else arm.hidden=true;
 });
}
function teleportTo(target,opts={}){
 const mode=opts.mode||'point';
 ensureActor();
 clearTimeout(teleportTimer);
 if(reduced()||opts.instant){applyPosition(target,mode);return;}
 actor.classList.remove('teleport-in');
 actor.classList.add('teleport-out');
 teleportTimer=setTimeout(()=>{
  applyPosition(target,mode);
  actor.classList.remove('teleport-out');
  void actor.offsetWidth;
  actor.classList.add('teleport-in');
  teleportTimer=setTimeout(()=>actor.classList.remove('teleport-in'),380);
 },150);
}
function home(opts={}){
 ensureActor();teleportTo(null,{mode:'home',instant:opts.instant});
}
function welcome(){
 ensureActor();actor.hidden=true;actor.disabled=true;arm.hidden=true;actor.classList.add('is-welcome');pose('welcome');
}
function leaveWelcome(){
 ensureActor();actor.hidden=false;actor.classList.remove('is-welcome');
}
function element(){return ensureActor();}
function refresh(){
 if(currentMode==='home')applyPosition(null,'home');
 else if(currentTarget?.isConnected)applyPosition(currentTarget,currentMode);
}
function setExpanded(value){ensureActor().setAttribute('aria-expanded',String(!!value));}

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
 hydrateArt(gate.querySelector('.ksyusha-language-character img'));
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
 gate.hidden=false;document.body.classList.add('language-gate-open');welcome();
 requestAnimationFrame(()=>choices.querySelector('.is-current,button')?.focus());
}
function hideLanguageGate(){
 const gate=ensureLanguageGate();gate.hidden=true;document.body.classList.remove('language-gate-open');leaveWelcome();
}
window.addEventListener('resize',refresh,{passive:true});
globalThis.FolkoopKsyushaGuide=Object.freeze({element,teleportTo,home,welcome,showLanguageGate,hideLanguageGate,refresh,setExpanded});
})();