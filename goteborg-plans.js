/* Recheck deadline against Sweden's date, including when the app uses a cached feed. */
(() => {
  let cache=null,pending=null,received=0;
  function active(payload) {
    const today=SverinavCore.stockholmDay();
    return {...payload,items:payload.items.filter(i=>i.deadline>=today)};
  }
  async function loadOpenPlans({force=false}={}) {
    if(!force && cache && Date.now()-received<300000)return active(cache);
    if(pending)return pending;
    pending=(async()=>{
      const r=await SverinavCore.fetchJSON('./data/goteborg-open-plans.json');
      const payload=SverinavCore.feed(r.payload,'goteborg_open_plans',['goteborg.se','www.goteborg.se']);
      if(!SverinavCore.officialUrl(payload.sourceUrl,['goteborg.se','www.goteborg.se']) || payload.items.some(i=>!SverinavCore.dateOnly(i.deadline)))throw new Error('INVALID_PLAN_FEED');
      cache={...payload,_cached:r.cached};received=Date.now();return active(cache);
    })().finally(()=>{pending=null;});
    return pending;
  }
  globalThis.SverinavGoteborgPlans={loadOpenPlans,active};
})();
