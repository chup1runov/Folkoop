/* Voluntary selected-object exchange. Pure validation and rendering: no network or DB writes. */
(()=>{'use strict';
const FORMAT='folkoop-selected-objects',VERSION=1,MAX=200000;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function invalid(path){throw Object.assign(new Error('INVALID_EXCHANGE'),{code:'INVALID_EXCHANGE',path});}
function keys(o,list,path){if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).length!==list.length||list.some(k=>!Object.hasOwn(o,k)))invalid(path);}
function str(v,min,max,path){if(typeof v!=='string'||v.trim().length<min||v.length>max)invalid(path);}
function date(v,path){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)invalid(path);}
function validate(packet){
 keys(packet,['format','version','generated_at','records'],'packet');if(packet.format!==FORMAT||packet.version!==VERSION)invalid('version');date(packet.generated_at,'generated_at');
 if(!Array.isArray(packet.records)||packet.records.length<1||packet.records.length>20)invalid('records');const ids=new Set();
 for(const [i,r] of packet.records.entries()){
  const p='records['+i+']';keys(r,['id','type','title','quantity','period','place','conditions','source'],p);
  if(typeof r.id!=='string'||!uuid.test(r.id)||ids.has(r.id.toLowerCase()))invalid(p+'.id');ids.add(r.id.toLowerCase());
  if(!['need','offer','resource'].includes(r.type))invalid(p+'.type');str(r.title,2,120,p+'.title');str(r.conditions,0,1000,p+'.conditions');
  if(r.quantity!==null){keys(r.quantity,['value','unit'],p+'.quantity');if(typeof r.quantity.value!=='string'||!/^\d{1,10}(\.\d{1,3})?$/.test(r.quantity.value)||Number(r.quantity.value)<=0||Number(r.quantity.value)>1000000000)invalid(p+'.quantity.value');str(r.quantity.unit,1,30,p+'.quantity.unit');}
  if(r.period!==null){keys(r.period,['from','until'],p+'.period');date(r.period.from,p+'.period.from');date(r.period.until,p+'.period.until');if(r.period.until<=r.period.from)invalid(p+'.period');}
  keys(r.place,['precision','label'],p+'.place');if(!['unspecified','area'].includes(r.place.precision))invalid(p+'.place.precision');str(r.place.label,r.place.precision==='area'?1:0,120,p+'.place.label');if(r.place.precision==='unspecified'&&r.place.label!=='')invalid(p+'.place.label');
  keys(r.source,['system','object_id','updated_at','observed_at','declaration'],p+'.source');if(r.source.system!=='FOLKOOP'||r.source.object_id!==r.id||r.source.declaration!=='exporter_statement')invalid(p+'.source');if(r.source.updated_at!==null)date(r.source.updated_at,p+'.source.updated_at');date(r.source.observed_at,p+'.source.observed_at');
 }
 return packet;
}
function parse(text){if(typeof text!=='string'||text.length>MAX)invalid('size');let p;try{p=JSON.parse(text);}catch{invalid('json');}return validate(p);}
function build({rows,user,selected,fields={},loadedAt,now=Date.now()}){
 if(!user?.id||!Number.isFinite(loadedAt)||now<loadedAt||now-loadedAt>=60000||!Array.isArray(selected)||new Set(selected).size!==selected.length)invalid('selection');
 const timestamp=v=>{if(!v)return null;const d=new Date(v);if(!Number.isFinite(d.getTime()))invalid('date');return d.toISOString();};
 const packet={format:FORMAT,version:VERSION,generated_at:new Date(now).toISOString(),records:selected.map(id=>{
  const r=rows.find(r=>r.id===id&&r.owner_id===user.id&&['need','offer','resource'].includes(r.kind)&&['open','active'].includes(r.status));if(!r)invalid('selection');
  const f=fields[id]||{};if((!f.quantity)!==(!f.unit))invalid('quantity');if((!f.from)!==(!f.until))invalid('period');
  return {id:r.id,type:r.kind,title:r.title,quantity:f.quantity?{value:f.quantity,unit:f.unit}:null,period:f.from?{from:timestamp(f.from),until:timestamp(f.until)}:null,place:{precision:f.area?'area':'unspecified',label:f.area||''},conditions:f.conditions||'',source:{system:'FOLKOOP',object_id:r.id,updated_at:timestamp(r.updated_at),observed_at:new Date(loadedAt).toISOString(),declaration:'exporter_statement'}};
 })};return validate(packet);
}
const copy={ru:['Обмен выбранными объектами','Файл для совместного испытания формата, не живая интеграция. Выберите свои открытые записи. Личные профили, переписки, адреса и описание записи автоматически не копируются.','Количество — оставьте пустым, если неизвестно','Единица — например, шт., час, кг','Доступно / требуется с — время устройства','До — время устройства','Район или город — необязательно; не точный адрес','Условия, которые вы хотите передать','Подготовить и проверить JSON','Скачать проверенный пакет','Проверить JSON без импорта','Вставьте содержимое файла','Проверить и показать','Формат корректен. Данные не записаны и не подтверждены внешним источником.','Файл не прошёл проверку','Данные изменились или устарели. Обновите список и подготовьте пакет заново.','Доступных собственных записей нет. Создайте потребность, предложение или ресурс в «Вместе».','Не указано','Количество, сроки, район и условия — ваше заявление для этого файла, не подтверждённый резерв. Проверьте, что готовы передать эти сведения.','Выберите от 1 до 20 записей.','Версия формата','Источник: обновлён / просмотрен','Проверка только структуры. Точность, права на ресурс и актуальная доступность не удостоверяются.'],en:['Exchange selected objects','A file for testing the format together, not a live integration. Select your open records. Profiles, messages, addresses and record descriptions are not copied automatically.','Quantity — leave empty if unknown','Unit — for example item, hour, kg','Available / needed from — device time','Until — device time','Area or city — optional; not a precise address','Conditions you want to share','Prepare and validate JSON','Download validated packet','Validate JSON without importing','Paste file contents','Validate and display','Valid format. No data was saved or independently verified.','File validation failed','Data changed or became stale. Refresh the list and prepare the packet again.','No available owned records. Create a need, offer or resource in Together.','Not specified','Quantity, times, area and conditions are your declaration for this file, not a confirmed reservation. Review what you intend to share.','Select 1–20 records.','Format version','Source: updated / observed','Structural validation only. Accuracy, resource authority and current availability are not certified.']};
Object.assign(copy,globalThis.FolkoopFeatureCopy?.exchange||{});
const text=i=>(copy[document.documentElement.lang]||copy.en)[i];
function preview(packet){validate(packet);const tx=i=>esc(text(i));return `<section class="exchange-preview"><p>${tx(13)}</p><p>${tx(22)}</p><p>${tx(20)}: ${VERSION}</p>${packet.records.map(r=>`<article><h4>${esc(r.title)}</h4><p>${esc(r.type)} · ${esc(r.id)}</p><p>${r.quantity?esc(r.quantity.value+' '+r.quantity.unit):tx(17)}</p><p>${r.period?esc(r.period.from+' — '+r.period.until):tx(17)}</p><p>${esc(r.place.label||text(17))}</p><p style="white-space:pre-wrap">${esc(r.conditions)}</p><p>${tx(21)}: ${esc(r.source.updated_at||text(17))} / ${esc(r.source.observed_at)}</p></article>`).join('')}</section>`;}
function render({rows=[],user,draft={selected:[],fields:{}},packet,readback,error,input=''}){
 const tx=i=>esc(text(i)),own=rows.filter(r=>r.owner_id===user.id&&['need','offer','resource'].includes(r.kind)&&['open','active'].includes(r.status));
 let out=`<section class="card" lang="${Object.hasOwn(copy,document.documentElement.lang)?document.documentElement.lang:'en'}" dir="${['ar','fa'].includes(document.documentElement.lang)?'rtl':'ltr'}"><h3>${tx(0)}</h3><p>${tx(1)}</p><p>${tx(18)}</p><p>${tx(19)}</p>`;
 if(error)out+=`<p role="status">${tx(error==='STALE'?15:14)}</p>`;
 if(own.length)out+=`<form id="netExchange">${own.map(r=>{const f=draft.fields[r.id]||{};return `<article><label><input type="checkbox" name="selected" value="${esc(r.id)}"${draft.selected.includes(r.id)?' checked':''}> ${esc(r.title)}</label><details><summary>${esc(r.kind)} · ${esc(r.title)}</summary>${[['quantity',2,'text'],['unit',3,'text'],['from',4,'datetime-local'],['until',5,'datetime-local'],['area',6,'text']].map(([k,i,type])=>`<label>${tx(i)}<input name="${esc(r.id+'.'+k)}" type="${type}" maxlength="${k==='area'?120:30}" value="${esc(f[k]||'')}"></label>`).join('')}<label>${tx(7)}<textarea name="${esc(r.id)}.conditions" maxlength="1000">${esc(f.conditions||'')}</textarea></label></details></article>`;}).join('')}<button class="button">${tx(8)}</button></form>`;else out+=`<p>${tx(16)}</p>`;
 if(packet)out+=preview(packet)+`<textarea readonly rows="12" aria-label="JSON">${esc(JSON.stringify(packet,null,2))}</textarea><button type="button" class="button" data-net="exchangeDownload">${tx(9)}</button>`;
 out+=`<details><summary>${tx(10)}</summary><form id="netExchangeRead"><label>${tx(11)}<textarea name="json" rows="10" maxlength="${MAX}" required>${esc(input)}</textarea></label><button class="button">${tx(12)}</button></form>${readback?preview(readback):''}</details></section>`;return out;
}
globalThis.FolkoopExchange=Object.freeze({validate,parse,build,render,preview,text});
})();
