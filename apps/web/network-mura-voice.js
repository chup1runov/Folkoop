/* Mura speaks from inside her life. This copy is authored for her read-only
   account; legal/source/participant status remains separate system information. */
(() => {
'use strict';
const stepKeys=['welcome','home','together','projects','people','city','center','quick'];
// Each pair is [personal chapter title, first-person voice].
const walks={
ru:[
 ['Добро пожаловать ко мне','Заходи. Я Мура, живу в Гётеборге. Здесь у меня соседи, разговоры, пара незаконченных дел и кое-что, что уже получилось. Пойдём, покажу, как всё переплелось.'],
 ['Что я храню здесь','Вчера я снова открыла свой профиль: хотела не забыть про обмен растениями и увидеть, кто ответил. Тут рядом и мои черновики, и дела, к которым я ещё вернусь.'],
 ['Что мне понадобилось','В маленьком ремонте дома всё остановилось на плитке. Плиткорез мне нужен ровно на выходные — я написала, что ищу, и теперь жду, у кого получится одолжить.'],
 ['Чем я могу помочь','А потом подумала: у меня ведь есть фотоаппарат. Если соседям или проекту нужны фотографии, я вполне могу помочь — не только просить что-то для себя.'],
 ['Идея, которая выросла','Я однажды предложила обменяться растениями. Анна и Сара откликнулись, появились задачи и общий чат. Теперь мы думаем, где поставить стол и как собрать людей.'],
 ['Люди вокруг меня','Анну я знаю по растениям, Йохана — по ремонту, с Омаром говорим о доставке. Я не собирала «подписчиков»: мы познакомились, потому что было общее дело.'],
 ['Мой локальный Центр','В Гётеборге я смотрю, что обсуждают соседи, где проходят встречи и куда можно обратиться. Иногда это просто разговор, а иногда из него рождается новое дело.'],
 ['Теперь исследуй сам','Я ещё не всё тебе показала. Можешь открыть мою переписку, зайти в проект, посмотреть людей или черновики. А я останусь здесь — у меня ещё много дел.']
],
en:[
 ['Welcome to my place','Come in. I am Mura and I live in Göteborg. Here are my neighbours, conversations, unfinished things and a few things that worked out. Let me show you how they connect.'],
 ['What I keep here','I opened my profile again yesterday to check the plant exchange and see who replied. My private notes and the things I still need to do are here too.'],
 ['Something I need','My small repair at home stopped at the tiles. I need a tile cutter for just one weekend, so I put the need here and am looking for someone who can lend one.'],
 ['Something I can offer','Then I remembered I have a camera. When neighbours or a project need photos, I can help too. It feels good not to be asking all the time.'],
 ['An idea that grew','I once suggested exchanging plants. Anna and Sara joined in; then we had tasks and a work chat. Now we are working out where to put a table.'],
 ['People around me','I know Anna through plants, Johan through repairs and Omar through the pickup conversation. We did not meet as followers; we had something to do together.'],
 ['My local Center','In Göteborg I look at what neighbours are discussing, where people meet and which city routes help. Sometimes it stays a conversation, and that is fine.'],
 ['Now explore on your own','There is more I have not shown you. Open a chat, a project, someone I know or one of my unfinished notes. I will still be around.']
],
sv:[
 ['Välkommen hem till mig','Kom in. Jag heter Mura och bor i Göteborg. Här finns grannar, samtal, ofärdiga saker och några som faktiskt blev av. Jag visar hur allt hänger ihop.'],
 ['Det jag har här','Igår tittade jag in igen för att se hur det går med växtbytet och vem som svarat. Här finns också mina egna anteckningar och saker jag vill göra senare.'],
 ['Något jag behöver','Min lilla renovering hemma stannade vid kaklet. Jag behöver en kakelskärare bara över helgen, så jag skrev vad jag söker och hoppas kunna låna en.'],
 ['Något jag kan erbjuda','Sedan kom jag på att jag har en kamera. När grannar eller ett projekt behöver bilder kan jag också hjälpa till, inte bara fråga.'],
 ['En idé som växte','Jag föreslog en gång att byta växter. Anna och Sara ville vara med. Sedan fick vi uppgifter och en arbetschatt. Nu funderar vi på var bordet ska stå.'],
 ['Människor runt mig','Anna känner jag genom växterna, Johan genom reparationerna och Omar genom samtalet om hämtning. Vi har något gemensamt att göra.'],
 ['Mitt lokala Center','I Göteborg tittar jag på vad grannar pratar om, var vi kan träffas och vart man kan vända sig. Ibland räcker det med ett samtal.'],
 ['Utforska nu själv','Jag har inte visat allt. Öppna ett samtal, ett projekt, någon jag känner eller en ofärdig anteckning. Jag finns kvar här.']
],
es:[
 ['Bienvenido a mi lugar','Entra. Soy Mura y vivo en Göteborg. Aquí están mis vecinos, mis conversaciones y algunas ideas que siguen esperando. Te enseño cómo se conectan.'],
 ['Lo que guardo aquí','Ayer volví a mirar el intercambio de plantas y quién había respondido. También guardo mis notas privadas y cosas pendientes.'],
 ['Algo que necesito','Mi pequeña reforma se paró en los azulejos. Solo necesito una cortadora un fin de semana, así que busco a alguien que pueda prestarla.'],
 ['Lo que puedo ofrecer','Entonces pensé en mi cámara. También puedo ayudar con fotos a un vecino o a un proyecto, no solo pedir ayuda.'],
 ['Una idea que creció','Propuse intercambiar plantas. Anna y Sara se apuntaron; después llegaron las tareas y el chat del proyecto. Aún acordamos dónde poner la mesa.'],
 ['Personas a mi alrededor','Conozco a Anna por las plantas, a Johan por las reparaciones y a Omar por la recogida. Nos une algo que hacemos juntos.'],
 ['Mi Centro local','En Göteborg veo de qué hablan los vecinos, dónde quedan y a quién puedo preguntar. A veces una conversación es suficiente.'],
 ['Ahora explora tú','Todavía no te he mostrado todo. Entra en una conversación, un proyecto o una de mis ideas pendientes. Seguimos por aquí.']
],
uk:[
 ['Ласкаво прошу до мене','Заходь. Я Мура, живу в Гетеборзі. Тут мої сусіди, розмови, незавершені справи й те, що вже вийшло. Покажу, як усе пов’язане.'],
 ['Що я тут зберігаю','Учора знову перевірила обмін рослинами й відповіді. Тут також мої особисті нотатки та справи на потім.'],
 ['Що мені потрібно','Удома ремонт зупинився на плитці. Плиткоріз потрібен лише на вихідні, тому шукаю, у кого позичити.'],
 ['Чим можу допомогти','А потім згадала про свій фотоапарат. Можу й сама допомогти сусідам або проєкту зі світлинами.'],
 ['Ідея, що виросла','Я запропонувала обмінятися рослинами. Відгукнулися Анна й Сара, з’явилися завдання та спільний чат. Ще домовляємося про стіл.'],
 ['Люди поруч','Анну знаю через рослини, Йохана — через ремонт, з Омаром говоримо про доставку. Нас поєднує спільна справа.'],
 ['Мій місцевий Центр','У Гетеборзі дивлюся, про що говорять сусіди, де зустрічаються і куди звернутися. Іноді простої розмови достатньо.'],
 ['Досліджуй сам','Я показала не все. Відкрий розмову, проєкт, знайомих або мої незавершені нотатки. Я тут.']
],
fi:[
 ['Tervetuloa luokseni','Tule sisään. Olen Mura ja asun Göteborgissa. Täällä on naapureita, keskusteluja ja keskeneräisiä asioita. Näytän, miten ne liittyvät yhteen.'],
 ['Mitä täällä säilytän','Eilen kävin katsomassa, miten kasvien vaihto etenee ja kuka vastasi. Täällä ovat myös omat muistiinpanoni.'],
 ['Mitä tarvitsen','Pieni kotiremonttini pysähtyi laattoihin. Tarvitsen laattaleikkurin vain viikonlopuksi, joten yritän lainata sellaisen.'],
 ['Mitä voin tarjota','Sitten muistin kamerani. Voin auttaa naapuria tai projektia valokuvilla enkä vain pyytää apua.'],
 ['Idea joka kasvoi','Ehdotin kasvien vaihtoa. Anna ja Sara tulivat mukaan, sitten syntyivät tehtävät ja yhteinen keskustelu. Pöydän paikka pitää vielä sopia.'],
 ['Ihmisiä ympärilläni','Tunnen Annan kasveista, Johanin korjauksista ja Omarin noudon suunnittelusta. Yhteinen tekeminen toi meidät yhteen.'],
 ['Paikallinen Centerini','Göteborgissa katson, mistä naapurit puhuvat, missä tavataan ja mihin voi ottaa yhteyttä. Joskus keskustelu riittää.'],
 ['Tutustu rauhassa','Kaikkea en vielä näyttänyt. Avaa keskustelu, projekti, tuttu ihminen tai keskeneräinen muistiinpano. Olen täällä.']
],
bs:[
 ['Dobro došao kod mene','Uđi. Ja sam Mura i živim u Göteborgu. Ovdje su moje komšije, razgovori, nezavršene stvari i poneki uspjeh. Pokazat ću ti kako su povezani.'],
 ['Šta čuvam ovdje','Jučer sam provjerila razmjenu biljaka i ko je odgovorio. Ovdje čuvam i privatne bilješke.'],
 ['Šta mi treba','Mali popravak kod kuće stao je kod pločica. Rezač mi treba samo za vikend, pa tražim da ga posudim.'],
 ['Šta mogu ponuditi','Onda sam se sjetila fotoaparata. Mogu pomoći komšijama ili projektu fotografijama, ne samo tražiti pomoć.'],
 ['Ideja je porasla','Predložila sam razmjenu biljaka. Anna i Sara su se pridružile, pa su nastali zadaci i razgovor. Još dogovaramo sto.'],
 ['Ljudi oko mene','Annu znam kroz biljke, Johana kroz popravke, a s Omarom pričam o preuzimanju. Spojio nas je zajednički posao.'],
 ['Moj lokalni Centar','U Göteborgu gledam o čemu komšije pričaju i gdje se okupljaju. Nekada je razgovor sasvim dovoljan.'],
 ['Istraži sam','Nisam ti još sve pokazala. Otvori razgovor, projekt, nekoga koga znam ili moju nedovršenu bilješku.']
],
ar:[
 ['أهلاً بك عندي','تفضل. أنا مورا وأعيش في يوتيبوري. هنا جيراني ومحادثاتي وأعمال لم تكتمل وأخرى انتهت. سأريك كيف ترتبط.'],
 ['ما أحتفظ به هنا','عدت أمس لأرى كيف يسير تبادل النباتات ومن رد عليّ. هنا أيضاً ملاحظاتي الخاصة وأعمالي المؤجلة.'],
 ['ما أحتاجه','توقف إصلاح صغير في البيت عند البلاط. أحتاج قاطعه لعطلة نهاية أسبوع فقط، لذلك أحاول استعارته.'],
 ['ما يمكنني تقديمه','ثم تذكرت الكاميرا. أستطيع مساعدة الجيران أو المشروع بالصور، لا أن أطلب المساعدة فقط.'],
 ['فكرة كبرت','اقترحت تبادل النباتات. انضمت آنا وسارة، ثم ظهرت المهام ومحادثة العمل. ما زلنا نختار مكان الطاولة.'],
 ['الناس من حولي','عرفت آنا عبر النباتات ويوهان عبر الإصلاح وعمر عبر حديث الاستلام. جمعنا عمل مشترك.'],
 ['مركزي المحلي','في يوتيبوري أتابع ما يتحدث عنه الجيران وأماكن اللقاء والجهات المفيدة. أحياناً تكفي محادثة فقط.'],
 ['استكشف بنفسك','لم أريك كل شيء. افتح محادثة أو مشروعاً أو شخصاً أعرفه أو إحدى ملاحظاتي غير المكتملة.']
],
fa:[
 ['به خانه‌ام خوش آمدی','بیا داخل. من مورا هستم و در یوتبری زندگی می‌کنم. اینجا همسایه‌ها، گفت‌وگوها و کارهای نیمه‌تمامم هستند. نشان می‌دهم چطور به هم مربوط‌اند.'],
 ['چیزهایی که اینجا دارم','دیروز دوباره سراغ تبادل گیاه رفتم ببینم چه کسی پاسخ داده. یادداشت‌های خصوصی و کارهای بعدی‌ام هم اینجا هستند.'],
 ['چیزی که نیاز دارم','تعمیر کوچکم در خانه به کاشی رسید و متوقف شد. کاشی‌بُر را فقط آخر هفته لازم دارم، پس دنبال قرض گرفتنش هستم.'],
 ['چیزی که می‌توانم بدهم','بعد یاد دوربینم افتادم. می‌توانم برای همسایه‌ها یا پروژه عکس بگیرم، نه اینکه فقط کمک بخواهم.'],
 ['ایده‌ای که بزرگ شد','تبادل گیاه را پیشنهاد دادم. آنا و سارا آمدند و کارها و گفت‌وگو شروع شد. هنوز جای میز را هماهنگ می‌کنیم.'],
 ['آدم‌های اطرافم','آنا را از گیاه‌ها می‌شناسم، یوهان را از تعمیر و با عمر درباره تحویل حرف زده‌ام. یک کار مشترک ما را آشنا کرد.'],
 ['مرکز محلی من','در یوتبری می‌بینم همسایه‌ها درباره چه حرف می‌زنند و کجا همدیگر را می‌بینند. گاهی گفت‌وگو کافی است.'],
 ['خودت بگرد','هنوز همه چیز را نشان نداده‌ام. گفت‌وگو، پروژه، آدم‌ها یا یادداشت ناتمام مرا باز کن.']
],
so:[
 ['Ku soo dhowow gurigayga','Soo gal. Waxaan ahay Mura, Göteborg ayaan degganahay. Halkan waxaa ku jira deriskayga, sheekooyinkayga iyo hawlo aan dhammaan. Aan ku tuso sida ay isugu xiran yihiin.'],
 ['Waxaan ku haysto','Shalay waxaan dib u eegay isweydaarsiga dhirta iyo cidda jawaabtay. Qoraalladayda gaarka ahna way yaallaan.'],
 ['Waxaan u baahanahay','Dayactir yar oo guriga ah ayaa ku xayirmay dhoobada. Qalabka jarista waxaan u baahanahay hal dhammaad toddobaad, sidaas darteed waan amaahanayaa.'],
 ['Waxaan bixin karo','Markaas waxaan xusuustay kamaradayda. Waxaan sawirro uga caawin karaa deriska ama mashruuca, ma aha inaan mar kasta codsado.'],
 ['Fikrad korodhay','Waxaan soo jeediyay isweydaarsiga dhirta. Anna iyo Sara ayaa ku soo biiray; hawlo iyo wada hadal ayaana yimid. Weli meel baan isla dooranaynaa.'],
 ['Dadka agtayda','Anna dhirta ayaan ku bartay, Johan dayactirka, Omarna qaadista ayaan ka wada hadalnay. Hawl wadajir ah ayaa na kulmisay.'],
 ['Xaruntayda deegaanka','Göteborg waxaan ka eegaa deriska waxa ay ka hadlayaan iyo meelaha la isugu yimaado. Mararka qaar sheeko keliya ayaa ku filan.'],
 ['Adigu baadh','Wax walba weli kuma tusin. Fur wada hadal, mashruuc, qof aan aqaan ama qoraal aan dhammayn.']
],
ku:[
 ['Bi xêr hatî mala min','Were hundir. Ez Mura me û li Göteborg dijîm. Li vir cîran, axaftin û karên min ên neqediyayî hene. Ez ê girêdanên wan nîşan bidim.'],
 ['Tiştên li vir','Duh min dîsa li guherîna nebatan nihêrî ka kê bersiv daye. Nivîsên min ên taybet jî li vir in.'],
 ['Tiştek ku dixwazim','Tamîra min a biçûk li malê li ser seramîkê rawestiya. Amûrê tenê dawiya hefteyê dixwazim, ji ber vê yekê ez deyn digerim.'],
 ['Tiştên ku dikarim','Paşê kamera min hat bîra min. Dikarin bi wêneyan alîkariya cîranan an projeyek bikim.'],
 ['Ramanek mezin bû','Min guherîna nebatan pêşniyar kir. Anna û Sara hatin, erk û axaftin jî çêbûn. Hê em cihê maseyê diyar dikin.'],
 ['Mirovên li dor min','Min Anna bi nebatan, Johan bi tamîrê, Omar jî bi wergirtinê nas kir. Kareke hevpar me anî cem hev.'],
 ['Navenda min a herêmî','Li Göteborg ez dibînim cîran çi diaxivin û li ku dicivin. Carinan tenê axaftin bes e.'],
 ['Tu jî bigere','Min hê her tişt nîşan neda. Axaftinek, projeyek, mirov an nivîsek min a neqediyayî veke.']
]
};
const centers={
ru:{title:'Мои места и люди в Göteborg',body:'Соседи, встречи и городские возможности — не отдельный мир от моих проектов. Иногда я просто читаю разговор, иногда задаю вопрос, иногда нахожу человека.',localTitle:'Что обсуждают рядом со мной',localText:'Мне интересно, что происходит у соседей и вокруг ГБГ Форума. Можно просто пообщаться, не превращая всё в очередную задачу.',helper:'Я заглядываю сюда, когда ищу людей, встречу или городской маршрут. Отсюда удобно перейти к знакомым, разговорам или проекту.'},
en:{title:'My people and places in Göteborg',body:'Neighbours, meetings and city opportunities are part of the same week as my projects. Sometimes I just read a conversation.',localTitle:'What neighbours are talking about',localText:'I keep an eye on local conversations and the GBG Forum context. Not every chat has to become another task.',helper:'I come here when I need a person, a meeting or a route through the city. I can follow the conversation without making it a project.'},
sv:{title:'Mina människor och platser i Göteborg',body:'Grannar, träffar och möjligheter i staden hör ihop med mina projekt. Ibland vill jag bara läsa ett samtal.',localTitle:'Det grannarna pratar om',localText:'Jag följer lokala samtal och sammanhanget kring GBG Forum. Allt behöver inte bli ett nytt uppdrag.',helper:'Jag kommer hit när jag söker en person, en träff eller en väg genom staden. Ett vanligt samtal räcker ofta.'},
es:{title:'Mi gente y mis lugares en Göteborg',body:'Los vecinos, encuentros y oportunidades de la ciudad forman parte de mi semana. A veces solo quiero leer una conversación.',localTitle:'Lo que se comenta cerca',localText:'Sigo las conversaciones locales y el contexto de GBG Forum. No todo debe convertirse en una tarea.',helper:'Vengo cuando busco gente, una reunión o un camino por la ciudad.'},
uk:{title:'Мої люди й місця в Göteborg',body:'Сусіди, зустрічі й можливості міста — частина мого життя. Інколи я просто читаю розмови.',localTitle:'Про що говорять поруч',localText:'Слідкую за місцевими розмовами й контекстом ГБГ Форуму. Не все має ставати завданням.',helper:'Сюди приходжу по людей, зустрічі й корисні міські маршрути.'},
fi:{title:'Ihmiset ja paikat Göteborgissa',body:'Naapurit, tapaamiset ja kaupungin mahdollisuudet ovat osa arkeani. Joskus haluan vain lukea keskustelua.',localTitle:'Mistä naapurit puhuvat',localText:'Seuraan paikallisia keskusteluja ja GBG Forumin ympäristöä. Kaikesta ei tarvitse tehdä tehtävää.',helper:'Tulen tänne etsimään ihmisiä, tapaamisia ja kaupungin mahdollisuuksia.'},
bs:{title:'Moji ljudi i mjesta u Göteborgu',body:'Komšije, susreti i gradske mogućnosti dio su mog svakodnevnog života. Nekad samo želim čitati razgovor.',localTitle:'O čemu komšije pričaju',localText:'Pratim lokalne razgovore i kontekst GBG Foruma. Ne mora sve postati zadatak.',helper:'Dolazim ovdje kad tražim ljude, susret ili gradske mogućnosti.'},
ar:{title:'أناسيّ وأماكني في يوتيبوري',body:'الجيران واللقاءات وفرص المدينة جزء من حياتي اليومية. أحياناً أريد فقط قراءة حديث.',localTitle:'ما الذي يتحدث عنه الجيران',localText:'أتابع أحاديث الحي وسياق منتدى غوتنبرغ. ليس كل حديث مهمة جديدة.',helper:'أعود هنا لأجد شخصاً أو لقاء أو طريقاً مفيداً في المدينة.'},
fa:{title:'آدم‌ها و جاهای من در یوتبری',body:'همسایه‌ها، دیدارها و فرصت‌های شهر بخشی از روزهای من‌اند. گاهی فقط می‌خواهم گفت‌وگویی را بخوانم.',localTitle:'حرف‌های همسایه‌ها',localText:'گفت‌وگوهای محلی و فضای پیرامون انجمن گوتنبرگ را دنبال می‌کنم. هر حرفی قرار نیست کار تازه‌ای باشد.',helper:'وقتی دنبال آدم‌ها، دیدار یا مسیر شهری هستم به اینجا سر می‌زنم.'},
so:{title:'Dadkayga iyo meelahayga Göteborg',body:'Deriska, kulamada iyo fursadaha magaalada waa qayb ka mid ah maalmahayga. Mararka qaar sheeko ayaan akhriyaa.',localTitle:'Waxa derisku ka hadlayaan',localText:'Waxaan raacaa sheekooyinka deegaanka iyo GBG Forum. Sheeko kasta hawl ma noqoto.',helper:'Waxaan halkan ka raadiyaa qof, kulan ama adeeg magaalada ah.'},
ku:{title:'Mirov û cihên min li Göteborg',body:'Cîran, civîn û derfetên bajêr beşek ji rojên min in. Carinan tenê dixwazim axaftinek bixwînim.',localTitle:'Axaftina cîranan',localText:'Ez axaftinên herêmî û derdora GBG Forum dişopînim. Ne her axaftin divê bibe erk.',helper:'Ez li vir mirov, civîn an rêya bajêr digerim.'}
};
function step(code,id){const i=stepKeys.indexOf(id),s=walks[code]||walks.en;return i<0?null:s[i];}
function walkCopy(code){const s=walks[code]||walks.en;return Object.fromEntries(stepKeys.map((k,i)=>[k,s[i][1]]));}
function walkTitle(code,id){return step(code,id)?.[0]||id;}
function centerCopy(code){return centers[code]||centers.en;}
globalThis.FolkoopMuraVoice=Object.freeze({walkCopy,walkTitle,centerCopy,stepKeys:Object.freeze(stepKeys)});
})();
