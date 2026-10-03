/* Signed-in Home presentation domain for the network UI.
   RPC execution, routing mutation and state ownership stay in network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  getProfile,
  generalText,
  cooperationText,
  homeText,
  activityLabel,
  kindLabel,
  statusLabel,
  formatWhen,
  button,
  getView
}){
  if(
    typeof escape!=='function'||
    typeof getData!=='function'||
    typeof getProfile!=='function'||
    typeof generalText!=='function'||
    typeof cooperationText!=='function'||
    typeof homeText!=='function'||
    typeof activityLabel!=='function'||
    typeof kindLabel!=='function'||
    typeof statusLabel!=='function'||
    typeof formatWhen!=='function'||
    typeof button!=='function'||
    typeof getView!=='function'
  ) throw new Error('FOLKOOP_NETWORK_HOME_DEPENDENCIES');

  function render(user){
    const data=getData()||{};
    const chatInbox=Array.isArray(data.chatInbox)?data.chatInbox:[];
    const chatInvites=Array.isArray(data.chatInvites)?data.chatInvites:[];
    const myConfirmations=Array.isArray(data.myConfirmations)?data.myConfirmations:[];
    const allProcesses=Array.isArray(data.allProcesses)?data.allProcesses:[];
    const cooperations=Array.isArray(data.cooperations)?data.cooperations:[];
    const assignedTasks=Array.isArray(data.assignedTasks)?data.assignedTasks:[];
    const activityInbox=Array.isArray(data.activityInbox)?data.activityInbox:[];
    const coopMembers=Array.isArray(data.coopMembers)?data.coopMembers:[];
    const homePosts=Array.isArray(data.homePosts)?data.homePosts:[];
    const groups=Array.isArray(data.groups)?data.groups:[];

    const unreadMessages=chatInbox.reduce((sum,item)=>sum+Number(item.unread_count||0),0);
    const invites=chatInvites.filter(item=>item.user_id===user.id).length;
    const pendingConfirmations=myConfirmations
      .filter(item=>item.decision==='pending')
      .map(confirmation=>({
        confirmation,
        process:allProcesses.find(process=>process.cooperation_id===confirmation.cooperation_id),
        coop:cooperations.find(coop=>coop.id===confirmation.cooperation_id)
      }))
      .filter(item=>item.process?.stage==='confirming'&&item.coop);
    const assigned=assignedTasks
      .filter(item=>item.status!=='done')
      .map(item=>({...item,coop:cooperations.find(coop=>coop.id===item.cooperation_id)}))
      .filter(item=>item.coop);
    const unreadActivity=activityInbox.filter(item=>Number(item.unread_count||0)>0);
    const attention=[];

    pendingConfirmations.forEach(item=>attention.push({
      type:'confirmation',
      title:item.coop.title,
      meta:(item.process.confirmation_deadline?homeText('deadline')+': '+formatWhen(item.process.confirmation_deadline):'')+' · '+item.confirmation.quantity+' '+(item.coop.unit||''),
      coop:item.coop
    }));
    assigned.slice(0,5).forEach(item=>attention.push({
      type:'task',
      title:item.title,
      meta:item.coop.title+' · '+cooperationText(item.status),
      coop:item.coop
    }));
    if(unreadMessages)attention.push({type:'messages',title:homeText('messages')+' · '+unreadMessages,meta:'',route:'messages'});
    if(invites)attention.push({type:'invitations',title:homeText('invitations')+' · '+invites,meta:'',route:'messages'});
    unreadActivity.slice(0,4).forEach(item=>attention.push({
      type:'activity',
      title:item.cooperation_title,
      meta:homeText('activity')+' · '+item.unread_count,
      coop:cooperations.find(coop=>coop.id===item.cooperation_id)
    }));

    const memberIds=new Set(coopMembers.filter(member=>member.user_id===user.id).map(member=>member.cooperation_id));
    const unreadByCoop=new Map(activityInbox.map(item=>[item.cooperation_id,Number(item.unread_count||0)]));
    const active=cooperations
      .filter(coop=>memberIds.has(coop.id)&&['open','active'].includes(coop.status))
      .sort((a,b)=>(unreadByCoop.get(b.id)||0)-(unreadByCoop.get(a.id)||0)||Date.parse(b.updated_at||b.created_at||0)-Date.parse(a.updated_at||a.created_at||0))
      .slice(0,8);

    const feed=[];
    activityInbox.filter(item=>item.last_activity_at).forEach(item=>feed.push({
      kind:'activity',
      time:item.last_activity_at,
      coop:cooperations.find(coop=>coop.id===item.cooperation_id),
      title:item.cooperation_title,
      event:item
    }));
    homePosts.forEach(post=>feed.push({
      kind:'post',
      time:post.created_at,
      post,
      group:groups.find(group=>group.id===post.community_id)
    }));
    feed.sort((a,b)=>Date.parse(b.time||0)-Date.parse(a.time||0));

    const actionCard=item=>{
      if(item.route)return `<article class="card home-attention-card"><span class="badge">${escape(homeText(item.type))}</span><h3>${escape(item.title)}</h3>${item.meta?`<p class="meta">${escape(item.meta)}</p>`:''}<a class="button secondary" href="#/${item.route}">${escape(homeText('open'))}</a></article>`;
      const coop=item.coop;
      if(!coop)return '';
      return `<article class="card home-attention-card"><span class="badge">${escape(homeText(item.type))}</span><h3>${escape(item.title)}</h3>${item.meta?`<p class="meta">${escape(item.meta)}</p>`:''}<button class="button secondary" type="button" data-home="openCoop" data-id="${escape(coop.id)}">${escape(homeText('open'))}</button></article>`;
    };

    const focusCard=item=>{
      if(!item)return `<article class="card home-daily-focus home-daily-clear"><span class="badge">${escape(homeText('daily'))}</span><h2>${escape(homeText('caughtUp'))}</h2><p class="meta">${escape(homeText('why'))}</p></article>`;
      if(item.route)return `<article class="card home-daily-focus"><div class="row"><span class="badge">${escape(homeText('daily'))}</span><span class="meta">${escape(homeText('nextStep'))}</span></div><h2>${escape(item.title)}</h2>${item.meta?`<p class="meta">${escape(item.meta)}</p>`:''}<a class="button" href="#/${item.route}">${escape(homeText('open'))}</a></article>`;
      const coop=item.coop;
      if(!coop)return '';
      return `<article class="card home-daily-focus"><div class="row"><span class="badge">${escape(homeText('daily'))}</span><span class="meta">${escape(homeText('nextStep'))}</span></div><h2>${escape(item.title)}</h2>${item.meta?`<p class="meta">${escape(item.meta)}</p>`:''}<button class="button" type="button" data-home="openCoop" data-id="${escape(coop.id)}">${escape(homeText('open'))}</button></article>`;
    };

    const feedCard=item=>{
      if(item.kind==='post'){
        const author=getProfile(item.post.author_id)?.name||generalText('by');
        return `<article class="card home-feed-card"><span class="badge">${escape(homeText('communityPost'))}</span><h3>${escape(item.group?.name||generalText('groups'))}</h3><p style="white-space:pre-wrap">${escape(item.post.body)}</p><p class="meta">${escape(homeText('from'))} ${escape(author)} · ${escape(formatWhen(item.post.created_at))}</p>${item.group?`<button class="text-button" type="button" data-home="openCommunity" data-id="${escape(item.group.id)}">${escape(homeText('open'))}</button>`:''}</article>`;
      }
      const event=item.event,coop=item.coop;
      const line=activityLabel({actor_id:event.last_actor_id,event_type:event.last_event_type,label:event.last_label},user);
      return `<article class="card home-feed-card"><span class="badge">${escape(coop?kindLabel(coop.kind):homeText('activity'))}</span><h3>${escape(item.title)}</h3><p>${escape(line)}</p><p class="meta">${escape(formatWhen(event.last_activity_at))}</p>${coop?`<button class="text-button" type="button" data-home="openCoop" data-id="${escape(coop.id)}">${escape(homeText('open'))}</button>`:''}</article>`;
    };

    const primary=attention[0]||(active[0]?{
      type:'activity',
      title:active[0].title,
      meta:statusLabel(active[0].status),
      coop:active[0]
    }:null);
    const feedItems=feed.slice(0,12);
    const view=getView();

    const header=`<div class="row"><div><p class="eyebrow">FOLKOOP</p><h1>${escape(homeText('title'))}</h1><p class="home-subtitle">${escape(homeText('subtitle'))}</p></div>${button('refresh','refresh')}</div>`;
    const overview=`<section class="home-daily">${focusCard(primary)}</section><section class="home-section"><h2>${escape(homeText('myWork'))}</h2><div class="draft-grid">${active.map(coop=>`<article class="card"><span class="badge">${escape(kindLabel(coop.kind))}</span><h3>${escape(coop.title)}</h3><p class="meta">${escape(statusLabel(coop.status))} · ${escape(coop.location_text||'')}</p><button class="text-button" type="button" data-home="openCoop" data-id="${escape(coop.id)}">${escape(homeText('open'))}</button></article>`).join('')||`<div class="empty"><p>${escape(homeText('noFeed'))}</p></div>`}</div></section>`;
    const attentionView=`<section class="home-section"><div class="row"><h2>${escape(homeText('attention'))}</h2><span class="meta">${escape(homeText('why'))}</span></div><div class="home-attention-grid">${attention.map(actionCard).join('')||`<div class="empty"><p>${escape(homeText('nothingUrgent'))}</p></div>`}</div></section>`;
    const actionsView=`<section class="home-section"><h2>${escape(homeText('quick'))}</h2><div class="quick-grid home-quick"><button class="quick" type="button" data-home="createCoop" data-kind="need">${escape(homeText('need'))}<span aria-hidden="true">＋</span></button><button class="quick" type="button" data-home="createCoop" data-kind="offer">${escape(homeText('offer'))}<span aria-hidden="true">＋</span></button><button class="quick" type="button" data-home="createCoop" data-kind="purchase">${escape(homeText('purchase'))}<span aria-hidden="true">＋</span></button><button class="quick" type="button" data-home="createCoop" data-kind="project">${escape(homeText('project'))}<span aria-hidden="true">＋</span></button><a class="quick" href="#/communities">${escape(homeText('community'))}<span aria-hidden="true">→</span></a><a class="quick" href="#/city">${escape(homeText('city'))}<span aria-hidden="true">→</span></a></div></section>`;
    const feedView=`<section class="home-section"><h2>${escape(homeText('feed'))}</h2><div class="home-feed">${feedItems.map(feedCard).join('')||`<div class="empty"><p>${escape(homeText('noFeed'))}</p></div>`}</div>${feedItems.length?`<p class="home-feed-end">${escape(homeText('feedEnd'))}</p>`:''}</section>`;
    const body=view==='home-attention'?attentionView:view==='home-feed'?feedView:view==='home-actions'?actionsView:overview;

    return `<section class="home-dashboard" data-home-view="${escape(view)}">${header}${body}</section>`;
  }

  return Object.freeze({render});
}

globalThis.FolkoopNetworkHome=Object.freeze({create});
})();
