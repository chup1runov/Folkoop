/* Economic Flow v0 presentation only. Authorization stays in Supabase RLS/RPCs. */
(() => {
'use strict';

const COPY={
 en:{section:'Economic coordination',intro:'Shows what economic coordination is happening inside this Project or Shared Purchase. It is not a second project system.',truth:'Flow stage is coordination state only. Closed does not mean paid, delivered or independently verified.',create:'Add economic flow',kind:'Flow kind',summary:'Purpose summary',stage:'Stage',roles:'Coordination roles',addRole:'Add role',save:'Save flow',delete:'Delete planning flow',empty:'No economic flow yet.',planning:'Planning',active:'Active',closed:'Closed',cancelled:'Cancelled',procurement:'Procurement',production:'Production',sale:'Sale',service:'Service',distribution:'Distribution',coordinator:'Coordinator',contributor:'Contributor',producer:'Producer',buyer:'Buyer',seller:'Seller',logistics:'Logistics',roleNote:'Roles describe coordination only; they are not employment, qualification or legal authority.',terminal:'Terminal flows stay as history and cannot reopen.',purchaseBoundary:'For Shared Purchase this does not replace supplier offers, confirmation, external order, delivery or pickup.'},
 ru:{section:'Экономическая координация',intro:'Показывает, какая экономическая координация происходит внутри проекта или совместной закупки. Это не вторая система проектов.',truth:'Этап потока — только состояние координации. «Закрыт» не означает оплату, доставку или независимо подтверждённый результат.',create:'Добавить экономический поток',kind:'Тип потока',summary:'Краткая цель',stage:'Этап',roles:'Роли координации',addRole:'Добавить роль',save:'Сохранить поток',delete:'Удалить поток в планировании',empty:'Экономических потоков пока нет.',planning:'Планирование',active:'В работе',closed:'Закрыт',cancelled:'Отменён',procurement:'Закупка',production:'Производство',sale:'Продажа',service:'Услуга',distribution:'Распределение',coordinator:'Координатор',contributor:'Участник',producer:'Производитель',buyer:'Покупатель',seller:'Продавец',logistics:'Логистика',roleNote:'Роли описывают только координацию; это не трудовые отношения, квалификация и не юридические полномочия.',terminal:'Терминальный поток сохраняется как история и не может быть снова открыт.',purchaseBoundary:'Для совместной закупки этот слой не заменяет предложения поставщиков, подтверждение, внешний заказ, доставку и выдачу.'},
 sv:{section:'Ekonomisk samordning',intro:'Visar vilken ekonomisk samordning som sker inom projektet eller det gemensamma köpet. Det är inte ett andra projektsystem.',truth:'Flödets steg är bara samordningsstatus. Stängt betyder inte betalt, levererat eller oberoende verifierat.',create:'Lägg till ekonomiskt flöde',kind:'Flödestyp',summary:'Kort syfte',stage:'Steg',roles:'Samordningsroller',addRole:'Lägg till roll',save:'Spara flöde',delete:'Radera planeringsflöde',empty:'Inget ekonomiskt flöde ännu.',planning:'Planering',active:'Aktivt',closed:'Stängt',cancelled:'Avbrutet',procurement:'Inköp',production:'Produktion',sale:'Försäljning',service:'Tjänst',distribution:'Distribution',coordinator:'Samordnare',contributor:'Deltagare',producer:'Producent',buyer:'Köpare',seller:'Säljare',logistics:'Logistik',roleNote:'Rollerna beskriver bara samordning; de är inte anställning, kvalifikation eller juridisk behörighet.',terminal:'Terminala flöden sparas som historik och kan inte öppnas igen.',purchaseBoundary:'För gemensamt köp ersätter lagret inte leverantörserbjudanden, bekräftelse, extern beställning, leverans eller hämtning.'}
};

function create({escape,getLanguage,getProfile}){
 if(typeof escape!=='function'||typeof getLanguage!=='function'||typeof getProfile!=='function')throw new Error('FOLKOOP_ECONOMIC_FLOW_DEPENDENCIES');
 const text=k=>COPY[getLanguage()]?.[k]||COPY.en[k]||k;
 const name=(uid,user)=>uid===user.id?'You':(getProfile(uid)?.name||text('roles'));
 const stageOptions=stage=>stage==='planning'?['planning','active','cancelled']:stage==='active'?['active','closed','cancelled']:[stage];
 const kinds=coop=>coop.kind==='purchase'?['procurement','distribution']:['procurement','production','sale','service','distribution'];
 const roles=['coordinator','contributor','producer','buyer','seller','logistics'];

 function render({user,coop,owner,members,flows,flowRoles,createDraft,editDrafts,roleDrafts,readOnly=false}){
  const cards=(flows||[]).map(flow=>{
   const terminal=['closed','cancelled'].includes(flow.stage);
   const assigned=(flowRoles||[]).filter(r=>r.flow_id===flow.id);
   const roleHtml=assigned.map(r=>{
    const protectedCoordinator=r.user_id===coop.owner_id&&r.role==='coordinator';
    const remove=owner&&!readOnly&&!terminal&&!protectedCoordinator
      ?`<button type="button" class="text-button" data-economic="removeRole" data-flow="${escape(flow.id)}" data-user="${escape(r.user_id)}" data-role="${escape(r.role)}">×</button>`
      :'';
    return `<span class="badge economic-role">${escape(name(r.user_id,user))} · ${escape(text(r.role))}${remove}</span>`;
   }).join('')||`<span class="meta">${escape(text('empty'))}</span>`;
   const edit=editDrafts?.[flow.id]||{stage:flow.stage,summary:flow.summary};
   const manage=owner&&!readOnly&&!terminal?`<form class="netEconomicFlowEdit editor card" data-flow="${escape(flow.id)}">
    <label>${escape(text('stage'))}<select name="stage">${stageOptions(flow.stage).map(v=>`<option value="${v}"${edit.stage===v?' selected':''}>${escape(text(v))}</option>`).join('')}</select></label>
    <label>${escape(text('summary'))}<textarea name="summary" maxlength="500" required rows="2">${escape(edit.summary||'')}</textarea></label>
    <div class="actions"><button class="button">${escape(text('save'))}</button>${flow.stage==='planning'?`<button type="button" class="button secondary" data-economic="deleteFlow" data-flow="${escape(flow.id)}">${escape(text('delete'))}</button>`:''}</div>
   </form>`:'';
   const roleDraft=roleDrafts?.[flow.id]||{user:'',role:'contributor'};
   const roleForm=owner&&!readOnly&&!terminal?`<form class="netEconomicRoleAdd editor card" data-flow="${escape(flow.id)}">
    <h4>${escape(text('addRole'))}</h4>
    <label>${escape(text('roles'))}<select name="user" required><option value=""></option>${members.map(m=>`<option value="${escape(m.user_id)}"${roleDraft.user===m.user_id?' selected':''}>${escape(name(m.user_id,user))}</option>`).join('')}</select></label>
    <label>${escape(text('kind'))}<select name="role">${roles.map(r=>`<option value="${r}"${roleDraft.role===r?' selected':''}>${escape(text(r))}</option>`).join('')}</select></label>
    <button class="button secondary">${escape(text('addRole'))}</button>
   </form>`:'';
   return `<article class="card economic-flow-card" data-economic-flow="${escape(flow.id)}"><div class="row"><span class="badge">${escape(text(flow.kind))}</span><span class="badge muted-badge">${escape(text(flow.stage))}</span></div><p style="white-space:pre-wrap">${escape(flow.summary)}</p><h4>${escape(text('roles'))}</h4><div class="economic-role-list">${roleHtml}</div><p class="meta">${escape(text('roleNote'))}</p>${terminal?`<p class="meta">${escape(text('terminal'))}</p>`:''}${manage}${roleForm}</article>`;
  }).join('');
  const draft=createDraft||{kind:coop.kind==='purchase'?'procurement':'service',summary:''};
  const createForm=owner&&!readOnly&&['open','active'].includes(coop.status)?`<form id="netEconomicFlowCreate" class="editor card"><h3>${escape(text('create'))}</h3><label>${escape(text('kind'))}<select name="kind">${kinds(coop).map(k=>`<option value="${k}"${draft.kind===k?' selected':''}>${escape(text(k))}</option>`).join('')}</select></label><label>${escape(text('summary'))}<textarea name="summary" maxlength="500" required rows="2">${escape(draft.summary||'')}</textarea></label><button class="button">${escape(text('create'))}</button></form>`:'';
  return `<div class="economic-flow-zone"><p>${escape(text('intro'))}</p><aside class="notice"><p>${escape(text('truth'))}</p>${coop.kind==='purchase'?`<p>${escape(text('purchaseBoundary'))}</p>`:''}</aside><div class="draft-grid">${cards||`<div class="empty"><p>${escape(text('empty'))}</p></div>`}</div>${createForm}</div>`;
 }

 return Object.freeze({render,text});
}

globalThis.FolkoopNetworkEconomicFlow=Object.freeze({create});
})();