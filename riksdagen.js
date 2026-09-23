/* Public normalized feed only. A malformed source is not an empty result. */
(() => {
  let cache=null,pending=null,received=0;
  async function loadLatestDecisions({force=false}={}) {
    if(!force && cache && Date.now()-received<300000)return cache;
    if(pending)return pending;
    pending=(async()=>{
      const r=await SverinavCore.fetchJSON('./data/riksdagen-decisions.json');
      const payload=SverinavCore.feed(r.payload,'riksdagen_open_data',['data.riksdagen.se']);
      if(!payload.items.length)throw new Error('EMPTY_DECISION_FEED');
      cache={...payload,_cached:r.cached};received=Date.now();return cache;
    })().finally(()=>{pending=null;});
    return pending;
  }
  globalThis.SverinavRiksdagen={loadLatestDecisions};
})();
