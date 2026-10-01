import {fetchBounded} from './http.mjs';
import '../../apps/web/civic-core.js';
import '../../apps/web/daily-data.js';
const origin='https://chup1runov.github.io';
for(const [name,url,normalize] of [
 ['SMHI SNOW1gv1','https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/11.97/lat/57.71/data.json',FolkoopCityDaily.forecast],
 ['SMHI county warnings','https://opendata-download-warnings.smhi.se/ibww/api/version/1/warning.json',FolkoopCityDaily.warnings]
]){
 const r=await fetchBounded(url,{headers:{origin,accept:'application/json'}});
 if(!r.ok)throw new Error(name+' HTTP '+r.status);
 const cors=r.headers.get('access-control-allow-origin');if(cors!=='*'&&cors!==origin)throw new Error(name+' browser CORS not available');
 const payload=normalize(await r.json());console.log(name+': valid current schema; '+(payload.rows?.length??payload.length)+' relevant entries');
}
