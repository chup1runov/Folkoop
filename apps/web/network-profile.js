/* Network profile presentation domain.
   Profile persistence, account deletion, export and authorization remain owned by network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  text,
  homeText,
  shellText=key=>key,
  field,
  button,
  renderActivityNotifications
}){
  if(typeof escape!=='function'||typeof getData!=='function'||typeof text!=='function'){
    throw new Error('FOLKOOP_NETWORK_PROFILE_DEPENDENCIES');
  }

  function render(user,{profileDraft=null,guestDemo=false}={}){
    const data=getData()||{};
    const profile=profileDraft||data.profile||{};
    const blocks=Array.isArray(data.blocks)?data.blocks:[];
    const localDrafts=Array.isArray(data.localDrafts)?data.localDrafts:[];

    if(guestDemo){
      const city=profile.city||'';
      const lang=globalThis.document?.documentElement?.lang||'en';
      const privateDraft=lang==='ru'?'Личный черновик':lang==='sv'?'Privat utkast':'Private draft';
      const lifeTitle=lang==='ru'?'Что у меня здесь живёт':lang==='sv'?'Det som händer hos mig':'What lives here';
      const projectLabel=lang==='ru'?'дел и проектов':lang==='sv'?'saker och projekt':'things and projects';
      const chatLabel=lang==='ru'?'разговоров':lang==='sv'?'samtal':'conversations';
      const groupLabel=lang==='ru'?'сообществ':lang==='sv'?'gemenskaper':'communities';
      const projects=(data.cooperations||[]).filter(item=>item.owner_id===user.id||['project','need','offer'].includes(item.kind)).length;
      const chats=(data.chats||[]).length;
      const groups=(data.memberships||[]).filter(item=>!item.banned).length;
      const draftCards=localDrafts.map(draft=>`<article class="card mura-draft-card"><div class="row"><span class="badge">${escape(shellText(draft.kind))}</span><span class="meta">${escape(privateDraft)}</span></div><h3>${escape(draft.title||'')}</h3><p>${escape(draft.body||'')}</p></article>`).join('');
      const drafts=`<section class="mura-drafts"><div class="row"><h3>${escape(shellText('drafts'))}</h3><span class="meta">${escape(String(localDrafts.length))}</span></div><div class="draft-grid">${draftCards}</div></section>`;
      return `<div class="row mura-profile-toolbar"><div><p class="eyebrow">MURA / FOLKOOP</p><h2>${escape(text('profile'))}</h2></div>${button('logout','out')}</div><article class="card demo-profile-card"><span class="badge">${escape(homeText('demoBadge'))}</span><div class="mura-profile-head"><div><h2>${escape(profile.name||'')}</h2>${city?`<p class="meta"><strong>${escape(shellText('cityProfile'))}:</strong> ${escape(city)}</p>`:''}</div></div><p><strong>${escape(text('skills'))}:</strong> ${escape(profile.skills||'')}</p><p>${escape(profile.about||'')}</p><p class="meta">${escape(text('listed'))}</p><div class="mura-profile-stats" aria-label="${escape(lifeTitle)}"><span><strong>${projects}</strong>${escape(projectLabel)}</span><span><strong>${chats}</strong>${escape(chatLabel)}</span><span><strong>${groups}</strong>${escape(groupLabel)}</span></div></article>${drafts}${renderActivityNotifications(user)}`;
    }

    const blockRows=blocks
      .map(block=>`<p>${escape(block.target_id)} ${button('unblock','unblock',block.target_id)}</p>`)
      .join('');

    return `<div class="row"><h2>${escape(text('profile'))}</h2>${button('logout','out')}</div><p>${escape(text('private'))}</p><form id="netProfile" class="editor card">${field('name','name',profile.name||'',60)}${field('skills','skills',profile.skills||'',200)}${field('about','about',profile.about||'',600,true)}<label class="checkbox"><input type="checkbox" name="listed"${profile.listed?' checked':''}>${escape(text('listed'))}</label><button class="button">${escape(text('save'))}</button></form><div class="actions">${button('deleteProfile','deleteProfile')}${button('export','export')}${button('refresh','refresh')}</div><p class="meta">${escape(text('accountDelete'))} ${escape(text('exportNote'))}</p><h3>${escape(text('blocks'))}</h3>${blockRows}${renderActivityNotifications(user)}<h3>${escape(text('localTitle'))}</h3>`;
  }

  return Object.freeze({render});
}

globalThis.FolkoopNetworkProfile=Object.freeze({create});
})();
