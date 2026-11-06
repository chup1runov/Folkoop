/* Read-only, derived task-basis inbox. Opening a notice never records consent. */
(() => {
'use strict';
const copy={
 ru:'Согласование задач|Нужно твоё согласие с основанием задачи|Что изменилось|Было|Стало|Первое основание задачи|Твоё согласие больше не требуется в текущем составе|Открыть задачу|Нет уведомлений по основаниям задач.|Это текущее состояние, не непрочитанные сообщения. Показаны первые записи из общего количества. Чтение не означает согласия.|Сравнение с предыдущей версией основания, а не с последней просмотренной.|Новый документ ещё не включён в основание|Документ в основании|Последняя редакция документа|Список необходимых согласующих|Задача завершена; показаны текущие ответы, результат не отменяется.|Тип или связи документа изменились|Условия основания не менялись.',
 en:'Task consent|Your consent to the task basis is needed|What changed|Before|After|First task basis|Your consent is no longer required in the current list|Open task|No task-basis notices.|This is current state, not unread messages. Showing the first records out of the total. Reading is not consent.|Compared with the previous basis version, not the last viewed version.|The new document is not yet part of the basis|Document in the basis|Latest document revision|Required signers|Task completed; current responses are shown, the result is not undone.|Document type or links changed|Basis terms have not changed.',
 sv:'Samtycke för uppgifter|Ditt samtycke till uppgiftens underlag behövs|Vad har ändrats|Före|Efter|Uppgiftens första underlag|Ditt samtycke krävs inte längre i den aktuella listan|Öppna uppgift|Inga aviseringar om uppgiftsunderlag.|Aktuellt läge, inte olästa meddelanden. De första posterna av totalen visas. Att läsa är inte samtycke.|Jämförs med föregående underlagsversion, inte senast visade version.|Det nya dokumentet ingår ännu inte i underlaget|Dokument i underlaget|Senaste dokumentversion|Nödvändiga samtyckande deltagare|Uppgiften är klar; aktuella svar visas, resultatet återkallas inte.|Dokumenttyp eller länkar har ändrats|Underlagets villkor har inte ändrats.',
 uk:'Погодження завдань|Потрібна твоя згода з підставою завдання|Що змінилося|Було|Стало|Перша підстава завдання|Твоя згода більше не потрібна в поточному складі|Відкрити завдання|Немає сповіщень про підстави завдань.|Це поточний стан, не непрочитані повідомлення. Показано перші записи із загальної кількості. Читання не є згодою.|Порівняння з попередньою версією підстави, не з останньою переглянутою.|Новий документ ще не включено до підстави|Документ у підставі|Остання редакція документа|Необхідні погоджувачі|Завдання завершено; показано поточні відповіді, результат не скасовується.|Тип або зв’язки документа змінилися|Умови підстави не змінилися.',
 fi:'Tehtävien suostumukset|Suostumuksesi tehtävän perusteeseen tarvitaan|Mikä muuttui|Ennen|Jälkeen|Tehtävän ensimmäinen peruste|Suostumustasi ei enää vaadita nykyisessä luettelossa|Avaa tehtävä|Ei tehtäväperusteen ilmoituksia.|Nykyinen tila, ei lukemattomia viestejä. Näytetään ensimmäiset tietueet kokonaismäärästä. Lukeminen ei ole suostumus.|Verrataan edelliseen perusteversioon, ei viimeksi katsottuun.|Uusi asiakirja ei vielä kuulu perusteeseen|Perusteen asiakirja|Uusin asiakirjaversio|Vaaditut hyväksyjät|Tehtävä valmistui; nykyiset vastaukset näkyvät, tulosta ei peruta.|Asiakirjan tyyppi tai linkit muuttuivat|Perusteen ehdot eivät muuttuneet.',
 bs:'Saglasnosti za zadatke|Potrebna je tvoja saglasnost na osnovu zadatka|Šta se promijenilo|Prije|Poslije|Prva osnova zadatka|Tvoja saglasnost više nije potrebna na trenutnom spisku|Otvori zadatak|Nema obavijesti o osnovama zadataka.|Trenutno stanje, ne nepročitane poruke. Prikazani su prvi zapisi od ukupnog broja. Čitanje nije saglasnost.|Poređenje s prethodnom verzijom osnove, ne posljednjom pregledanom.|Novi dokument još nije dio osnove|Dokument u osnovi|Najnovija verzija dokumenta|Potrebni potpisnici|Zadatak je završen; prikazani su trenutni odgovori, rezultat se ne poništava.|Vrsta ili veze dokumenta su promijenjene|Uslovi osnove nisu promijenjeni.',
 es:'Consentimiento de tareas|Se necesita tu consentimiento a la base de la tarea|Qué cambió|Antes|Después|Primera base de la tarea|Tu consentimiento ya no es necesario en la lista actual|Abrir tarea|No hay avisos sobre bases de tareas.|Es el estado actual, no mensajes sin leer. Se muestran los primeros registros del total. Leer no es consentir.|Comparación con la versión anterior, no con la última vista.|El nuevo documento aún no forma parte de la base|Documento de la base|Última versión del documento|Personas cuyo consentimiento se requiere|Tarea completada; se muestran las respuestas actuales, no se anula el resultado.|Cambió el tipo o los enlaces del documento|No cambiaron las condiciones de la base.',
 ar:'موافقات المهام|موافقتك على أساس المهمة مطلوبة|ما الذي تغير|قبل|بعد|أول أساس للمهمة|لم تعد موافقتك مطلوبة في القائمة الحالية|فتح المهمة|لا إشعارات لأسس المهام.|هذه الحالة الحالية وليست رسائل غير مقروءة. تُعرض أولى السجلات من الإجمالي. القراءة ليست موافقة.|المقارنة مع الإصدار السابق للأساس وليس آخر إصدار شاهدته.|المستند الجديد ليس ضمن الأساس بعد|المستند في الأساس|أحدث إصدار للمستند|الأشخاص المطلوب موافقتهم|المهمة مكتملة؛ تُعرض الردود الحالية ولا تُلغى النتيجة.|تغير نوع المستند أو روابطه|لم تتغير شروط الأساس.',
 fa:'رضایت‌های کارها|رضایت شما با مبنای کار لازم است|چه تغییر کرده|پیش از تغییر|پس از تغییر|اولین مبنای کار|رضایت شما دیگر در فهرست فعلی لازم نیست|باز کردن کار|اعلانی درباره مبنای کارها نیست.|این وضعیت فعلی است نه پیام‌های خوانده‌نشده. اولین موارد از کل نمایش داده می‌شود. خواندن رضایت نیست.|مقایسه با نسخه قبلی مبنا، نه آخرین نسخه مشاهده‌شده.|سند جدید هنوز بخشی از مبنا نیست|سند مبنا|آخرین نسخه سند|افرادی که رضایتشان لازم است|کار پایان یافته؛ پاسخ‌های فعلی نمایش داده می‌شوند و نتیجه لغو نمی‌شود.|نوع یا پیوندهای سند تغییر کرده|شرایط مبنا تغییر نکرده است.',
 so:'Oggolaanshaha hawlaha|Oggolaanshahaaga aasaaska hawsha ayaa loo baahan yahay|Maxaa is beddelay|Hore|Kadib|Aasaaska koowaad ee hawsha|Oggolaanshahaaga looma baahna liiska hadda|Fur hawsha|Ogeysiisyo aasaaska hawlaha ma jiraan.|Waa xaaladda hadda, ma aha farriimo aan la akhrin. Diiwaannada ugu horreeya ee wadarta ayaa muuqda. Akhrintu oggolaansho ma aha.|Waxaa lala barbar dhigaa noocii hore ee aasaaska, ma aha kii ugu dambeeyey ee la arkay.|Dukumentiga cusub weli kama mid aha aasaaska|Dukumentiga aasaaska|Nooca ugu dambeeya ee dukumentiga|Dadka oggolaanshahooda loo baahan yahay|Hawshu way dhammaatay; jawaabaha hadda ayaa muuqda, natiijada lama burinayo.|Nooca ama xiriirrada dukumentiga ayaa is beddelay|Shuruudaha aasaasku isma beddelin.',
 ku:'Razîbûnên peywiran|Razîbûna te ji bo bingeha peywirê pêwîst e|Çi guherî|Berê|Piştî|Bingeha yekem a peywirê|Di lîsteya niha de razîbûna te êdî ne pêwîst e|Peywirê veke|Agahiya bingeha peywiran tune ye.|Ev rewşa niha ye, ne peyamên nexwendî. Tomarên yekem ji tevahiyê tên nîşandan. Xwendin ne razîbûn e.|Berawird bi guhertoya berê ya bingehê ye, ne ya herî dawî hatiye dîtin.|Belgeya nû hê ne beşek ji bingehê ye|Belgeya di bingehê de|Guhertoya herî dawî ya belgeyê|Kesên ku razîbûna wan pêwîst e|Peywir qediyaye; bersivên niha tên nîşandan, encam nayê betalkirin.|Cure an girêdanên belgeyê guherîn|Şertên bingehê neguherîn.'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=i=>(copy[document.documentElement.lang]||copy.en).split('|')[i];
function changedFields(before,after){
 if(!before)return [];
 const fields=[];
 if(before.decision_id!==after.decision_id)fields.push('decision');
 if(before.document_id!==after.document_id||before.document_revision!==after.document_revision)fields.push('document');
 const ids=x=>JSON.stringify((x.signers||[]).map(s=>s.user_id).sort());
 if(ids(before)!==ids(after))fields.push('signers');
 return fields;
}
function render({rows,error,loadedAt,now=Date.now(),online=globalThis.navigator?.onLine!==false}){
 if(rows===undefined&&!error)return '';
 const tx=i=>esc(text(i)),bx=i=>esc(globalThis.FolkoopTaskWork.basisText(i));
 let html=`<section class="task-basis-notices"><div class="row"><h3>${tx(0)}</h3><button class="button secondary" type="button" data-coop="taskRefresh">${esc(globalThis.FolkoopTaskWork.text(18))}</button></div>`;
 if(error||!Array.isArray(rows)||!online||!Number.isFinite(loadedAt)||now-loadedAt>=60000)return html+`<p role="status">${bx(10)}</p></section>`;
 html+=`<p class="meta">${rows.length} / ${esc(rows[0]?.total_count||0)} · ${tx(9)}</p>`;
 const person=s=>esc(s.name||globalThis.FolkoopTaskWork.basisText(14));
 const names=list=>`<ul>${(list||[]).map(s=>`<li>${person(s)}</li>`).join('')}</ul>`;
 const doc=d=>d?`<strong>${esc(d.title)} · v${esc(d.revision)}</strong><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(d.body)}</p>`:`<p>${bx(21)}</p>`;
 const decision=d=>d?`<strong>${esc(d.question)}</strong><p>${esc(d.options?.[d.selected_option]||'')}</p><p style="white-space:pre-wrap">${esc(d.rationale)}</p>`:`<p>${bx(21)}</p>`;
 const value=(k,b)=>k==='signers'?names(b.signers):k==='document'?doc(b.document):decision(b.decision);
 for(const n of rows){
  const after=n.after_basis,before=n.before_basis;
  html+=`<article class="card"><h4>${esc(n.task_title)}</h4><p>${esc(n.project_title)} · ${bx(19)} ${esc(n.revision)}</p>`;
  if(n.work_stage==='verified')html+=`<p>${tx(15)}</p>`;
  else{
   if(n.missing_link)html+=`<p role="status">${bx(21)}</p>`;
   else if(n.document_stale)html+=`<p role="status">${bx(16)}</p>`;
   if(n.response_state==='pending'&&!n.document_stale&&!n.missing_link)html+=`<p>${tx(1)}</p>`;
   if(n.response_state==='confirmed')html+=`<p>${bx(11)}</p>`;
   if(n.response_state==='withdrawn')html+=`<p>${bx(13)}</p>`;
   if(n.response_state==='not_required'&&!n.organizer)html+=`<p>${tx(6)}</p>`;
  }
  html+=`<p>${bx(1)}: ${esc(after.decision?.question||globalThis.FolkoopTaskWork.basisText(21))}</p><p>${bx(2)}: ${esc(after.document?.title||globalThis.FolkoopTaskWork.basisText(21))} · v${esc(after.document_revision)}</p>`;
  if(n.organizer){
   const groups=[[11,s=>s.member&&s.confirmed===true],[12,s=>s.member&&s.confirmed==null],[13,s=>s.member&&s.confirmed===false],[14,s=>!s.member]];
   html+='<div class="readiness-columns">'+groups.map(([label,predicate])=>{
    const people=n.signers.filter(predicate);
    return `<section><h5>${bx(label)} · ${people.length}</h5><ul>${people.map(s=>`<li>${person(s)}${!s.member&&s.confirmed!=null?' — '+bx(s.confirmed?11:13):''}${s.responded_at?' · <time datetime="'+esc(s.responded_at)+'">'+esc(new Date(s.responded_at).toLocaleString())+'</time>':''}</li>`).join('')}</ul></section>`;
   }).join('')+'</div>';
  }
  const changes=changedFields(before,after);
  html+=`<details><summary>${tx(2)}</summary><p class="meta">${tx(10)}</p>`;
  if(!before)html+=`<p>${tx(5)}</p>${decision(after.decision)}${doc(after.document)}<h5>${tx(14)}</h5>${names(after.signers)}`;
  else if(!changes.length)html+=`<p>${tx(17)}</p>`;
  else for(const k of changes)html+=`<section><h5>${k==='signers'?tx(14):bx(k==='decision'?1:2)}</h5><p>${tx(3)} · ${bx(19)} ${esc(before.revision)}</p>${value(k,before)}<p>${tx(4)} · ${bx(19)} ${esc(after.revision)}</p>${value(k,after)}</section>`;
  if(before?.document&&after.document&&['kind','decision_id','task_ids'].some(k=>JSON.stringify(before.document[k])!==JSON.stringify(after.document[k])))html+=`<p>${tx(16)}</p>`;
  html+='</details>';
  if(n.document_stale&&n.latest_document)html+=`<details><summary>${tx(11)}</summary><h5>${tx(12)}</h5>${doc(after.document)}<h5>${tx(13)}</h5>${doc(n.latest_document)}${['kind','decision_id','task_ids'].some(k=>JSON.stringify(after.document?.[k])!==JSON.stringify(n.latest_document[k]))?`<p>${tx(16)}</p>`:''}</details>`;
  html+=`<button class="button secondary" type="button" data-coop="openNotify" data-target-kind="project" data-id="${esc(n.cooperation_id)}" data-task="${esc(n.task_id)}">${tx(7)}</button></article>`;
 }
 return html+(rows.length?'':`<p>${tx(8)}</p>`)+'</section>';
}
globalThis.FolkoopTaskBasisNotices=Object.freeze({render,changedFields,text});
})();
