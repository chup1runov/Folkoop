/* Coordination only. Integer hundredths; no conversion of time/items to money. */
(() => {
'use strict';
// Draft translations, not human-reviewed.
const copy={
ru:'Вклады и бюджет|Нужно|Обещано всего|Передано, ждёт подтверждения|Получено — подтверждено|Не покрыто обещаниями|Ещё получить|Расходы со слов организатора|Расчётный остаток|Деньги · SEK|Вещи · шт.|Время · ч|Помещение · ч|Добавить потребность|На что нужно|Количество / сумма|Сохранить|Я обещаю|Я передал / выполнил|Подтвердить получение|Отозвать обещание|Вернуть на уточнение|Отменить подтверждение|Отменено|Исправить расход|Причина / описание|Потребностей пока нет|Обнови проект: данные недоступны или устарели|Это записи участников, не банковская выписка. Платежей здесь нет. Вещи и время не оцениваются в деньгах.|Пример: практика шведского — вымышленные данные|Ведение встречи|Помещение|Чай|Материалы|Участник|История|Отменить потребность|Записать расход|План расходов|Обещание отозвано|ч|шт.|Данные изменились. Проверь обновлённые значения.|Получение подтверждает другой человек. Для частичной передачи создай несколько отдельных обещаний.|Излишек обещаний|Излишек полученного',
en:'Contributions and budget|Needed|Total promised|Reported delivered, awaiting confirmation|Receipt confirmed|Not covered by promises|Still to receive|Expenses reported by organiser|Calculated balance|Money · SEK|Items · units|Time · h|Space · h|Add a need|Purpose|Quantity / amount|Save|I promise|I delivered / completed|Confirm receipt|Withdraw promise|Return for clarification|Undo receipt confirmation|Cancelled|Correct expense|Reason / description|No needs yet|Refresh the project: data unavailable or outdated|Participant records, not a bank statement. No payments here. Items and time are not priced in money.|Example: Swedish practice — fictional data|Facilitation|Room|Tea|Materials|Participant|History|Cancel need|Record expense|Planned costs|Promise withdrawn|h|units|Data changed. Review the refreshed values.|Another person confirms receipt. For partial delivery, make separate promises.|Excess promised|Excess received',
sv:'Bidrag och budget|Behövs|Utlovat totalt|Uppges levererat, väntar på bekräftelse|Mottagande bekräftat|Saknar löften|Återstår att ta emot|Utgifter enligt arrangören|Beräknat saldo|Pengar · SEK|Saker · st.|Tid · h|Lokal · h|Lägg till behov|Ändamål|Antal / belopp|Spara|Jag lovar|Jag har levererat / utfört|Bekräfta mottagande|Återkalla löftet|Begär förtydligande|Ångra mottagningsbekräftelse|Avbrutet|Rätta utgift|Orsak / beskrivning|Inga behov ännu|Uppdatera projektet: uppgifter saknas eller är gamla|Deltagarnas uppgifter, inte ett kontoutdrag. Inga betalningar här. Saker och tid värderas inte i pengar.|Exempel: svenskövning — påhittade uppgifter|Samtalsledare|Lokal|Te|Material|Deltagare|Historik|Avbryt behov|Registrera utgift|Planerade kostnader|Löftet återkallat|h|st.|Uppgifterna ändrades. Granska de uppdaterade värdena.|En annan person bekräftar mottagandet. Dela upp löftet för delleveranser.|Överskott av löften|Mottaget överskott',
uk:'Внески та бюджет|Потрібно|Обіцяно загалом|Передано, очікує підтвердження|Отримання підтверджено|Не покрито обіцянками|Ще отримати|Витрати зі слів організатора|Розрахунковий залишок|Гроші · SEK|Речі · шт.|Час · год|Приміщення · год|Додати потребу|На що потрібно|Кількість / сума|Зберегти|Я обіцяю|Я передав / виконав|Підтвердити отримання|Відкликати обіцянку|Повернути на уточнення|Скасувати підтвердження|Скасовано|Виправити витрату|Причина / опис|Потреб поки немає|Онови проєкт: дані відсутні або застаріли|Записи учасників, не банківська виписка. Платежів тут немає. Речі й час не оцінюються в грошах.|Приклад: практика шведської — вигадані дані|Ведення зустрічі|Приміщення|Чай|Матеріали|Учасник|Історія|Скасувати потребу|Записати витрату|План витрат|Обіцянку відкликано|год|шт.|Дані змінилися. Перевір оновлені значення.|Отримання підтверджує інша людина. Для часткової передачі створи окремі обіцянки.|Надлишок обіцянок|Отриманий надлишок',
fi:'Panokset ja budjetti|Tarvitaan|Luvattu yhteensä|Ilmoitettu toimitetuksi, odottaa vahvistusta|Vastaanotto vahvistettu|Lupauksilla kattamatta|Vielä vastaanotettava|Järjestäjän ilmoittamat kulut|Laskennallinen saldo|Raha · SEK|Tavarat · kpl|Aika · h|Tila · h|Lisää tarve|Tarkoitus|Määrä / summa|Tallenna|Lupaan|Olen toimittanut / tehnyt|Vahvista vastaanotto|Peru lupaus|Pyydä tarkennusta|Peru vastaanottovahvistus|Peruttu|Korjaa kulu|Syy / kuvaus|Ei vielä tarpeita|Päivitä projekti: tiedot puuttuvat tai vanhentuivat|Osallistujien kirjauksia, ei tiliote. Ei maksuja täällä. Tavaroita ja aikaa ei hinnoitella rahaksi.|Esimerkki: ruotsin harjoittelu — kuvitteelliset tiedot|Ohjaus|Tila|Tee|Materiaalit|Osallistuja|Historia|Peru tarve|Kirjaa kulu|Suunnitellut kulut|Lupaus peruttu|h|kpl|Tiedot muuttuivat. Tarkista päivitetyt arvot.|Toinen henkilö vahvistaa vastaanoton. Tee erilliset lupaukset osatoimituksille.|Luvattu yli tarpeen|Vastaanotettu yli tarpeen',
bs:'Doprinosi i budžet|Potrebno|Ukupno obećano|Prijavljeno predato, čeka potvrdu|Prijem potvrđen|Nije pokriveno obećanjima|Još treba primiti|Troškovi prema organizatoru|Izračunati ostatak|Novac · SEK|Stvari · kom.|Vrijeme · h|Prostor · h|Dodaj potrebu|Namjena|Količina / iznos|Sačuvaj|Obećavam|Predao/la sam / uradio/la|Potvrdi prijem|Povuci obećanje|Vrati na pojašnjenje|Poništi potvrdu prijema|Otkazano|Ispravi trošak|Razlog / opis|Još nema potreba|Osvježi projekat: podaci nisu dostupni ili su zastarjeli|Zapisi učesnika, ne bankovni izvod. Ovdje nema plaćanja. Stvari i vrijeme se ne vrednuju novcem.|Primjer: vježbanje švedskog — izmišljeni podaci|Vođenje susreta|Prostorija|Čaj|Materijali|Učesnik|Historija|Otkaži potrebu|Zabilježi trošak|Planirani troškovi|Obećanje povučeno|h|kom.|Podaci su promijenjeni. Pregledaj nove vrijednosti.|Druga osoba potvrđuje prijem. Za djelimične predaje napravi odvojena obećanja.|Višak obećanog|Višak primljenog',
es:'Aportaciones y presupuesto|Necesario|Total prometido|Entrega declarada, pendiente de confirmar|Recepción confirmada|Sin promesas que lo cubran|Falta recibir|Gastos declarados por el organizador|Saldo calculado|Dinero · SEK|Objetos · unidades|Tiempo · h|Espacio · h|Añadir necesidad|Finalidad|Cantidad / importe|Guardar|Me comprometo|He entregado / realizado|Confirmar recepción|Retirar compromiso|Pedir aclaración|Anular confirmación|Cancelado|Corregir gasto|Motivo / descripción|Aún no hay necesidades|Actualiza el proyecto: datos no disponibles o antiguos|Registros de participantes, no extracto bancario. Aquí no hay pagos. Los objetos y el tiempo no se valoran en dinero.|Ejemplo: práctica de sueco — datos ficticios|Facilitación|Sala|Té|Materiales|Participante|Historial|Cancelar necesidad|Registrar gasto|Gastos previstos|Compromiso retirado|h|unidades|Los datos cambiaron. Revisa los valores actualizados.|Otra persona confirma la recepción. Crea compromisos separados para entregas parciales.|Exceso prometido|Exceso recibido',
ar:'المساهمات والميزانية|المطلوب|إجمالي الوعود|أُبلغ عن التسليم، بانتظار التأكيد|تم تأكيد الاستلام|غير مغطى بالوعود|المتبقي للاستلام|نفقات أبلغ عنها المنظم|الرصيد المحسوب|مال · SEK|أشياء · وحدات|وقت · ساعات|مكان · ساعات|إضافة احتياج|الغرض|الكمية / المبلغ|حفظ|أتعهد|سلّمت / أنجزت|تأكيد الاستلام|سحب التعهد|طلب توضيح|إلغاء تأكيد الاستلام|ملغى|تصحيح نفقة|السبب / الوصف|لا توجد احتياجات بعد|حدّث المشروع: البيانات غير متاحة أو قديمة|سجلات المشاركين وليست كشف حساب بنكي. لا مدفوعات هنا. لا تُقيّم الأشياء والوقت بالمال.|مثال: ممارسة السويدية — بيانات خيالية|إدارة اللقاء|قاعة|شاي|مواد|مشارك|السجل|إلغاء الاحتياج|تسجيل نفقة|النفقات المخططة|سُحب التعهد|ساعة|وحدات|تغيرت البيانات. راجع القيم المحدثة.|يؤكد شخص آخر الاستلام. أنشئ تعهدات منفصلة للتسليم الجزئي.|وعود زائدة|مستلم زائد',
fa:'مشارکت‌ها و بودجه|نیاز|کل وعده‌ها|تحویل اعلام شده، منتظر تأیید|دریافت تأیید شده|بدون وعده پوشش‌دهنده|مانده برای دریافت|هزینه‌های اعلامی برگزارکننده|مانده محاسبه‌شده|پول · SEK|وسایل · عدد|زمان · ساعت|فضا · ساعت|افزودن نیاز|هدف|تعداد / مبلغ|ذخیره|متعهد می‌شوم|تحویل دادم / انجام دادم|تأیید دریافت|پس گرفتن تعهد|درخواست توضیح|لغو تأیید دریافت|لغو شده|اصلاح هزینه|دلیل / توضیح|هنوز نیازی نیست|پروژه را تازه کن: داده‌ها در دسترس نیستند یا قدیمی‌اند|ثبت شرکت‌کنندگان، نه صورت‌حساب بانکی. اینجا پرداختی نیست. وسایل و زمان به پول ارزش‌گذاری نمی‌شوند.|مثال: تمرین سوئدی — داده‌های خیالی|تسهیل جلسه|اتاق|چای|لوازم|شرکت‌کننده|تاریخچه|لغو نیاز|ثبت هزینه|هزینه‌های برنامه‌ریزی‌شده|تعهد پس گرفته شد|ساعت|عدد|داده‌ها تغییر کردند. مقادیر تازه را بررسی کن.|شخص دیگری دریافت را تأیید می‌کند. برای تحویل جزئی تعهدهای جدا بساز.|مازاد وعده|مازاد دریافت',
so:'Wax ku biirinta iyo miisaaniyadda|Loo baahan yahay|Wadarta la ballanqaaday|La sheegay in la keenay, sugaya xaqiijin|Helitaanka la xaqiijiyey|Ballan aan daboolin|Weli la helayo|Kharashka uu sheegay qabanqaabiyuhu|Hadhaaga la xisaabiyey|Lacag · SEK|Alaab · xabbo|Waqti · saacado|Goob · saacado|Ku dar baahi|Ujeeddo|Tiro / lacag|Kaydi|Waan ballanqaadayaa|Waan keenay / qabtay|Xaqiiji helitaanka|Ka noqo ballanqaadka|Codso caddayn|Ka noqo xaqiijinta|La joojiyey|Sax kharashka|Sabab / sharraxaad|Weli baahiyo ma jiraan|Cusboonaysii mashruuca: xogtu ma jirto ama waa duug|Diiwaanka ka qaybgalayaasha, ma aha warbixin bangi. Lacag laguma bixiyo halkan. Alaabta iyo waqtiga lacag laguma qiimeeyo.|Tusaale: ku tababarka Iswiidhishka — xog mala-awaal ah|Hoggaaminta kulanka|Qol|Shaah|Agab|Ka qaybgalaha|Taariikhda|Jooji baahida|Diiwaangeli kharash|Kharashka la qorsheeyey|Ballanqaadka laga noqday|saac|xabbo|Xogtu way is beddeshay. Eeg qiimayaasha cusub.|Qof kale ayaa xaqiijiya helitaanka. Samee ballanqaadyo kala duwan keenis qayb ah.|Ballanqaad dheeraad ah|Wax dheeraad ah oo la helay',
ku:'Beşdarî û budçe|Pêwîst|Tevahiya sozdayî|Hat gotin radest bû, li benda pejirandinê|Wergirtin hate pejirandin|Bê soz maye|Hê dê were wergirtin|Lêçûn li gorî organîzator|Mayîna hesabkirî|Pere · SEK|Tişt · dane|Dem · saet|Cih · saet|Pêdiviyekê zêde bike|Armanc|Hejmara / mîqdar|Tomar bike|Ez soz didim|Min radest kir / kir|Wergirtinê bipejirîne|Sozê paş ve bikişîne|Ravekirinê bixwaze|Pejirandina wergirtinê betal bike|Betalkirî|Lêçûnê sererast bike|Sedem / ravekirin|Hê pêdivî tune ne|Projeyê nû bike: dane tune an kevn in|Tomarên beşdaran in, ne rapora bankê. Li vir pere nayên dayîn. Tişt û dem bi pere nayên nirxandin.|Mînak: pratîka swêdî — daneyên xeyalî|Birêvebirina civînê|Ode|Çay|Materyal|Beşdar|Dîrok|Pêdiviyê betal bike|Lêçûnê tomar bike|Lêçûnên plankirî|Soz hate paşvekişandin|saet|dane|Dane guherîn. Nirxên nû binêre.|Kesekî din wergirtinê dipejirîne. Ji bo radestkirina beşî sozên cuda çêke.|Soza zêde|Wergirtiya zêde'
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=i=>(copy[document.documentElement.lang]||copy.en).split('|')[i];
const kindIndex={money:9,items:10,time:11,space:12};
const actionIndex={need:13,pledge:17,submit:18,confirm:19,withdraw:20,return:21,reopen:22,cancel_need:36,expense:37,void_expense:24};
const statusIndex={promised:2,submitted:3,received:4,withdrawn:39};
function amount(value){
 const s=String(value??'').trim().replace(',','.');
 if(!/^\d{1,7}(\.\d{1,2})?$/.test(s))throw Object.assign(new Error('INVALID_INPUT'),{code:'INVALID_INPUT'});
 const [whole,fraction='']=s.split('.'),n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 if(!Number.isSafeInteger(n)||n<1||n>100000000)throw Object.assign(new Error('INVALID_INPUT'),{code:'INVALID_INPUT'});
 return n;
}
const fmt=(n,kind)=>`${new Intl.NumberFormat(document.documentElement.lang||'en',{maximumFractionDigits:2}).format(n/100)} ${kind==='money'?'SEK':text(kind==='items'?41:40)}`;
function totals(need,rows){
 const live=rows.filter(c=>c.need_id===need.id&&c.status!=='withdrawn'&&!(c.status==='promised'&&c.terms_current===false));
 const sum=status=>live.filter(c=>!status||c.status===status).reduce((a,c)=>a+Number(c.amount),0);
 const promised=sum(),received=sum('received');
 return {required:Number(need.amount),promised,submitted:sum('submitted'),received,uncovered:Math.max(0,need.amount-promised),remaining:Math.max(0,need.amount-received),excessPromised:Math.max(0,promised-need.amount),excessReceived:Math.max(0,received-need.amount)};
}
const field=(label,name,value='',extra='')=>`<label>${esc(text(label))}<input name="${name}" value="${esc(value)}" ${extra}></label>`;
function form(action,target,body='',values={}){
 return `<form class="netBudget" data-action="${action}" data-target="${esc(target)}">${Object.entries(values).map(([k,v])=>`<input type="hidden" name="${k}" value="${esc(v)}">`).join('')}${body}<button type="submit" class="button">${esc(text(actionIndex[action]))}</button></form>`;
}
function content({coop,user,owner,snapshot:s,name,demo=false,drafts={},documents}){
 const active=!demo&&['open','active'].includes(coop.status),needs=s.needs,rows=s.contributions;
 let html=`<p class="meta">${esc(text(28))}</p><p class="meta">${esc(text(43))}</p>`;
 const money=needs.filter(n=>!n.cancelled&&n.kind==='money');
 if(money.length){
  const total=money.reduce((a,n)=>{const t=totals(n,rows);for(const k of Object.keys(t))a[k]=(a[k]||0)+t[k];return a;},{});
  const spent=s.expenses.filter(x=>!x.voided).reduce((a,x)=>a+Number(x.amount),0);
  html+=`<div class="budget-summary">${[[38,total.required],[2,total.promised],[4,total.received],[5,total.uncovered],[6,total.remaining],[7,spent],[8,total.received-spent]].map(([i,n])=>`<div><span>${esc(text(i))}</span><strong>${esc(fmt(n,'money'))}</strong></div>`).join('')}</div>`;
 }
 if(!needs.length)html+=`<p>${esc(text(26))}</p>`;
 for(const n of needs){
  const t=totals(n,rows),key='pledge:'+n.id,d=drafts[key]||{};
  html+=`<article class="budget-need"><h4>${esc(n.title)} <small>${esc(text(kindIndex[n.kind]))}</small></h4>`;
  if(n.cancelled)html+=`<p>${esc(text(23))}</p>`;
  else html+=`<dl class="budget-metrics">${[[1,t.required],[2,t.promised],[3,t.submitted],[4,t.received],[5,t.uncovered],[6,t.remaining],...(t.excessPromised?[[44,t.excessPromised]]:[]),...(t.excessReceived?[[45,t.excessReceived]]:[])].map(([i,v])=>`<div><dt>${esc(text(i))}</dt><dd>${esc(fmt(v,n.kind))}</dd></div>`).join('')}</dl>`;
  html+=renderNeedTerms({need:n,snapshot:s,user,owner,active,documents,drafts});
  for(const c of rows.filter(x=>x.need_id===n.id)){
   const own=c.contributor_id===user.id,receiver=!own&&(owner||c.contributor_id===coop.owner_id);
   const vals={contribution:c.id,revision:c.revision};
   html+=`<div class="budget-contribution" data-contribution-row="${esc(c.id)}"><bdi>${esc(name(c.contributor_id))}</bdi> · ${esc(fmt(Number(c.amount),n.kind))}<p>${esc(text(statusIndex[c.status]))}${c.received_at?` · <bdi>${esc(name(c.received_by))}</bdi> · ${esc(new Date(c.received_at).toLocaleString())}`:''}</p>`;
   html+=renderContributionTerms({contribution:c,need:n,snapshot:s,user,active:active&&!n.cancelled});
   if(active&&!n.cancelled){
    if(own&&c.status==='promised'&&c.terms_current!==false)html+=form('submit',c.id,'',vals);
    if(own&&['promised','submitted'].includes(c.status))html+=form('withdraw',c.id,'',vals);
    if(receiver&&c.status==='submitted')html+=form('confirm',c.id,'',vals)+form('return',c.id,field(25,'note',drafts['return:'+c.id]?.note,'required minlength="2" maxlength="500"'),vals);
    if(receiver&&c.status==='received')html+=`<details><summary>${esc(text(22))}</summary>${form('reopen',c.id,field(25,'note',drafts['reopen:'+c.id]?.note,'required minlength="2" maxlength="500"'),vals)}</details>`;
   }
   html+='</div>';
  }
  if(active&&!n.cancelled){
   const linked=latestTerms(s,n);
   if(!linked||personalTermsReady(s,linked,user))html+=form('pledge',n.id,field(15,'amount',d.amount,`required inputmode="decimal" placeholder="${n.kind==='money'?'50':'1'}"`)+(linked?`<label lang="${termsLang()}" dir="${['ar','fa'].includes(termsLang())?'rtl':'ltr'}"><input type="checkbox" required>${esc(termsText(14))}</label>`:''),{need:n.id,...(linked?{terms_revision:linked.revision}:{})});
   if(owner){
    if(n.kind==='money')html+=`<details><summary>${esc(text(37))}</summary>${form('expense',n.id,field(15,'amount',drafts['expense:'+n.id]?.amount,'required inputmode="decimal"')+field(25,'note',drafts['expense:'+n.id]?.note,'required minlength="2" maxlength="500"'),{need:n.id})}</details>`;
    if(!rows.some(c=>c.need_id===n.id&&c.status!=='withdrawn')&&!s.expenses.some(x=>x.need_id===n.id&&!x.voided))html+=form('cancel_need',n.id,'',{need:n.id});
   }
  }
  html+='</article>';
 }
 for(const x of s.expenses){
  html+=`<p>${esc(text(x.voided?23:7))}: ${esc(fmt(Number(x.amount),'money'))} · ${esc(needs.find(n=>n.id===x.need_id)?.title)} · ${esc(x.note)} · <bdi>${esc(name(x.recorded_by))}</bdi></p>`;
  if(active&&owner&&!x.voided)html+=`<details><summary>${esc(text(24))}</summary>${form('void_expense',x.id,field(25,'note',drafts['void_expense:'+x.id]?.note,'required minlength="2" maxlength="500"'),{expense:x.id})}</details>`;
 }
 if(active&&owner){
  const d=drafts['need:']||{};
  html+=`<details class="budget-create"><summary>${esc(text(13))}</summary>${form('need','',field(14,'title',d.title,'required minlength="2" maxlength="160"')+`<label>${esc(text(15))}<select name="kind">${Object.keys(kindIndex).map(k=>`<option value="${k}"${(d.kind||'money')===k?' selected':''}>${esc(text(kindIndex[k]))}</option>`).join('')}</select></label>`+field(15,'amount',d.amount,'required inputmode="decimal"'))}</details>`;
 }
 html+=`<details><summary>${esc(text(35))} · ${s.events.length}</summary><ol>${s.events.map(e=>{const c=rows.find(c=>c.id===e.payload.contribution),x=s.expenses.find(x=>x.id===e.payload.expense);const n=needs.find(n=>n.id===(e.payload.need||c?.need_id||x?.need_id||(e.action==='need'?e.id:null)));return `<li>${esc(new Date(e.created_at).toLocaleString())} · <bdi>${esc(name(e.actor_id))}</bdi> · ${esc(['terms','accept_terms'].includes(e.action)?termsText(e.action==='terms'?5:6):(text(actionIndex[e.action])||e.action))} · ${esc(n?.title||'')}${e.payload.amount&&n?` · ${esc(fmt(Number(e.payload.amount),n.kind))}`:''}${e.payload.note?` — ${esc(e.payload.note)}`:''}</li>`;}).join('')}</ol></details>`;
 return html;
}
function example(){
 const needs=[{id:'tea',title:text(32),kind:'money',amount:15000},{id:'materials',title:text(33),kind:'money',amount:5000},{id:'room',title:text(31),kind:'space',amount:200},{id:'host',title:text(30),kind:'time',amount:200}];
 const contributions=[{id:'a',need_id:'tea',contributor_id:'a',amount:10000,status:'received',received_by:'b',received_at:'2026-10-25T10:00:00Z'},{id:'b',need_id:'materials',contributor_id:'b',amount:5000,status:'promised'},{id:'c',need_id:'room',contributor_id:'c',amount:200,status:'submitted'}];
 const name=id=>text(34)+' '+({a:'A',b:'B',c:'C'}[id]||'');
 const sampleNotice={action:'confirm',actor_id:'b',created_at:'2026-10-25T10:00:00Z',need_title:text(32),kind:'money',amount:10000,project_title:text(29),is_current:true,current_status:'received'};
 const exampleRows=needs.map(n=>{const t=totals(n,contributions),mode=n.kind==='money'?'receipt':'promise';return {need:n.id,title:n.title,kind:n.kind,required:n.amount,mode,promised:t.promised,received:t.received,timely_received:t.received,pending:t.submitted,pending_rows:contributions.filter(c=>c.need_id===n.id&&c.status==='submitted'),uncovered:t.uncovered,gap:mode==='promise'?t.uncovered:t.remaining,ready:(mode==='promise'?t.uncovered:t.remaining)===0};});
 const samplePolicy={project_title:text(29),author_id:'b',before_version:1,version:2,current_version:2,created_at:'2026-10-26T10:00:00Z',before_configured:true,before_items:[{need:'tea',title:text(32),kind:'money',amount:15000,mode:'promise'}],after_items:[{need:'tea',title:text(32),kind:'money',amount:15000,mode:'receipt'}],is_current:true,can_respond:true,roles:[{role:'attendee',confirmed:null}]};
 return `<details class="budget-example"><summary>${esc(text(29))}</summary>${content({coop:{status:'active'},user:{id:null},snapshot:{needs,contributions,expenses:[{need_id:'tea',amount:3000,note:text(32),recorded_by:'b'}],events:[]},demo:true,name})}${renderMeeting({snapshot:{terms:{version:1},ready:false,budget:{configured:true,ready:false,rows:exampleRows}},fresh:true,current:true,demo:true,name})}${renderInbox({snapshot:{rows:[sampleNotice],total:1,unread:1},name,demo:true})}${renderPolicyInbox({snapshot:{rows:[samplePolicy],total:1,unread:1},name,demo:true})}</details>`;
}
// Read-only projection of existing contribution records, never a second ledger.
const overviewCopy={
 ru:'Состояние вкладов|Организатор|Следующее действие по вкладам|Проверить получение|Найти недостающие обещания|Сообщить о выполнении обещания|Получение подтверждено по всем потребностям|Другой участник|Обещано всего включает переданное и подтверждённое: эти колонки не складываются. Подтверждения участников не доказывают внешний результат проекта.',
 en:'Contribution overview|Organiser|Next contribution action|Check receipt|Find missing pledges|Report fulfilment of the pledge|Receipt confirmed for all needs|Another participant|Total promised includes reported and confirmed contributions: do not add these columns. Participant confirmations do not prove the external project outcome.',
 sv:'Översikt över bidrag|Organisatör|Nästa steg för bidrag|Kontrollera mottagandet|Hitta återstående löften|Rapportera utfört löfte|Mottagandet bekräftat för alla behov|En annan deltagare|Totalt utlovat omfattar rapporterade och bekräftade bidrag: summera inte kolumnerna. Deltagarnas bekräftelser bevisar inte projektets externa resultat.',
 uk:'Стан внесків|Організатор|Наступна дія щодо внесків|Перевірити отримання|Знайти відсутні обіцянки|Повідомити про виконання обіцянки|Отримання підтверджено для всіх потреб|Інший учасник|Загальна обіцянка включає передане й підтверджене: стовпці не додаються. Підтвердження учасників не доводять зовнішній результат проєкту.',
 fi:'Panosten yhteenveto|Järjestäjä|Seuraava panoksiin liittyvä toimi|Tarkista vastaanotto|Etsi puuttuvat lupaukset|Ilmoita lupauksen toteutumisesta|Kaikkien tarpeiden vastaanotto vahvistettu|Toinen osallistuja|Luvattu yhteensä sisältää ilmoitetut ja vahvistetut panokset: älä laske sarakkeita yhteen. Osallistujien vahvistukset eivät todista hankkeen ulkoista tulosta.',
 bs:'Pregled doprinosa|Organizator|Sljedeći korak za doprinose|Provjeriti prijem|Pronaći nedostajuća obećanja|Prijaviti ispunjenje obećanja|Prijem potvrđen za sve potrebe|Drugi učesnik|Ukupno obećano uključuje prijavljeno i potvrđeno: kolone se ne sabiraju. Potvrde učesnika ne dokazuju vanjski rezultat projekta.',
 es:'Resumen de aportaciones|Organizador|Siguiente acción de aportaciones|Comprobar recepción|Buscar compromisos pendientes|Informar del cumplimiento|Recepción confirmada para todas las necesidades|Otro participante|El total prometido incluye lo declarado y confirmado: no se suman las columnas. Las confirmaciones no prueban el resultado externo del proyecto.',
 ar:'ملخص المساهمات|المنظم|الخطوة التالية للمساهمات|التحقق من الاستلام|البحث عن التعهدات الناقصة|الإبلاغ عن تنفيذ التعهد|تأكد الاستلام لجميع الاحتياجات|مشارك آخر|إجمالي التعهدات يشمل المبلغ عنه والمؤكد: لا تجمع الأعمدة. تأكيدات المشاركين لا تثبت النتيجة الخارجية للمشروع.',
 fa:'خلاصه مشارکت‌ها|برگزارکننده|اقدام بعدی مشارکت‌ها|بررسی دریافت|یافتن تعهدهای باقی‌مانده|اعلام انجام تعهد|دریافت برای همه نیازها تأیید شد|مشارکت‌کننده دیگر|کل تعهدها شامل موارد اعلام‌شده و تأییدشده است: ستون‌ها را جمع نکنید. تأیید مشارکت‌کنندگان نتیجه بیرونی پروژه را اثبات نمی‌کند.',
 so:'Soo koobidda wax ku biirinta|Qabanqaabiye|Tallaabada xigta ee wax ku biirinta|Hubi helitaanka|Raadi ballanqaadyada maqan|Sheeg fulinta ballanqaadka|Helitaanka dhammaan baahiyaha waa la xaqiijiyey|Ka qaybqaate kale|Wadarta ballanqaadka waxaa ku jira la sheegay iyo la xaqiijiyey: ha isku darin tiirarka. Xaqiijinta ka qaybqaatayaasha ma caddayso natiijada dibadda ee mashruuca.',
 ku:'Kurteya beşdariyan|Organîzator|Gava din a beşdariyan|Wergirtinê kontrol bike|Sozên kêm bibîne|Pêkanîna sozê ragihîne|Wergirtin ji bo hemû hewcedariyan pejirandî ye|Beşdarekî din|Tevahiya sozdayî radestkirina ragihandî û pejirandî jî dihewîne: stûnan li hev zêde neke. Pejirandinên beşdaran encama derveyî ya projeyê îspat nakin.'
};
function overviewModel(snapshot,now=Date.now(),online=globalThis.navigator?.onLine!==false){
 const s=snapshot;
 if(!online||!s||s.error||!Number.isFinite(s.loadedAt)||now-s.loadedAt<0||now-s.loadedAt>=60000||!Array.isArray(s.needs)||!Array.isArray(s.contributions))return null;
 if(s.terms_version===1&&(!['terms','documents','consents'].every(k=>Array.isArray(s[k]))||s.contributions.some(c=>typeof c.terms_current!=='boolean')))return null;
 const needs=s.needs,rows=s.contributions,validAmount=n=>Number.isSafeInteger(Number(n))&&Number(n)>0&&Number(n)<=100000000;
 if(new Set(needs.map(n=>n.id)).size!==needs.length||new Set(rows.map(c=>c.id)).size!==rows.length||needs.some(n=>!n.id||!Object.hasOwn(kindIndex,n.kind)||!validAmount(n.amount))||rows.some(c=>!c.id||!needs.some(n=>n.id===c.need_id)||!Object.hasOwn(statusIndex,c.status)||!validAmount(c.amount)))return null;
 return needs.filter(n=>!n.cancelled).map(need=>({need,...totals(need,rows),pending:rows.filter(c=>c.need_id===need.id&&c.status==='submitted'),pledges:rows.filter(c=>c.need_id===need.id&&c.status==='promised')}));
}
function renderOverview({coop,snapshot,name,now=Date.now(),online=globalThis.navigator?.onLine!==false}){
 const tx=i=>esc((overviewCopy[document.documentElement.lang]||overviewCopy.en).split('|')[i]);
 let html=`<section class="card contribution-overview"><h3>${tx(0)}</h3><p>${esc(coop.description||'')}</p><p>${tx(1)}: <bdi>${esc(name(coop.owner_id))}</bdi></p>`;
 const model=overviewModel(snapshot,now,online);
 if(!model)return html+`<p role="status">${esc(text(27))}</p><button type="button" class="button" data-net="refresh">${esc(text(27))}</button></section>`;
 html+=`<p class="meta">${tx(8)}</p>`;
 if(snapshot.contributions.some(c=>c.status==='promised'&&c.terms_current===false))html+=`<p lang="${termsLang()}" dir="${['ar','fa'].includes(termsLang())?'rtl':'ltr'}">${esc(termsText(19))}</p>`;
 for(const row of model){
  const n=row.need;
  html+=`<article class="budget-need"><h4>${esc(n.title)} · ${esc(text(kindIndex[n.kind]))}</h4><dl class="budget-metrics">${[[1,row.required],[2,row.promised],[3,row.submitted],[4,row.received],[5,row.uncovered],[6,row.remaining]].map(([label,value])=>`<div><dt>${esc(text(label))}</dt><dd>${esc(fmt(value,n.kind))}</dd></div>`).join('')}</dl></article>`;
 }
 const renew=snapshot.contributions.find(c=>c.status==='promised'&&c.terms_current===false&&model.some(r=>r.need.id===c.need_id));
 const pending=model.find(r=>r.pending.length),gap=model.find(r=>r.uncovered>0),pledge=model.find(r=>r.pledges.length);
 let next;
 if(pending){const c=pending.pending[0];next=`${tx(3)}: ${esc(pending.need.title)} — <bdi>${c.contributor_id===coop.owner_id?tx(7):esc(name(coop.owner_id))}</bdi>`;}
 else if(renew)next=`${esc(termsText(6))}: ${esc(model.find(r=>r.need.id===renew.need_id).need.title)} — <bdi>${esc(name(renew.contributor_id))}</bdi>`;
 else if(gap)next=`${tx(4)}: ${esc(gap.need.title)} — ${esc(fmt(gap.uncovered,gap.need.kind))} · <bdi>${esc(name(coop.owner_id))}</bdi>`;
 else if(pledge)next=`${tx(5)}: ${esc(pledge.need.title)} — <bdi>${esc(name(pledge.pledges[0].contributor_id))}</bdi>`;
 else next=model.length?tx(6):esc(text(26));
 return html+`<p class="notice"><strong>${tx(2)}</strong>: ${next}</p></section>`;
}

// Presentation only. The future RPC must independently enforce the same contract.
// Do not use this projection as authority to execute or record a contribution.
function contributionTermsState({contribution:c,terms=[],documents=[],consents=[],loadedAt,now=Date.now(),online=true,error=false}){
 const unknown={state:'unavailable',canSubmit:false,overdue:null};
 if(!c?.cooperation_id||!c.need_id||!c.contributor_id||error||!online||!Number.isFinite(loadedAt)||now-loadedAt<0||now-loadedAt>=60000)return unknown;
 if(c.terms_revision==null)return {state:'unlinked',canSubmit:false,overdue:null};
 if(!Number.isInteger(c.terms_revision)||c.terms_revision<1||!Array.isArray(terms)||!Array.isArray(documents)||!Array.isArray(consents))return unknown;
 const versions=terms.filter(t=>t.need_id===c.need_id&&t.cooperation_id===c.cooperation_id);
 if(!versions.length||new Set(versions.map(t=>t.revision)).size!==versions.length||versions.some(t=>!Number.isInteger(t.revision)||t.revision<1))return unknown;
 const accepted=versions.find(t=>t.revision===c.terms_revision),latest=versions.reduce((a,b)=>a.revision>b.revision?a:b);
 if(!accepted||!accepted.document_id||!Number.isInteger(accepted.document_revision)||accepted.document_revision<1||!accepted.participation||!Number.isFinite(Date.parse(accepted.due_at)))return unknown;
 const docs=documents.filter(d=>d.document_id===accepted.document_id&&d.cooperation_id===c.cooperation_id);
 if(!docs.length||new Set(docs.map(d=>d.revision)).size!==docs.length||docs.some(d=>!Number.isInteger(d.revision)||d.revision<1))return unknown;
 const exact=docs.find(d=>d.revision===accepted.document_revision);
 if(!exact||!['rules','estimate'].includes(exact.kind))return unknown;
 const overdue=now>Date.parse(accepted.due_at),basis={acceptedRevision:accepted.revision,latestRevision:latest.revision,documentRevision:accepted.document_revision,dueAt:accepted.due_at,participation:accepted.participation,overdue};
 // Past receipt is historical evidence of the old basis, never consent to new terms.
 if(['received','submitted'].includes(c.status))return {...basis,state:'historical',canSubmit:false};
 if(c.status==='withdrawn')return {...basis,state:'withdrawn',canSubmit:false};
 if(!['promised','submitted'].includes(c.status))return unknown;
 if(latest.revision!==accepted.revision||docs.some(d=>d.revision>accepted.document_revision))return {...basis,state:'changed',canSubmit:false};
 const personal=consents.filter(x=>x.document_id===accepted.document_id&&x.revision===accepted.document_revision&&x.cooperation_id===c.cooperation_id&&x.user_id===c.contributor_id);
 if(personal.length>1)return unknown;
 if(personal[0]?.confirmed!==true)return {...basis,state:personal[0]?.confirmed===false?'declined':'awaiting',canSubmit:false};
 return {...basis,state:'current',canSubmit:c.status==='promised'};
}

// New copy is RU/EN draft; other locales use an explicitly marked English block until T11.
const termsCopy={ru:['Условия вклада','Редакция','Срок — время устройства','Способ участия','Документ условий','Опубликовать новую редакцию','Принять условия этого вклада','Сначала лично подтвердите актуальный документ ниже в проекте. Затем примите условия вклада.','Открыть документ','Условия не привязаны','Условия изменились: требуется личное подтверждение','Личное согласие не получено или отозвано','Условия передачи сохранены','Просрочено: можно сообщить о фактическом исполнении','Я прочитал срок, способ участия и редакцию документа','Документы недоступны: обновите проект','Создайте правила или смету в документах проекта','Условия приняты','Вклад отозван','Обещания, требующие нового согласия, не включены в итог обещанного.'],en:['Contribution terms','Revision','Deadline — device time','How to participate','Terms document','Publish a new revision','Accept these contribution terms','First personally confirm the current document below in the project. Then accept the contribution terms.','Open document','Terms are not linked','Terms changed: personal acceptance required','Personal consent missing or withdrawn','Terms of actual delivery retained','Overdue: actual fulfilment can still be reported','I have read the deadline, participation method and document revision','Documents unavailable: refresh the project','Create rules or an estimate in project documents','Terms accepted','Contribution withdrawn','Pledges awaiting renewed consent are excluded from the promised total.']};
Object.assign(termsCopy,globalThis.FolkoopFeatureCopy?.terms||{});
function termsText(i){return (termsCopy[document.documentElement.lang]||termsCopy.en)[i];}
function termsLang(){return Object.hasOwn(termsCopy,document.documentElement.lang)?document.documentElement.lang:'en';}
function latestTerms(s,n){return (s.terms||[]).filter(t=>t.need_id===n.id).sort((a,b)=>b.revision-a.revision)[0];}
function personalTermsReady(s,t,user){return !!t&&(s.documents||[]).some(d=>d.document_id===t.document_id&&d.revision===t.document_revision)&&!(s.documents||[]).some(d=>d.document_id===t.document_id&&d.revision>t.document_revision)&&(s.consents||[]).some(c=>c.document_id===t.document_id&&c.revision===t.document_revision&&c.user_id===user.id&&c.confirmed===true);}
function termsHidden(values){return Object.entries(values).map(([k,v])=>`<input type="hidden" name="${k}" value="${esc(v)}">`).join('');}
function termsDetails(t){return `<p>${esc(termsText(1))} ${t.revision} · ${esc(termsText(2))}: ${esc(new Date(t.due_at).toLocaleString())}</p><p>${esc(t.participation)}</p><p>${esc(termsText(4))}: ${esc(t.document_id)} · ${esc(termsText(1))} ${t.document_revision}</p>${Date.now()>Date.parse(t.due_at)?`<p>${esc(termsText(13))}</p>`:''}`;}
function renderNeedTerms({need:n,snapshot:s,user,owner,active,documents,drafts}){
 if(s.terms_version!==1)return '';
 const t=latestTerms(s,n),d=drafts['terms:'+n.id]||{},docs=documents?.rows?.filter(x=>['rules','estimate'].includes(x.kind))||[];
 let html=`<aside lang="${termsLang()}" dir="${['ar','fa'].includes(termsLang())?'rtl':'ltr'}"><h5>${esc(termsText(0))}</h5>${t?termsDetails(t):`<p>${esc(termsText(9))}</p>`}`;
 if(t)html+=`<button type="button" class="button secondary" data-coop="openNotify" data-target-kind="project" data-id="${esc(n.cooperation_id)}" data-document="${esc(t.document_id)}">${esc(termsText(8))}</button>${personalTermsReady(s,t,user)?'':`<p>${esc(termsText(7))}</p>`}`;
 if(owner&&active&&!n.cancelled){
  if(!documents||documents.error)html+=`<p role="status">${esc(termsText(15))}</p>`;
  else if(!docs.length)html+=`<p>${esc(termsText(16))}</p>`;
  else html+=`<details><summary>${esc(termsText(5))}</summary><form class="netBudget" data-action="terms" data-target="${esc(n.id)}">${termsHidden({need:n.id,revision:t?.revision||0})}<label>${esc(termsText(4))}<select name="document_choice" required>${docs.map(x=>`<option value="${esc(x.document_id)}:${x.revision}"${d.document_choice===x.document_id+':'+x.revision?' selected':''}>${esc(x.title)} · ${x.revision}</option>`).join('')}</select></label><label>${esc(termsText(2))}<input type="datetime-local" name="due_at" required value="${esc(d.due_at||'')}"></label><label>${esc(termsText(3))}<textarea name="participation" required minlength="2" maxlength="500">${esc(d.participation||t?.participation||'')}</textarea></label><button type="submit" class="button">${esc(termsText(5))}</button></form></details>`;
 }
 return html+'</aside>';
}
function renderContributionTerms({contribution:c,need:n,snapshot:s,user,active}){
 if(s.terms_version!==1)return '';
 const current=contributionTermsState({contribution:c,...s}),t=latestTerms(s,n),basis=(s.terms||[]).find(x=>x.need_id===n.id&&x.revision===c.terms_revision);
 const label={unlinked:9,changed:10,awaiting:11,declined:11,historical:12,withdrawn:18,current:17};
 let html=`<aside lang="${termsLang()}" dir="${['ar','fa'].includes(termsLang())?'rtl':'ltr'}"><p>${esc(current.state==='unavailable'?text(27):termsText(label[current.state]))}</p>${basis?termsDetails(basis):''}`;
 if(active&&c.contributor_id===user.id&&c.status==='promised'&&t&&c.terms_current!==true){
  html+=`<p>${esc(termsText(6))}:</p>${termsDetails(t)}`;
  if(personalTermsReady(s,t,user))html+=`<form class="netBudget" data-action="accept_terms" data-target="${esc(c.id)}">${termsHidden({contribution:c.id,revision:c.revision,terms_revision:t.revision})}<label><input type="checkbox" name="accept" required>${esc(termsText(14))}</label><button type="submit" class="button">${esc(termsText(6))}</button></form>`;
  else html+=`<p>${esc(termsText(7))}</p>`;
 }
 return html+'</aside>';
}

function render(opts){
 if(opts.demo)return `<section class="card project-budget"><h3>${esc(text(0))}</h3>${example()}</section>`;
 const s=opts.snapshot;
 const ready=s&&!s.error&&(s.terms_version!==1||(['terms','documents','consents'].every(k=>Array.isArray(s[k]))&&Array.isArray(s.contributions)&&s.contributions.every(c=>typeof c.terms_current==='boolean')))&&['needs','contributions','expenses','events'].every(k=>Array.isArray(s[k]))&&Number.isFinite(s.loadedAt)&&Date.now()-s.loadedAt>=0&&Date.now()-s.loadedAt<60000&&globalThis.navigator?.onLine!==false;
 return `<section class="card project-budget"><h3>${esc(text(0))}</h3>${ready?content(opts):`<p role="status">${esc(text(27))}</p><button type="button" class="button" data-net="refresh">${esc(text(27))}</button>`}${example()}</section>`;
}
// Draft notification translations, separate from imperative button labels.
const noticeCopy={
 ru:'Уведомления о вкладах|Обещал вклад|Сообщил о передаче — получение ещё не подтверждено|Подтвердил получение|Вернул на уточнение|Отозвал обещание|Отменил подтверждение получения|Отметить прочитанным|Открыть вклад|Уведомлений пока нет|После этого вклад изменился|Сейчас|Непрочитано',
 en:'Contribution notifications|Promised a contribution|Reported delivery — receipt not yet confirmed|Confirmed receipt|Returned for clarification|Withdrew a promise|Undid receipt confirmation|Mark as read|Open contribution|No notifications yet|The contribution changed afterwards|Current state|Unread',
 sv:'Aviseringar om bidrag|Lovade ett bidrag|Uppgav leverans — mottagandet ännu inte bekräftat|Bekräftade mottagandet|Begärde förtydligande|Återkallade löftet|Ångrade mottagningsbekräftelsen|Markera som läst|Öppna bidrag|Inga aviseringar ännu|Bidraget ändrades senare|Nuvarande status|Olästa',
 uk:'Сповіщення про внески|Пообіцяв внесок|Повідомив про передачу — отримання ще не підтверджено|Підтвердив отримання|Повернув на уточнення|Відкликав обіцянку|Скасував підтвердження отримання|Позначити прочитаним|Відкрити внесок|Сповіщень поки немає|Після цього внесок змінився|Зараз|Непрочитані',
 fi:'Ilmoitukset panoksista|Lupasi panoksen|Ilmoitti toimituksesta — vastaanottoa ei vielä vahvistettu|Vahvisti vastaanoton|Pyysi tarkennusta|Perui lupauksen|Perui vastaanottovahvistuksen|Merkitse luetuksi|Avaa panos|Ei vielä ilmoituksia|Panos muuttui tämän jälkeen|Nykytila|Lukematta',
 bs:'Obavijesti o doprinosima|Obećao/la doprinos|Prijavio/la predaju — prijem još nije potvrđen|Potvrdio/la prijem|Vratio/la na pojašnjenje|Povukao/la obećanje|Poništio/la potvrdu prijema|Označi kao pročitano|Otvori doprinos|Još nema obavijesti|Doprinos je kasnije promijenjen|Trenutno stanje|Nepročitano',
 es:'Notificaciones de aportaciones|Prometió una aportación|Declaró la entrega — recepción aún sin confirmar|Confirmó la recepción|Pidió aclaración|Retiró el compromiso|Anuló la confirmación de recepción|Marcar como leído|Abrir aportación|Aún no hay notificaciones|La aportación cambió después|Estado actual|Sin leer',
 ar:'إشعارات المساهمات|تعهد بمساهمة|أبلغ عن التسليم — لم يتأكد الاستلام بعد|أكد الاستلام|طلب توضيحًا|سحب التعهد|ألغى تأكيد الاستلام|تحديد كمقروء|فتح المساهمة|لا إشعارات بعد|تغيرت المساهمة لاحقًا|الحالة الحالية|غير مقروء',
 fa:'اعلان‌های مشارکت|وعده مشارکت داد|تحویل را اعلام کرد — دریافت هنوز تأیید نشده|دریافت را تأیید کرد|درخواست توضیح داد|تعهد را پس گرفت|تأیید دریافت را لغو کرد|علامت‌گذاری به‌عنوان خوانده‌شده|باز کردن مشارکت|هنوز اعلانی نیست|مشارکت بعداً تغییر کرد|وضعیت کنونی|خوانده‌نشده',
 so:'Ogeysiisyada wax ku biirinta|Ballanqaaday wax ku biirin|Sheegay keenista — helitaanka weli lama xaqiijin|Xaqiijiyey helitaanka|Codsaday caddayn|Ka noqday ballanqaadka|Ka noqday xaqiijinta helitaanka|U calaamadee la akhriyey|Fur wax ku biirinta|Weli ogeysiisyo ma jiraan|Wax ku biirintu mar dambe way is beddeshay|Xaaladda hadda|Aan la akhrin',
 ku:'Agahiyên beşdariyê|Soza beşdariyê da|Radestkirin ragihand — wergirtin hê nehat pejirandin|Wergirtin pejirand|Ravekirin xwest|Soz paş ve kişand|Pejirandina wergirtinê betal kir|Wek xwendî nîşan bide|Beşdariyê veke|Hê agahî tune ne|Beşdarî piştre guherî|Rewşa niha|Nexwendî'
};
const noticeText=i=>(noticeCopy[document.documentElement.lang]||noticeCopy.en).split('|')[i];
function renderInbox({snapshot:s,name,demo=false}){
 if(!s)return '';
 let html=`<section class="budget-notices"><h3>${esc(noticeText(0))}</h3>`;
 if(!demo&&(s.error||!Array.isArray(s.rows)||!Number.isFinite(s.loadedAt)||Date.now()-s.loadedAt<0||Date.now()-s.loadedAt>=60000||globalThis.navigator?.onLine===false))return html+`<p role="status">${esc(text(27))}</p><button type="button" class="button" data-coop="taskRefresh">${esc(text(27))}</button></section>`;
 html+=`<p class="meta">${s.rows.length} / ${esc(s.total)} · ${esc(noticeText(12))}: ${esc(s.unread)}</p>`;
 const labels={pledge:1,submit:2,confirm:3,return:4,withdraw:5,reopen:6};
 for(const n of s.rows){
  html+=`<article class="card"><h4>${esc(n.need_title)} · ${esc(fmt(Number(n.amount),n.kind))}</h4><p>${esc(n.project_title)}</p><p><bdi>${esc(name(n.actor_id))}</bdi> · ${esc(noticeText(labels[n.action]))}</p><p class="meta">${esc(new Date(n.created_at).toLocaleString())}${n.read_at?'':' · '+esc(noticeText(12))}</p>`;
  if(n.note)html+=`<p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(n.note)}</p>`;
  if(!n.is_current)html+=`<p>${esc(noticeText(10))}. ${esc(noticeText(11))}: ${esc(text(statusIndex[n.current_status]))}</p>`;
  if(!demo)html+=`<button type="button" class="button secondary" data-coop="openNotify" data-target-kind="project" data-id="${esc(n.cooperation_id)}" data-contribution="${esc(n.contribution_id)}">${esc(noticeText(8))}</button>${n.read_at?'':`<form class="netContributionNoticeRead"><input type="hidden" name="event" value="${esc(n.event_id)}"><button type="submit" class="button secondary">${esc(noticeText(7))}</button></form>`}`;
  html+='</article>';
 }
 return html+(s.rows.length?'':`<p>${esc(noticeText(9))}</p>`)+'</section>';
}
const meetingCopy={
 ru:'Вклады для встречи|Достаточно личного обещания|Получение подтверждено до начала|Не учитывать для этой встречи|Организатор ещё не выбрал потребности для этой версии встречи|Сохранить условия вкладов|Потребности не выбраны: сохранение явно означает, что вклады не являются условием готовности.|Изменение создаст новую версию встречи. Участникам потребуется снова подтвердить участие и роли.|Условия по вкладам выполнены|По вкладам ещё есть препятствия|Ждёт подтверждения получения|Обещано, ещё не передано|Не хватает по выбранному правилу|Люди, помещение и выбранные вклады готовы|Встреча ещё не готова по выбранным условиям|Потребность отменена или недоступна — пересмотрите выбор|Получение после начала не закрывает условие «до начала»',
 en:'Contributions for the meeting|A personal promise is enough|Receipt confirmed before the start|Not required for this meeting|The organiser has not selected needs for this meeting version|Save contribution rules|No needs selected: saving explicitly means contributions are not a readiness condition.|Changes create a new meeting version. Participants must reconfirm attendance and roles.|Contribution conditions met|Contribution blockers remain|Awaiting receipt confirmation|Promised, not yet delivered|Missing under the selected rule|People, room and selected contributions are ready|The meeting is not ready under the selected conditions|Need cancelled or unavailable — review the selection|Receipt after the start does not meet the before-start condition',
 sv:'Bidrag till mötet|Ett personligt löfte räcker|Mottagande bekräftat före start|Krävs inte för detta möte|Arrangören har inte valt behov för denna mötesversion|Spara bidragsvillkor|Inga behov valda: sparande betyder uttryckligen att bidrag inte är ett beredskapsvillkor.|Ändringar skapar en ny mötesversion. Deltagarna måste bekräfta närvaro och roller igen.|Bidragsvillkoren uppfyllda|Hinder för bidragen återstår|Väntar på mottagningsbekräftelse|Utlovat, ännu inte levererat|Saknas enligt valt villkor|Deltagare, lokal och valda bidrag är redo|Mötet är inte redo enligt valda villkor|Behov avbrutet eller otillgängligt — granska valet|Mottagande efter start uppfyller inte villkoret före start',
 uk:'Внески для зустрічі|Достатньо особистої обіцянки|Отримання підтверджено до початку|Не враховувати для цієї зустрічі|Організатор ще не обрав потреби для цієї версії зустрічі|Зберегти умови внесків|Потреби не обрані: збереження явно означає, що внески не є умовою готовності.|Зміни створять нову версію зустрічі. Учасники знову підтвердять участь і ролі.|Умови внесків виконані|Щодо внесків ще є перешкоди|Очікує підтвердження отримання|Обіцяно, ще не передано|Бракує за обраним правилом|Люди, приміщення та обрані внески готові|Зустріч ще не готова за обраними умовами|Потребу скасовано або вона недоступна — перегляньте вибір|Отримання після початку не виконує умову до початку',
 fi:'Tapaamisen panokset|Henkilökohtainen lupaus riittää|Vastaanotto vahvistettu ennen alkua|Ei vaadita tähän tapaamiseen|Järjestäjä ei ole valinnut tämän tapaamisversion tarpeita|Tallenna panosehdot|Tarpeita ei valittu: tallennus tarkoittaa, etteivät panokset ole valmiuden ehto.|Muutos luo uuden tapaamisversion. Osallistujien on vahvistettava osallistuminen ja roolit uudelleen.|Panosehdot täyttyvät|Panoksiin liittyy vielä esteitä|Odottaa vastaanoton vahvistusta|Luvattu, ei vielä toimitettu|Valitusta ehdosta puuttuu|Ihmiset, tila ja valitut panokset ovat valmiina|Tapaaminen ei ole valmis valittujen ehtojen mukaan|Tarve peruttu tai puuttuu — tarkista valinta|Alkamisen jälkeinen vastaanotto ei täytä ennen alkua -ehtoa',
 bs:'Doprinosi za sastanak|Lično obećanje je dovoljno|Prijem potvrđen prije početka|Nije potrebno za ovaj sastanak|Organizator nije izabrao potrebe za ovu verziju sastanka|Sačuvaj uslove doprinosa|Nema izabranih potreba: spremanje znači da doprinosi nisu uslov spremnosti.|Izmjene stvaraju novu verziju. Učesnici ponovo potvrđuju dolazak i uloge.|Uslovi doprinosa ispunjeni|Preostale su prepreke za doprinose|Čeka potvrdu prijema|Obećano, još nije predato|Nedostaje prema izabranom pravilu|Ljudi, prostor i izabrani doprinosi su spremni|Sastanak nije spreman prema izabranim uslovima|Potreba otkazana ili nedostupna — pregledaj izbor|Prijem poslije početka ne ispunjava uslov prije početka',
 es:'Aportaciones para la reunión|Basta un compromiso personal|Recepción confirmada antes del inicio|No se exige para esta reunión|El organizador no ha elegido necesidades para esta versión|Guardar condiciones|Sin necesidades seleccionadas: guardar indica expresamente que las aportaciones no condicionan la preparación.|Los cambios crean una nueva versión. Se deben reconfirmar asistencia y funciones.|Condiciones de aportaciones cumplidas|Quedan obstáculos en las aportaciones|Recepción pendiente de confirmar|Prometido, aún sin entregar|Falta según la regla elegida|Personas, sala y aportaciones elegidas listas|La reunión no está lista según las condiciones elegidas|Necesidad cancelada o no disponible: revisa la selección|La recepción posterior al inicio no cumple la condición previa',
 ar:'مساهمات اللقاء|يكفي تعهد شخصي|تأكيد الاستلام قبل البداية|غير مطلوب لهذا اللقاء|لم يختر المنظم احتياجات هذا الإصدار من اللقاء|حفظ شروط المساهمات|لم تُختر احتياجات: الحفظ يعني صراحة أن المساهمات ليست شرطًا للجاهزية.|التغييرات تنشئ إصدارًا جديدًا. يجب تأكيد الحضور والأدوار مجددًا.|شروط المساهمات مستوفاة|ما زالت هناك عوائق للمساهمات|بانتظار تأكيد الاستلام|موعود ولم يُسلّم بعد|النقص حسب القاعدة المختارة|الأشخاص والمكان والمساهمات المختارة جاهزة|اللقاء غير جاهز حسب الشروط المختارة|الاحتياج ملغى أو غير متاح — راجع الاختيار|الاستلام بعد البداية لا يستوفي شرط قبل البداية',
 fa:'مشارکت‌های دیدار|تعهد شخصی کافی است|دریافت پیش از شروع تأیید شود|برای این دیدار لازم نیست|برگزارکننده نیازهای این نسخه را انتخاب نکرده|ذخیره شرایط مشارکت|نیازی انتخاب نشده: ذخیره یعنی مشارکت‌ها شرط آمادگی نیستند.|تغییرات نسخه تازه می‌سازند. حضور و نقش‌ها باید دوباره تأیید شوند.|شرایط مشارکت برآورده شده|موانع مشارکت باقی مانده|منتظر تأیید دریافت|وعده داده شده، هنوز تحویل نشده|کمبود طبق قاعده انتخابی|افراد، مکان و مشارکت‌های انتخابی آماده‌اند|دیدار طبق شرایط انتخابی آماده نیست|نیاز لغو شده یا در دسترس نیست — انتخاب را بازبینی کن|دریافت پس از شروع شرط پیش از شروع را برآورده نمی‌کند',
 so:'Wax ku biirinta kulanka|Ballanqaad qofeed ayaa ku filan|Helitaanka la xaqiijiyey ka hor bilowga|Looma baahna kulankan|Qabanqaabiyuhu ma dooran baahiyaha noocan kulanka|Kaydi shuruudaha|Baahiyo lama dooran: kaydintu waxay ka dhigan tahay in wax ku biirintu aanay shardi diyaar-garow ahayn.|Isbeddelku wuxuu abuuraa nooc cusub. Imaanshaha iyo doorarka waa in dib loo xaqiijiyaa.|Shuruudaha wax ku biirinta waa buuxaan|Caqabado wax ku biirin ayaa hadhay|Sugaya xaqiijinta helitaanka|La ballanqaaday, weli lama keenin|Ka dhiman xeerka la doortay|Dadka, goobta iyo wax ku biirinta la doortay waa diyaar|Kulanku diyaar ma aha sida shuruudaha la doortay|Baahida waa la joojiyey ama lama heli karo — dib u eeg|Helitaan bilowga ka dib ma buuxiyo shuruudda ka hor bilowga',
 ku:'Beşdariyên civînê|Soza kesane bes e|Wergirtin berî destpêkê pejirandî be|Ji bo vê civînê ne pêwîst e|Organîzator pêdiviyên vê guhertoyê hilnebijartiye|Şertên beşdariyê tomar bike|Pêdivî nehatin hilbijartin: tomarkirin tê wê wateyê ku beşdarî ne şerta amadebûnê ye.|Guhertin guhertoyeke nû çêdikin. Hatîn û rol divê dîsa bên pejirandin.|Şertên beşdariyê pêk hatin|Astengên beşdariyê hene|Li benda pejirandina wergirtinê|Sozdayî, hê ne radestkirî|Li gor rêgeza hilbijartî kêm e|Kes, cih û beşdariyên hilbijartî amade ne|Civîn li gor şertên hilbijartî ne amade ye|Pêdivî betal an ne berdest e — hilbijartinê binêre|Wergirtina piştî destpêkê şerta berî destpêkê pêk nayîne'
};
const meetingText=i=>(meetingCopy[document.documentElement.lang]||meetingCopy.en).split('|')[i];
function renderMeeting({snapshot,budget,owner=false,fresh=false,current=false,draft,name=()=>text(34),demo=false}){
 if(!snapshot?.terms)return '';
 const b=snapshot.budget,tx=i=>esc(meetingText(i));
 let html=`<section class="card meeting-budget"><h3>${tx(0)}</h3>`;
 if(!fresh)return html+`<p role="status">${esc(text(27))}</p></section>`;
 html+=`<p role="status">${!b?.configured?tx(4):tx(b.ready?8:9)}</p>`;
 if(b)for(const row of b.rows||[]){
  html+=`<article class="budget-need"><h4>${esc(row.title)}</h4><p>${tx(row.mode==='promise'?1:2)}</p>`;
  if(row.missing)html+=`<p>${tx(15)}</p>`;
  else{
   html+=`<dl class="budget-metrics">${[[text(1),row.required],[text(2),row.promised],[text(4),row.received],[meetingText(10),row.pending],[meetingText(11),Math.max(0,row.promised-row.received-row.pending)],[text(5),row.uncovered],[meetingText(12),row.gap]].map(([label,n])=>`<div><dt>${esc(label)}</dt><dd>${esc(fmt(Number(n),row.kind))}</dd></div>`).join('')}</dl>`;
   if(row.mode==='receipt'&&row.received>row.timely_received)html+=`<p>${tx(16)}</p>`;
   html+=`<ul>${(row.pending_rows||[]).map(c=>`<li>${esc(name(c.contributor_id))} · ${esc(fmt(Number(c.amount),row.kind))} — ${tx(10)}</li>`).join('')}</ul>`;
  }
  html+='</article>';
 }
 if(current)html+=`<p><strong>${tx(snapshot.ready===true?13:14)}</strong></p>`;
 if(!demo)html+=`<button type="button" class="button secondary" data-project-next="budget">${esc(noticeText(8))}</button>`;
 const freshBudget=budget&&!budget.error&&Array.isArray(budget.needs)&&Number.isFinite(budget.loadedAt)&&Date.now()-budget.loadedAt>=0&&Date.now()-budget.loadedAt<60000;
 if(owner&&current&&!demo){
  if(!freshBudget)html+=`<p>${esc(text(27))}</p>`;
  else{
   const choices=draft||Object.fromEntries((b?.requirements||[]).map(r=>[r.need,r.mode]));
   html+=`<details><summary>${tx(5)}</summary><form class="netMeetingBudget"><input type="hidden" name="version" value="${snapshot.terms.version}">${budget.needs.filter(n=>!n.cancelled).map(n=>`<label>${esc(n.title)} · ${esc(fmt(Number(n.amount),n.kind))}<select name="need_${esc(n.id)}">${[['',3],['promise',1],['receipt',2]].map(([value,label])=>`<option value="${value}"${(choices[n.id]||'')===value?' selected':''}>${tx(label)}</option>`).join('')}</select></label>`).join('')}<p>${tx(6)}</p><p>${tx(7)}</p><button class="button" type="submit">${tx(5)}</button></form></details>`;
  }
 }
 return html+'</section>';
}
const policyNoticeCopy={
 ru:'Изменились вклады для встречи|Добавлено|Исключено из условий встречи|Изменено правило|Было|Стало|В предыдущей версии потребности не были настроены|Подтверди заново, если согласен с текущими условиями|Уже подтверждено для текущей версии|Ты отказался или отозвал согласие|Есть более новая версия встречи — открой актуальные условия|Подтверждение сейчас недоступно: встреча началась, закрыта или условия требуют обновления|Открыть условия встречи|Состав и правила не изменились; условия закреплены для новой версии|Уведомлений об изменении условий пока нет|Выбор организатора не изменяет твои личные обещания. Прочтение уведомления не является согласием.|Нет выбранных потребностей',
 en:'Meeting contributions changed|Added|Removed from meeting requirements|Rule changed|Before|After|Needs were not configured in the previous version|Reconfirm if you agree with the current terms|Already confirmed for the current version|You declined or withdrew consent|A newer meeting version exists — open current terms|Confirmation is unavailable: the meeting started, closed, or terms need updating|Open meeting terms|Selection and rules are unchanged; assigned to a new version|No meeting-rule notifications yet|The organiser’s selection does not change your personal promises. Reading is not consent.|No needs selected',
 sv:'Mötets bidrag har ändrats|Tillagt|Borttaget från möteskraven|Ändrat villkor|Före|Efter|Behov var inte inställda i föregående version|Bekräfta igen om du godtar aktuella villkor|Redan bekräftat för aktuell version|Du har avböjt eller återkallat samtycket|En nyare mötesversion finns — öppna aktuella villkor|Bekräftelse är inte tillgänglig: mötet har börjat, stängts eller villkoren måste uppdateras|Öppna mötesvillkor|Urval och villkor är oförändrade; knutna till ny version|Inga aviseringar om ändrade villkor ännu|Arrangörens val ändrar inte dina personliga löften. Läsning är inte samtycke.|Inga behov valda',
 uk:'Змінилися внески для зустрічі|Додано|Виключено з умов зустрічі|Змінено правило|Було|Стало|У попередній версії потреби не налаштовано|Підтвердь знову, якщо згоден з поточними умовами|Вже підтверджено для поточної версії|Ти відмовився або відкликав згоду|Є новіша версія зустрічі — відкрий актуальні умови|Підтвердження недоступне: зустріч почалася, закрита або умови застаріли|Відкрити умови зустрічі|Склад і правила не змінилися; закріплено для нової версії|Сповіщень про зміни умов поки немає|Вибір організатора не змінює твоїх обіцянок. Прочитання не є згодою.|Потреби не обрані',
 fi:'Tapaamisen panokset muuttuivat|Lisätty|Poistettu tapaamisen ehdoista|Ehto muuttui|Ennen|Jälkeen|Tarpeita ei määritetty edellisessä versiossa|Vahvista uudelleen, jos hyväksyt nykyiset ehdot|Jo vahvistettu nykyiselle versiolle|Kieltäydyit tai peruit suostumuksen|Uudempi tapaamisversio on olemassa — avaa nykyiset ehdot|Vahvistus ei ole käytettävissä: tapaaminen alkoi, suljettiin tai ehdot on päivitettävä|Avaa tapaamisen ehdot|Valinta ja ehdot ennallaan; liitetty uuteen versioon|Ei vielä ehtomuutosten ilmoituksia|Järjestäjän valinta ei muuta omia lupauksiasi. Lukeminen ei ole suostumus.|Tarpeita ei valittu',
 bs:'Doprinosi za sastanak su promijenjeni|Dodano|Uklonjeno iz uslova sastanka|Pravilo promijenjeno|Prije|Poslije|Potrebe nisu bile podešene u prethodnoj verziji|Potvrdi ponovo ako prihvataš trenutne uslove|Već potvrđeno za trenutnu verziju|Odbio/la si ili povukao/la saglasnost|Postoji novija verzija sastanka — otvori trenutne uslove|Potvrda nije dostupna: sastanak je počeo, zatvoren ili uslovi zahtijevaju ažuriranje|Otvori uslove sastanka|Izbor i pravila su isti; vezani za novu verziju|Još nema obavijesti o promjeni uslova|Izbor organizatora ne mijenja tvoja lična obećanja. Čitanje nije saglasnost.|Nema izabranih potreba',
 es:'Cambiaron las aportaciones de la reunión|Añadido|Eliminado de los requisitos de la reunión|Regla modificada|Antes|Después|No había necesidades configuradas en la versión anterior|Confirma de nuevo si aceptas las condiciones actuales|Ya confirmado para la versión actual|Rechazaste o retiraste el consentimiento|Hay una versión más reciente: abre las condiciones actuales|No se puede confirmar: la reunión empezó, se cerró o requiere actualizar las condiciones|Abrir condiciones de la reunión|Selección y reglas sin cambios; vinculadas a una nueva versión|Aún no hay avisos de cambios de condiciones|La selección del organizador no cambia tus compromisos personales. Leer no significa consentir.|Sin necesidades seleccionadas',
 ar:'تغيرت مساهمات اللقاء|أُضيف|أُزيل من متطلبات اللقاء|تغيرت القاعدة|قبل|بعد|لم تكن الاحتياجات محددة في الإصدار السابق|أكد مجددًا إذا وافقت على الشروط الحالية|مؤكد بالفعل للإصدار الحالي|رفضت أو سحبت موافقتك|يوجد إصدار أحدث — افتح الشروط الحالية|التأكيد غير متاح: بدأ اللقاء أو أُغلق أو تحتاج الشروط للتحديث|فتح شروط اللقاء|الاختيار والقواعد لم يتغيرا؛ رُبطا بإصدار جديد|لا إشعارات بتغير الشروط بعد|اختيار المنظم لا يغير تعهداتك الشخصية. القراءة ليست موافقة.|لا احتياجات مختارة',
 fa:'مشارکت‌های دیدار تغییر کرد|اضافه شد|از شرایط دیدار حذف شد|قاعده تغییر کرد|پیش از تغییر|پس از تغییر|نیازها در نسخه قبلی تنظیم نشده بود|اگر شرایط فعلی را می‌پذیری دوباره تأیید کن|برای نسخه فعلی تأیید شده|رد کردی یا رضایت را پس گرفتی|نسخه تازه‌تری هست — شرایط فعلی را باز کن|تأیید در دسترس نیست: دیدار شروع یا بسته شده یا شرایط نیاز به به‌روزرسانی دارد|باز کردن شرایط دیدار|انتخاب و قواعد تغییر نکرده؛ به نسخه جدید پیوند خورده|هنوز اعلان تغییر شرایطی نیست|انتخاب برگزارکننده تعهدهای شخصی تو را عوض نمی‌کند. خواندن رضایت نیست.|نیازی انتخاب نشده',
 so:'Wax ku biirinta kulanka way is beddeshay|Lagu daray|Laga saaray shuruudaha kulanka|Xeerka waa la beddelay|Hore|Kadib|Baahiyaha laguma dejin noocii hore|Mar kale xaqiiji haddii aad ku raacsan tahay shuruudaha hadda|Hore ayaa loogu xaqiijiyey nooca hadda|Waad diidday ama ka noqotay oggolaanshaha|Nooc cusub ayaa jira — fur shuruudaha hadda|Xaqiijin ma jirto: kulanku wuu bilowday, xirmay ama shuruuduhu waxay u baahan yihiin cusboonaysiin|Fur shuruudaha kulanka|Doorashada iyo xeerarku isma beddelin; waxaa lagu xiray nooc cusub|Weli ogeysiisyo isbeddel shuruudo ma jiraan|Doorashada qabanqaabiyuhu ma beddesho ballanqaadyadaada. Akhrisku ma aha oggolaansho.|Baahiyo lama dooran',
 ku:'Beşdariyên civînê guherîn|Hat zêdekirin|Ji şertên civînê hat derxistin|Rêgez guherî|Berê|Piştî|Di guhertoya berê de pêdivî nehatibûn diyarkirin|Dîsa bipejirîne heke tu şertên niha qebûl dikî|Ji bo guhertoya niha pejirandî ye|Te red kir an razîbûn paş ve kişand|Guhertoyeke nûtir heye — şertên niha veke|Pejirandin ne berdest e: civîn dest pê kiriye, hatiye girtin an şert nûkirin dixwazin|Şertên civînê veke|Hilbijartin û rêgez neguherîn; bi guhertoya nû ve girêdayî ne|Hê agahiyên guhertina şertan tune ne|Hilbijartina organîzator sozên te yên kesane naguherîne. Xwendin ne razîbûn e.|Pêdivî nehatin hilbijartin'
};
const policyNoticeText=i=>(policyNoticeCopy[document.documentElement.lang]||policyNoticeCopy.en).split('|')[i];
function policyChanges(before=[],after=[]){
 const old=new Map(before.map(n=>[n.need,n])),next=new Map(after.map(n=>[n.need,n]));
 return [...new Set([...old.keys(),...next.keys()])].flatMap(id=>{
  const a=old.get(id),b=next.get(id);
  return !a?[{type:1,after:b}]:!b?[{type:2,before:a}]:a.mode!==b.mode||a.amount!==b.amount||a.kind!==b.kind||a.title!==b.title?[{type:3,before:a,after:b}]:[];
 });
}
function renderPolicyInbox({snapshot:s,name,demo=false}){
 if(!s)return '';
 const tx=i=>esc(policyNoticeText(i));
 let html=`<section class="meeting-budget-notices"><h3>${tx(0)}</h3>`;
 if(!demo&&(s.error||!Array.isArray(s.rows)||!Number.isFinite(s.loadedAt)||Date.now()-s.loadedAt<0||Date.now()-s.loadedAt>=60000||globalThis.navigator?.onLine===false))return html+`<p role="status">${esc(text(27))}</p><button type="button" class="button" data-coop="taskRefresh">${esc(text(27))}</button></section>`;
 html+=`<p class="meta">${s.rows.length} / ${esc(s.total)} · ${esc(noticeText(12))}: ${esc(s.unread)}</p>`;
 const describe=n=>`${esc(n.title||text(14))} · ${esc(fmt(Number(n.amount),n.kind))} · ${esc(meetingText(n.mode==='promise'?1:2))}`;
 for(const n of s.rows){
  const changes=policyChanges(n.before_items,n.after_items);
  html+=`<article class="card"><h4>${esc(n.project_title)}</h4><p>${esc(globalThis.FolkoopMeetings.text(8))} ${esc(n.before_version)} → ${esc(n.version)} · <bdi>${esc(name(n.author_id))}</bdi></p><p class="meta">${esc(new Date(n.created_at).toLocaleString())}${n.read_at?'':' · '+esc(noticeText(12))}</p>`;
  if(!n.before_configured)html+=`<p>${tx(6)}</p>`;
  html+=changes.length?`<ul>${changes.map(c=>`<li><strong>${tx(c.type)}</strong>${c.before?`<p>${tx(4)}: ${describe(c.before)}</p>`:''}${c.after?`<p>${tx(5)}: ${describe(c.after)}</p>`:''}</li>`).join('')}</ul>`:`<p>${tx(13)}</p>`;
  if(!n.after_items.length)html+=`<p>${tx(16)}</p>`;
  if(!n.is_current)html+=`<p role="status">${tx(10)} · ${esc(globalThis.FolkoopMeetings.text(8))} ${esc(n.current_version)}</p>`;
  if(!n.can_respond)html+=`<p>${tx(11)}</p>`;
  else html+=`<ul>${(n.roles||[]).map(r=>`<li>${esc(globalThis.FolkoopMeetings.text({attendee:25,facilitator:2,opener:3}[r.role]))} — ${tx(r.confirmed===true?8:r.confirmed===false?9:7)}</li>`).join('')}</ul>`;
  html+=`<p class="meta">${tx(15)}</p>`;
  if(!demo)html+=`<button type="button" class="button" data-coop="openNotify" data-target-kind="project" data-id="${esc(n.cooperation_id)}" data-meeting-budget="true">${tx(12)}</button>${n.read_at?'':`<form class="netMeetingBudgetNoticeRead"><input type="hidden" name="project" value="${esc(n.cooperation_id)}"><input type="hidden" name="version" value="${esc(n.version)}"><button class="button secondary" type="submit">${esc(noticeText(7))}</button></form>`}`;
  html+='</article>';
 }
 return html+(s.rows.length?'':`<p>${tx(14)}</p>`)+'</section>';
}
globalThis.FolkoopBudget=Object.freeze({contributionTermsState,renderOverview,overviewModel,render,text,amount,totals,renderInbox,noticeText,renderMeeting,meetingText,renderPolicyInbox,policyChanges});
})();
