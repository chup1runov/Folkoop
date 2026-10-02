/* Communities presentation domain for the network UI.
   RPC execution, authorization/RLS and state ownership remain in network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  text,
  field,
  button
}){
  if(typeof escape!=='function'||typeof getData!=='function'||typeof text!=='function'){
    throw new Error('FOLKOOP_NETWORK_COMMUNITIES_DEPENDENCIES');
  }

  function render(user,{selected=null,groupDraft={},postDrafts={}}={}){
    const data=getData()||{};
    const groups=Array.isArray(data.groups)?data.groups:[];
    const memberships=Array.isArray(data.memberships)?data.memberships:[];
    const posts=Array.isArray(data.posts)?data.posts:[];
    const group=groups.find(item=>item.id===selected);
    const membership=memberships.find(item=>item.community_id===selected);
    const member=membership&&!membership.banned;

    let html=`<div class="row"><h2>${escape(text('groups'))}</h2><div>${button('refresh','refresh')}${button('logout','out')}</div></div><p>${escape(text('desc'))}</p>`;

    if(group){
      const membershipAction=membership?.banned
        ? escape(text('banned'))
        : member
          ? (group.owner_id===user.id?button('deleteGroup','ownerDelete',group.id):button('leave','leave',group.id))
          : button('join','join',group.id);

      html+=`${button('back','back')}<article class="card"><h2>${escape(group.name)}</h2><p>${escape(group.description)}</p><div class="actions">${membershipAction}</div></article>`;

      if(member){
        html+=`<form id="netPost" class="editor card">${field('body','post',postDrafts[selected]||'',3000,true)}<button class="button">${escape(text('publish'))}</button></form><h3>${escape(text('members'))}</h3>`;
        html+=posts.map(post=>{
          const author=post.author_id===user.id?text('own'):text('by')+' '+String(post.author_id||'').slice(0,8);
          const canDelete=post.author_id===user.id||group.owner_id===user.id;
          const otherActions=post.author_id!==user.id
            ? button('report','report',post.id)
              +button('block','block',post.author_id)
              +(group.owner_id===user.id?button('ban','ban',post.author_id):'')
            : '';
          return `<article class="card"><small>${escape(author)}</small><p style="white-space:pre-wrap">${escape(post.body)}</p><div class="actions">${canDelete?button('deletePost','delete',post.id):''}${otherActions}</div></article>`;
        }).join('');
      }
      return html;
    }

    html+=`<form id="netGroup" class="editor card"><h3>${escape(text('newGroup'))}</h3>${field('name','name',groupDraft.name||'',80)}${field('description','description',groupDraft.description||'',1000,true)}<button class="button">${escape(text('create'))}</button></form><div class="draft-grid">${groups.map(item=>`<article class="card"><h3>${escape(item.name)}</h3><p>${escape(item.description)}</p>${button('open','open',item.id)}</article>`).join('')||escape(text('empty'))}</div>`;
    return html;
  }

  return Object.freeze({render});
}

globalThis.FolkoopNetworkCommunities=Object.freeze({create});
})();
