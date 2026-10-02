/* Network profile presentation domain.
   Profile persistence, account deletion, export and authorization remain owned by network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  text,
  homeText,
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

    if(guestDemo){
      return `<div class="row"><h2>${escape(text('profile'))}</h2>${button('logout','out')}</div><article class="card demo-profile-card"><span class="badge">${escape(homeText('demoBadge'))}</span><h2>${escape(profile.name||'')}</h2><p><strong>${escape(text('skills'))}:</strong> ${escape(profile.skills||'')}</p><p>${escape(profile.about||'')}</p><p class="meta">${escape(text('listed'))}</p></article><div class="actions"><button class="button" type="button" data-demo="register">${escape(homeText('demoCta'))}</button></div>${renderActivityNotifications(user)}`;
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
