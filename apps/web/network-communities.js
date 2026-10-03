/* Communities presentation domain for the network UI.
   RPC execution, authorization/RLS and state ownership remain in network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  getProfile=()=>null,
  text,
  field,
  button
}){
  if(typeof escape!=='function'||typeof getData!=='function'||typeof text!=='function'){
    throw new Error('FOLKOOP_NETWORK_COMMUNITIES_DEPENDENCIES');
  }

  function render(user,{selected=null,groupDraft={},postDrafts={},guestDemo=false}={}){
    const data=getData()||{};
    const groups=Array.isArray(data.groups)?data.groups:[];
    const memberships=Array.isArray(data.memberships)?data.memberships:[];
    const posts=Array.isArray(data.posts)?data.posts:[];
    const group=groups.find(item=>item.id===selected);
    const membership=memberships.find(item=>item.community_id===selected);
    const member=membership&&!membership.banned;
    const guestIntro=guestDemo
      ? (document?.documentElement?.lang==='ru'?'Места, куда я возвращаюсь: соседи, язык, ремонт и идеи, которые становятся общими делами.':document?.documentElement?.lang==='sv'?'Platser jag återkommer till: grannar, språk, reparation och idéer som blir gemensamma saker.':'Places I return to: neighbours, language, repair and ideas that turn into shared things.')
      : text('desc');

    let html=`<div class="row"><h2>${escape(text('groups'))}</h2>${guestDemo?'':`<div>${button('refresh','refresh')}${button('logout','out')}</div>`}</div><p>${escape(guestIntro)}</p>`;

    if(group){
      const membershipAction=guestDemo?'':membership?.banned
        ? escape(text('banned'))
        : member
          ? (group.owner_id===user.id?button('deleteGroup','ownerDelete',group.id):button('leave','leave',group.id))
          : button('join','join',group.id);

      html+=`${button('back','back')}<article class="card mura-community-head"><h2>${escape(group.name)}</h2><p>${escape(group.description)}</p>${membershipAction?`<div class="actions">${membershipAction}</div>`:''}</article>`;

      if(member){
        if(!guestDemo)html+=`<form id="netPost" class="editor card">${field('body','post',postDrafts[selected]||'',3000,true)}<button class="button">${escape(text('publish'))}</button></form>`;
        html+=`<h3>${escape(text('members'))}</h3><div class="mura-community-posts">`;
        html+=posts.map(post=>{
          const profile=getProfile(post.author_id);
          const author=post.author_id===user.id?text('own'):(profile?.name||text('by'));
          const canDelete=!guestDemo&&(post.author_id===user.id||group.owner_id===user.id);
          const otherActions=!guestDemo&&post.author_id!==user.id
            ? button('report','report',post.id)+button('block','block',post.author_id)+(group.owner_id===user.id?button('ban','ban',post.author_id):'')
            : '';
          return `<article class="card mura-community-post"><small>${escape(author)}</small><p style="white-space:pre-wrap">${escape(post.body)}</p><div class="actions">${canDelete?button('deletePost','delete',post.id):''}${otherActions}</div></article>`;
        }).join('');
        html+='</div>';
      }
      return html;
    }

    const list=groups.map(item=>{
      const latest=(Array.isArray(data.homePosts)?data.homePosts:[]).filter(post=>post.community_id===item.id).sort((a,b)=>Date.parse(b.created_at||0)-Date.parse(a.created_at||0))[0];
      return `<article class="card mura-community-card"><h3>${escape(item.name)}</h3><p>${escape(item.description)}</p>${guestDemo&&latest?`<blockquote>${escape(latest.body)}</blockquote>`:''}${button('open','open',item.id)}</article>`;
    }).join('')||escape(text('empty'));
    if(!guestDemo)html+=`<form id="netGroup" class="editor card"><h3>${escape(text('newGroup'))}</h3>${field('name','name',groupDraft.name||'',80)}${field('description','description',groupDraft.description||'',1000,true)}<button class="button">${escape(text('create'))}</button></form>`;
    html+=`<div class="draft-grid mura-community-grid">${list}</div>`;
    return html;
  }

  return Object.freeze({render});
}

globalThis.FolkoopNetworkCommunities=Object.freeze({create});
})();