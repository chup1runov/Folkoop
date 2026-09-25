/* FOLKOOP local workspace. No accounts, analytics, requests, payments or public posts. */
(() => {
  'use strict';
  const LANGS = ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];
  const ROUTES = ['home','people','together','projects','city','center','me','messages'];
  const KINDS = ['need','offer','purchase','resource','project','event'];
  const KEY = 'folkoop-workspace-v1';
  const text = (v, max) => typeof v === 'string' ? v.slice(0, max).trim() : '';
  function clean(input) {
    const x = input && typeof input === 'object' ? input : {};
    const p = x.profile && typeof x.profile === 'object' ? x.profile : {};
    return {version:1, profile:{name:text(p.name,60),skills:text(p.skills,200),about:text(p.about,600)},
      drafts:Array.isArray(x.drafts) ? x.drafts.slice(0,100).filter(d => d && KINDS.includes(d.kind) && /^[a-zA-Z0-9-]{1,80}$/.test(d.id || '') && text(d.title,100)).map(d=>({id:d.id,kind:d.kind,title:text(d.title,100),body:text(d.body,1500),done:d.done===true})) : []};
  }
  function workspace(storage) {
    let state = clean(null), persistent = false;
    try {const raw = storage?.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(parsed.version===1){state=clean(parsed);persistent=true;}}} catch { /* Blocked or corrupt storage: start safely in memory. */ }
    function write() {
      if(!persistent)return true;
      try {storage.setItem(KEY,JSON.stringify(state));return true;}catch {return false;}
    }
    return {
      get:()=>clean(state),
      isPersistent:()=>persistent,
      profile(p){state.profile=clean({profile:p}).profile;return write();},
      add(d){
        const item=clean({drafts:[d]}).drafts[0];
        if(!item || state.drafts.length>=100 || state.drafts.some(x=>x.id===item.id))return {ok:false,saved:false};
        state.drafts.unshift(item);return {ok:true,saved:write()};
      },
      toggle(id){const d=state.drafts.find(x=>x.id===id);if(d)d.done=!d.done;return write();},
      remove(id){state.drafts=state.drafts.filter(d=>d.id!==id);return write();},
      remember(enabled){
        if(enabled){try{storage.setItem(KEY,JSON.stringify(state));persistent=true;return true;}catch{return false;}}
        try{storage?.removeItem(KEY);persistent=false;return true;}catch{return false;}
      },
      clear(){try{storage?.removeItem(KEY);}catch{return false;}state=clean(null);persistent=false;return true;}
    };
  }
  const route = hash => {const value=String(hash||'').replace(/^#\/?/,'').split('/')[0];return ROUTES.includes(value)?value:'home';};
  const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  globalThis.FolkoopCore = Object.freeze({LANGS,ROUTES,KINDS,KEY,clean,workspace,route,escape});
})();
