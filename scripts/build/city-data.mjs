import {readFile} from 'node:fs/promises';
import '../../apps/web/civic-core.js';
export const CITY_FEEDS=Object.freeze([
 {file:'riksdagen-decisions.json',id:'riksdagen_open_data',hosts:['data.riksdagen.se']},
 {file:'goteborg-open-plans.json',id:'goteborg_open_plans',hosts:['goteborg.se','www.goteborg.se']}
]);
export function validateCityFeed(payload,source,{now=Date.now(),maxAgeMs=24*60*60*1000}={}){
 const core=globalThis.FolkoopCityCore;
 core.feed(payload,source.id,source.hosts);
 if(now-Date.parse(payload.fetchedAt)>maxAgeMs)throw new Error('STALE_CITY_FEED: '+source.file);
 if(source.id==='riksdagen_open_data'&&!payload.items.length)throw new Error('EMPTY_DECISION_FEED');
 if(source.id==='goteborg_open_plans'&&(!core.officialUrl(payload.sourceUrl,source.hosts)||payload.itemCount!==payload.items.length||payload.items.some(i=>!core.dateOnly(i.deadline))))throw new Error('INVALID_PLAN_FEED');
 return payload;
}
export async function validateCityData(directory='data',options){
 return Promise.all(CITY_FEEDS.map(async source=>{
  const payload=JSON.parse(await readFile(directory+'/'+source.file,'utf8'));
  validateCityFeed(payload,source,options);return {file:source.file,fetchedAt:payload.fetchedAt,count:payload.items.length};
 }));
}
