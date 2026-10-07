/* Mura's personal story: authored, read-only, linked to the SAME existing account objects.
   This module never creates people, claims verified outcomes, or calls the network. */
(() => {
'use strict';
const keys=['need','offer','project','chat','people','purchase','outcome','city','draft'];
// Intro, headline, visit link; then nine [label, first-person memory] pairs.
// A personal note describes Mura's authored story, never an externally verified event.
const voices={
 ru:[
 'МОИ ЗАПИСКИ','Дела, люди и маленькие повороты','Заглянуть',
 ['Дома','Хочу закончить уголок дома, но плиткорез нужен всего на выходные. Пока ищу, у кого можно одолжить — покупать свой ради одной работы не хочется.'],
 ['Что умею','А ещё я снимаю фотографии. Иногда приятнее предложить то, что уже умею, чем ждать, пока кто-нибудь попросит.'],
 ['Соседи','Обмен растениями начинался с одной мысли. Потом появились Анна, Сара, задачи и наш разговор — теперь нужно договориться о следующей встрече.'],
 ['Переписка','Сначала мы просто переписывались. А потом в этих сообщениях появились люди, время и конкретные дела. Я возвращаюсь туда, когда нужно что-то уточнить.'],
 ['Знакомства','Анна любит мастерить, Йохан разбирается в инструментах, а с Омаром мы говорили о доставке. Каждого из них я знаю по своему делу, не по числу подписчиков.'],
 ['Вместе дешевле','С дровами оказалось проще договориться о совместной покупке. Пока согласуем количество и как забирать — деньги и доставку одним сообщением не решишь.'],
 ['То, что вышло','Недавно я одолжила складную лестницу и вечером отметила, что вернула её. Маленькое дело, зато осталось понятно, с чего всё началось и чем закончилось.'],
 ['Мой город','Живу в Göteborg. Иногда сначала надо понять, куда обратиться в городе, иногда — поговорить с соседями. Не все вопросы начинаются с проекта.'],
 ['Пока для себя','Не всё сразу публикую. Где-то записала идею, где-то оставила просьбу на потом. Люблю, когда незаконченные мысли не теряются среди чужих сообщений.']
 ],
 en:[
 'MY NOTES','People, plans and little turns in the road','Take a look',
 ['At home','I still want to finish a corner of my room, but I only need a tile cutter for a weekend. I am looking for one to borrow, rather than buying it for a single job.'],
 ['What I can do','I take photographs, too. Sometimes it feels better to offer a skill I already have instead of waiting to be asked.'],
 ['Neighbours','The plant exchange began as a passing thought. Then Anna, Sara, tasks and a conversation came along. Now we need to agree on our next meeting.'],
 ['Conversations','At first we were just chatting. Then the conversations turned into names, times and things to do. I go back when we need to agree on details.'],
 ['People I know','Anna likes making things, Johan knows tools, and I have spoken with Omar about pickup. I know them through things we share, not follower counts.'],
 ['Together','We thought a joint firewood purchase might work better. We are still sorting out quantities and pickup; a message does not settle payment or delivery.'],
 ['Something finished','I borrowed a folding ladder and marked it returned that evening. A small thing, but I can still see why I needed it and how it ended.'],
 ['My city','I live in Göteborg. Sometimes I need to find the right city service; sometimes I just want to talk with neighbours. Not every question starts as a project.'],
 ['Still thinking','I do not publish every thought. Some are ideas for later and some are notes to myself. I like having a place where unfinished things do not disappear in chat.']
 ],
 sv:[
 'MINA ANTECKNINGAR','Människor, planer och små vändningar','Titta närmare',
 ['Hemma','Jag vill göra klart ett hörn hemma, men behöver bara en kakelskärare över helgen. Jag försöker låna en i stället för att köpa för ett enda jobb.'],
 ['Det jag kan','Jag fotograferar också. Ibland känns det bättre att erbjuda det jag redan kan än att vänta på att någon frågar.'],
 ['Grannar','Växtbytet började som en tanke. Sedan kom Anna, Sara, uppgifter och vårt samtal. Nu behöver vi bestämma nästa träff.'],
 ['Samtal','Först pratade vi bara. Sedan blev samtalen till namn, tider och saker att göra. Jag återvänder när vi behöver reda ut detaljer.'],
 ['Människor','Anna tycker om att bygga, Johan kan verktyg och jag har pratat med Omar om hämtningen. Jag känner dem genom det vi gör, inte genom följare.'],
 ['Tillsammans','Vi funderade på att köpa ved tillsammans. Vi planerar ännu mängder och hämtning; ett meddelande betyder inte att något är betalt eller levererat.'],
 ['Det som blev klart','Jag lånade en hopfällbar stege och markerade den som återlämnad samma kväll. Litet, men nu ser jag både början och slutet.'],
 ['Min stad','Jag bor i Göteborg. Ibland behöver jag hitta rätt stadstjänst, ibland bara prata med grannar. Allt måste inte bli ett projekt.'],
 ['Än så länge privat','Jag publicerar inte varje tanke. Några sparar jag till senare. Jag vill inte att ofärdiga idéer ska försvinna i en chatt.']
 ],
 es:[
 'MIS NOTAS','Personas, planes y pequeños giros','Ver más',
 ['En casa','Quiero terminar un arreglo en casa, pero solo necesito una cortadora de azulejos un fin de semana. Prefiero intentar pedirla prestada.'],
 ['Lo que sé hacer','También hago fotos. A veces es más sencillo ofrecer una habilidad que ya tengo que esperar a que alguien pregunte.'],
 ['Vecinos','El intercambio de plantas empezó como una idea pequeña. Después llegaron Anna, Sara, las tareas y nuestra conversación. Falta acordar el próximo encuentro.'],
 ['Conversaciones','Primero charlábamos. Luego surgieron personas, horarios y cosas concretas por hacer. Vuelvo al chat para aclarar detalles.'],
 ['Mi gente','Anna construye cosas, Johan conoce las herramientas y con Omar hablé de la recogida. Nos unen cosas que hacemos, no seguidores.'],
 ['Juntos','Pensamos comprar leña juntos. Todavía acordamos cantidades y recogida; hablar no significa haber pagado ni recibido nada.'],
 ['Algo terminado','Pedí prestada una escalera plegable y marqué su devolución esa misma tarde. Fue poco, pero quedó claro cómo terminó.'],
 ['Mi ciudad','Vivo en Göteborg. A veces necesito un servicio municipal y otras solo hablar con los vecinos. No todo tiene que ser un proyecto.'],
 ['Para mí','No publico todas mis ideas. Guardo algunas notas para después, para que no desaparezcan entre conversaciones.']
 ],
 uk:[
 'МОЇ НОТАТКИ','Люди, плани й невеликі повороти','Подивитися',
 ['Удома','Хочу доробити ремонт удома, але плиткоріз потрібен лише на вихідні. Шукаю, у кого позичити, замість купувати для однієї роботи.'],
 ['Що вмію','Я ще й фотографую. Іноді краще запропонувати те, що вже вмієш, ніж чекати на прохання.'],
 ['Сусіди','Обмін рослинами почався з думки. Потім долучилися Анна, Сара, завдання й розмова. Тепер треба домовитися про зустріч.'],
 ['Розмови','Спочатку ми просто переписувалися. Потім з’явилися люди, час і справи. Повертаюся до чату, коли треба уточнити деталі.'],
 ['Знайомі','Анна майструє, Йохан знається на інструментах, з Омаром говорили про перевезення. Нас поєднують спільні справи.'],
 ['Разом','З дровами вирішили подумати про спільну покупку. Кількість і отримання ще узгоджуємо — повідомлення не означає оплату чи доставку.'],
 ['Зроблено','Позичила складану драбину й увечері позначила, що повернула. Невелика справа, але видно початок і кінець.'],
 ['Моє місто','Живу в Göteborg. Іноді шукаю міську службу, іноді просто спілкуюся із сусідами. Не все мусить бути проєктом.'],
 ['Для себе','Не всі думки публікую. Деякі залишаю на потім, щоб вони не загубилися серед повідомлень.']
 ],
 fi:[
 'MUISTIINPANONI','Ihmisiä, suunnitelmia ja pieniä käänteitä','Katso',
 ['Kotona','Haluan viimeistellä pienen remontin, mutta tarvitsen laattaleikkuria vain viikonlopuksi. Etsin lainattavaa sen sijaan, että ostaisin uuden.'],
 ['Mitä osaan','Osaan myös kuvata. Joskus on helpompaa tarjota omaa taitoa kuin odottaa, että joku pyytää apua.'],
 ['Naapurit','Kasvien vaihto alkoi pienestä ajatuksesta. Sitten mukaan tulivat Anna, Sara, tehtävät ja keskustelu. Seuraava tapaaminen pitää vielä sopia.'],
 ['Keskustelut','Ensin vain juttelimme. Vähitellen syntyi nimiä, aikoja ja tekemistä. Palaan keskusteluun sopiakseni yksityiskohdista.'],
 ['Ihmiset','Anna rakentaa, Johan tuntee työkalut ja Omarin kanssa puhuin noudosta. Meitä yhdistävät yhteiset asiat, eivät seuraajamäärät.'],
 ['Yhdessä','Mietimme polttopuiden yhteisostoa. Määristä ja noudosta sovitaan vielä; viesti ei tarkoita maksua tai toimitusta.'],
 ['Valmis','Lainasin taittotikkaat ja merkitsin ne palautetuiksi samana iltana. Pieni asia, mutta alku ja loppu näkyvät.'],
 ['Kaupunkini','Asun Göteborgissa. Joskus etsin kaupungin palvelua, joskus haluan vain jutella naapureille. Kaikki ei tarvitse projektia.'],
 ['Itselleni','En julkaise jokaista ajatusta. Säilytän luonnoksia myöhemmäksi, etteivät ne huku keskusteluihin.']
 ],
 bs:[
 'MOJE BILJEŠKE','Ljudi, planovi i mali zaokreti','Pogledaj',
 ['Kod kuće','Želim završiti mali popravak, ali rezač pločica mi treba samo za vikend. Radije bih ga posudila nego kupila zbog jednog posla.'],
 ['Šta mogu','Volim fotografisati. Nekad je lakše ponuditi vještinu koju već imam nego čekati da me neko pita.'],
 ['Komšije','Razmjena biljaka počela je kao ideja. Zatim su došli Anna, Sara, zadaci i razgovor. Još dogovaramo sljedeći susret.'],
 ['Razgovori','Prvo smo samo pričali. Onda su se pojavili ljudi, termini i konkretni zadaci. Tu se vraćam radi dogovora.'],
 ['Moji ljudi','Anna voli praviti stvari, Johan poznaje alat, a s Omarom sam pričala o preuzimanju. Povezuju nas stvari koje radimo.'],
 ['Zajedno','Razmišljali smo o zajedničkoj kupovini drva. Količine i preuzimanje još dogovaramo; poruka nije isto što i plaćanje ili dostava.'],
 ['Završeno','Posudila sam sklopive ljestve i uveče označila da sam ih vratila. Mali posao, ali kraj je jasan.'],
 ['Moj grad','Živim u Göteborgu. Nekad mi treba gradska služba, nekad samo razgovor s komšijama. Ne mora sve postati projekt.'],
 ['Za sebe','Ne objavljujem svaku misao. Neke ideje čuvam za kasnije da se ne izgube među porukama.']
 ],
 ar:[
 'ملاحظاتي','أشخاص وخطط وتفاصيل صغيرة','ألقِ نظرة',
 ['في البيت','أريد إنهاء إصلاح صغير في المنزل، لكنني أحتاج قاطع البلاط لعطلة أسبوع فقط. أحاول استعارته بدل شرائه لعمل واحد.'],
 ['ما أستطيع فعله','أحب التصوير أيضاً. أحياناً أفضل أن أعرض مهارة لدي بدلاً من انتظار أن يطلب أحد المساعدة.'],
 ['الجيران','بدأ تبادل النباتات كفكرة بسيطة. ثم انضمت آنا وسارة وظهرت المهام والمحادثة. بقي أن نتفق على اللقاء التالي.'],
 ['المحادثات','بدأنا بالكلام فقط، ثم صارت لدينا أسماء ومواعيد وأشياء نفعلها. أعود إلى المحادثة لتأكيد التفاصيل.'],
 ['معارفي','آنا تحب صنع الأشياء ويوهان يعرف الأدوات، وتحدثت مع عمر عن الاستلام. ما يربطنا هو ما نفعله معاً.'],
 ['معاً','فكرنا في شراء الحطب معاً. ما زلنا نرتب الكميات والاستلام؛ الرسالة ليست دفعاً أو تسليماً.'],
 ['شيء انتهى','استعرت سلماً قابلاً للطي وسجلت أنني أعدته في المساء. أمر صغير لكنني أعرف كيف بدأ وكيف انتهى.'],
 ['مدينتي','أعيش في يوتيبوري. أحياناً أحتاج إلى خدمة من المدينة وأحياناً إلى حديث مع الجيران. ليس كل شيء مشروعاً.'],
 ['لنَفسي','لا أنشر كل فكرة. أحتفظ ببعض المسودات للمرة القادمة حتى لا تضيع بين الرسائل.']
 ],
 fa:[
 'یادداشت‌های من','آدم‌ها، برنامه‌ها و اتفاق‌های کوچک','نگاهی بینداز',
 ['در خانه','می‌خواهم تعمیر کوچکی را تمام کنم، اما کاشی‌بُر را فقط برای آخر هفته می‌خواهم. ترجیح می‌دهم قرض بگیرم تا برای یک بار بخرم.'],
 ['کارهایی که بلدم','عکاسی هم می‌کنم. گاهی بهتر است مهارتی را که دارم پیشنهاد بدهم تا منتظر درخواست کسی بمانم.'],
 ['همسایه‌ها','تبادل گیاه از یک فکر کوچک شروع شد. بعد آنا و سارا و کارها و گفت‌وگوها اضافه شدند. هنوز باید برای دیدار بعدی هماهنگ کنیم.'],
 ['گفت‌وگوها','اول فقط حرف می‌زدیم؛ بعد نام‌ها، زمان‌ها و کارهای مشخص پیدا شدند. برای هماهنگی دوباره به پیام‌ها سر می‌زنم.'],
 ['آدم‌های من','آنا ساختن را دوست دارد، یوهان ابزار می‌شناسد و با عمر درباره تحویل صحبت کردم. کارهای مشترک ما را به هم پیوند می‌دهد.'],
 ['با هم','فکر خرید مشترک هیزم پیش آمد. هنوز مقدار و تحویل را هماهنگ می‌کنیم؛ پیام به معنی پرداخت یا تحویل نیست.'],
 ['کاری که تمام شد','نردبان تاشو قرض گرفتم و عصر ثبت کردم که پس داده‌ام. کار کوچکی بود، ولی آغاز و پایانش روشن است.'],
 ['شهر من','در یوتبری زندگی می‌کنم. گاهی دنبال خدمات شهری هستم، گاهی فقط با همسایه‌ها حرف می‌زنم. همه چیز پروژه نیست.'],
 ['برای خودم','همه فکرها را منتشر نمی‌کنم. بعضی یادداشت‌ها را برای بعد نگه می‌دارم تا میان پیام‌ها گم نشوند.']
 ],
 so:[
 'QORAALLADAYDA','Dad, qorshayaal iyo dhacdooyin yaryar','Eeg',
 ['Guriga','Waxaan rabaa inaan dhammaystiro dayactir yar, balse qalabka jarista dhoobada waxaan u baahanahay hal dhammaad toddobaad. Waxaan raadinayaa mid aan amaahdo.'],
 ['Waxaan qaban karo','Sawirro ayaan qaadaa. Mararka qaar way fiican tahay inaan bixiyo xirfad aan leeyahay intii aan sugi lahaa codsi.'],
 ['Deriska','Isweydaarsiga dhirtu wuxuu ku bilaabmay fikrad yar. Anna iyo Sara ayaa yimid, hawlo iyo wada hadalna waa raaceen. Kulanka xiga waan qorshaynaynaa.'],
 ['Wadahadalka','Markii hore waan sheekaysannay. Dabadeed waxaa soo baxay magacyo, waqtiyo iyo hawlo. Halkaas ayaan faahfaahinta ku hubiyaa.'],
 ['Dadkayga','Anna wax bay dhistaa, Johan qalabka wuu yaqaan, Omarna waxaan kala hadlay qaadista. Hawlaha wadaagga ahi na xiriiriya.'],
 ['Wadajir','Waxaan ka fikirnay inaan xaabo wada iibsanno. Tirada iyo qaadista weli waa la isku afgaranayaa; fariin ma aha lacag ama gaarsiin.'],
 ['Wax la dhammeeyay','Jaranjaro la laabi karo ayaan amaahday, fiidkiina waxaan calaamadeeyay inaan celiyay. Waa arrin yar oo bilow iyo dhammaad leh.'],
 ['Magaaladayda','Waxaan degganahay Göteborg. Mararka qaar adeeg magaalada ah ayaan raadiyaa, marna deriska ayaan la hadlaa. Wax kastaa mashruuc ma aha.'],
 ['Aniga uun','Fikrad kasta ma daabaco. Qoraallo qaar ayaan keydsadaa si aysan farriimaha ugu lumin.']
 ],
 ku:[
 'NIVÎSÊN MIN','Mirov, plan û guherînên biçûk','Binêre',
 ['Li malê','Ez dixwazim tamîrek biçûk biqedînim, lê amûra birîna seramîkê tenê dawiya hefteyê pêdivî ye. Ez dixwazim deyn bikim.'],
 ['Tiştên ku dikarim','Ez wêne jî dikişînim. Carinan baştir e ku hunera xwe pêşkêş bikim li şûna ku li benda daxwazê bim.'],
 ['Cîran','Guhertina nebatan bi ramanek biçûk dest pê kir. Paşê Anna, Sara, erk û axaftin hatin. Hê divê civîna din saz bikin.'],
 ['Axaftin','Destpêkê tenê diaxivîn; paşê nav, dem û karên diyar hatin. Ji bo hûrguliyan ez vedigerim peyaman.'],
 ['Mirovên min','Anna ji çêkirinê hez dike, Johan amûran nas dike û min bi Omar re li ser wergirtinê axivî. Karên hevpar me girêdidin.'],
 ['Bi hev re','Me li ser kirîna hevpar a daran fikirî. Hîn hejmar û wergirtinê li hev tînin; peyam ne pere dayîn an radestkirin e.'],
 ['Tiştek qediya','Min pêlikek qatkirî deyn kir û êvarê qeyd kir ku vegerand. Kareke biçûk e lê destpêk û dawî diyar e.'],
 ['Bajarê min','Ez li Göteborg dijîm. Carinan xizmeta bajêr digerim, carinan tenê bi cîranan re diaxivim. Her tişt ne proje ye.'],
 ['Ji bo xwe','Ez her ramanê belav nakim. Hin notan ji bo paşê diparêzim da ku di nav peyaman de winda nebin.']
 ]
};
const TARGET=Object.freeze({
 need:{kind:'need',ownership:true,onlyOpen:true},
 offer:{kind:'offer',ownership:true,onlyOpen:true},
 project:{kind:'project',ownership:true,onlyOpen:true},
 chat:{chat:'group'},
 people:{href:'#/people'},
 purchase:{kind:'purchase'},
 outcome:{kind:'need',ownership:true,onlyDone:true},
 city:{href:'#/city'},
 draft:{href:'#/me',requireDraft:true}
});
const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function chapterTarget(key,data,userId){
 const spec=TARGET[key];
 if(spec.kind){
  const found=(data.cooperations||[]).find(row=>row.kind===spec.kind&&(!spec.ownership||row.owner_id===userId)&&(!spec.onlyOpen||['open','active'].includes(row.status))&&(!spec.onlyDone||row.status==='done'));
  return found?{type:'coop',id:found.id,title:found.title}:null;
 }
 if(spec.chat){
  const chat=(data.chats||[]).find(x=>x.kind===spec.chat);
  return chat?{type:'chat',id:chat.id,title:chat.title}:null;
 }
 if(spec.requireDraft&&!(data.localDrafts||[]).length)return null;
 return {type:'route',href:spec.href,title:null};
}
function copyFor(code){return voices[code]||voices.en;}
function render({data,userId,language='en'}){
 const content=copyFor(language);
 const chapters=keys.map((key,index)=>{
  const target=chapterTarget(key,data,userId);
  if(!target)return '';
  const [eyebrow,body]=content[3+index];
  const attribute=target.type==='coop'?'data-home="openCoop" data-id="'+safe(target.id)+'"':
   target.type==='chat'?'data-net="openChat" data-id="'+safe(target.id)+'"':null;
  const cta=attribute?'<button type="button" class="mura-life-link" '+attribute+'>'+safe(content[2])+' <span aria-hidden="true">→</span></button>':
   '<a class="mura-life-link" href="'+safe(target.href)+'">'+safe(content[2])+' <span aria-hidden="true">→</span></a>';
  const targetTitle=target.title?'<p class="mura-life-object">'+safe(target.title)+'</p>':'';
  return '<article class="mura-life-chapter" data-mura-chapter="'+safe(key)+'"><span class="mura-life-dot" aria-hidden="true"></span><div class="mura-life-card"><p class="mura-life-kicker">'+safe(eyebrow)+'</p><p class="mura-life-voice">'+safe(body)+'</p>'+targetTitle+cta+'</div></article>';
 }).filter(Boolean).join('');
 if(!chapters)return '';
 return '<section class="mura-life" aria-labelledby="muraLifeTitle"><div class="mura-life-heading"><p class="eyebrow">'+safe(content[0])+'</p><h2 id="muraLifeTitle">'+safe(content[1])+'</h2></div><div class="mura-life-timeline">'+chapters+'</div></section>';
}
globalThis.FolkoopMuraLife=Object.freeze({render,copyFor,keys:Object.freeze(keys)});
})();
