/* R1 forms inside existing Project/Resource details. Ephemeral drafts only.
   The SQL layer owns permissions; declarations are not reservations or outcomes. */
(() => {
  'use strict';
  const UNITS={consumable:['piece','kg','litre','metre','m2','m3','pack'],equipment:['piece'],work:['hour']};
  const REPAIR='00000000-0000-4000-8000-000000000306';
  const unitSymbols={kg:'kg',litre:'L',metre:'m',m2:'m²',m3:'m³'};
  function create({api,documentRef=globalThis.document,confirm=message=>globalThis.confirm(message),download,uuid=()=>globalThis.crypto.randomUUID()}={}) {
    const doc=documentRef;
    let root=null,ctx=null,scope='',generation=0,state=null,disposed=false;
    const text=key=>globalThis.FolkoopResourceCopy.get(ctx?.language||'en')[key]||key;
    const unit=u=>unitSymbols[u]||text(u);
    function fresh(n){return !disposed&&n===generation&&ctx&&scope===scopeOf(ctx);}
    function scopeOf(c){return c ? [c.user?.id,c.coop?.id,c.coop?.kind,!!c.readOnly,!!c.owner,!!c.member,c.readOnly?'demo':api?.context?.()?.epoch].join(':') : '';}
    function reset(){generation++;state={entries:[],draft:null,selected:null,revision:0,loaded:false,pending:false,locked:false,dirty:false,status:'',cursor:null};}
    function el(tag,content='',attributes={}) {
      const node=doc.createElement(tag); if(content!=='')node.textContent=String(content);
      for(const [name,value] of Object.entries(attributes))node.setAttribute(name,String(value));
      return node;
    }
    function button(key,action,disabled=false){const b=el('button',text(key),{type:'button','data-rp-action':action,class:'button secondary'});b.disabled=disabled||state.pending||!!ctx.busy;return b;}
    function blank(){return {id:ctx.coop.kind==='project'?uuid():undefined,title:'',kind:'consumable',quantity:'',unit:'kg',from:'',until:'',conditions:''};}
    function draftOf(entry){return {...entry.value,from:entry.value.from||'',until:entry.value.until||''};}
    function choose(entry=null){state.selected=entry?.value.id||null;state.revision=entry?.revision||0;state.draft=entry?draftOf(entry):blank();state.dirty=false;}
    function field(form,key,name,value,{area=false,required=false,max=1000}={}) {
      const label=el('label',text(key)),input=el(area?'textarea':'input','',{name});
      input.value=value??'';input.maxLength=max;input.required=required;
      if(area)input.rows=3;
      else {input.type='text';if(name==='quantity')input.inputMode='decimal';}
      if(name==='from'||name==='until')input.placeholder='2026-10-10T09:00:00+02:00';
      label.append(input);form.append(label);return input;
    }
    function selectField(form,key,name,values,value,labeler=text){
      const label=el('label',text(key)),select=el('select','',{name});
      for(const v of values){const opt=el('option',labeler(v),{value:v});opt.selected=v===value;select.append(opt);}
      label.append(select);form.append(label);return select;
    }
    function statusFor(error) {
      if(error?.code==='STALE'||error?.code==='AUTH_REQUIRED')return 'session';
      if(error?.code==='RESOURCE_CONFLICT')return 'conflict';
      if(error?.code==='RESOURCE_SCHEMA_UNAVAILABLE'||error?.code==='DISABLED')return 'unavailable';
      if(/^(INVALID_(INPUT|ID|TEXT|TIME|QUANTITY|DIMENSION|WINDOW|REVISION)|UNKNOWN_FIELD|INDIVISIBLE_QUANTITY|INCOMPLETE_WINDOW|WINDOW_REQUIRED)$/.test(error?.code||''))return 'invalid';
      return 'error';
    }
    async function load({keepSelection=true}={}){
      if(!ctx||ctx.readOnly||!api||state.pending)return;
      if(ctx.coop.kind==='resource'&&!ctx.owner)return;
      const n=generation,oldSelection=keepSelection?state.selected:null;
      state.pending=true;state.status='loading';draw();
      try{
        if(ctx.coop.kind==='project'){
          const entries=await api.requirements(ctx.coop.id);if(!fresh(n))return;
          state.entries=entries;
          if(ctx.owner)choose(entries.find(e=>e.value.id===oldSelection)||null);
        } else {
          const entry=await api.availability(ctx.coop.id);if(!fresh(n))return;
          state.entries=entry.value?[entry]:[];state.draft=entry.value?draftOf(entry):blank();state.revision=entry.revision;state.dirty=false;
        }
        state.loaded=true;state.locked=false;state.status='';
      }catch(error){if(fresh(n)){state.locked=true;state.status=statusFor(error);}}
      finally{if(fresh(n)){state.pending=false;draw();}}
    }
    async function mutate(action){
      if(!ctx||ctx.readOnly||!ctx.owner||!state.loaded||state.locked||state.pending||ctx.busy)return;
      const n=generation;
      if(action==='remove'&&!confirm(text('confirm')))return;
      state.pending=true;state.status='loading';draw();
      try {
        if(action==='save'){
          const d=state.draft,dimensions={kind:d.kind,quantity:d.quantity,unit:d.unit,from:d.from||null,until:d.until||null,conditions:d.conditions};
          if(ctx.coop.kind==='project')await api.saveRequirement({id:d.id,projectId:ctx.coop.id,flowId:d.flowId||null,title:d.title,...dimensions},state.revision);
          else await api.saveAvailability({resourceId:ctx.coop.id,...dimensions},state.revision);
        } else if(ctx.coop.kind==='project')await api.removeRequirement(ctx.coop.id,state.draft.id,state.revision);
        else await api.removeAvailability(ctx.coop.id,state.revision);
        if(!fresh(n))return;
        // A write acknowledgement is not a physical handover. Reload before further edits.
        state.pending=false;state.dirty=false;
        if(action==='remove')state.selected=null;
        await load();if(!fresh(n))return;
        if(!state.locked)state.status=action==='save'?'saved':'removed';
      }catch(error){
        if(fresh(n)){state.status=statusFor(error);state.locked=state.status!=='invalid';}
      }finally{if(fresh(n)){state.pending=false;draw();}}
    }
    function saveDownload(page){
      if(download){download(page);return;}
      const url=URL.createObjectURL(new Blob([JSON.stringify(page,null,2)],{type:'application/json'}));
      const a=el('a','',{href:url,download:'folkoop-resource-planning-page.json'});a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    async function exportPage(){
      if(!ctx||ctx.readOnly||!api||state.pending||ctx.busy)return;
      const n=generation;state.pending=true;state.status='loading';draw();
      try{
        const page=await api.exportPage(ctx.coop.kind==='project'?'requirements':'availability',state.cursor,100);
        if(!fresh(n))return;
        saveDownload(page);state.cursor=page.next_cursor;state.status='exportNote';
      }catch(error){if(fresh(n))state.status=statusFor(error);}
      finally{if(fresh(n)){state.pending=false;draw();}}
    }
    function onInput(event){
      const input=event.target;if(!input?.name||!state?.draft)return;event.stopPropagation();
      if(!['title','kind','quantity','unit','from','until','conditions'].includes(input.name)||state.pending||ctx.readOnly)return;
      state.draft[input.name]=input.value;state.dirty=true;
      if(input.name==='kind'){
        if(!UNITS[input.value])return;
        if(!UNITS[input.value].includes(state.draft.unit))state.draft.unit=UNITS[input.value][0];
        draw();root.querySelector('[name="kind"]')?.focus();
      }
    }
    function bind(){
      root.oninput=onInput;
      root.onchange=e=>{if(e.target?.tagName==='SELECT')onInput(e);};
      root.onsubmit=e=>{e.preventDefault();e.stopPropagation();void mutate('save');};
      root.onclick=e=>{
        const b=e.target.closest?.('[data-rp-action]');if(!b||!root.contains(b))return;
        e.preventDefault();e.stopPropagation();if(b.disabled||state.pending||ctx.busy)return;
        const action=b.dataset.rpAction;
        if(action==='refresh'){
          if(state.dirty&&!confirm(text('discard')))return;
          void load();
        } else if(action==='remove')void mutate('remove');
        else if(action==='export')void exportPage();
        else if(action==='add'){
          if(state.dirty&&!confirm(text('discard')))return;
          choose();state.status='';draw();root.querySelector('[name="title"]')?.focus();
        } else if(action==='edit'){
          if(state.dirty&&!confirm(text('discard')))return;
          const entry=state.entries.find(x=>x.value.id===b.dataset.rpId);if(!entry)return;
          choose(entry);state.status='';draw();root.querySelector('[name="title"]')?.focus();
        }
      };
    }
    function draw(){
      if(!root||!ctx||disposed)return;
      root.replaceChildren();root.classList.add('resource-planning');root.setAttribute('aria-busy',String(state.pending));bind();
      root.append(el('h3',text(ctx.coop.kind==='project'?'requirements':'availability')));
      root.append(el('p',text(ctx.coop.kind==='project'?'audienceProject':'audienceOwner'),{class:'meta'}));
      root.append(el('p',text('boundary'),{class:'meta'}));
      if(ctx.readOnly){
        // Mura stays in-character: show authored planning data, not demo/meta chrome.
        if(ctx.coop.id===REPAIR){
          const list=el('ul');for(const [k,q,u] of [['equipment','2','piece'],['consumable','5','kg'],['work','4','hour']])list.append(el('li',`${text(k)} — ${q} ${unit(u)}`));root.append(list);
        }else root.append(el('p',text('empty')));
        return; // no writes, login prompts, fake receipt or network requests in Mura
      }
      if(!api){root.append(el('p',text('unavailable'),{role:'status'}));return;}
      if(ctx.coop.kind==='resource'&&!ctx.owner){root.append(el('p',text('readOnly')));return;}
      const actions=el('div','',{class:'actions'});actions.append(button('refresh','refresh'));
      if(state.loaded)actions.append(button(state.cursor?'more':'export','export'));
      root.append(actions);
      if(ctx.coop.kind==='project'&&state.entries.length){
        const list=el('div','',{class:'rp-records'});
        for(const entry of state.entries){
          const item=el('article','',{class:'card'}),v=entry.value;
          item.append(el('h4',v.title),el('p',`${text(v.kind)} — ${v.quantity} ${unit(v.unit)}`));
          if(v.from)item.append(el('p',`${text('from')}: ${v.from} / ${text('until')}: ${v.until}`,{class:'meta'}));
          if(v.conditions)item.append(el('p',v.conditions,{class:'rp-conditions'}));
          if(ctx.owner){const b=button('edit','edit',state.locked);b.setAttribute('aria-label',text('edit')+': '+v.title);b.dataset.rpId=v.id;item.append(b);}
          list.append(item);
        }root.append(list);
      }else if(state.loaded&&!state.entries.length)root.append(el('p',text('empty')));
      if(ctx.owner&&state.loaded&&state.draft){
        if(ctx.coop.kind==='project'&&['open','active'].includes(ctx.coop.status))root.append(button('add','add',state.locked));
        const form=el('form','',{'data-rp-form':ctx.coop.kind,class:'editor card'}),d=state.draft;
        const fs=el('fieldset');fs.disabled=state.pending||state.locked||!!ctx.busy||!['open','active'].includes(ctx.coop.status);
        if(ctx.coop.kind==='project')field(fs,'title','title',d.title,{required:true,max:160});
        selectField(fs,'kind','kind',Object.keys(UNITS),d.kind);
        field(fs,'quantity','quantity',d.quantity,{required:true,max:14});selectField(fs,'unit','unit',UNITS[d.kind]||[],d.unit,unit);
        field(fs,'from','from',d.from,{required:d.kind!=='consumable',max:35});field(fs,'until','until',d.until,{required:d.kind!=='consumable',max:35});
        field(fs,'conditions','conditions',d.conditions,{area:true,max:1000});
        const submit=el('button',text('save'),{type:'submit',class:'button','data-rp-save':''});fs.append(submit);form.append(fs);root.append(form);
        // Deletion is distinct from closing a project and remains allowed on closed parents.
        if(state.entries.some(e=>ctx.coop.kind==='resource'||e.value.id===d.id))root.append(button('remove','remove',state.locked));
      }else if(state.loaded&&!ctx.owner)root.append(el('p',text('readOnly'),{class:'meta'}));
      if(state.cursor)root.append(el('code',state.cursor,{'data-rp-next-cursor':''}));
      const status=el('p',state.status?text(state.status):'',{'data-rp-status':'',role:'status','aria-live':'polite'});root.append(status);
    }
    function mount(nextRoot,nextContext){
      if(disposed)return;
      const nextScope=scopeOf(nextContext);
      if(nextScope!==scope){reset();scope=nextScope;}
      root=nextRoot;ctx=nextContext;
      if(!root||!ctx){reset();return;}
      if(!state)reset();draw();
      if(!state.loaded&&!state.pending&&!state.locked&&!ctx.readOnly&&api)void load();
    }
    const unsubscribe=api?.onChange?.(()=>{
      reset();scope='';if(root)root.replaceChildren(el('p',text('session'),{role:'status'}));ctx=null;
    });
    function dispose(){disposed=true;generation++;unsubscribe?.();root?.replaceChildren();root=null;ctx=null;state=null;}
    return Object.freeze({mount,dispose});
  }
  globalThis.FolkoopResourceForms=Object.freeze({create});
})();
