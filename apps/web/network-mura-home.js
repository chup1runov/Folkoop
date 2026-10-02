/* Immersive read-only Home for Mura's account.
   Uses only the local illustrative account snapshot; no RPCs, mutation or signup CTA. */
(() => {
'use strict';

function create({
  escape,
  getData,
  getProfile,
  copy,
  kindLabel,
  statusLabel,
  formatWhen
}){
  if(typeof escape!=='function'||typeof getData!=='function'||typeof copy!=='function'){
    throw new Error('FOLKOOP_MURA_HOME_DEPENDENCIES');
  }

  const e=value=>escape(value??'');
  const profileName=id=>getProfile(id)?.name||copy('participant');

  function coopCard(coop,extra=''){
    if(!coop)return '';
    return `<article class="mura-story-card mura-story-${e(coop.kind)}">
      <div class="mura-card-top"><span class="badge">${e(kindLabel(coop.kind))}</span><span class="mura-status">${e(statusLabel(coop.status))}</span></div>
      <h3>${e(coop.title)}</h3>
      <p>${e(coop.description||'')}</p>
      ${extra}
      <button class="mura-deep-link" type="button" data-home="openCoop" data-id="${e(coop.id)}">${e(copy('openStory'))}<span aria-hidden="true">&rarr;</span></button>
    </article>`;
  }

  function render(user){
    const data=getData()||{};
    const profile=data.profile||{};
    const cooperations=Array.isArray(data.cooperations)?data.cooperations:[];
    const project=cooperations.find(x=>x.kind==='project'&&x.owner_id===user.id)||cooperations.find(x=>x.kind==='project');
    const purchase=cooperations.find(x=>x.kind==='purchase');
    const need=cooperations.find(x=>x.kind==='need'&&x.owner_id===user.id)||cooperations.find(x=>x.kind==='need');
    const offer=cooperations.find(x=>x.kind==='offer'&&x.owner_id===user.id)||cooperations.find(x=>x.kind==='offer');
    const resource=cooperations.find(x=>x.kind==='resource');
    const task=(data.assignedTasks||[]).find(x=>x.status!=='done');
    const projectMembers=(data.coopMembers||[]).filter(x=>x.cooperation_id===project?.id);
    const people=projectMembers.map(m=>getProfile(m.user_id)).filter(Boolean);
    const unread=(data.chatInbox||[]).reduce((sum,x)=>sum+Number(x.unread_count||0),0);
    const active=cooperations.filter(x=>['open','active'].includes(x.status)).length;
    const drafts=Array.isArray(data.localDrafts)?data.localDrafts:[];
    const chats=Array.isArray(data.chats)?data.chats:[];
    const direct=chats.find(x=>x.kind==='direct');
    const groupChat=chats.find(x=>x.kind==='group');
    const messages=Array.isArray(data.chatMessages)?data.chatMessages:[];
    const directPreview=messages.find(x=>x.conversation_id===direct?.id);
    const groupPreview=[...messages].reverse().find(x=>x.conversation_id===groupChat?.id);
    const groups=Array.isArray(data.groups)?data.groups:[];
    const localGroup=groups[0], languageGroup=groups[1];
    const posts=Array.isArray(data.homePosts)?data.homePosts:[];
    const latestPost=posts[0];

    const peopleNames=people.filter(p=>p.id!==user.id).map(p=>p.name).slice(0,3);
    const projectMeta=task
      ? `<div class="mura-next-step"><span>${e(copy('next'))}</span><strong>${e(task.title)}</strong></div>`
      : '';
    const purchaseCommit=(data.myConfirmations||[]).find(x=>x.cooperation_id===purchase?.id);
    const purchaseMeta=purchaseCommit
      ? `<div class="mura-mini-progress"><span>${e(copy('myPart'))}</span><strong>${e(String(purchaseCommit.quantity||0))} ${e(purchase?.unit||'')}</strong></div>`
      : '';

    const peopleCards=(data.directory||[]).filter(p=>p.id!==user.id).slice(0,3).map(p=>`
      <article class="mura-person-card">
        <div class="mura-avatar" aria-hidden="true">${e((p.name||'?').slice(0,1))}</div>
        <div><strong>${e(p.name)}</strong><p>${e(p.skills||'')}</p></div>
      </article>`).join('');

    const draftCards=drafts.map(d=>`
      <article class="mura-note">
        <span class="badge">${e(kindLabel(d.kind))}</span>
        <strong>${e(d.title)}</strong>
        <p>${e(d.body||'')}</p>
      </article>`).join('');

    const conversationCards=[
      groupChat?`<button class="mura-conversation" type="button" data-net="openChat" data-id="${e(groupChat.id)}">
        <span class="mura-conversation-icon">#</span><span><strong>${e(groupChat.title)}</strong><small>${e(groupPreview?.body||copy('openConversation'))}</small></span><span aria-hidden="true">&rarr;</span>
      </button>`:'',
      direct?`<button class="mura-conversation" type="button" data-net="openChat" data-id="${e(direct.id)}">
        <span class="mura-conversation-icon">@</span><span><strong>${e(profileName((data.chatMembers||[]).find(m=>m.conversation_id===direct.id&&m.user_id!==user.id)?.user_id))}</strong><small>${e(directPreview?.body||copy('openConversation'))}</small></span><span aria-hidden="true">&rarr;</span>
      </button>`:''
    ].join('');

    const sparkCards=[
      resource?`<button class="mura-spark-card" type="buton" data-home="openCoop" data-id="${e(resource.id)}"><span>+</span><strong>${e(resource.title)}</strong><small>${e(copy('resourceSpark'))}</small></button>`:'',
      localGroup?`<button class="mura-spark-card" type="button" data-home="openCommunity" data-id="${e(localGroup.id)}"><span>*</span><strong>${e(localGroup.name)}</strong><small>${e(copy('communitySpark'))}</small></button>`:'',
      languageGroup?`<button class="mura-spark-card" type="buton" data-home="openCommunity" data-id="${e(languageGroup.id)}"><span>o</span><strong>${e(languageGroup.name)}</strong><small>${e(copy('languageSpark'))}</small></button>`:''
    ].join('');

    return `<section class="mura-home">
      <header class="mura-hero">
        <div class="mura-hero-copy">
          <p class="eyebrow">${e(copy('eyebrow'))}</p>
          <div class="mura-identity-line"><h1>${e(profile.name||'Mura')}</h1><span class="mura-city-pill">${e(profile.city||'Goteborg')}</span></div>
          <p class="mura-hero-lead">${e(copy('lead'))}</p>
          <div class="mura-stat-row">
            <div><strong>${active}</strong><span>${e(copy('active'))}</span></div>
            <div><strong>${peopleNames.length}</strong><span>${e(copy('people'))}</span></div>
            <div><strong>${unread}</strong><span>${e(copy('unread'))}</span></div>
            <div><strong>${drafts.length}</strong><span>${e(copy('drafts'))}</span></div>
          </div>
        </div>
        <aside class="mura-now-card">
          <span class="mura-live-dot"></span><span class="mura-now-label">${e(copy('today')}</span>
          <h2>${e(task?.title||project?.title||copy('caughtUp'))}</h2>
          <p>${e(project?.title||copy('nothingUrgent'))}</p>
          ${project?`<button class="button" type="button" data-home="openCoop" data-id="${e(project.id)}">${e(copy('continue'))}</button>`:''}
        </aside>
      </header>

      <section class="mura-section mura-story">
        <div class="mura-section-head"><div><p class="eyebrow">${e(copy('storyEyebrow'))}</p><h2>${e(copy('storyTitle'))}</h2></div><p>${e(copy('storyText'))}</p></div>
        <div class="mura-story-grid">
          ${coopCard(project,projectMeta)}
          ${coopCard(purchase,purchaseMeta)}
          ${coopCard(need)}
          ${coopCard(offer)}
        </div>
      </section>

      <section class="mura-section mura-people-zone">
        <div class="mura-section-head"><div><p class="eyebrow">${e(copy('peopleEyebrow'))}</p><h2>${e(copy('peopleTitle'))}</h2></div><a class="mura-text-link" href="#/people">${e(copy('seePeople')} &rarr;</a></div>
        <div class="mura-people-grid">${peopleCards}</div>
      </section>

      <section class="mura-section mura-conversations-zone">
        <div class="mura-section-head"><div><p class="eyebrow">${e(copy('chatEyebrow'))}</p><h2>${e(copy('chatTitle'))}</h2></div><a class="mura-text-link" href="#/messages">${e(copy('allMessages'))} &rarr;</a></div>
        <div class="mura-conversation-list">${conversationCards}</div>
      </section>

      <section class="mura-section mura-spark-s-zone">
        <div class="mura-section-head"><div><p class="eyebrow">${e(copy('sparkEyebrow'))}</p><h2>${e(copy('sparkTitle'))}</h2></div><p>${e(copy('sparkText'))}</p></div>
        <div class="mura-spark-grid">${sparkCards}</div>
      </section>

      <section class="mura-section mura-drafts-zone">
        <div class="mura-section-head"><div><p class="eyebrow">${e(copy('draftEyebrow'))}</p><h2>${e(copy('draftTitle'))}</h2></div><a class="mura-text-link" href="#/me">${e(copy('openProfile'))} &rarr;</a></div>
        <div class="mura-note-grid">${draftCards}</div>
      </section>

      <section class="mura-section mura-city-zone">
        <div class="mura-city-callout">
          <div><p class="eyebrow">GOTEBORG</p><h2>${e(copy('cityTitle'))}</h2><p>${e(copy('cityText'))}</p></div>
          <a class="button secondary" href="#/city">${e(copy('cityCta'))} &rarr;</a>
        </div>
        ${latestPost?`<article class="mura-neighbourhood-pulse"><span class="badge">${e(copy('neighbourhood'))}</span><strong>${e(localGroup?.name||'')}</strong><p>${e(latestPost.body)}</p><small>${e(formatWhen(latestPost.created_at))}</small></article>`:''}
      </section>

      <footer class="mura-roam-note">
        <span aria-hidden="true">*</span><p><strong>${e(copy('roamTitle'))}</strong> ${e(copy('roamText'))}</p>
      </footer>
    </section>`;
  }

  return Object.freeze({render});
}
globalThis.FolkoopMuraHome=Object.freeze({create});
})();