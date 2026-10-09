/* Visible resource catalogue context, not project inventory or verified availability.
   Uses the existing RLS-filtered cooperation list. Does not fetch, cache, match by
   inferred suitability, reserve resources, or add a new permission surface. */
(() => {
'use strict';
const words={
 sv:['Resurser med samma angivna plats','Andra poster i katalogen, inte bokade för detta projekt. Fråga ägaren om villkoren.','Visa resurs','Angiven plats','Resurser'],
 en:['Resources with the same listed place','Other catalogue entries, not reserved for this project. Check the terms with the owner.','View resource','Listed place','Resources'],
 ru:['Ресурсы с таким же указанным местом','Это другие записи каталога, не закреплённые за проектом. Уточните условия у владельца.','Открыть ресурс','Указанное место','Ресурсы'],
 es:['Recursos con el mismo lugar indicado','Son otras entradas del catálogo, no reservas del proyecto. Consulta las condiciones con la persona propietaria.','Ver recurso','Lugar indicado','Recursos'],
 uk:['Ресурси з таким самим зазначеним місцем','Це інші записи каталогу, не закріплені за проєктом. Уточніть умови у власника.','Відкрити ресурс','Зазначене місце','Ресурси'],
 fi:['Resursseja samalla ilmoitetulla paikalla','Nämä ovat muita luettelomerkintöjä, eivät projektille varattuja resursseja. Tarkista ehdot omistajalta.','Katso resurssia','Ilmoitettu paikka','Resurssit'],
 bs:['Resursi s istim navedenim mjestom','Ovo su druge stavke kataloga, nisu rezervisane za projekat. Provjerite uslove s vlasnikom.','Otvori resurs','Navedeno mjesto','Resursi'],
 ar:['موارد بالمكان المذكور نفسه','هذه سجلات أخرى في الدليل وليست محجوزة لهذا المشروع. تحقق من الشروط مع المالك.','عرض المورد','المكان المذكور','الموارد'],
 fa:['منابع با مکان ثبت‌شده یکسان','این‌ها موارد دیگری در فهرست هستند و برای این پروژه رزرو نشده‌اند. شرایط را با مالک بررسی کنید.','دیدن منبع','مکان ثبت‌شده','منابع'],
 so:['Khayraad leh goobta la sheegay oo isku mid ah','Kuwani waa diiwaanno kale oo liiska ku jira, looma sii qoondeyn mashruucan. Shuruudaha milkiilaha weydii.','Fur khayraadka','Goobta la sheegay','Khayraadka'],
 ku:['Çavkaniyên bi heman cihê diyarkirî','Ev tomarên din ên katalogê ne, ji bo vê projeyê nehatine veqetandin. Mercan ji xwediyê wê bipirse.','Çavkaniyê veke','Cihê diyarkirî','Çavkanî']
};
const word=(language,index)=>(words[language]||words.en)[index];
const place=value=>String(value||'').normalize('NFKC').trim().toLocaleLowerCase();
function candidates(project,visibleCooperations,limit=2){
 if(!project||project.kind!=='project'||!place(project.location_text)||!Array.isArray(visibleCooperations))return [];
 return visibleCooperations.filter(item=>
  item&&item.kind==='resource'&&item.id!==project.id
  &&['open','active'].includes(item.status)
  &&place(item.location_text)===place(project.location_text)
 ).slice(0,Math.max(0,Math.min(limit,3)));
}
function render({project,visibleCooperations,escape,language='en'}={}){
 if(typeof escape!=='function')return '';
 const records=candidates(project,visibleCooperations);
 if(!records.length)return '';
 const title=word(language,0),note=word(language,1),cta=word(language,2),locationLabel=word(language,3);
 return '<section class="project-resource-discovery" tabindex="-1" data-resource-scope="catalogue-not-assigned" aria-label="'+escape(title)+'">'
  +'<div class="project-resource-heading"><p class="eyebrow">'+escape(locationLabel)+' · '+escape(project.location_text)+'</p><h3>'+escape(title)+'</h3></div>'
  +'<div class="project-resource-grid">'
  +records.map(item=>'<article class="project-resource-card"><strong>'+escape(item.title||'')+'</strong>'
   +'<button type="button" class="project-resource-open" data-coop="openNotify" data-id="'+escape(item.id)+'">'+escape(cta)+' <span aria-hidden="true">→</span></button></article>').join('')
  +'</div><p class="project-resource-disclaimer">'+escape(note)+'</p></section>';
}
globalThis.FolkoopProjectResources=Object.freeze({render,candidates,word});
})();
