/* Shared-purchase lifecycle presentation domain for the network UI.
   RPC execution, authorization, draft mutation and state ownership stay in network-ui.js. */
(() => {
'use strict';

function create({
  escape,
  getData,
  getProfile,
  getDrafts,
  lifecycleText,
  chatText,
  cooperationText,
  formatWhen,
  localDateTime,
  button
}){
  if(
    typeof escape!=='function'||
    typeof getData!=='function'||
    typeof getProfile!=='function'||
    typeof getDrafts!=='function'||
    typeof lifecycleText!=='function'||
    typeof chatText!=='function'||
    typeof cooperationText!=='function'||
    typeof formatWhen!=='function'||
    typeof localDateTime!=='function'||
    typeof button!=='function'
  ) throw new Error('FOLKOOP_NETWORK_PURCHASE_LIFECYCLE_DEPENDENCIES');

  function render(user,coop,owner){
    const data=getData()||{};
    const drafts=getDrafts()||{};
    const purchaseProcess=Array.isArray(data.purchaseProcess)?data.purchaseProcess:[];
    const purchaseChoice=Array.isArray(data.purchaseChoice)?data.purchaseChoice:[];
    const confirmations=Array.isArray(data.purchaseConfirmations)?data.purchaseConfirmations:[];
    const process=purchaseProcess[0]||{stage:purchaseChoice.length?'offer_selected':'collecting'};
    const stage=process.stage||'collecting';
    const mine=confirmations.find(item=>item.user_id===user.id);
    const pending=confirmations.filter(item=>item.decision==='pending').length;
    const confirmed=confirmations.filter(item=>item.decision==='confirmed');
    const declined=confirmations.filter(item=>item.decision==='declined').length;
    const confirmedTotal=confirmed.reduce((sum,item)=>sum+Number(item.quantity||0),0);
    const profileName=id=>id===user.id
      ?chatText('you')
      :(getProfile(id)?.name||cooperationText('noProfile'));

    let html=`<section class="card"><div class="row"><h3>${escape(lifecycleText('lifecycle'))}</h3><span class="badge">${escape(lifecycleText(stage))}</span></div><p class="meta">${escape(lifecycleText('selfReported'))}</p>`;
    if(process.confirmation_deadline)html+=`<p><strong>${escape(lifecycleText('confirmationDeadline'))}:</strong> ${escape(formatWhen(process.confirmation_deadline))}</p>`;
    if(process.external_order_reference)html+=`<p><strong>${escape(lifecycleText('externalReference'))}:</strong> ${escape(process.external_order_reference)}</p>`;
    if(process.expected_delivery_at)html+=`<p><strong>${escape(lifecycleText('expectedDelivery'))}:</strong> ${escape(formatWhen(process.expected_delivery_at))}</p>`;
    if(process.pickup_place)html+=`<p><strong>${escape(lifecycleText('pickupPlace'))}:</strong> ${escape(process.pickup_place)}</p>`;
    if(process.pickup_start)html+=`<p><strong>${escape(lifecycleText('pickupStart'))}:</strong> ${escape(formatWhen(process.pickup_start))}${process.pickup_end?' – '+escape(formatWhen(process.pickup_end)):''}</p>`;
    if(process.delivery_note)html+=`<p style="white-space:pre-wrap">${escape(process.delivery_note)}</p>`;
    if(process.result_note)html+=`<p style="white-space:pre-wrap"><strong>${escape(lifecycleText('resultNote'))}:</strong> ${escape(process.result_note)}</p>`;
    html+='</section>';

    if(stage==='offer_selected'&&owner){
      const draft=drafts.netPurchaseStart||{};
      html+=`<form id="netPurchaseStart" class="editor card"><h3>${escape(lifecycleText('startConfirmation'))}</h3><p class="meta">${escape(lifecycleText('frozen'))}</p><label>${escape(lifecycleText('confirmationDeadline'))}<input name="deadline" type="datetime-local" required value="${escape(draft.deadline||'')}"></label><button class="button">${escape(lifecycleText('startConfirmation'))}</button></form>`;
    }

    if(stage==='confirming'){
      html+=`<h3>${escape(lifecycleText('confirmations'))}</h3><div class="draft-grid">${confirmations.map(item=>`<article class="card"><strong>${escape(profileName(item.user_id))}</strong><p>${escape(String(item.quantity))} ${escape(coop.unit)}</p><span class="badge">${escape(lifecycleText(item.decision))}</span>${item.note?`<p class="meta">${escape(item.note)}</p>`:''}</article>`).join('')||`<div class="empty"><p>${escape(lifecycleText('noSnapshot'))}</p></div>`}</div><p><strong>${escape(lifecycleText('confirmedTotal'))}: ${escape(String(confirmedTotal))} ${escape(coop.unit)}</strong> · ${escape(lifecycleText('pending'))}: ${pending} · ${escape(lifecycleText('declined'))}: ${declined}</p>`;
      if(mine){
        const draft=drafts.netPurchaseConfirm||{};
        html+=`<form id="netPurchaseConfirm" class="editor card"><label>${escape(lifecycleText('responseNote'))}<input name="note" maxlength="500" value="${escape(draft.note||mine.note||'')}"></label><div class="actions"><button name="operation" value="yes" class="button">${escape(lifecycleText('confirmYes'))}</button><button name="operation" value="no" class="button secondary">${escape(lifecycleText('confirmNo'))}</button></div></form>`;
      }else{
        html+=`<aside class="notice"><p>${escape(lifecycleText('noSnapshot'))}</p></aside>`;
      }
      if(owner){
        html+=`<div class="actions">${button('resetConfirmation','resetConfirmation',coop.id)}</div>`;
        if(pending===0&&confirmed.length>0){
          const draft=drafts.netPurchaseOrdered||{};
          html+=`<form id="netPurchaseOrdered" class="editor card"><h3>${escape(lifecycleText('markOrdered'))}</h3><p class="meta">${escape(lifecycleText('externalOrderNotice'))}</p><label>${escape(lifecycleText('externalReference'))}<input name="reference" maxlength="120" value="${escape(draft.reference||'')}"></label><label>${escape(lifecycleText('expectedDelivery'))}<input name="expectedDelivery" type="datetime-local" value="${escape(draft.expectedDelivery||'')}"></label><label>${escape(lifecycleText('pickupPlace'))}<input name="pickupPlace" maxlength="200" value="${escape(draft.pickupPlace||'')}"></label><label>${escape(lifecycleText('pickupStart'))}<input name="pickupStart" type="datetime-local" value="${escape(draft.pickupStart||'')}"></label><label>${escape(lifecycleText('pickupEnd'))}<input name="pickupEnd" type="datetime-local" value="${escape(draft.pickupEnd||'')}"></label><label>${escape(lifecycleText('deliveryNote'))}<textarea name="note" maxlength="1000" rows="3">${escape(draft.note||'')}</textarea></label><button class="button">${escape(lifecycleText('markOrdered'))}</button></form>`;
        }else{
          html+=`<p class="meta">${escape(lifecycleText('allResponsesNeeded'))}</p>`;
        }
      }
    }

    if(['ordered','delivered','distributing'].includes(stage)){
      if(owner){
        const draft=drafts.netPurchaseDeliveryPlan||{
          expectedDelivery:localDateTime(process.expected_delivery_at),
          pickupPlace:process.pickup_place||'',
          pickupStart:localDateTime(process.pickup_start),
          pickupEnd:localDateTime(process.pickup_end),
          note:process.delivery_note||''
        };
        html+=`<form id="netPurchaseDeliveryPlan" class="editor card"><h3>${escape(lifecycleText('saveDeliveryPlan'))}</h3><label>${escape(lifecycleText('expectedDelivery'))}<input name="expectedDelivery" type="datetime-local" value="${escape(draft.expectedDelivery||'')}"></label><label>${escape(lifecycleText('pickupPlace'))}<input name="pickupPlace" maxlength="200" value="${escape(draft.pickupPlace||'')}"></label><label>${escape(lifecycleText('pickupStart'))}<input name="pickupStart" type="datetime-local" value="${escape(draft.pickupStart||'')}"></label><label>${escape(lifecycleText('pickupEnd'))}<input name="pickupEnd" type="datetime-local" value="${escape(draft.pickupEnd||'')}"></label><label>${escape(lifecycleText('deliveryNote'))}<textarea name="note" maxlength="1000" rows="3">${escape(draft.note||'')}</textarea></label><button class="button secondary">${escape(lifecycleText('saveDeliveryPlan'))}</button></form>`;
      }
      if(stage==='ordered'&&owner){
        const draft=drafts.netPurchaseDelivered||{};
        html+=`<form id="netPurchaseDelivered" class="editor card"><p class="meta">${escape(lifecycleText('deliverySelfReport'))}</p><label>${escape(lifecycleText('deliveryNote'))}<input name="note" maxlength="1000" value="${escape(draft.note||'')}"></label><button class="button">${escape(lifecycleText('markDelivered'))}</button></form>`;
      }
    }

    if(['delivered','distributing'].includes(stage)){
      if(mine?.decision==='confirmed'){
        const draft=drafts.netPurchaseCollected||{};
        html+=`<form id="netPurchaseCollected" class="editor card"><label>${escape(lifecycleText('collectionNote'))}<input name="note" maxlength="500" value="${escape(draft.note||mine.collected_note||'')}"></label><div class="actions"><button name="operation" value="yes" class="button">${escape(lifecycleText('markCollected'))}</button>${mine.collected_at?`<button name="operation" value="no" class="button secondary">${escape(lifecycleText('undoCollected'))}</button>`:''}</div></form>`;
      }
      if(owner){
        const draft=drafts.netPurchaseFinish||{};
        html+=`<form id="netPurchaseFinish" class="editor card"><p class="meta">${escape(lifecycleText('resultSelfReport'))}</p><label>${escape(lifecycleText('resultNote'))}<textarea name="note" maxlength="2000" rows="3">${escape(draft.note||'')}</textarea></label><button class="button">${escape(lifecycleText('finishPurchase'))}</button></form>`;
      }
    }

    if(owner&&!['done','cancelled'].includes(stage)){
      const draft=drafts.netPurchaseCancel||{};
      html+=`<form id="netPurchaseCancel" class="editor card"><label>${escape(lifecycleText('cancelReason'))}<input name="reason" maxlength="2000" minlength="3" required value="${escape(draft.reason||'')}"></label><button class="button secondary">${escape(lifecycleText('cancelPurchase'))}</button></form>`;
    }
    return html;
  }

  return Object.freeze({render});
}

globalThis.FolkoopNetworkPurchaseLifecycle=Object.freeze({create});
})();
