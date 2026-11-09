/* Consultative project decisions. Authorization and deadline checks live on the server. */
(() => {
'use strict';
const copy={
 en:['Decision → tasks','Responses advise the organizer; they are not binding votes or consent to do work. Silence is not agreement.','Propose a decision','Question','Why is this needed?','Alternatives — one per line (2–6)','Respond by (your device time)','Publish','No proposals yet.','Unavailable. Refresh to try again.','Refresh','My choice','Optional explanation','Save response','Withdraw response','Record decision and create tasks','Reason for this decision','Tasks — one per line (1–10), without assignees','Decision recorded','Responses','Discussion closed','Tasks are managed in the project task list.','The organizer records a decision after the deadline, with a reason.','Mura: “We chose conversation in pairs. Now we need topic cards and someone to check the room.”','Decision by','No response','Participants can see your choice and explanation.'],
 ru:['Решение → задачи','Ответы помогают организатору принять решение. Это не обязательное голосование и не согласие выполнить работу. Молчание не означает согласие.','Предложить решение','Вопрос','Зачем это нужно?','Варианты — каждый с новой строки (2–6)','Ответить до (время твоего устройства)','Опубликовать','Предложений пока нет.','Данные недоступны. Попробуй обновить.','Обновить','Мой выбор','Пояснение — необязательно','Сохранить ответ','Отозвать ответ','Зафиксировать решение и создать задачи','Почему выбрано это решение','Задачи — каждая с новой строки (1–10), без исполнителей','Решение зафиксировано','Ответы','Обсуждение завершено','Задачи доступны в обычном списке задач проекта.','После срока обсуждения организатор фиксирует решение и объясняет его.','Мура: «Выбрали разговор в парах. Теперь нужны карточки с темами и проверка помещения».','Решение зафиксировал(а)','Нет ответа','Участники видят твой выбор и пояснение.'],
 sv:['Beslut → uppgifter','Svaren är rådgivande, inte bindande röster eller samtycke till arbete. Tystnad är inte samtycke.','Föreslå ett beslut','Fråga','Varför behövs detta?','Alternativ — ett per rad (2–6)','Svara senast (enhetens tid)','Publicera','Inga förslag ännu.','Uppgifterna är inte tillgängliga. Uppdatera.','Uppdatera','Mitt val','Valfri förklaring','Spara svar','Återkalla svar','Registrera beslut och skapa uppgifter','Skäl till beslutet','Uppgifter — en per rad (1–10), utan ansvarig','Beslut registrerat','Svar','Diskussionen är avslutad','Uppgifterna finns i projektets uppgiftslista.','Arrangören registrerar beslut och skäl efter svarstiden.','Mura: ”Vi valde samtal i par. Nu behöver vi ämneskort och kontrollera lokalen.”','Beslut registrerat av','Inget svar','Deltagarna ser ditt val och din förklaring.']
};
Object.assign(copy,{
 uk:['Рішення → завдання','Відповіді дорадчі, це не обов’язкове голосування чи згода виконати роботу. Мовчання не є згодою.','Запропонувати рішення','Питання','Навіщо це потрібно?','Варіанти — кожен з нового рядка (2–6)','Відповісти до (час пристрою)','Опублікувати','Пропозицій ще немає.','Дані недоступні. Онови.','Оновити','Мій вибір','Необов’язкове пояснення','Зберегти відповідь','Відкликати відповідь','Зафіксувати рішення та створити завдання','Причина рішення','Завдання — кожне з нового рядка (1–10), без виконавців','Рішення зафіксовано','Відповіді','Обговорення завершено','Завдання доступні у списку завдань проєкту.','Після строку обговорення організатор фіксує рішення з поясненням.','Мура: «Обрали розмови в парах. Потрібні картки з темами та перевірка приміщення».','Рішення зафіксував(-ла)','Немає відповіді','Учасники бачать твій вибір і пояснення.'],
 fi:['Päätös → tehtävät','Vastaukset ovat neuvoa-antavia, eivät sitovia ääniä tai suostumuksia työhön. Hiljaisuus ei ole suostumus.','Ehdota päätöstä','Kysymys','Miksi tätä tarvitaan?','Vaihtoehdot — yksi riville (2–6)','Vastaa viimeistään (laitteen aika)','Julkaise','Ei vielä ehdotuksia.','Tietoja ei ole saatavilla. Päivitä.','Päivitä','Oma valintani','Valinnainen perustelu','Tallenna vastaus','Peru vastaus','Kirjaa päätös ja luo tehtävät','Päätöksen perustelu','Tehtävät — yksi riville (1–10), ilman vastuuhenkilöitä','Päätös kirjattu','Vastaukset','Keskustelu päättynyt','Tehtävät löytyvät projektin tehtävälistasta.','Järjestäjä kirjaa perustellun päätöksen vastausajan jälkeen.','Mura: ”Valitsimme parikeskustelut. Tarvitsemme aihekortit ja tilan tarkistuksen.”','Päätöksen kirjasi','Ei vastausta','Osallistujat näkevät valintasi ja perustelusi.'],
 bs:['Odluka → zadaci','Odgovori su savjetodavni, nisu obavezujući glasovi ni pristanak na rad. Šutnja nije saglasnost.','Predloži odluku','Pitanje','Zašto je ovo potrebno?','Opcije — jedna po redu (2–6)','Odgovori do (vrijeme uređaja)','Objavi','Još nema prijedloga.','Podaci nisu dostupni. Osvježi.','Osvježi','Moj izbor','Neobavezno obrazloženje','Sačuvaj odgovor','Povuci odgovor','Zabilježi odluku i kreiraj zadatke','Razlog odluke','Zadaci — jedan po redu (1–10), bez izvršilaca','Odluka zabilježena','Odgovori','Rasprava završena','Zadaci su na listi zadataka projekta.','Organizator bilježi odluku s razlogom nakon roka.','Mura: „Izabrali smo razgovore u paru. Trebaju nam kartice s temama i provjera prostorije.”','Odluku zabilježio/la','Nema odgovora','Učesnici vide tvoj izbor i obrazloženje.'],
 es:['Decisión → tareas','Las respuestas son consultivas, no votos vinculantes ni consentimiento para trabajar. El silencio no es acuerdo.','Proponer una decisión','Pregunta','¿Por qué hace falta?','Alternativas — una por línea (2–6)','Responder antes de (hora del dispositivo)','Publicar','Todavía no hay propuestas.','Datos no disponibles. Actualiza.','Actualizar','Mi elección','Explicación opcional','Guardar respuesta','Retirar respuesta','Registrar decisión y crear tareas','Motivo de la decisión','Tareas — una por línea (1–10), sin responsables','Decisión registrada','Respuestas','Debate cerrado','Las tareas están en la lista de tareas del proyecto.','El organizador registra la decisión y su motivo después del plazo.','Mura: «Elegimos conversaciones en parejas. Necesitamos tarjetas de temas y comprobar la sala».','Decisión registrada por','Sin respuesta','Los participantes ven tu elección y explicación.'],
 ar:['القرار ← المهام','الإجابات استشارية وليست تصويتًا ملزمًا أو موافقة على العمل. الصمت ليس موافقة.','اقتراح قرار','السؤال','لماذا نحتاج هذا؟','الخيارات — خيار في كل سطر (2–6)','الرد قبل (وقت جهازك)','نشر','لا توجد مقترحات بعد.','البيانات غير متاحة. حدّث.','تحديث','اختياري','توضيح اختياري','حفظ الرد','سحب الرد','تسجيل القرار وإنشاء المهام','سبب القرار','المهام — مهمة في كل سطر (1–10)، دون إسناد لأشخاص','تم تسجيل القرار','الردود','انتهى النقاش','المهام موجودة في قائمة مهام المشروع.','يسجل المنظم القرار وسببه بعد انتهاء المهلة.','مورا: «اخترنا الحديث في أزواج. نحتاج بطاقات مواضيع والتحقق من القاعة».','سجل القرار','لا يوجد رد','يرى المشاركون اختيارك وتوضيحك.'],
 fa:['تصمیم ← کارها','پاسخ‌ها مشورتی هستند، نه رأی الزام‌آور یا رضایت برای انجام کار. سکوت موافقت نیست.','پیشنهاد تصمیم','پرسش','چرا لازم است؟','گزینه‌ها — هر گزینه یک خط (2–6)','پاسخ تا (زمان دستگاه شما)','انتشار','هنوز پیشنهادی نیست.','داده‌ها در دسترس نیست. تازه‌سازی کنید.','تازه‌سازی','انتخاب من','توضیح اختیاری','ذخیره پاسخ','پس گرفتن پاسخ','ثبت تصمیم و ایجاد کارها','دلیل تصمیم','کارها — هر کار یک خط (1–10)، بدون مسئول','تصمیم ثبت شد','پاسخ‌ها','گفت‌وگو پایان یافت','کارها در فهرست کارهای پروژه هستند.','برگزارکننده پس از مهلت، تصمیم و دلیل را ثبت می‌کند.','مورا: «گفت‌وگوی دونفره را انتخاب کردیم. کارت موضوع و بررسی اتاق لازم داریم».','ثبت‌کننده تصمیم','بدون پاسخ','شرکت‌کنندگان انتخاب و توضیح شما را می‌بینند.'],
 so:['Go’aan → hawlo','Jawaabuhu waa talo, ma aha cod khasab ah ama oggolaansho shaqo. Aamusnaantu ma aha oggolaansho.','Soo jeedi go’aan','Su’aal','Maxaa loogu baahan yahay?','Doorashooyin — mid sadar kasta (2–6)','Ka jawaab ka hor (wakhtiga qalabka)','Daabac','Weli talooyin ma jiraan.','Xogta lama heli karo. Cusboonaysii.','Cusboonaysii','Doorashadayda','Sharaxaad ikhtiyaari ah','Kaydi jawaabta','Ka noqo jawaabta','Diiwaangeli go’aanka oo samee hawlo','Sababta go’aanka','Hawlo — mid sadar kasta (1–10), aan cid loo xilsaarin','Go’aanka waa la diiwaangeliyey','Jawaabo','Wadahadalku wuu dhammaaday','Hawluhu waxay ku jiraan liiska hawlaha mashruuca.','Qabanqaabiyuhu wuxuu diiwaangeliyaa go’aanka iyo sababta marka waqtigu dhammaado.','Mura: “Waxaan doorannay wada hadal labo-labo ah. Waxaan u baahan nahay kaarar mowduucyo iyo hubinta qolka.”','Go’aanka waxaa diiwaangeliyey','Jawaab ma jirto','Ka qaybgalayaashu waxay arkaan doorashadaada iyo sharaxaaddaada.'],
 ku:['Biryar → peywir','Bersiv şîret in, ne dengên mecbûrî an razîbûna kar in. Bêdengî ne razîbûn e.','Biryar pêşniyar bike','Pirs','Çima ev pêwîst e?','Vebijêrk — her yek rêzek (2–6)','Heta vê demê bersiv bide (dema amûrê)','Biweşîne','Hê pêşniyar tune ne.','Daneyên berdest tune ne. Nû bike.','Nû bike','Hilbijartina min','Ravekirina bijartî','Bersiv tomar bike','Bersiv paşve bikişîne','Biryar tomar bike û peywiran çêke','Sedema biryarê','Peywir — her yek rêzek (1–10), bê berpirsiyar','Biryar hat tomarkirin','Bersiv','Nîqaş qediya','Peywir di lîsteya peywirên projeyê de ne.','Organîzator piştî dawiyê biryar û sedemê tomar dike.','Mura: «Me axaftina cot bi cot hilbijart. Kartên mijaran û kontrola odeyê lazim in».','Biryar tomar kir','Bersiv tune','Beşdar hilbijartin û ravekirina te dibînin.']
});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=v=>String(v||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
// Draft translations: the organizer decides, but must address every active objection.
const ruleCopy={
 ru:'Правила решения|Решает|Организатор после обсуждения; ответы консультативные. Каждое возражение требует ответа, но не даёт права вето. Молчание не означает согласия.|Ожидаемый итог до (время устройства)|Срок итога пропущен; решение ещё можно записать.|Возражения|Моё возражение|Сохранить возражение|Отозвать возражение|Учтено|Отклонено с объяснением|Ответ организатора|Сохранить ответ|Ждёт ответа|Возражение отозвано|Прежние правила: отдельного срока итога и обязательных ответов на возражения не было.|Организатор изменился или недоступен. Для новых правил нужно новое предложение.|Правила и сроки фиксируются при публикации. Новый срок требует нового предложения.|Данные изменились или действие недоступно. Обнови раздел и проверь ответы.|Сначала ответь на все возражения.|Ожидаемый итог',
 en:'Decision rules|Decided by|The organizer decides after discussion; responses are advisory. Every objection needs an answer, not a veto. Silence is not agreement.|Outcome due (device time)|Outcome overdue; the decision can still be recorded.|Objections|My objection|Save objection|Withdraw objection|Taken into account|Declined with reasons|Organizer response|Save response|Awaiting response|Objection withdrawn|Legacy rules: no separate outcome deadline or required objection responses.|Organizer changed or unavailable. New rules need a new proposal.|Rules and deadlines are fixed at publication. A new deadline needs a new proposal.|Data changed or action unavailable. Refresh and review responses.|Answer every objection first.|Outcome due',
 sv:'Beslutsregler|Beslutas av|Arrangören beslutar efter diskussion; svaren är rådgivande. Varje invändning kräver svar men ger inget veto. Tystnad är inte samtycke.|Resultat senast (enhetens tid)|Resultatet är försenat; beslutet kan fortfarande registreras.|Invändningar|Min invändning|Spara invändning|Återkalla invändning|Beaktad|Avvisad med motivering|Arrangörens svar|Spara svar|Väntar på svar|Invändning återkallad|Tidigare regler: ingen separat resultatfrist eller krav på svar på invändningar.|Arrangören har ändrats eller är inte tillgänglig. Nya regler kräver ett nytt förslag.|Regler och tidsfrister låses vid publicering. Ny tidsfrist kräver nytt förslag.|Uppgifter ändrades eller åtgärden är otillgänglig. Uppdatera och granska svaren.|Besvara alla invändningar först.|Resultat senast',
 uk:'Правила рішення|Вирішує|Організатор вирішує після обговорення; відповіді дорадчі. Кожне заперечення потребує відповіді, але не дає права вето. Мовчання не є згодою.|Очікуваний підсумок до (час пристрою)|Строк підсумку минув; рішення ще можна записати.|Заперечення|Моє заперечення|Зберегти заперечення|Відкликати заперечення|Враховано|Відхилено з поясненням|Відповідь організатора|Зберегти відповідь|Очікує відповіді|Заперечення відкликано|Попередні правила: без окремого строку підсумку та обов’язкових відповідей.|Організатор змінився або недоступний. Потрібна нова пропозиція.|Правила і строки фіксуються при публікації. Новий строк потребує нової пропозиції.|Дані змінилися або дія недоступна. Онови й перевір відповіді.|Спочатку дай відповідь на всі заперечення.|Очікуваний підсумок',
 fi:'Päätöksen säännöt|Päättäjä|Järjestäjä päättää keskustelun jälkeen; vastaukset ovat neuvoa antavia. Jokaiseen vastalauseeseen vastataan, mutta veto-oikeutta ei ole. Hiljaisuus ei ole suostumus.|Tulos viimeistään (laitteen aika)|Määräaika ohitettu; päätöksen voi yhä kirjata.|Vastalauseet|Oma vastalause|Tallenna vastalause|Peru vastalause|Huomioitu|Hylätty perustellen|Järjestäjän vastaus|Tallenna vastaus|Odottaa vastausta|Vastalause peruttu|Vanhat säännöt: ei erillistä tuloksen määräaikaa eikä pakollisia vastauksia.|Järjestäjä muuttui tai ei ole käytettävissä. Tarvitaan uusi ehdotus.|Säännöt ja määräajat lukitaan julkaisussa. Uusi määräaika vaatii uuden ehdotuksen.|Tiedot muuttuivat tai toiminto ei ole käytettävissä. Päivitä ja tarkista.|Vastaa ensin kaikkiin vastalauseisiin.|Tulos viimeistään',
 bs:'Pravila odluke|Odlučuje|Organizator odlučuje nakon rasprave; odgovori su savjetodavni. Svaki prigovor traži odgovor, bez veta. Šutnja nije saglasnost.|Ishod do (vrijeme uređaja)|Rok je prošao; odluka se još može zapisati.|Prigovori|Moj prigovor|Sačuvaj prigovor|Povuci prigovor|Uvaženo|Odbijeno uz obrazloženje|Odgovor organizatora|Sačuvaj odgovor|Čeka odgovor|Prigovor povučen|Ranija pravila: bez zasebnog roka ishoda i obaveznih odgovora.|Organizator je promijenjen ili nedostupan. Potreban je novi prijedlog.|Pravila i rokovi se fiksiraju objavom. Novi rok traži novi prijedlog.|Podaci su promijenjeni ili radnja nije dostupna. Osvježi i pregledaj.|Prvo odgovori na sve prigovore.|Ishod do',
 es:'Reglas de decisión|Decide|El organizador decide tras el debate; las respuestas son consultivas. Cada objeción requiere respuesta, sin veto. El silencio no es consentimiento.|Resultado previsto antes de (hora del dispositivo)|Plazo vencido; todavía se puede registrar la decisión.|Objeciones|Mi objeción|Guardar objeción|Retirar objeción|Tenida en cuenta|Rechazada con explicación|Respuesta del organizador|Guardar respuesta|Espera respuesta|Objeción retirada|Reglas anteriores: sin plazo separado ni respuestas obligatorias.|El organizador cambió o no está disponible. Se necesita otra propuesta.|Reglas y plazos se fijan al publicar. Otro plazo requiere otra propuesta.|Datos modificados o acción no disponible. Actualiza y revisa.|Responde primero a todas las objeciones.|Resultado previsto',
 ar:'قواعد القرار|صاحب القرار|يقرر المنظم بعد النقاش؛ الردود استشارية. كل اعتراض يحتاج ردًا دون حق النقض. الصمت ليس موافقة.|النتيجة قبل (وقت الجهاز)|انتهت المهلة؛ يمكن تسجيل القرار لاحقًا.|الاعتراضات|اعتراضي|حفظ الاعتراض|سحب الاعتراض|أُخذ بعين الاعتبار|رُفض مع توضيح|رد المنظم|حفظ الرد|بانتظار الرد|سُحب الاعتراض|القواعد السابقة: لا مهلة منفصلة ولا ردود إلزامية.|تغير المنظم أو غير متاح. يلزم اقتراح جديد.|تثبت القواعد والمواعيد عند النشر. موعد جديد يتطلب اقتراحًا جديدًا.|تغيرت البيانات أو الإجراء غير متاح. حدّث وراجع.|أجب عن جميع الاعتراضات أولًا.|النتيجة المتوقعة',
 fa:'قواعد تصمیم|تصمیم‌گیرنده|برگزارکننده پس از گفت‌وگو تصمیم می‌گیرد؛ پاسخ‌ها مشورتی‌اند. هر اعتراض پاسخ می‌خواهد، نه حق وتو. سکوت رضایت نیست.|نتیجه تا (زمان دستگاه)|مهلت گذشته؛ هنوز می‌توان تصمیم را ثبت کرد.|اعتراض‌ها|اعتراض من|ذخیره اعتراض|پس گرفتن اعتراض|در نظر گرفته شد|رد با توضیح|پاسخ برگزارکننده|ذخیره پاسخ|منتظر پاسخ|اعتراض پس گرفته شد|قواعد پیشین: بدون مهلت جداگانه و پاسخ اجباری.|برگزارکننده تغییر کرده یا در دسترس نیست. پیشنهاد تازه لازم است.|قواعد و زمان‌ها هنگام انتشار ثابت می‌شوند. مهلت تازه پیشنهاد تازه می‌خواهد.|داده‌ها تغییر کرده یا اقدام ممکن نیست. تازه کن و بررسی کن.|اول به همه اعتراض‌ها پاسخ بده.|نتیجه مورد انتظار',
 so:'Xeerarka go’aanka|Waxaa go’aamiya|Qabanqaabiyaha ayaa go’aamiya doodda ka dib; jawaabuhu waa talo. Diidmo kasta jawaab bay u baahan tahay, ma aha veto. Aamusnaantu oggolaansho ma aha.|Natiijada ka hor (waqtiga qalabka)|Waqtigii wuu dhaafay; go’aanka weli waa la qori karaa.|Diidmooyinka|Diidmadayda|Kaydi diidmada|Ka noqo diidmada|La tixgeliyey|La diiday iyadoo la sharxay|Jawaabta qabanqaabiyaha|Kaydi jawaabta|Jawaab sugaya|Diidmada waa laga noqday|Xeerarkii hore: ma lahayn waqti natiijo gaar ah iyo jawaabo khasab ah.|Qabanqaabiyuhu wuu beddelmay ama lama heli karo. Soo jeedin cusub ayaa loo baahan yahay.|Xeerarka iyo waqtiyadu way go’an yihiin marka la daabaco. Waqti cusub wuxuu u baahan yahay soo jeedin cusub.|Xogtu way beddelantay ama ficilku ma bannaana. Cusboonaysii oo eeg.|Marka hore ka jawaab diidmo kasta.|Natiijada la filayo',
 ku:'Rêzikên biryarê|Biryar dide|Organîzator piştî nîqaşê biryar dide; bersiv şîret in. Her îtiraz bersiv dixwaze, ne mafê veto. Bêdengî razîbûn nîne.|Encam heta (dema amûrê)|Dem derbas bû; biryar hîn dikare bê tomarkirin.|Îtiraz|Îtiraza min|Îtirazê tomar bike|Îtirazê paşve bikişîne|Hat hesibandin|Bi ravekirin hat redkirin|Bersiva organîzator|Bersivê tomar bike|Li benda bersivê|Îtiraz hat paşvekişandin|Rêzikên berê: bê dema encamê û bersivên mecbûrî.|Organîzator guherî an ne berdest e. Pêşniyareke nû lazim e.|Rêzik û dem di weşandinê de tên sabîtkirin. Dema nû pêşniyara nû dixwaze.|Dane guherîn an kiryar ne berdest e. Nû bike û kontrol bike.|Pêşî bersiva her îtirazê bide.|Encama bendewar'
};
const ruleText=i=>(ruleCopy[document.documentElement.lang]||ruleCopy.en).split('|')[i];
function renderRules(d,{objections,user,owner,name,drafts,project,active}){
 const tx=i=>esc(ruleText(i)),closed=Date.parse(d.closes_at)<=Date.now(),done=!!d.decided_at;
 if(d.rules_version!==1)return `<p class="meta">${tx(15)}</p>`;
 const canDecide=owner&&d.decision_maker===user.id;
 let html=`<aside class="decision-rules"><h5>${tx(0)}</h5><p>${tx(1)}: ${esc(name(d.decision_maker))}</p><p>${tx(2)}</p><p>${tx(20)}: ${esc(new Date(d.decide_by).toLocaleString())}</p><p class="meta">${tx(17)}</p>${!done&&Date.parse(d.decide_by)<Date.now()?`<p role="status">${tx(4)}</p>`:''}${owner&&!canDecide&&!done?`<p>${tx(16)}</p>`:''}</aside>`;
 const rows=objections.filter(o=>o.decision_id===d.id),mine=rows.find(o=>o.author_id===user.id);
 html+=`<details${closed&&!done&&rows.some(o=>!o.withdrawn&&!o.disposition)?' open':''}><summary>${tx(5)} · ${rows.filter(o=>!o.withdrawn).length}</summary>`;
 for(const o of rows){
  const key=project+':answer:'+o.id,v=drafts[key]||{revision:o.revision,reply:o.reply||'',disposition:o.disposition||'accepted'};
  html+=`<article class="decision-objection"><strong>${esc(name(o.author_id))}</strong><p style="white-space:pre-wrap">${o.withdrawn?tx(14):esc(o.body)}</p>`;
  if(!o.withdrawn)html+=o.disposition?`<p>${tx(o.disposition==='accepted'?9:10)} · ${esc(name(o.answered_by))} · ${esc(new Date(o.answered_at).toLocaleString())}</p><p style="white-space:pre-wrap">${esc(o.reply)}</p>`:`<p>${tx(13)}</p>`;
  if(active&&canDecide&&closed&&!done&&!o.withdrawn)html+=`<form class="netDecision" data-operation="answer" data-decision="${esc(o.id)}"><input type="hidden" name="revision" value="${esc(v.revision)}"><label>${tx(11)}<select name="disposition"><option value="accepted"${v.disposition==='accepted'?' selected':''}>${tx(9)}</option><option value="declined"${v.disposition==='declined'?' selected':''}>${tx(10)}</option></select><textarea name="reply" rows="3" minlength="2" maxlength="1000" required>${esc(v.reply)}</textarea></label><button class="button">${tx(12)}</button></form>`;
  html+='</article>';
 }
 if(active&&!closed&&!done){
  const v=drafts[project+':objection:'+d.id]||{id:mine?.id||'',revision:mine?.revision||0,body:mine?.body||''};
  html+=`<form class="netDecision" data-operation="objection" data-decision="${esc(d.id)}"><input type="hidden" name="id" value="${esc(v.id)}"><input type="hidden" name="revision" value="${esc(v.revision)}"><label>${tx(6)}<textarea name="body" rows="3" minlength="2" maxlength="1000" required>${esc(v.body)}</textarea></label><button class="button" value="save">${tx(7)}</button>${mine&&!mine.withdrawn?`<button class="button secondary" value="withdraw" formnovalidate>${tx(8)}</button>`:''}</form>`;
 }
 return html+'</details>';
}
// Read-only projection of existing authority and exact task basis. No new voting model.
const pathCopy={ru:['Путь решения','Автор предложения','Откликнулись — ответом или возражением','Откликов пока нет; это не согласие','Решение фиксирует','Организатор проекта после обсуждения. Ответы консультативные; это не голосование кругов.','Зафиксировал решение','Не разобраны возражения','Связанные задачи','Исполнитель','Пока не назначен','Назначение ещё не означает принятия задачи','Основание задачи','Основание не задано; применяется существующий процесс задачи','Данные основания недоступны или устарели','Редакция документа','Текущая редакция','Нужны обновление основания и новые согласия','Ожидаются необходимые согласия','Необходимые согласия получены по загруженным данным','Основание ссылается на другое решение — проверьте связь','Открыть задачи и условия','Данные об участнике недоступны','Назначенный принимающий решение больше не является организатором. Нужно новое предложение.','Связанных задач пока нет'],en:['Decision path','Proposal author','Responded — with an answer or objection','No responses yet; this is not consent','Decision recorded by','The project organizer decides after discussion. Responses are advisory; this is not circle voting.','Recorded the decision','Unanswered objections','Linked tasks','Assignee','Not assigned yet','Assignment does not mean task acceptance','Task basis','No basis set; the existing task workflow applies','Basis data unavailable or stale','Document revision','Current revision','Update the basis and collect new consents','Required consents pending','Required consents received in the loaded data','The basis refers to another decision — check the link','Open tasks and conditions','Participant data unavailable','The named decision maker is no longer the organizer. A new proposal is required.','No linked tasks yet']};
Object.assign(pathCopy,globalThis.FolkoopFeatureCopy?.path||{});
function renderPath(d,{responses=[],objections=[],tasks=[],taskBases,name,organizer,now=Date.now()}){
 const locale=Object.hasOwn(pathCopy,document.documentElement.lang)?document.documentElement.lang:'en',tx=i=>esc(pathCopy[locale][i]);
 const who=id=>id?esc(name(id)):tx(22);
 const participants=[...new Set([...responses.filter(r=>r.decision_id===d.id).map(r=>r.user_id),...objections.filter(o=>o.decision_id===d.id).map(o=>o.author_id)])];
 const pending=objections.filter(o=>o.decision_id===d.id&&!o.withdrawn&&!o.disposition);
 const fresh=taskBases&&!taskBases.error&&Array.isArray(taskBases.rows)&&Number.isFinite(taskBases.loadedAt)&&now>=taskBases.loadedAt&&now-taskBases.loadedAt<60000&&globalThis.navigator?.onLine!==false;
 let out=`<section class="decision-path" lang="${locale}" dir="${['ar','fa'].includes(locale)?'rtl':'ltr'}"><h5>${tx(0)}</h5><p>${tx(1)}: ${who(d.created_by)}</p><p>${tx(2)}: ${participants.length?participants.map(who).join(', '):tx(3)}</p><p>${tx(4)}: ${who(d.rules_version===1?d.decision_maker:d.decided_by||organizer)}</p><p>${tx(5)}</p>`;
 if(d.decided_at)out+=`<p>${tx(6)}: ${who(d.decided_by)}</p>`;
 if(d.rules_version===1&&d.decision_maker!==organizer&&!d.decided_at)out+=`<p role="status">${tx(23)}</p>`;
 out+=`<p${pending.length?' role="status"':''}>${tx(7)}: ${pending.length}${pending.length?' — '+pending.map(o=>who(o.author_id)).join(', '):''}</p><h5>${tx(8)}</h5>`;
 const linked=tasks.filter(t=>t.source_decision_id===d.id);
 if(!linked.length)out+=`<p>${tx(24)}</p>`;
 for(const task of linked){
  const b=fresh?taskBases.rows.find(b=>b.task_id===task.id):null;
  out+=`<article><strong>${esc(task.title)}</strong><p>${tx(9)}: ${task.assignee_id?who(task.assignee_id):tx(10)}</p>${task.assignee_id&&(!task.work_stage||['legacy','available'].includes(task.work_stage))?`<p>${tx(11)}</p>`:''}<p>${tx(12)}: `;
  if(!fresh)out+=tx(14);
  else if(!b)out+=tx(13);
  else{
   out+=`${esc(b.document?.title||pathCopy[locale][14])} · ${tx(15)} ${esc(b.document_revision)} · ${tx(16)} ${esc(b.latest_document_revision??'—')}`;
   if(b.decision_id!==d.id)out+=`</p><p role="status">${tx(20)}`;
   else if(!b.document||!b.decision)out+=`</p><p role="status">${tx(14)}`;
   else if(b.document_revision!==b.latest_document_revision)out+=`</p><p role="status">${tx(17)}`;
   else out+=`</p><p>${tx(b.ready===true?19:18)}`;
  }
  out+='</p></article>';
 }
 if(linked.length)out+=`<button type="button" class="button secondary" data-project-next="tasks">${tx(21)}</button>`;
 return out+'</section>';
}

function render({snapshot,user,owner,organizer,name,tasks=[],taskBases,drafts={},project,demo=false,active=true}){
 const locale=copy[document.documentElement.lang]?document.documentElement.lang:'en',tx=i=>esc(copy[locale][i]);
 const input=(label,key,d,max=160)=>`<label>${tx(label)}<input name="${key}" maxlength="${max}" required value="${esc(d[key]||'')}"></label>`;
 const area=(label,key,d,max,required=true)=>`<label>${tx(label)}<textarea name="${key}" maxlength="${max}"${required?' required':''}>${esc(d[key]||'')}</textarea></label>`;
 const select=(d,value)=>`<label>${tx(11)}<select name="option" required><option value="">—</option>${d.options.map((s,i)=>`<option value="${i}"${String(value)===String(i)?' selected':''}>${esc(s)}</option>`).join('')}</select></label>`;
 let html=`<section class="card project-decisions" lang="${locale}" dir="${['ar','fa'].includes(locale)?'rtl':'ltr'}"><h3>${tx(0)}</h3><p class="meta">${tx(1)}</p>`;
 if(demo)return html+`<p>${tx(23)}</p><p class="meta">${tx(21)}</p></section>`;
 html+=`<button type="button" class="button secondary" data-coop="decisionRefresh">${tx(10)}</button>`;
 if(!snapshot||snapshot.error)return html+`<p role="status">${tx(9)}</p></section>`;
 const decisions=snapshot.decisions, responses=snapshot.responses, objections=snapshot.objections||[];
 if(!decisions.length)html+=`<p>${tx(8)}</p>`;
 for(const d of decisions){
  const rows=responses.filter(r=>r.decision_id===d.id),mine=rows.find(r=>r.user_id===user.id),closed=Date.parse(d.closes_at)<=Date.now(),done=!!d.decided_at;
  const response=drafts[project+':response:'+d.id]||{option:mine?.option_index??'',note:mine?.note||''};
  const finish=drafts[project+':finish:'+d.id]||{};
  const pendingObjections=objections.filter(o=>o.decision_id===d.id&&!o.withdrawn&&!o.disposition).length;
  const canFinish=owner&&(d.rules_version!==1||d.decision_maker===user.id);
  html+=`<article class="card"><h4>${esc(d.question)}</h4><p>${esc(d.purpose)}</p><p class="meta">${esc(new Date(d.closes_at).toLocaleString())} · ${tx(done?18:closed?20:6)}</p><ol>${d.options.map((o,i)=>`<li>${esc(o)} — ${rows.filter(r=>r.option_index===i).length}</li>`).join('')}</ol>`;
  html+=renderPath(d,{responses,objections,tasks,taskBases,name,organizer});
  html+=renderRules(d,{objections,user,owner,name,drafts,project,active});
  html+=`<details><summary>${tx(19)} (${rows.length})</summary><ul>${rows.map(r=>`<li>${esc(name(r.user_id))}: ${esc(d.options[r.option_index])}${r.note?` — ${esc(r.note)}`:''}</li>`).join('')}</ul><p class="meta">${tx(26)}</p></details>`;
  if(!closed&&!done&&active)html+=`<form class="editor netDecision" data-operation="response" data-decision="${esc(d.id)}">${select(d,response.option)}${area(12,'note',response,500,false)}<button class="button" value="save">${tx(13)}</button>${mine?`<button class="button secondary" value="withdraw" formnovalidate>${tx(14)}</button>`:''}</form>`;
  else if(!done)html+=`<p>${tx(22)}</p>`;
  if(closed&&!done&&canFinish&&active)html+=`<details${Object.keys(finish).length?' open':''}><summary>${tx(15)}</summary><form class="editor netDecision" data-operation="finish" data-decision="${esc(d.id)}">${select(d,finish.option)}${area(16,'rationale',finish,1000)}${area(17,'tasks',finish,1610)}${pendingObjections?`<p role="status">${esc(ruleText(19))} (${pendingObjections})</p>`:''}<button class="button"${pendingObjections?' disabled':''}>${tx(15)}</button></form></details>`;
  if(done){
   html+=`<p><strong>${esc(d.options[d.selected_option])}</strong></p><p>${esc(d.rationale)}</p><p class="meta">${tx(24)}: ${esc(name(d.decided_by))} · ${esc(new Date(d.decided_at).toLocaleString())}</p><ul>${(d.task_plan||[]).map(title=>`<li>${esc(title)}</li>`).join('')}</ul><p class="meta">${tx(21)}</p>`;
   html+=`<ul>${tasks.filter(task=>task.source_decision_id===d.id).map(task=>`<li>${esc(task.title)} · ${esc(task.work_stage&&task.work_stage!=='legacy'?globalThis.FolkoopTaskWork.label(task):task.status)}</li>`).join('')}</ul>`;
  }
  html+='</article>';
 }
 if(active&&decisions.length<50){
  const d=drafts[project+':propose:']||{};
  html+=`<details${Object.keys(d).length?' open':''}><summary>${tx(2)}</summary><form class="editor netDecision" data-operation="propose">${input(3,'question',d)}${area(4,'purpose',d,1000)}${area(5,'options',d,966)}<label>${tx(6)}<input type="datetime-local" name="closesAt" value="${esc(d.closesAt||'')}" required></label><label>${esc(ruleText(3))}<input type="datetime-local" name="decideBy" value="${esc(d.decideBy||'')}" required></label><p>${esc(ruleText(1))}: ${esc(name(organizer))}</p><p>${esc(ruleText(2))}</p><p class="meta">${esc(ruleText(17))}</p><button class="button">${tx(7)}</button></form></details>`;
 }
 return html+'</section>';
}
const overviewCopy={
 ru:'Обзор проекта|Цель|Что решили — протокол|Подтверждения встречи|Задачи|Что требует внимания|Нет зафиксированного решения|Задач пока нет|Без исполнителя|Ждёт проверки результата|Нужна доработка|Явных препятствий в загруженных данных не найдено. Это не гарантия готовности.|Нет настроенной встречи; её подтверждения не оцениваются.|Изменения и согласия проверяй в подробных разделах ниже.|Подтверждено участие|Ждём ответа|Подтверждение отозвано',
 en:'Project overview|Goal|Recorded decisions — minutes|Meeting confirmations|Tasks|Needs attention|No recorded decision|No tasks yet|No assignee|Result awaiting review|Rework needed|No explicit blockers found in loaded data. This is not a readiness guarantee.|No meeting configured; meeting confirmations are not assessed.|Review changes and consents in the detailed sections below.|Attendance confirmed|Awaiting response|Confirmation withdrawn',
 sv:'Projektöversikt|Mål|Beslut — protokoll|Mötesbekräftelser|Uppgifter|Behöver uppmärksamhet|Inget registrerat beslut|Inga uppgifter än|Ingen ansvarig|Resultat väntar på granskning|Omarbetning behövs|Inga tydliga hinder i laddade uppgifter. Det garanterar inte beredskap.|Inget möte inställt; bekräftelser bedöms inte.|Granska ändringar och samtycken i avsnitten nedan.|Deltagande bekräftat|Väntar på svar|Bekräftelse återkallad',
 uk:'Огляд проєкту|Мета|Рішення — протокол|Підтвердження зустрічі|Завдання|Потребує уваги|Немає зафіксованого рішення|Завдань ще немає|Без виконавця|Результат чекає перевірки|Потрібне доопрацювання|Явних перешкод у завантажених даних не знайдено. Це не гарантія готовності.|Зустріч не налаштована; підтвердження не оцінюються.|Перевір зміни та згоди в розділах нижче.|Участь підтверджено|Чекаємо відповіді|Підтвердження відкликано',
 fi:'Projektin yleiskuva|Tavoite|Päätökset — pöytäkirja|Tapaamisen vahvistukset|Tehtävät|Huomioitavaa|Ei kirjattua päätöstä|Ei vielä tehtäviä|Ei vastuuhenkilöä|Tulos odottaa tarkistusta|Korjattavaa|Ladatuissa tiedoissa ei selviä esteitä. Tämä ei takaa valmiutta.|Tapaamista ei ole määritetty; vahvistuksia ei arvioida.|Tarkista muutokset ja suostumukset alla.|Osallistuminen vahvistettu|Odottaa vastausta|Vahvistus peruttu',
 bs:'Pregled projekta|Cilj|Odluke — zapisnik|Potvrde sastanka|Zadaci|Traži pažnju|Nema zabilježene odluke|Još nema zadataka|Bez izvršioca|Rezultat čeka provjeru|Potrebna dorada|Nema jasnih prepreka u učitanim podacima. To nije garancija spremnosti.|Sastanak nije postavljen; potvrde se ne procjenjuju.|Provjeri promjene i saglasnosti u odjeljcima ispod.|Dolazak potvrđen|Čeka se odgovor|Potvrda povučena',
 es:'Resumen del proyecto|Objetivo|Decisiones — acta|Confirmaciones de reunión|Tareas|Requiere atención|Sin decisión registrada|Sin tareas todavía|Sin responsable|Resultado pendiente de revisión|Necesita correcciones|No hay obstáculos explícitos en los datos cargados. No garantiza que esté listo.|No hay reunión configurada; no se evalúan confirmaciones.|Revisa cambios y consentimientos más abajo.|Asistencia confirmada|Esperando respuesta|Confirmación retirada',
 ar:'نظرة عامة على المشروع|الهدف|القرارات — المحضر|تأكيدات اللقاء|المهام|يحتاج انتباهًا|لا قرار مسجل|لا مهام بعد|بلا مسؤول|النتيجة تنتظر المراجعة|يلزم تعديل|لا عوائق واضحة في البيانات المحملة. هذا لا يضمن الجاهزية.|لا لقاء محدد؛ لا تُقيّم التأكيدات.|راجع التغييرات والموافقات في الأقسام أدناه.|الحضور مؤكد|بانتظار الرد|سُحب التأكيد',
 fa:'نمای کلی پروژه|هدف|تصمیم‌ها — صورت‌جلسه|تأییدهای دیدار|کارها|نیازمند توجه|تصمیمی ثبت نشده|هنوز کاری نیست|بدون مسئول|نتیجه در انتظار بررسی|نیاز به اصلاح|مانع روشنی در داده‌های بارگیری‌شده نیست. تضمین آمادگی نیست.|دیداری تنظیم نشده؛ تأییدها ارزیابی نمی‌شوند.|تغییرات و رضایت‌ها را در بخش‌های پایین بررسی کنید.|حضور تأیید شده|در انتظار پاسخ|تأیید پس گرفته شده',
 so:'Dulmarka mashruuca|Ujeeddo|Go’aamada — diiwaanka|Xaqiijinta kulanka|Hawlaha|U baahan fiiro|Go’aan la diiwaangeliyey ma jiro|Weli hawlo ma jiraan|Qof loo xilsaaray ma jiro|Natiijadu hubin bay sugaysaa|Dib-u-habayn baa loo baahan yahay|Caqabad cad kuma jirto xogta la soo dejiyey. Ma dammaanad qaaddo diyaar-garow.|Kulan lama dejin; xaqiijinta lama qiimaynayo.|Eeg isbeddellada iyo oggolaanshaha qaybaha hoose.|Imaanshaha la xaqiijiyey|Jawaab baa la sugayaa|Xaqiijinta laga noqday',
 ku:'Kurteya projeyê|Armanc|Biryar — protokol|Pejirandinên civînê|Peywir|Baldarî dixwaze|Biryar nehatiye tomarkirin|Hê peywir tune ne|Bê berpirsiyar|Encam li benda kontrolê ye|Sererastkirin lazim e|Di daneyan de astenga eşkere tune. Ev ne garantîya amadebûnê ye.|Civîn nehatiye sazkirin; pejirandin nayên nirxandin.|Guhertin û razîbûnan li jêr kontrol bike.|Hatin pejirandî|Li benda bersivê|Pejirandin paşve kişandî'
};
// Draft translations. Navigation only: no consent or workflow mutation.
const nextCopy={
 ru:'Следующий шаг проекта|Открыть раздел|Данные нужно обновить|Нужно согласовать|Требует внимания|Можно обсудить|Ещё требует внимания|Проект закрыт: доступны просмотр и история.|Это подсказки по загруженным данным, не разрешение действовать за других.|Посмотреть результат встречи',
 en:'Next project step|Open section|Refresh the data|Agreement needed|Needs attention|Consider discussing|Also needs attention|Project closed: review and history remain available.|These suggestions use loaded data, not permission to act for others.|Review the meeting outcome',
 sv:'Nästa steg i projektet|Öppna avsnitt|Uppdatera uppgifterna|Samtycke behövs|Behöver uppmärksamhet|Kan diskuteras|Behöver också uppmärksamhet|Projektet är stängt: översikt och historik finns kvar.|Förslag utifrån inlästa uppgifter, inte tillåtelse att agera åt andra.|Se mötets resultat',
 uk:'Наступний крок проєкту|Відкрити розділ|Онови дані|Потрібна згода|Потребує уваги|Можна обговорити|Також потребує уваги|Проєкт закрито: доступні перегляд та історія.|Підказки за завантаженими даними, не дозвіл діяти за інших.|Переглянути результат зустрічі',
 fi:'Projektin seuraava vaihe|Avaa osio|Päivitä tiedot|Suostumus tarvitaan|Vaatii huomiota|Voitte keskustella|Vaatii myös huomiota|Projekti on suljettu: katselu ja historia ovat käytettävissä.|Ehdotuksia ladatuista tiedoista, ei lupaa toimia muiden puolesta.|Katso tapaamisen tulos',
 bs:'Sljedeći korak projekta|Otvori odjeljak|Osvježi podatke|Potrebna saglasnost|Potrebna pažnja|Možete razgovarati|Također traži pažnju|Projekat je zatvoren: pregled i historija su dostupni.|Prijedlozi iz učitanih podataka, ne dozvola za djelovanje u tuđe ime.|Pogledaj rezultat susreta',
 es:'Siguiente paso del proyecto|Abrir sección|Actualiza los datos|Se necesita consentimiento|Requiere atención|Se puede debatir|También requiere atención|Proyecto cerrado: consulta e historial disponibles.|Sugerencias según los datos cargados, no permiso para actuar por otros.|Ver resultado del encuentro',
 ar:'الخطوة التالية للمشروع|افتح القسم|حدّث البيانات|الموافقة مطلوبة|يحتاج إلى اهتمام|يمكن مناقشته|يحتاج أيضًا إلى اهتمام|المشروع مغلق: العرض والسجل متاحان.|اقتراحات من البيانات المحملة وليست إذنًا للتصرف نيابة عن الآخرين.|عرض نتيجة اللقاء',
 fa:'گام بعدی پروژه|باز کردن بخش|داده‌ها را تازه کن|رضایت لازم است|نیازمند توجه|قابل گفت‌وگو|همچنین نیازمند توجه|پروژه بسته است: مشاهده و تاریخچه در دسترس است.|پیشنهاد بر پایه داده‌های بارگیری‌شده، نه اجازه اقدام از طرف دیگران.|دیدن نتیجه دیدار',
 so:'Tallaabada xigta ee mashruuca|Fur qaybta|Cusboonaysii xogta|Oggolaansho ayaa loo baahan yahay|Waxay u baahan tahay fiiro|Waa laga wada hadli karaa|Sidoo kale waxay u baahan tahay fiiro|Mashruucu waa xiran yahay: eegista iyo taariikhdu waa diyaar.|Talooyin xogta la soo dejiyey, ma aha fasax lagu matalo dadka kale.|Eeg natiijada kulanka',
 ku:'Gava din a projeyê|Beşê veke|Daneyan nû bike|Razîbûn pêwîst e|Pêdivî bi baldarî heye|Dikare bê nîqaşkirin|Ev jî baldarî dixwaze|Proje girtî ye: dîtin û dîrok berdest in.|Pêşniyar li gorî daneyên barkirî ne, ne destûra kiryarê ji bo kesên din.|Encama hevdîtinê bibîne'
};
function renderNext(steps,active){
 const tx=i=>esc((nextCopy[document.documentElement.lang]||nextCopy.en).split('|')[i]);
 const ordered=steps.slice().sort((a,b)=>a.priority-b.priority),first=ordered[0];
 const action=s=>`<button type="button" class="button secondary" ${s.target==='refresh'?'data-net="refresh"':`data-project-next="${s.target}"`}>${tx(s.target==='refresh'?2:1)} →</button>`;
 return `<aside class="project-next-step"><h4>${tx(0)}</h4>${!active?`<p>${tx(7)}</p>`:first?`<span class="badge">${tx(first.kind)}</span><p><strong>${first.message}</strong></p>${action(first)}${ordered.length>1?`<details><summary>${tx(6)} · ${ordered.length-1}</summary><ul>${ordered.slice(1).map(s=>`<li><span class="meta">${tx(s.kind)}</span><p>${s.message}</p>${action(s)}</li>`).join('')}</ul></details>`:''}`:`<p>${esc((overviewCopy[document.documentElement.lang]||overviewCopy.en).split('|')[11])}</p>`}<p class="meta">${tx(8)}</p></aside>`;
}
function renderOverview({coop,decisions,meeting,tasks=[],members=[],name,loadedAt,now=Date.now(),online=true,taskBases}){
 const tx=i=>esc((overviewCopy[document.documentElement.lang]||overviewCopy.en).split('|')[i]);
 const dt=i=>esc((copy[document.documentElement.lang]||copy.en)[i]);
 const mt=i=>esc(globalThis.FolkoopMeetings.text(i));
 let html=`<section class="card project-overview"><h3>${tx(0)}</h3><h4>${tx(1)}</h4><p style="white-space:pre-wrap">${esc(coop.description)}</p><p class="meta">${tx(13)}</p>`;
 const active=['open','active'].includes(coop.status);
 if(!online||!Number.isFinite(loadedAt)||now-loadedAt<0||now-loadedAt>=60000)return html+renderNext([{message:mt(19),target:'refresh',kind:2,priority:0}],active)+'</section>';
 const steps=[],ds=decisions?.decisions||[],responses=decisions?.responses||[];
 const add=(message,target,kind=4,priority=3)=>steps.push({message,target,kind,priority});
 if(taskBases!==undefined){
  const work=globalThis.FolkoopTaskWork;
  if(!taskBases||taskBases.error||!Number.isFinite(taskBases.loadedAt)||now-taskBases.loadedAt<0||now-taskBases.loadedAt>=60000)add(esc(work.basisText(10)),'refresh',2,0);
  else for(const b of taskBases.rows){
   const task=tasks.find(t=>t.id===b.task_id);
   if(task&&task.work_stage!=='verified'&&!b.ready)add(`${esc(task.title)} — ${esc(work.basisText(8))}`,'tasks',3,1);
  }
 }
 if(!decisions||decisions.error)add(dt(9),'refresh',2,0);
 else if(!ds.some(d=>d.decided_at))add(tx(6),'decisions',5,5);
 const pending=ds.filter(d=>!d.decided_at);
 for(const d of pending.filter(d=>d.rules_version===1)){
  const count=(decisions.objections||[]).filter(o=>o.decision_id===d.id&&!o.withdrawn&&!o.disposition).length;
  if(count)add(`${esc(d.question)} — ${esc(ruleText(13))}: ${count}`,'decisions',4,1);
  if(Date.parse(d.decide_by)<now)add(`${esc(d.question)} — ${esc(ruleText(4))}`,'decisions',4,2);
 }
 for(const d of pending)add(`${esc(d.question)} — ${dt(Date.parse(d.closes_at)<=now?22:6)}`,'decisions');
 for(const task of tasks){
  if(task.work_stage==='submitted')add(`${esc(task.title)} — ${tx(9)}`,'tasks',4,2);
  else if(task.work_stage==='changes')add(`${esc(task.title)} — ${tx(10)}`,'tasks',4,2);
  else if(!task.assignee_id&&task.status!=='done'&&task.work_stage!=='verified')add(`${esc(task.title)} — ${tx(8)}`,'tasks');
 }
 html+=`<h4>${tx(3)}</h4>`;
 if(!meeting||meeting.error){html+=`<p>${mt(24)}</p>`;add(mt(24),'refresh',2,0);}
 else if(!meeting.terms)html+=`<p>${tx(12)}</p>`;
 else if(meeting.stale||meeting.current!==true||!Number.isFinite(meeting.loadedAt)||now-meeting.loadedAt<0||now-meeting.loadedAt>=60000){html+=`<p>${mt(19)}</p>`;add(mt(19),'refresh',2,0);}
 else if(Date.parse(meeting.terms.ends_at)<=now){
  const label=esc((nextCopy[document.documentElement.lang]||nextCopy.en).split('|')[9]);
  html+=`<p>${label}</p>`;steps.push({message:label,target:'meeting',kind:4,priority:2});
 }
 else{
  const s=meeting.terms,rs=(meeting.responses||[]).filter(r=>r.version===s.version),answer=(id,role)=>rs.find(r=>r.user_id===id&&r.role===role);
  html+=`<p>${mt(8)} ${s.version} · ${esc(s.place)}</p><ul>${members.map(m=>`<li>${esc(name(m.user_id))} — ${tx(answer(m.user_id,'attendee')?.confirmed===true?14:answer(m.user_id,'attendee')?.confirmed===false?16:15)}</li>`).join('')}</ul>`;
  for(const [role,label,id] of [['facilitator',2,s.facilitator_id],['opener',3,s.opener_id]]){
   const ready=!!id&&members.some(m=>m.user_id===id)&&answer(id,role)?.confirmed===true&&answer(id,'attendee')?.confirmed===true;
   html+=`<p>${mt(label)}: ${id?esc(name(id)):mt(26)} — ${mt(ready?7:6)}</p>`;
   if(!ready)add(`${mt(label)} — ${mt(id?6:26)}`,'meeting',3,1);
  }
  if(meeting.attendee_count<s.minimum_attendees)add(`${mt(14)}: ${meeting.attendee_count} / ${s.minimum_attendees}`,'meeting',3,1);
  const room=globalThis.FolkoopRooms;
  html+=`<p>${esc(room.text(0))} — ${meeting.room?.confirmed===true?esc(room.text(14)):mt(6)}</p>`;
  if(meeting.room?.confirmed!==true)add(`${esc(room.text(0))} — ${mt(6)}`,'meeting',3,1);
  const budgetDomain=globalThis.FolkoopBudget,b=meeting.budget;
  if(!b?.configured)add(esc(budgetDomain.meetingText(4)),'meetingBudget',3,1);
  else for(const row of b.rows||[]){
   if(!row.ready)add(`${esc(row.title)} — ${esc(budgetDomain.meetingText(row.missing?15:12))}`,'meetingBudget',4,1);
   else if(row.pending>0)add(`${esc(row.title)} — ${esc(budgetDomain.meetingText(10))}`,'meetingBudget',4,3);
  }
 }
 // Place the action above the long overview; keep the existing protocol below.
 html=html.replace('<h4>',renderNext(steps,active)+'<h4>');
 html+=`<h4>${tx(2)}</h4><p class="meta">${dt(1)}</p>`;
 if(!decisions||decisions.error)html+=`<p>${dt(9)}</p>`;
 else if(!ds.length)html+=`<p>${dt(8)}</p>`;
 else for(const d of ds){
  const linked=tasks.filter(t=>t.source_decision_id===d.id);
  if(d.rules_version===1)html+=renderRules(d,{objections:decisions.objections||[],user:{id:null},owner:false,name,drafts:{},project:coop.id,active:false});
  html+=`<details><summary>${esc(d.question)} — ${dt(d.decided_at?18:Date.parse(d.closes_at)<=now?20:6)}</summary><p>${esc(d.purpose)}</p><ol>${d.options.map(option=>`<li>${esc(option)}</li>`).join('')}</ol><h5>${dt(19)}</h5><ul>${responses.filter(r=>r.decision_id===d.id).map(r=>`<li>${esc(name(r.user_id))}: ${esc(d.options[r.option_index])}${r.note?' — '+esc(r.note):''}</li>`).join('')}</ul>`;
  if(d.decided_at)html+=`<p><strong>${esc(d.options[d.selected_option])}</strong></p><p style="white-space:pre-wrap">${esc(d.rationale)}</p><p>${dt(24)}: ${esc(name(d.decided_by))} · ${esc(new Date(d.decided_at).toLocaleString())}</p><h5>${tx(4)}</h5><ul>${linked.map(t=>`<li>${esc(t.title)} — ${esc(t.assignee_id?name(t.assignee_id):(overviewCopy[document.documentElement.lang]||overviewCopy.en).split('|')[8])}</li>`).join('')}</ul>`;
  html+='</details>';
 }
 html+=`<h4>${tx(4)} · ${tasks.length}</h4>`;
 html+=tasks.length?`<ul>${tasks.map(t=>`<li><strong>${esc(t.title)}</strong> — ${esc(t.work_stage&&t.work_stage!=='legacy'?globalThis.FolkoopTaskWork.label(t):t.status)} · ${t.assignee_id?esc(name(t.assignee_id)):tx(8)}</li>`).join('')}</ul>`:`<p>${tx(7)}</p>`;
 return html+'</section>';
}
const progressCopy={ru:['Действия и итог проекта','Задачи с подтверждённым результатом','Старая отметка «выполнено» — без нового подтверждения','Вещи без подтверждённого возврата','Это записи участников. Завершение задач и возврат вещей сами по себе не доказывают внешний результат проекта.','Ваш следующий шаг','Открыть раздел','Проверить задачу и условия, затем принять её','Описать выполненную работу и передать на проверку','Проверить результат другого исполнителя','Проверить условия задачи и необходимые согласия','Подтвердить фактически полученное количество','Проверить срок пользования и заявить фактический возврат','Проверить состояние возвращённых вещей и подтвердить полученное количество','Разобрать спор или предложение исправления с другой стороной','Сообщить, как прошла встреча','Посмотреть сообщения об итоге встречи','Организатор может создать повтор с новыми сроками','Повтор не переносит согласия, резервы и подтверждения передачи. Незавершённые возвраты остаются обязательствами старого проекта.','Данные недоступны или устарели — обновите обзор','Итог встречи не настроен; результат проекта не определён автоматически','Сейчас нет отдельного действия для вас в загруженных данных. Проверьте общий следующий шаг проекта.','Перейти к повтору','Проект закрыт: завершите расчёты по выданным вещам в разделе ресурсов; новые задачи здесь недоступны.'],en:['Project actions and outcome','Tasks with a confirmed result','Legacy done mark — no new confirmation','Items without confirmed return','These are participant records. Completed tasks and returned items do not by themselves prove the project’s external outcome.','Your next step','Open section','Review the task and conditions, then accept it','Describe the work and submit it for review','Review another assignee’s result','Review task conditions and required consents','Confirm the quantity actually received','Check the due time and report the actual return','Check returned item condition and confirm the quantity received','Resolve the dispute or correction proposal with the other party','Report how the meeting went','Review participant outcome reports','The organizer can create a repeat with new times','A repeat does not carry over consents, reservations or handoff confirmations. Outstanding returns remain obligations of the old project.','Data unavailable or stale — refresh the overview','No meeting outcome configured; the project result is not determined automatically','No separate action for you in the loaded data. Review the overall next project step.','Open the repeat','Project closed: settle outstanding item returns in resources; new tasks are unavailable here.']};
Object.assign(progressCopy,globalThis.FolkoopFeatureCopy?.progress||{});
function renderProgress({coop,user,tasks=[],taskBases,roomRequests=[],roomRequestsError,resources=[],meeting,loadedAt,online=true,name=id=>id,now=Date.now()}){
 const locale=Object.hasOwn(progressCopy,document.documentElement.lang)?document.documentElement.lang:'en',tx=i=>esc(progressCopy[locale][i]);
 const fresh=s=>s&&!s.error&&!s.stale&&Number.isFinite(s.loadedAt)&&now>=s.loadedAt&&now-s.loadedAt<60000;
 let out=`<section class="card project-progress" lang="${locale}" dir="${['ar','fa'].includes(locale)?'rtl':'ltr'}"><h3>${tx(0)}</h3><p>${tx(4)}</p>`;
 if(!online||!fresh({loadedAt}))return out+`<p role="status">${tx(19)}</p><button type="button" data-net="refresh" class="button secondary">${tx(6)}</button></section>`;
 const active=['open','active'].includes(coop.status),actions=[];
 const add=(label,target,title='')=>actions.push(`<li>${title?esc(title)+' — ':''}${tx(label)} <button type="button" class="button secondary" data-project-next="${target}">${tx(6)}</button></li>`);
 out+=`<p>${tx(1)}: ${tasks.filter(t=>t.work_stage==='verified').length}</p><p>${tx(2)}: ${tasks.filter(t=>t.status==='done'&&(!t.work_stage||t.work_stage==='legacy')).length}</p>`;
 if(active)for(const t of tasks){
  const mine=t.assignee_id===user.id,review=t.work_stage==='submitted'&&!mine&&t.assignee_id&&(coop.owner_id===user.id||coop.owner_id===t.assignee_id);
  if((mine&&['available','working','changes'].includes(t.work_stage))||review){
   const b=fresh(taskBases)&&Array.isArray(taskBases.rows)?taskBases.rows.find(b=>b.task_id===t.id):null;
   const allowed=fresh(taskBases)&&Array.isArray(taskBases.rows)&&(!b||(b.ready===true&&b.document_revision===b.latest_document_revision));
   add(!allowed?10:review?9:t.work_stage==='available'?7:8,'tasks',t.title);
  }
 }
 if(roomRequestsError)out+=`<p role="status">${tx(3)}: ${tx(19)}</p>`;
 else{
  const rows=roomRequests.filter(r=>r.booking_unit==='piece'),outstanding=rows.reduce((sum,r)=>sum+Math.max(0,(r.issued||0)-(r.return_confirmed||0)),0);
  out+=`<p>${tx(3)}: ${outstanding}</p>`;
  for(const r of rows){
   const owner=r.resource_owner_id===user.id,receiver=r.requester_id===user.id;if(!owner&&!receiver)continue;
   const title=resources.find(x=>x.id===r.resource_id)?.title||r.resource_id||'';
   if(r.owner_disputed||r.requester_disputed||r.correction)add(14,'resources',title);
   else if(receiver&&(r.issued||0)>(r.received||0))add(11,'resources',title);
   else if(receiver&&(r.received||0)>(r.return_claimed||0))add(12,'resources',title);
   else if(owner&&(r.return_claimed||0)>(r.return_confirmed||0))add(13,'resources',title);
  }
 }
 if(!fresh(meeting)||meeting.current!==true||meeting.outcome?.error)out+=`<p role="status">${tx(19)}</p>`;
 else if(!meeting.terms)out+=`<p>${tx(20)}</p>`;
 else if(meeting.outcome){
  const o=meeting.outcome;
  out+=`<p>${esc(globalThis.FolkoopMeetings.outcomeText(({unreported:5,self_reported:6,participant_confirmed:7,unclear:8})[o.state]??8))}</p>`;
  if(o.ended){
   add(o.can_report?15:16,'meeting');
   out+=`<p>${tx(18)}</p>`;
   if(o.next_id)out+=`<button type="button" class="button secondary" data-coop="open" data-id="${esc(o.next_id)}">${tx(22)}</button>`;
   else if(active&&coop.owner_id===user.id)add(17,'meeting');
  }
 }else out+=`<p role="status">${tx(19)}</p>`;
 if(!active)out+=`<p>${tx(23)}</p>`;
 return out+`<h4>${tx(5)} · ${esc(name(user.id))}</h4>${actions.length?'<ul>'+actions.join('')+'</ul>':`<p>${tx(21)}</p>`}</section>`;
}

const documentCopy={
 ru:'Документы проекта|Правила|Смета|Отчёт|Создать документ|Название|Текст|Связанное решение|Связанные задачи — до 20|Сохранить новую версию|Редактировать|История версий|Без связи|Версия|Сохранение и связь не означают одобрение. Смета — текст, суммы автоматически не проверяются. Все версии видны участникам проекта.|Документов пока нет|Связанный объект недоступен|Автор редакции',
 en:'Project documents|Rules|Estimate|Report|Create document|Title|Text|Related decision|Related tasks — up to 20|Save new version|Edit|Version history|No link|Version|Saving and linking do not mean approval. Estimates are text; amounts are not checked automatically. All versions are visible to project members.|No documents yet|Linked object unavailable|Revision author',
 sv:'Projektdokument|Regler|Kostnadsförslag|Rapport|Skapa dokument|Titel|Text|Relaterat beslut|Relaterade uppgifter — högst 20|Spara ny version|Redigera|Versionshistorik|Ingen koppling|Version|Sparande och koppling innebär inte godkännande. Belopp i text kontrolleras inte automatiskt. Alla versioner syns för projektmedlemmar.|Inga dokument ännu|Kopplat objekt saknas|Versionens författare',
 uk:'Документи проєкту|Правила|Кошторис|Звіт|Створити документ|Назва|Текст|Пов’язане рішення|Пов’язані завдання — до 20|Зберегти нову версію|Редагувати|Історія версій|Без зв’язку|Версія|Збереження та зв’язок не означають схвалення. Суми в тексті не перевіряються автоматично. Усі версії бачать учасники проєкту.|Документів ще немає|Пов’язаний об’єкт недоступний|Автор редакції',
 fi:'Projektin asiakirjat|Säännöt|Kustannusarvio|Raportti|Luo asiakirja|Otsikko|Teksti|Liittyvä päätös|Liittyvät tehtävät — enintään 20|Tallenna uusi versio|Muokkaa|Versiohistoria|Ei linkkiä|Versio|Tallennus ja linkitys eivät merkitse hyväksyntää. Tekstin summia ei tarkisteta automaattisesti. Kaikki versiot näkyvät projektin jäsenille.|Ei vielä asiakirjoja|Linkitetty kohde ei ole saatavilla|Version tekijä',
 bs:'Dokumenti projekta|Pravila|Procjena troškova|Izvještaj|Kreiraj dokument|Naslov|Tekst|Povezana odluka|Povezani zadaci — do 20|Sačuvaj novu verziju|Uredi|Historija verzija|Bez veze|Verzija|Čuvanje i povezivanje nisu odobrenje. Iznosi u tekstu se ne provjeravaju automatski. Sve verzije vide članovi projekta.|Još nema dokumenata|Povezani objekat nije dostupan|Autor verzije',
 es:'Documentos del proyecto|Reglas|Presupuesto|Informe|Crear documento|Título|Texto|Decisión relacionada|Tareas relacionadas — hasta 20|Guardar nueva versión|Editar|Historial de versiones|Sin vínculo|Versión|Guardar y vincular no equivale a aprobar. Los importes del texto no se verifican automáticamente. Todas las versiones son visibles para miembros.|Aún no hay documentos|Objeto vinculado no disponible|Autor de la versión',
 ar:'مستندات المشروع|القواعد|تقدير التكلفة|التقرير|إنشاء مستند|العنوان|النص|القرار المرتبط|المهام المرتبطة — حتى 20|حفظ نسخة جديدة|تعديل|سجل النسخ|بلا رابط|نسخة|الحفظ والربط ليسا موافقة. لا تُراجع المبالغ في النص تلقائيًا. جميع النسخ مرئية لأعضاء المشروع.|لا مستندات بعد|العنصر المرتبط غير متاح|مؤلف النسخة',
 fa:'اسناد پروژه|قواعد|برآورد هزینه|گزارش|ایجاد سند|عنوان|متن|تصمیم مرتبط|کارهای مرتبط — تا ۲۰|ذخیره نسخه تازه|ویرایش|تاریخچه نسخه‌ها|بدون ارتباط|نسخه|ذخیره و اتصال به معنی تصویب نیست. مبالغ متن خودکار بررسی نمی‌شوند. همه نسخه‌ها برای اعضای پروژه قابل مشاهده‌اند.|هنوز سندی نیست|مورد مرتبط در دسترس نیست|نویسنده نسخه',
 so:'Dukumentiyada mashruuca|Xeerar|Qiyaasta kharashka|Warbixin|Samee dukumenti|Cinwaan|Qoraal|Go’aan la xiriira|Hawlo la xiriira — ilaa 20|Kaydi nooc cusub|Wax ka beddel|Taariikhda noocyada|Xiriir ma jiro|Nooc|Kaydinta iyo xiriirintu oggolaansho ma aha. Lacagaha qoraalka si toos ah looma hubiyo. Dhammaan noocyada xubnaha ayaa arka.|Weli dukumenti ma jiro|Shayga la xiriiriyey lama heli karo|Qoraaga nooca',
 ku:'Belgeyên projeyê|Rêzik|Texmîna lêçûnê|Rapor|Belge çêke|Sernav|Nivîs|Biryara têkildar|Peywirên têkildar — heta 20|Guhertoya nû tomar bike|Biguherîne|Dîroka guhertoyan|Bê girêdan|Guherto|Tomarkirin û girêdan ne pejirandin in. Mîqdarên nivîsê bixweber nayên kontrolkirin. Hemû guherto ji endaman re xuya ne.|Hê belge tune ne|Tişta girêdayî ne berdest e|Nivîskarê guhertoyê'
};
const consentCopy={
 ru:'Согласование этой версии|Подтверждаю эту версию|Отозвать согласие|Подтверждено|Ждём ответа|Согласие отозвано|Новая версия требует нового личного согласия. Молчание и сохранение документа не считаются согласием. Смета не разрешает списание денег.|Прошлая версия: согласия не действуют для текущей редакции.|Согласия недоступны — обнови данные|Бывший участник',
 en:'Agreement to this version|I agree to this version|Withdraw consent|Confirmed|Awaiting response|Consent withdrawn|A new version needs fresh personal consent. Silence and saving are not consent. An estimate does not authorize charges.|Earlier version: consents do not apply to the current revision.|Consents unavailable — refresh|Former member',
 sv:'Samtycke till denna version|Jag godkänner denna version|Återkalla samtycke|Bekräftat|Väntar på svar|Samtycke återkallat|Ny version kräver nytt personligt samtycke. Tystnad och sparande är inte samtycke. Ett kostnadsförslag tillåter inte debitering.|Äldre version: samtycken gäller inte aktuell version.|Samtycken saknas — uppdatera|Tidigare medlem',
 uk:'Погодження цієї версії|Підтверджую цю версію|Відкликати згоду|Підтверджено|Чекаємо відповіді|Згоду відкликано|Нова версія потребує нової особистої згоди. Мовчання та збереження не є згодою. Кошторис не дозволяє списання грошей.|Попередня версія: згоди не діють для поточної.|Згоди недоступні — онови дані|Колишній учасник',
 fi:'Tämän version hyväksyntä|Hyväksyn tämän version|Peru suostumus|Vahvistettu|Odottaa vastausta|Suostumus peruttu|Uusi versio vaatii uuden henkilökohtaisen suostumuksen. Hiljaisuus tai tallennus ei ole suostumus. Arvio ei valtuuta veloituksia.|Aiempi versio: suostumukset eivät koske nykyistä.|Suostumukset puuttuvat — päivitä|Entinen jäsen',
 bs:'Saglasnost za ovu verziju|Prihvatam ovu verziju|Povuci saglasnost|Potvrđeno|Čeka se odgovor|Saglasnost povučena|Nova verzija traži novu ličnu saglasnost. Šutnja i čuvanje nisu saglasnost. Procjena ne odobrava naplatu.|Ranija verzija: saglasnosti ne vrijede za trenutnu.|Saglasnosti nisu dostupne — osvježi|Bivši član',
 es:'Consentimiento a esta versión|Acepto esta versión|Retirar consentimiento|Confirmado|Esperando respuesta|Consentimiento retirado|Una versión nueva exige consentimiento personal nuevo. Silencio y guardado no son consentimiento. El presupuesto no autoriza cargos.|Versión anterior: los consentimientos no cubren la actual.|Consentimientos no disponibles: actualiza|Antiguo miembro',
 ar:'الموافقة على هذه النسخة|أوافق على هذه النسخة|سحب الموافقة|مؤكد|بانتظار الرد|سُحبت الموافقة|النسخة الجديدة تحتاج موافقة شخصية جديدة. الصمت والحفظ ليسا موافقة. التقدير لا يجيز خصم الأموال.|نسخة سابقة: الموافقات لا تشمل الحالية.|الموافقات غير متاحة — حدّث البيانات|عضو سابق',
 fa:'رضایت به این نسخه|این نسخه را می‌پذیرم|پس‌گرفتن رضایت|تأیید شد|در انتظار پاسخ|رضایت پس گرفته شد|نسخه تازه رضایت شخصی تازه می‌خواهد. سکوت و ذخیره رضایت نیست. برآورد مجوز برداشت پول نیست.|نسخه پیشین: رضایت‌ها شامل نسخه فعلی نیست.|رضایت‌ها در دسترس نیست — تازه‌سازی کنید|عضو سابق',
 so:'Oggolaanshaha noocan|Waan oggolahay noocan|Ka noqo oggolaanshaha|La xaqiijiyey|Jawaab baa la sugayaa|Oggolaanshaha laga noqday|Nooc cusub wuxuu u baahan yahay oggolaansho cusub. Aamusnaan iyo kaydin ma aha oggolaansho. Qiyaastu ma oggola lacag jarid.|Nooc hore: oggolaanshuhu ma khuseeyo kan hadda.|Oggolaanshaha lama heli karo — cusboonaysii|Xubin hore',
 ku:'Razîbûna vê guhertoyê|Ez vê guhertoyê dipejirînim|Razîbûnê paşve bikişîne|Pejirandî|Li benda bersivê|Razîbûn paşve kişandî|Guhertoya nû razîbûna kesane ya nû dixwaze. Bêdengî û tomarkirin ne razîbûn in. Texmîn destûra kişandina pereyan nade.|Guhertoya berê: razîbûn ji bo ya heyî derbasdar nîne.|Razîbûn ne berdest in — nû bike|Endamê berê'
};
const documentSummaryCopy={
 ru:['Согласование документов — сводка организатора','Только текущие редакции и нынешние участники проекта. Это не кворум и не автоматическое утверждение документа.','Нет правил или смет для согласования'],
 en:['Document agreement — organizer overview','Current revisions and current project members only. This is not a quorum or automatic document approval.','No rules or estimates to agree'],
 sv:['Dokumentsamtycken — arrangörens översikt','Endast aktuella versioner och nuvarande projektmedlemmar. Detta är inte beslutsförhet eller automatiskt godkännande.','Inga regler eller kostnadsförslag att godkänna'],
 uk:['Погодження документів — огляд організатора','Лише поточні редакції та нинішні учасники. Це не кворум і не автоматичне схвалення документа.','Немає правил чи кошторисів для погодження'],
 fi:['Asiakirjojen hyväksyntä — järjestäjän näkymä','Vain nykyiset versiot ja projektin nykyiset jäsenet. Tämä ei ole päätösvaltaisuus tai automaattinen hyväksyntä.','Ei hyväksyttäviä sääntöjä tai kustannusarvioita'],
 bs:['Saglasnosti za dokumente — pregled organizatora','Samo trenutne verzije i sadašnji članovi. Ovo nije kvorum ni automatsko odobrenje dokumenta.','Nema pravila ili procjena za saglasnost'],
 es:['Consentimientos — resumen del organizador','Solo versiones actuales y miembros actuales. No representa un cuórum ni aprobación automática.','No hay reglas ni presupuestos para aceptar'],
 ar:['موافقات المستندات — ملخص المنظم','النسخ الحالية والأعضاء الحاليون فقط. هذا ليس نصابًا أو اعتمادًا تلقائيًا.','لا قواعد أو تقديرات للموافقة'],
 fa:['رضایت اسناد — خلاصه برگزارکننده','فقط نسخه‌ها و اعضای فعلی. این حد نصاب یا تصویب خودکار نیست.','قواعد یا برآوردی برای تأیید نیست'],
 so:['Oggolaanshaha dukumentiyada — dulmarka qabanqaabiyaha','Noocyada iyo xubnaha hadda oo keliya. Tani ma aha kooram ama ansixin toos ah.','Xeerar ama qiyaaso la oggolaado ma jiraan'],
 ku:['Razîbûna belgeyan — kurteya organîzator','Tenê guherto û endamên heyî. Ev ne quorum an pejirandina bixweber e.','Rêzik an texmîn ji bo pejirandinê tune ne']
};
function renderDocumentSummary({snapshot,owner,members=[],name,now=Date.now(),online=globalThis.navigator?.onLine!==false}){
 if(!owner)return '';
 const tx=i=>esc((documentSummaryCopy[document.documentElement.lang]||documentSummaryCopy.en)[i]);
 const cx=i=>esc((consentCopy[document.documentElement.lang]||consentCopy.en).split('|')[i]);
 const dx=i=>esc((documentCopy[document.documentElement.lang]||documentCopy.en).split('|')[i]);
 let html=`<section class="card document-organizer-summary"><h4>${tx(0)}</h4><p class="meta">${tx(1)}</p>`;
 if(!snapshot||snapshot.error||snapshot.consentsError||!Array.isArray(snapshot.consents)||!Number.isFinite(snapshot.consentsLoadedAt)||now-snapshot.consentsLoadedAt>=60000||!online)return html+`<p role="status">${cx(8)}</p></section>`;
 const ids=[...new Set(members.map(m=>m.user_id))],docs=snapshot.rows.filter(d=>['rules','estimate'].includes(d.kind));
 if(!docs.length)return html+`<p>${tx(2)}</p></section>`;
 for(const d of docs){
  const rows=snapshot.consents.filter(r=>r.document_id===d.document_id&&r.revision===d.revision);
  const answers=new Map(rows.map(r=>[r.user_id,r]));
  const confirmed=ids.filter(id=>answers.get(id)?.confirmed===true),waiting=ids.filter(id=>!answers.has(id)),withdrawn=ids.filter(id=>answers.get(id)?.confirmed===false);
  const list=(label,group)=>`<details><summary>${cx(label)} · ${group.length}</summary><ul>${group.map(id=>{const answer=answers.get(id);return `<li>${esc(name(id))}${answer?' · '+esc(new Date(answer.responded_at).toLocaleString()):''}</li>`;}).join('')}</ul></details>`;
  html+=`<article><h5><button type="button" class="button secondary" data-coop="openNotify" data-target-kind="project" data-id="${esc(d.cooperation_id)}" data-document="${esc(d.document_id)}">${esc(d.title)}</button> · ${dx(13)} ${d.revision}</h5><div class="readiness-columns">${list(3,confirmed)}${list(4,waiting)}${list(5,withdrawn)}</div>`;
  const former=rows.filter(r=>!ids.includes(r.user_id));
  if(former.length)html+=`<details><summary>${cx(9)} · ${former.length}</summary><ul>${former.map(r=>`<li>${esc(name(r.user_id))} — ${cx(r.confirmed?3:5)}</li>`).join('')}</ul></details>`;
  html+='</article>';
 }
 return html+'</section>';
}
function renderDocuments({project,snapshot,decisions,tasks,user,owner,active,drafts,histories,name,members=[]}){
 const tx=i=>esc((documentCopy[document.documentElement.lang]||documentCopy.en).split('|')[i]);
 const dt=i=>esc((copy[document.documentElement.lang]||copy.en)[i]);
 const kinds=['rules','estimate','report'],ds=decisions?.decisions||[];
 let html=`<section class="card project-documents"><h3>${tx(0)}</h3><p class="meta">${tx(14)}</p>`;
 if(!snapshot||snapshot.error)return html+`<p role="status">${dt(9)}</p></section>`;
 html+=renderDocumentSummary({snapshot,owner,members,name});
 const consent=(d,current)=>{
  if(!['rules','estimate'].includes(d.kind))return '';
  const cx=i=>esc((consentCopy[document.documentElement.lang]||consentCopy.en).split('|')[i]);
  let out=`<section class="document-consents"><h5>${cx(0)} · ${tx(13)} ${d.revision}</h5><p class="meta">${cx(current?6:7)}</p>`;
  if(snapshot.consentsError||!snapshot.consents||!Number.isFinite(snapshot.consentsLoadedAt)||Date.now()-snapshot.consentsLoadedAt>=60000||globalThis.navigator?.onLine===false)return out+`<p role="status">${cx(8)}</p></section>`;
  const rows=snapshot.consents.filter(r=>r.document_id===d.document_id&&r.revision===d.revision),ids=[...new Set(members.map(m=>m.user_id))];
  const mine=rows.find(r=>r.user_id===user.id);
  out+=`<ul>${ids.map(id=>{const r=rows.find(x=>x.user_id===id);return `<li>${esc(name(id))} — ${cx(r?.confirmed===true?3:r?.confirmed===false?5:4)}${r?' · '+esc(new Date(r.responded_at).toLocaleString()):''}</li>`;}).join('')}${rows.filter(r=>!ids.includes(r.user_id)).map(r=>`<li>${esc(name(r.user_id))} (${cx(9)}) — ${cx(r.confirmed?3:5)}</li>`).join('')}</ul>`;
  if((current&&active)||mine?.confirmed)out+=`<form class="netDocumentConsent"><input name="document" type="hidden" value="${esc(d.document_id)}"><input name="revision" type="hidden" value="${d.revision}"><button class="button${mine?.confirmed?' secondary':''}" value="${mine?.confirmed?'no':'yes'}">${cx(mine?.confirmed?2:1)} · ${tx(13)} ${d.revision}</button></form>`;
  return out+'</section>';
 };
 const body=d=>`<h4>${esc(d.title)}</h4><p class="meta">${tx(kinds.indexOf(d.kind)+1)} · ${tx(13)} ${d.revision} · ${tx(17)}: ${esc(name(d.editor_id))} · ${esc(new Date(d.created_at).toLocaleString())}</p><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(d.body)}</p>${d.decision_id?`<p>${tx(7)}: ${esc(ds.find(x=>x.id===d.decision_id)?.question||(documentCopy[document.documentElement.lang]||documentCopy.en).split('|')[16])}</p>`:''}${d.task_ids?.length?`<p>${tx(8)}</p><ul>${d.task_ids.map(id=>`<li>${esc(tasks.find(t=>t.id===id)?.title||(documentCopy[document.documentElement.lang]||documentCopy.en).split('|')[16])}</li>`).join('')}</ul>`:''}`;
 const editor=doc=>{
  const key=project+':'+(doc?.document_id||'new');
  const d=drafts[key]||{revision:doc?.revision||0,kind:doc?.kind||'rules',title:doc?.title||'',body:doc?.body||'',decision:doc?.decision_id||'',tasks:doc?.task_ids||[]};
  const selected=d.tasks||[],missing=selected.filter(id=>!tasks.some(t=>t.id===id));
  return `<details${drafts[key]?' open':''}><summary>${tx(doc?10:4)}</summary><form class="editor netProjectDocument" data-document="${esc(doc?.document_id||'')}"><input name="revision" type="hidden" value="${esc(d.revision)}"><label>${tx(0)}<select name="kind">${kinds.map((k,i)=>`<option value="${k}"${d.kind===k?' selected':''}>${tx(i+1)}</option>`).join('')}</select></label><label>${tx(5)}<input name="title" maxlength="160" minlength="2" required value="${esc(d.title)}"></label><label>${tx(6)}<textarea name="body" rows="10" maxlength="12000" minlength="2" required>${esc(d.body)}</textarea></label><label>${tx(7)}<select name="decision"><option value="">${tx(12)}</option>${ds.map(x=>`<option value="${esc(x.id)}"${d.decision===x.id?' selected':''}>${esc(x.question)}</option>`).join('')}${d.decision&&!ds.some(x=>x.id===d.decision)?`<option selected value="${esc(d.decision)}">${tx(16)}</option>`:''}</select></label><fieldset><legend>${tx(8)}</legend>${[...tasks,...missing.map(id=>({id,title:(documentCopy[document.documentElement.lang]||documentCopy.en).split('|')[16]}))].map(t=>`<label><input type="checkbox" name="tasks" value="${esc(t.id)}"${selected.includes(t.id)?' checked':''}>${esc(t.title)}</label>`).join('')}</fieldset>${decisions?.error?`<p role="status">${dt(9)}</p>`:''}<button class="button"${!decisions||decisions.error?' disabled':''}>${tx(9)}</button></form></details>`;
 };
 if(!snapshot.rows.length)html+=`<p>${tx(15)}</p>`;
 for(const d of snapshot.rows){
  html+=`<article class="card" id="project-document-${esc(d.document_id)}">${body(d)}${consent(d,true)}`;
  if(active&&d.revision<50&&(owner||d.author_id===user.id))html+=editor(d);
  html+=`<details><summary>${tx(11)}</summary><form class="netDocumentHistory"><input name="document" type="hidden" value="${esc(d.document_id)}"><button class="button secondary">${dt(10)}</button></form>${(histories[d.document_id]||[]).filter(v=>v.revision!==d.revision).map(v=>`<details><summary>${tx(13)} ${v.revision} · ${esc(v.title)}</summary>${body(v)}${consent(v,false)}</details>`).join('')}</details></article>`;
 }
 if(active&&snapshot.rows.length<50)html+=editor(null);
 return html+'</section>';
}
const documentNoticeCopy={
 ru:'Новые редакции документов|Что изменилось|Было|Стало|Открой документ, прочитай новую редакцию и подтверди её, если согласен. Старое согласие не переносится.|Открыть текущую версию|Сравнение с непосредственно предыдущей редакцией. Промежуточные версии доступны в истории документа.|Показано',
 en:'New document revisions|What changed|Before|After|Open the document, read the new revision and confirm if you agree. Earlier consent is not carried over.|Open current version|Compared with the immediately previous revision. Intermediate versions are in document history.|Shown',
 sv:'Nya dokumentversioner|Vad ändrades|Före|Efter|Öppna dokumentet, läs den nya versionen och bekräfta om du samtycker. Tidigare samtycke förs inte över.|Öppna aktuell version|Jämförelse med närmast föregående version. Mellanliggande versioner finns i historiken.|Visade',
 uk:'Нові редакції документів|Що змінилося|Було|Стало|Відкрий документ, прочитай нову редакцію та підтвердь, якщо згоден. Попередня згода не переноситься.|Відкрити поточну версію|Порівняння з безпосередньо попередньою редакцією. Проміжні версії є в історії.|Показано',
 fi:'Asiakirjojen uudet versiot|Mikä muuttui|Ennen|Jälkeen|Avaa asiakirja, lue uusi versio ja vahvista jos hyväksyt sen. Aiempi suostumus ei siirry.|Avaa nykyinen versio|Vertailu edelliseen versioon. Väliversiot löytyvät historiasta.|Näytetty',
 bs:'Nove verzije dokumenata|Šta se promijenilo|Prije|Poslije|Otvori dokument, pročitaj novu verziju i potvrdi ako se slažeš. Ranija saglasnost se ne prenosi.|Otvori trenutnu verziju|Poređenje s neposredno prethodnom verzijom. Međuv verzije su u historiji.|Prikazano',
 es:'Nuevas versiones de documentos|Qué cambió|Antes|Después|Abre el documento, lee la nueva versión y confirma si estás de acuerdo. El consentimiento anterior no se transfiere.|Abrir versión actual|Comparación con la versión inmediatamente anterior. Las versiones intermedias están en el historial.|Mostrados',
 ar:'نسخ جديدة للمستندات|ما الذي تغير|قبل|بعد|افتح المستند واقرأ النسخة الجديدة وأكد إن وافقت. لا تُنقل الموافقة السابقة.|فتح النسخة الحالية|مقارنة بالنسخة السابقة مباشرة. النسخ الوسيطة في السجل.|المعروض',
 fa:'نسخه‌های تازه اسناد|چه چیزی تغییر کرد|پیشین|تازه|سند را باز کنید، نسخه تازه را بخوانید و اگر موافقید تأیید کنید. رضایت قبلی منتقل نمی‌شود.|بازکردن نسخه فعلی|مقایسه با نسخه بلافاصله قبلی. نسخه‌های میانی در تاریخچه هستند.|نمایش داده‌شده',
 so:'Noocyo cusub oo dukumentiyada ah|Maxaa isbeddeley|Hore|Hadda|Fur dukumentiga, akhri nooca cusub oo xaqiiji haddii aad oggol tahay. Oggolaanshihii hore ma wareegayo.|Fur nooca hadda|Isbarbardhigga noocii ka horreeyey. Noocyada dhexe waxay ku jiraan taariikhda.|La muujiyey',
 ku:'Guhertoyên nû yên belgeyan|Çi guherî|Berê|Niha|Belgeyê veke, guhertoya nû bixwîne û heke razî yî bipejirîne. Razîbûna berê nayê veguhestin.|Guhertoya heyî veke|Berawird bi guhertoya yek berê. Guhertoyên navîn di dîrokê de ne.|Nîşandayî'
};
function renderDocumentNotifications({rows,error}){
 if(!error&&!rows?.length)return '';
 const tx=i=>esc((documentNoticeCopy[document.documentElement.lang]||documentNoticeCopy.en).split('|')[i]);
 const dx=i=>esc((documentCopy[document.documentElement.lang]||documentCopy.en).split('|')[i]);
 const cx=i=>esc((consentCopy[document.documentElement.lang]||consentCopy.en).split('|')[i]);
 let html=`<section class="card document-notifications"><h3>${tx(0)}</h3>`;
 if(error)return html+`<p role="status">${cx(8)}</p></section>`;
 html+=`<p class="meta">${tx(7)}: ${rows.length} / ${Number(rows[0]?.total_count||0)}</p>`;
 const fields={title:5,body:6,kind:0,decision_id:7,task_ids:8};
 const value=(key,v)=>key==='kind'?dx(({rules:1,estimate:2,report:3})[v]):Array.isArray(v)?esc(v.join(', ')||'—'):esc(v??'—');
 for(const n of rows){
  html+=`<article class="card"><h4>${esc(n.title)}</h4><p>${esc(n.project_title)} · ${dx(13)} ${n.revision}</p><p>${n.response_state==='withdrawn'?cx(5):tx(4)}</p><details><summary>${tx(1)}</summary><p class="meta">${tx(6)}</p>${(n.changed_fields||[]).map(k=>`<section><h5>${dx(fields[k])}</h5><p class="meta">${tx(2)} · ${dx(13)} ${n.before_version.revision}</p><p style="white-space:pre-wrap;overflow-wrap:anywhere">${value(k,n.before_version[k])}</p><p class="meta">${tx(3)} · ${dx(13)} ${n.after_version.revision}</p><p style="white-space:pre-wrap;overflow-wrap:anywhere">${value(k,n.after_version[k])}</p></section>`).join('')}</details><button class="button" data-coop="openNotify" data-target-kind="project" data-id="${esc(n.cooperation_id)}" data-document="${esc(n.document_id)}">${tx(5)}</button></article>`;
 }
 return html+'</section>';
}
globalThis.FolkoopDecisions=Object.freeze({render,renderPath,lines,ruleText,renderOverview,renderProgress,renderDocuments,renderDocumentNotifications,renderDocumentSummary});
})();
