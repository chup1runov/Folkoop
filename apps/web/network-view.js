/* Presentation-only helpers for the network UI. No Auth, IO or DOM access. */
(() => {
'use strict';
function create({escape,accountText,cooperationText,locale}={}){
 if([escape,accountText,cooperationText,locale].some(fn=>typeof fn!=='function'))throw new TypeError('Network view helpers require explicit functions');
 // Preserve the established HTML and locale contracts while moving rendering out of the UI controller.
 const esc=escape,t=accountText,ct=cooperationText,lang=locale;
const btn=(action,label,id='')=>`<button class="button secondary" type="button" data-net="${action}" data-id="${esc(id)}">${esc(t(label))}</button>`;
const field=(name,label,value='',max=100,area=false)=>`<label>${esc(t(label))}${area?`<textarea name="${name}" maxlength="${max}" rows="3">${esc(value)}</textarea>`:`<input name="${name}" maxlength="${max}" value="${esc(value)}"${name==='name'?' required':''}>`}</label>`;

function localDateTime(value){
 if(!value)return '';
 const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';
 const pad=n=>String(n).padStart(2,'0');
 return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
}

function formatWhen(value){
 if(!value)return '';
 const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';
 try{return new Intl.DateTimeFormat(lang(),{dateStyle:'medium',timeStyle:'short'}).format(d);}
 catch{return d.toISOString().slice(0,16).replace('T',' ');}
}

function coopDisclosure(key,title,count,body,open=false){
 return `<details class="coop-disclosure" data-coop-section="${esc(key)}"${open?' open':''}><summary><span>${esc(title)}</span>${count!==''?`<span class="coop-section-count">${esc(String(count))}</span>`:''}</summary><div class="coop-disclosure-body">${body}</div></details>`;
}

function projectSearch(){
 const label={en:'Search',sv:'Sök',ru:'Поиск',uk:'Пошук',fi:'Haku',bs:'Pretraga',ar:'بحث',fa:'جستجو',so:'Raadi',ku:'Lêgerîn',es:'Buscar'}[lang()]||'Search';
 return `<label class="project-search"><span>${esc(label)}</span><input id="networkProjectSearch" type="search" autocomplete="off"></label><p id="projectSearchEmpty" class="empty" role="status" hidden>${esc(ct('empty'))}</p>`;
}
 return Object.freeze({btn,field,localDateTime,formatWhen,coopDisclosure,projectSearch});
}
globalThis.FolkoopNetworkView=Object.freeze({create});
})();
