// Reuse only a recently verified public snapshot when the official host is unavailable.
// Keep its original timestamp: copying a feed is not a fresh source observation.
import {fetchBounded} from './http.mjs';
import {CITY_FEEDS,validateCityFeed} from '../build/city-data.mjs';
export async function recoverPublishedPlans(error,{send=fetchBounded,now=Date.now()}={}){
 const transient=/^TRANSIENT_HTTP_(429|5\d\d)$/.test(error?.message||'')||['TimeoutError','AbortError'].includes(error?.name)||(error?.name==='TypeError'&&error?.message==='fetch failed');
 if(!transient)throw error;
 const response=await send('https://folkoop.pages.dev/data/goteborg-open-plans.json',{headers:{accept:'application/json'}});
 if(!response.ok)throw new Error('PUBLISHED_PLANS_UNAVAILABLE');
 const payload=await response.json();
 validateCityFeed(payload,CITY_FEEDS.find(s=>s.id==='goteborg_open_plans'),{now});
 return payload;
}
