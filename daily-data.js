/* Official SMHI SNOW1gv1 + impact-based warnings. Coarse preset, not device GPS. */
(() => {
  'use strict';
  const WEATHER='https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point';
  const WARNINGS='https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json';
  const AREAS=Object.freeze({centrum:{name:'Göteborg centrum',lat:57.71,lon:11.97},hisingen:{name:'Hisingen',lat:57.75,lon:11.93},angered:{name:'Angered',lat:57.80,lon:12.05},frolunda:{name:'Frölunda',lat:57.65,lon:11.91}});
  const finite=n=>typeof n==='number' && Number.isFinite(n) && n!==9999;
  function forecast(payload, now=Date.now()) {
    const reference=SverinavCore.timestamp(payload?.referenceTime);
    if(reference===null || reference>now+300000 || now-reference>6*3600000 || !Array.isArray(payload.timeSeries)) throw new Error('STALE_OR_INVALID_FORECAST');
    const rows=payload.timeSeries.map(row=>({time:row.time,start:row.intervalParametersStartTime,data:row.data})).filter(row=>{
      const time=SverinavCore.timestamp(row.time);return time!==null && time>=now && time<=now+24*3600000 && row.data && finite(row.data.air_temperature);
    }).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
    if(!rows.length || Date.parse(rows[0].time)-now>2*3600000) throw new Error('NO_TIMELY_FORECAST');
    return {referenceTime:payload.referenceTime,rows};
  }
  function warnings(payload,now=Date.now()) {
    if(!Array.isArray(payload)) throw new Error('INVALID_WARNINGS');
    const items=[];
    for(const warning of payload){
      if(!warning?.event || !Array.isArray(warning.warningAreas)) throw new Error('INVALID_WARNING');
      for(const area of warning.warningAreas){
        if(!Array.isArray(area.affectedAreas) || !area.warningLevel?.code) throw new Error('INVALID_WARNING_AREA');
        if(!area.affectedAreas.some(a=>a.id===14)) continue;
        const start=area.approximateStart?SverinavCore.timestamp(area.approximateStart):null;
        const end=area.approximateEnd?SverinavCore.timestamp(area.approximateEnd):null;
        if((area.approximateStart&&start===null)||(area.approximateEnd&&end===null)) throw new Error('INVALID_WARNING_DATES');
        if(end!==null && end<=now || start!==null && start>now+24*3600000) continue;
        const title=area.eventDescription?.sv || warning.event.sv;
        if(typeof title!=='string') throw new Error('INVALID_WARNING_TITLE');
        items.push({id:String(area.id),title,area:area.areaName?.sv || 'Västra Götalands län',level:area.warningLevel.code,levelLabel:area.warningLevel.sv || area.warningLevel.code,start:area.approximateStart,end:area.approximateEnd});
      }
    }
    const severity={RED:0,ORANGE:1,YELLOW:2,MESSAGE:3};
    return items.sort((a,b)=>(severity[a.level]??4)-(severity[b.level]??4));
  }
  const memory=new Map();
  async function request(key,url,normalize,ttl,signal,force){
    const cached=memory.get(key);
    if(!force&&cached&&Date.now()-cached.received<ttl) return {...cached.value,payload:normalize(cached.raw)};
    const result=await SverinavCore.fetchJSON(url,{signal});
    const value={fetchedAt:result.fetchedAt,payload:normalize(result.payload)};
    memory.set(key,{received:Date.now(),raw:result.payload,value});return value;
  }
  function loadForecast(key,{signal,force=false}={}){
    const a=AREAS[key];if(!a) return Promise.reject(new Error('INVALID_AREA'));
    return request('weather:'+key,`${WEATHER}/lon/${a.lon.toFixed(2)}/lat/${a.lat.toFixed(2)}/data.json`,forecast,300000,signal,force);
  }
  function loadWarnings({signal,force=false}={}) { return request('warnings',WARNINGS,warnings,60000,signal,force); }
  globalThis.SverinavDaily={AREAS,forecast,warnings,loadForecast,loadWarnings,finite};
})();
