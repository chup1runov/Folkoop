/* Explicit local preferences; no engagement tracking or cached participant content. */
(() => {
'use strict';
const DAY=86400000,LIMIT=100,memory=new Map(),failed=new Set();
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
function clean(value){
 const ids=x=>Array.isArray(x)?[...new Set(x.filter(validId))].slice(0,LIMIT):[];
 const start=value?.goal?.start;
 return {saved:ids(value?.saved),hidden:ids(value?.hidden),goal:Number.isSafeInteger(start)&&start>0&&start<8640000000000000-7*DAY?{start}:null};
}
function key(user,demo=false){return 'folkoop-discovery-v1:'+(demo?'mura':validId(user)?user:'anonymous');}
function read(user,demo=false){
 const k=key(user,demo);let value=memory.get(k);
 if(!failed.has(k))try{value=JSON.parse(localStorage.getItem(k)||'null');}catch{failed.add(k);}
 return {...clean(value),persistent:!failed.has(k)};
}
function change(user,demo,action,id,now=Date.now()){
 const k=key(user,demo),value=clean(read(user,demo));let limit=false;
 if(['save','hide'].includes(action)&&validId(id)){
  const field=action==='save'?'saved':'hidden',list=value[field];
  if(list.includes(id))value[field]=list.filter(x=>x!==id);
  else if(list.length<LIMIT){list.push(id);if(action==='save')value.hidden=value.hidden.filter(x=>x!==id);}
  else limit=true;
 }
 if(action==='restore')value.hidden=[];
 if(action==='clear-saved')value.saved=[];
 if(action==='start'&&Number.isSafeInteger(now)&&now>0)value.goal={start:now};
 if(action==='cancel')value.goal=null;
 memory.set(k,value);
 try{localStorage.setItem(k,JSON.stringify(value));failed.delete(k);}catch{failed.add(k);}
 return {...value,persistent:!failed.has(k),limit};
}
// Within each participation band, greedily mix types and owners. Text relevance
// outranks diversity; creation time and ID break ties. No inferred personal traits.
function rank(items,{hidden=[],titleMatch=()=>false}={}){
 const blocked=new Set(hidden),seen=new Set(),pool=items.filter(x=>!blocked.has(x.id)&&!seen.has(x.id)&&seen.add(x.id));
 const result=[];
 pool.sort((a,b)=>Number(a.joined)-Number(b.joined)||Number(titleMatch(b))-Number(titleMatch(a))||String(b.created_at||'').localeCompare(String(a.created_at||''))||String(a.id).localeCompare(String(b.id)));
 while(pool.length){
  const batch=result.slice(result.length-result.length%3),kinds=new Set(batch.map(x=>x.kind)),owners=new Set(batch.map(x=>x.owner_id).filter(Boolean));
  const score=x=>(titleMatch(x)?4:0)-(kinds.has(x.kind)?1:0)-(x.owner_id&&owners.has(x.owner_id)?2:0);
  let best=0;
  for(let i=1;i<Math.min(24,pool.length);i++){
   if(pool[i].joined!==pool[0].joined)break;
   if(score(pool[i])>score(pool[best]))best=i;
  }
  result.push(pool.splice(best,1)[0]);
 }
 return result;
}
function goalProgress(goal,tasks,user,now=Date.now()){
 if(!goal)return null;
 const start=goal.start,end=start+7*DAY,seen=new Set();
 const results=tasks.filter(x=>x.assignee_id===user&&x.work_stage==='verified'&&x.reviewed_by&&x.reviewed_by!==user&&Date.parse(x.reviewed_at)>=start&&Date.parse(x.reviewed_at)<end&&Date.parse(x.reviewed_at)<=now&&validId(x.id)&&!seen.has(x.id)&&seen.add(x.id));
 return {start,end,results,count:results.length,complete:results.length>=1,ended:now>=end,future:start>now};
}
const copy={
 ru:'Сохранённое|Сохранить|Сохранено|Не интересно|Вернуть скрытые|Варианты|Назад|Другие варианты|Больше вариантов пока нет|Сохранённых доступных объявлений пока нет.|Сохранённое и скрытое — в этом браузере, отдельно для аккаунта.|Сохранить на устройстве не удалось. Выбор действует до закрытия страницы.|Моя цель на 7 дней|Один результат задачи, подтверждённый другим участником.|Начать|Цель достигнута|Срок завершён. Можно выбрать новую цель.|Подтверждённые результаты|Открыть задачи|Новая цель|Убрать цель|До|Закрыто|До 100 сохранённых и 100 скрытых. Убери лишнее, чтобы добавить новое.|Сначала совпадение по желанию, затем разнообразие типов и авторов. Уже начатое — после новых вариантов.|Пример Муры: сохранение можно попробовать; личная цель доступна в своём аккаунте.|Обнови данные, чтобы увидеть прогресс.|Показаны только доступные сейчас сохранённые объявления.|Совпадение в названии|Проверь дату на устройстве.|Очистить сохранённое',
 en:'Saved|Save|Saved|Not interested|Restore hidden|Options|Back|More options|No more options yet|No saved available listings yet.|Saved and hidden choices stay in this browser, separately for each account.|Could not save on this device. Choices last until this page closes.|My 7-day goal|One task result confirmed by another participant.|Start|Goal reached|The period ended. You can choose a new goal.|Confirmed results|Open tasks|New goal|Remove goal|Until|Closed|Up to 100 saved and 100 hidden. Remove one to add another.|Intent matches first, then a mix of types and authors. Already joined comes after new options.|Mura example: try saving; personal goals are available in your own account.|Refresh data to see progress.|Only saved listings currently available to you are shown.|Matches the title|Check the date on your device.|Clear saved',
 sv:'Sparat|Spara|Sparat|Inte intresserad|Visa dolda igen|Förslag|Tillbaka|Fler förslag|Inga fler förslag just nu|Inga tillgängliga sparade annonser ännu.|Sparade och dolda val finns i denna webbläsare, separat för varje konto.|Kunde inte spara på enheten. Valen gäller tills sidan stängs.|Mitt mål för 7 dagar|Ett uppgiftsresultat bekräftat av en annan deltagare.|Börja|Målet uppnått|Perioden är slut. Du kan välja ett nytt mål.|Bekräftade resultat|Öppna uppgifter|Nytt mål|Ta bort målet|Till|Stängt|Högst 100 sparade och 100 dolda. Ta bort ett för att lägga till fler.|Intresse först, sedan olika typer och författare. Redan påbörjat visas efter nya förslag.|Muras exempel: prova att spara; personliga mål finns i ditt eget konto.|Uppdatera för att se framstegen.|Bara sparade annonser som du har åtkomst till visas.|Matchning i rubriken|Kontrollera datumet på din enhet.|Rensa sparat',
 uk:'Збережене|Зберегти|Збережено|Не цікаво|Повернути приховане|Варіанти|Назад|Інші варіанти|Більше варіантів поки немає|Доступних збережених оголошень поки немає.|Збережене й приховане — у цьому браузері, окремо для акаунта.|Не вдалося зберегти. Вибір діє до закриття сторінки.|Моя ціль на 7 днів|Один результат завдання, підтверджений іншим учасником.|Почати|Цілі досягнуто|Термін завершився. Можна обрати нову ціль.|Підтверджені результати|Відкрити завдання|Нова ціль|Прибрати ціль|До|Закрито|До 100 збережених і 100 прихованих. Прибери зайве для нового.|Спочатку збіг із бажанням, потім різні типи й автори. Розпочате — після нових варіантів.|Приклад Мури: спробуй збереження; особиста ціль доступна у власному акаунті.|Онови дані, щоб побачити прогрес.|Показані лише доступні зараз збережені оголошення.|Збіг у назві|Перевір дату на пристрої.|Очистити збережене',
 fi:'Tallennetut|Tallenna|Tallennettu|Ei kiinnosta|Palauta piilotetut|Vaihtoehdot|Takaisin|Lisää vaihtoehtoja|Ei muita vaihtoehtoja vielä|Ei saatavilla olevia tallennettuja ilmoituksia.|Valinnat säilyvät tässä selaimessa erikseen kullekin tilille.|Tallennus ei onnistunut. Valinnat säilyvät sivun sulkemiseen asti.|7 päivän tavoitteeni|Yksi toisen osallistujan vahvistama tehtävän tulos.|Aloita|Tavoite saavutettu|Jakso päättyi. Voit valita uuden tavoitteen.|Vahvistetut tulokset|Avaa tehtävät|Uusi tavoite|Poista tavoite|Asti|Suljettu|Enintään 100 tallennettua ja 100 piilotettua. Poista yksi lisätäksesi uuden.|Ensin kiinnostus, sitten eri tyypit ja tekijät. Liitytyt uusien jälkeen.|Muran esimerkki: kokeile tallentamista; tavoitteet omalla tilillä.|Päivitä tiedot nähdäksesi edistymisen.|Vain saatavilla olevat tallennetut ilmoitukset näytetään.|Otsikko vastaa hakuasi|Tarkista laitteen päivämäärä.|Tyhjennä tallennetut',
 bs:'Sačuvano|Sačuvaj|Sačuvano|Ne zanima me|Vrati skrivene|Opcije|Nazad|Još opcija|Za sada nema više opcija|Nema dostupnih sačuvanih oglasa.|Izbori ostaju u ovom pregledniku, zasebno po računu.|Čuvanje nije uspjelo. Izbori traju do zatvaranja stranice.|Moj cilj za 7 dana|Jedan rezultat zadatka koji potvrdi drugi učesnik.|Počni|Cilj ostvaren|Period je završen. Možeš odabrati novi cilj.|Potvrđeni rezultati|Otvori zadatke|Novi cilj|Ukloni cilj|Do|Zatvoreno|Do 100 sačuvanih i 100 skrivenih. Ukloni jedan za novi.|Prvo interes, zatim različiti tipovi i autori. Pridruženi nakon novih.|Murin primjer: probaj sačuvati; lični ciljevi su na vlastitom računu.|Osvježi podatke za napredak.|Prikazani su samo trenutno dostupni sačuvani oglasi.|Podudaranje u naslovu|Provjeri datum uređaja.|Očisti sačuvano',
 es:'Guardado|Guardar|Guardado|No me interesa|Restaurar ocultos|Opciones|Atrás|Más opciones|No hay más opciones por ahora|Todavía no hay anuncios guardados disponibles.|Tus elecciones quedan en este navegador, separadas por cuenta.|No se pudo guardar. Las elecciones duran hasta cerrar la página.|Mi objetivo de 7 días|Un resultado de tarea confirmado por otra persona.|Empezar|Objetivo alcanzado|El periodo terminó. Puedes elegir otro objetivo.|Resultados confirmados|Abrir tareas|Nuevo objetivo|Quitar objetivo|Hasta|Cerrado|Hasta 100 guardados y 100 ocultos. Quita uno para añadir otro.|Primero intereses, luego variedad de tipos y autores. Los ya unidos después.|Ejemplo de Mura: prueba guardar; los objetivos están en tu propia cuenta.|Actualiza los datos para ver el progreso.|Solo se muestran anuncios guardados disponibles actualmente.|Coincide con el título|Comprueba la fecha del dispositivo.|Borrar guardados',
 ar:'المحفوظات|حفظ|محفوظ|غير مهتم|إظهار المخفي|خيارات|رجوع|خيارات أخرى|لا توجد خيارات أخرى الآن|لا توجد إعلانات محفوظة متاحة بعد.|الاختيارات في هذا المتصفح منفصلة لكل حساب.|تعذر الحفظ. تستمر الاختيارات حتى إغلاق الصفحة.|هدفي خلال 7 أيام|نتيجة مهمة واحدة يؤكدها مشارك آخر.|ابدأ|تحقق الهدف|انتهت المدة. يمكنك اختيار هدف جديد.|نتائج مؤكدة|فتح المهام|هدف جديد|إزالة الهدف|حتى|مغلق|حتى 100 محفوظ و100 مخفي. أزل واحدًا لإضافة آخر.|الاهتمام أولًا ثم تنوع الأنواع والمؤلفين. المشاركات الحالية بعد الجديدة.|مثال مورا: جرب الحفظ؛ الأهداف الشخصية في حسابك.|حدّث البيانات لرؤية التقدم.|تظهر فقط الإعلانات المحفوظة المتاحة حاليًا.|تطابق في العنوان|تحقق من تاريخ الجهاز.|مسح المحفوظات',
 fa:'ذخیره‌شده‌ها|ذخیره|ذخیره شد|علاقه ندارم|نمایش پنهان‌ها|گزینه‌ها|بازگشت|گزینه‌های بیشتر|فعلاً گزینه دیگری نیست|هنوز آگهی ذخیره‌شده در دسترسی نیست.|انتخاب‌ها در این مرورگر برای هر حساب جدا می‌مانند.|ذخیره نشد. انتخاب‌ها تا بستن صفحه می‌مانند.|هدف ۷ روزه من|یک نتیجه کار که مشارکت‌کننده دیگری تأیید کند.|شروع|هدف محقق شد|بازه تمام شد. می‌توانی هدف تازه‌ای انتخاب کنی.|نتایج تأییدشده|باز کردن کارها|هدف تازه|حذف هدف|تا|بسته|تا ۱۰۰ ذخیره و ۱۰۰ پنهان. برای افزودن یکی را بردار.|اول علاقه، سپس تنوع نوع و نویسنده. عضویت‌های فعلی پس از گزینه‌های تازه.|نمونه مورا: ذخیره را امتحان کن؛ اهداف شخصی در حساب خودت است.|برای دیدن پیشرفت داده‌ها را تازه کن.|فقط آگهی‌های ذخیره‌شده در دسترس نشان داده می‌شوند.|تطابق در عنوان|تاریخ دستگاه را بررسی کن.|پاک کردن ذخیره‌ها',
 so:'La kaydiyey|Kaydi|La kaydiyey|Ma xiisaynayo|Soo celi kuwa qarsoon|Ikhtiyaarro|Dib|Ikhtiyaarro kale|Weli ikhtiyaarro kale ma jiraan|Ogeysiisyo kaydsan oo la heli karo ma jiraan.|Doorashooyinku waxay ku jiraan biraawsarkan, koonto kasta gooni.|Kaydintu ma shaqayn. Doorashooyinku waxay jiraan ilaa bogga la xiro.|Hadafkayga 7 maalmood|Hal natiijo hawl oo qof kale xaqiijiyo.|Bilow|Hadafka waa la gaaray|Muddadu way dhammaatay. Dooro hadaf cusub.|Natiijooyin la xaqiijiyey|Fur hawlaha|Hadaf cusub|Ka saar hadafka|Ilaa|Xiran|Ilaa 100 kaydsan iyo 100 qarsoon. Mid saar si aad mid kale ugu darto.|Marka hore xiisaha, kadib noocyo iyo qoraayaal kala duwan. Kuwa aad ku jirto dambe.|Tusaalaha Mura: tijaabi kaydinta; hadafyada gaarka ahi koontadaada ayay ku jiraan.|Cusboonaysii xogta si aad u aragto horumarka.|Kaliya ogeysiisyada kaydsan ee hadda la heli karo ayaa muuqda.|Cinwaanku waa waafaqsan yahay|Hubi taariikhda qalabka.|Nadiifi kaydsan',
 ku:'Tomarkirî|Tomar bike|Tomarkirî|Eleqeya min tune|Veşartiyan vegerîne|Vebijark|Paşve|Vebijarkên din|Hê vebijarkên din tune|Ragihandinên tomarkirî yên berdest tune ne.|Hilbijartin di vê gerokê de ji bo her hesabî cuda dimînin.|Tomarkirin neçû. Hilbijartin heta girtina rûpelê dimînin.|Armanca min a 7 rojan|Encameke karê ku beşdarekî din piştrast bike.|Dest pê bike|Armanc pêk hat|Dem qediya. Tu dikarî armanceke nû hilbijêrî.|Encamên piştrastkirî|Karan veke|Armanceke nû|Armancê rake|Heta|Girtî|Heta 100 tomarkirî û 100 veşartî. Yekê rake ku yeke nû lê zêde bikî.|Pêşî eleqe, paşê cure û nivîskarên cuda. Yên tevlîbûyî piştî nûyan.|Mînaka Mura: tomarkirinê biceribîne; armancên kesane di hesabê te de ne.|Daneyan nû bike ku pêşketinê bibînî.|Tenê ragihandinên tomarkirî yên niha berdest tên nîşandan.|Lihevhatin di sernavê de|Dîroka amûrê kontrol bike.|Tomarkiriyan paqij bike'
};
const text=i=>(copy[document.documentElement.lang]||copy.en).split('|')[i];
globalThis.FolkoopDiscovery=Object.freeze({read,change,clean,rank,goalProgress,text});
})();
