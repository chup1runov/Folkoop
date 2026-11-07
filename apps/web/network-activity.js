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
    return actor+' '+(globalThis.FolkoopTaskWork?.eventLabel(e.event_type)||activityText(e.event_type||'activity'))+(label?' · '+label:'');
  }

  function counts(){
    const data=getData()||{};
    const user=getCurrentUser();
    const chatInbox=Array.isArray(data.chatInbox)?data.chatInbox:[];
    const chatInvites=Array.isArray(data.chatInvites)?data.chatInvites:[];
    const activityInbox=Array.isArray(data.activityInbox)?data.activityInbox:[];
    return Object.freeze({
      contributions:data.contributionNotices?.error?0:Number(data.contributionNotices?.unread||0),
      meetingBudget:data.meetingBudgetNotices?.error?0:Number(data.meetingBudgetNotices?.unread||0),
      rooms:data.roomNotificationsError?0:Number(data.roomNotifications?.[0]?.unread_count||0),
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
    setCountBadge(documentRef.querySelector('#mobilePrimaryNav a[href="#/together"]'),current.together+current.projects+current.rooms+current.contributions+current.meetingBudget);
    return current;
  }

  function renderTaskActions(){
    const data=getData()||{},work=globalThis.FolkoopTaskWork;
    if(!work||(!data.taskActions&&!data.taskActionsError))return '';
    const tx=i=>escape(work.notificationText(i)),rows=data.taskActions||[],total=Number(rows[0]?.total_count||0);
    return `<section class="network-task-actions"><div class="row"><h3>${tx(5)}${data.taskActionsError?'':` · ${rows.length} / ${total}`}</h3><button class="button secondary" data-coop="taskRefresh" type="button">${tx(10)}</button></div><p class="meta">${tx(11)}</p>${data.taskActionsError?`<p role="status">${tx(9)}</p>`:rows.map(item=>`<article class="card"><span class="badge">${tx(item.work_stage==='submitted'?6:7)}</span><h4>${escape(item.task_title)}</h4><p>${escape(item.project_title)}</p><button class="button secondary" type="button" data-coop="openNotify" data-id="${escape(item.cooperation_id)}" data-task="${escape(item.task_id)}">${escape(activityText('openActivity'))}</button></article>`).join('')||`<p>${tx(8)}</p>`}</section>`;
  }

  function renderRoomNotifications(){
    const data=getData()||{};
    const basis=globalThis.FolkoopTaskBasisNotices?.render({rows:data.taskBasisNotifications,error:data.taskBasisNotificationsError,loadedAt:data.taskBasisNotificationsLoadedAt})||'';
    const contributions=globalThis.FolkoopBudget?.renderInbox({snapshot:data.contributionNotices,name:id=>getProfile(id)?.name||cooperationText('noProfile')})||'';
    const meetingBudget=globalThis.FolkoopBudget?.renderPolicyInbox({snapshot:data.meetingBudgetNotices,name:id=>getProfile(id)?.name||cooperationText('noProfile')})||'';
    const reminders=(globalThis.FolkoopDecisions?.renderDocumentNotifications({rows:data.documentNotifications,error:data.documentNotificationsError})||'')+(globalThis.FolkoopMeetings?.renderReminders({rows:data.meetingReminders,error:data.meetingRemindersError})||'');
    return (globalThis.FolkoopMeetings?.renderActionInbox({rows:data.meetingActions??[],error:data.meetingActionsError})||'')+meetingBudget+contributions+basis+reminders+(globalThis.FolkoopMeetings?.renderRoomAlerts({rows:data.meetingRoomAlerts,error:data.meetingRoomAlertsError})||'')+(globalThis.FolkoopRooms?.renderInbox({rows:data.roomNotifications,error:data.roomNotificationsError,name:id=>getProfile(id)?.name||cooperationText('noProfile')})||'');
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
    return renderRoomNotifications()+renderTaskActions()+`<section class="network-activity"><div class="row"><h3>${escape(activityText('notifications'))}</h3><span class="meta">${escape(activityText('recentActivity'))}</span></div><div class="draft-grid">${cards||`<div class="empty"><p>${escape(activityText('noActivity'))}</p></div>`}</div></section>`;
  }

  return Object.freeze({activityLabel,counts,syncBadges,renderNotifications,renderTaskActions,renderRoomNotifications});
}

globalThis.FolkoopNetworkActivity=Object.freeze({create});
})();
