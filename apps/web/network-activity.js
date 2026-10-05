/* Activity/inbox presentation domain for the network UI.
   Pure data access is injected; this module performs no RPCs and owns no authorization state. */
(() => {
'use strict';

function create({
  escape,
  getData,
  getCurrentUser,
  getProfile,
  activityText,
  lifecycleText,
  chatText,
  cooperationText,
  kindLabel,
  formatWhen,
  button,
  documentRef=globalThis.document
}){
  if(typeof escape!=='function'||typeof getData!=='function'||typeof getCurrentUser!=='function'){
    throw new Error('FOLKOOP_NETWORK_ACTIVITY_DEPENDENCIES');
  }

  function activityLabel(event,user=getCurrentUser()){
    const e=event||{};
    const actor=e.actor_id===user?.id
      ? chatText('you')
      : (getProfile(e.actor_id)?.name||cooperationText('noProfile'));
    let label=e.label||'';
    if(e.event_type==='purchase_stage'||e.event_type==='confirmation_changed')label=lifecycleText(label);
    if(e.event_type==='collection_changed')label=label==='collected'?lifecycleText('collected'):lifecycleText('notCollected');
    return actor+' '+activityText(e.event_type||'activity')+(label?' · '+label:'');
  }

  function counts(){
    const data=getData()||{};
    const user=getCurrentUser();
    const chatInbox=Array.isArray(data.chatInbox)?data.chatInbox:[];
    const chatInvites=Array.isArray(data.chatInvites)?data.chatInvites:[];
    const activityInbox=Array.isArray(data.activityInbox)?data.activityInbox:[];
    return Object.freeze({
      messages:chatInbox.reduce((sum,item)=>sum+Number(item.unread_count||0),0)
        +chatInvites.filter(item=>item.user_id===user?.id).length,
      together:activityInbox
        .filter(item=>item.cooperation_kind!=='project')
        .reduce((sum,item)=>sum+Number(item.unread_count||0),0),
      projects:activityInbox
        .filter(item=>item.cooperation_kind==='project')
        .reduce((sum,item)=>sum+Number(item.unread_count||0),0)
    });
  }

  function setCountBadge(element,count){
    if(!element)return;
    element.querySelectorAll(':scope > .net-count').forEach(node=>node.remove());
    const n=Number(count||0);
    if(n<=0)return;
    const badge=documentRef.createElement('span');
    badge.className='net-count';
    badge.textContent=n>99?'99+':String(n);
    badge.setAttribute('aria-label',n+' '+activityText('unread'));
    element.append(badge);
  }

  function syncBadges(){
    const current=counts();
    setCountBadge(documentRef.getElementById('messageLink'),current.messages);
    setCountBadge(documentRef.querySelector('#mobilePrimaryNav a[href="#/messages"]'),current.messages);
    setCountBadge(documentRef.querySelector('#mobilePrimaryNav a[href="#/together"]'),current.together+current.projects);
    return current;
  }

  function renderNotifications(user=getCurrentUser()){
    const data=getData()||{};
    const rows=(Array.isArray(data.activityInbox)?data.activityInbox:[])
      .filter(item=>item.last_activity_at)
      .slice(0,12);
    const cards=rows.map(item=>{
      const unread=Number(item.unread_count||0);
      const line=activityLabel({
        actor_id:item.last_actor_id,
        event_type:item.last_event_type,
        label:item.last_label
      },user);
      return `<article class="card"><div class="row"><span class="badge">${escape(kindLabel(item.cooperation_kind))}</span>${unread?`<span class="net-count">${escape(String(unread))}</span>`:''}</div><h3>${escape(item.cooperation_title)}</h3><p class="meta">${escape(line)} · ${escape(formatWhen(item.last_activity_at))}</p>${button('openNotify','openActivity',item.cooperation_id)}</article>`;
    }).join('');
    return `<section class="network-activity"><div class="row"><h3>${escape(activityText('notifications'))}</h3><span class="meta">${escape(activityText('recentActivity'))}</span></div><div class="draft-grid">${cards||`<div class="empty"><p>${escape(activityText('noActivity'))}</p></div>`}</div></section>`;
  }

  return Object.freeze({activityLabel,counts,syncBadges,renderNotifications});
}

globalThis.FolkoopNetworkActivity=Object.freeze({create});
})();
