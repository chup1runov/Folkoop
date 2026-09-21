const view = document.getElementById('view');
const languageSelect = document.getElementById('languageSelect');
let deferredPrompt;
let currentScreen = 'home';

const supportedLanguages = ['sv', 'en', 'ar', 'so', 'fa', 'fi'];
const rtlLanguages = new Set(['ar', 'fa']);

const messages = {
  sv: {
    tagline:'Samhället. Enklare.', pilot:'PILOT', language:'Språk',
    eyebrow:'Göteborg · tidig prototyp', heroTitle:'Vad behöver du hjälp med?',
    heroText:'Hitta rätt väg i det offentliga Sverige utan att först behöva förstå organisationen bakom.',
    status:'Öppen samhällstjänst · inga riktiga ärenden skickas ännu',
    responsibility:'Vem ansvarar?', responsibilitySub:'Beskriv problemet så hjälper vi dig hitta rätt aktör.',
    report:'Rapportera', reportSub:'Fel på gata, belysning, miljö eller offentlig plats.',
    near:'Nära mig', nearSub:'Planer, störningar och samhällsinformation i närheten.',
    decisions:'Beslut', decisionsSub:'Förstå beslut och gå vidare till originalkällan.',
    installTitle:'Lägg Sverinav på hemskärmen', installText:'Fungerar som en app direkt från webbläsaren.', install:'Installera',
    navHome:'Hem', navNear:'Nära', navReport:'Rapportera', navDecisions:'Beslut', back:'← Hem',
    responsibilityTitle:'Vem ansvarar?',
    responsibilityHelp:'Beskriv problemet med vanliga ord. I en riktig version ska svaret alltid verifieras mot officiell källa.',
    issuePlaceholder:'Exempel: Det är en stor vattenpöl på vägen utanför huset...',
    findResponsible:'Hitta ansvarig',
    actorDefault:'Kommunen eller väghållaren',
    reasonDefault:'För en riktig bedömning behöver plats och ansvarig aktör kontrolleras mot officiell källa.',
    actorHealth:'Regionen / vårdgivaren', reasonHealth:'Hälso- och sjukvård ligger normalt på regional nivå.',
    actorRail:'Trafikverket eller trafikoperatören', reasonRail:'Ansvar beror på om frågan gäller infrastrukturen eller själva trafiktjänsten.',
    actorWaste:'Kommunen / kommunalt avfallsbolag', reasonWaste:'Hushållsavfall hanteras normalt kommunalt.',
    actorRoad:'Väghållaren', reasonRoad:'Nästa version ska använda NVDB för att avgöra om vägen är statlig, kommunal eller enskild.',
    demoNotVerified:'DEMO — ingen myndighetskontroll har gjorts.',
    reportTitle:'Rapportera',
    reportHelp:'Sverinav ska hjälpa dig samla rätt information och sedan leda dig till rätt officiell mottagare.',
    addPhoto:'Lägg till foto (demo)', place:'Plats eller adress', reportPlaceholder:'Beskriv problemet', preview:'Förhandsgranska',
    noRealReport:'Ingen riktig felanmälan skickas ännu.', earlyPrototype:'Det här är en tidig produktprototyp.',
    nearTitle:'Nära mig', nearHelp:'I piloten ska detta hämtas från öppna och officiella datakällor.',
    roadwork:'Vägarbete', roadworkText:'Demodata: planerat arbete i närområdet.',
    consultation:'Samråd', consultationText:'Demodata: ett planförslag är öppet för synpunkter.',
    air:'Luftkvalitet', airText:'Här ska senare visas öppen miljödata från officiell källa.',
    demoLiveLater:'Demo — livekälla kopplas in senare', demo:'Demo',
    decisionsTitle:'Beslut',
    decisionsHelp:'Sammanfattningar ska vara källbelagda och tydligt skilja fakta från politiska ståndpunkter.',
    nationalDecision:'Beslut i riksdagen',
    nationalDecisionText:'Här kommer en kort och neutral sammanfattning med länk till originaldokumentet.',
    nationalDecisionSource:'Demo — Riksdagens API planeras först',
    localDecision:'Lokalt beslut',
    localDecisionText:'Här kan användaren senare se kommunala beslut som berör det valda området.'
  },
  en: {
    tagline:'Society. Simpler.', pilot:'PILOT', language:'Language',
    eyebrow:'Gothenburg · early prototype', heroTitle:'What do you need help with?',
    heroText:'Find the right path through Sweden’s public sector without first having to understand which organisation is responsible.',
    status:'Open civic service · no real official cases are submitted yet',
    responsibility:'Who is responsible?', responsibilitySub:'Describe the problem and we will help you find the right authority.',
    report:'Report', reportSub:'Problems with streets, lighting, the environment or public spaces.',
    near:'Near me', nearSub:'Plans, disruptions and civic information nearby.',
    decisions:'Decisions', decisionsSub:'Understand public decisions and always continue to the original source.',
    installTitle:'Add Sverinav to your home screen', installText:'Works like an app directly from your browser.', install:'Install',
    navHome:'Home', navNear:'Nearby', navReport:'Report', navDecisions:'Decisions', back:'← Home',
    responsibilityTitle:'Who is responsible?',
    responsibilityHelp:'Describe the problem in ordinary words. In the real version, the answer must always be verified against an official source.',
    issuePlaceholder:'Example: There is a large pool of water on the road outside my home...',
    findResponsible:'Find responsible authority',
    actorDefault:'The municipality or road authority',
    reasonDefault:'A real assessment requires the location and responsible authority to be checked against an official source.',
    actorHealth:'The region / healthcare provider', reasonHealth:'Healthcare is normally a regional responsibility.',
    actorRail:'Trafikverket or the train operator', reasonRail:'Responsibility depends on whether the issue concerns infrastructure or the transport service.',
    actorWaste:'The municipality / municipal waste company', reasonWaste:'Household waste is normally handled at municipal level.',
    actorRoad:'The road authority', reasonRoad:'The next version will use NVDB to determine whether the road is state, municipal or private.',
    demoNotVerified:'DEMO — no authority check has been performed.',
    reportTitle:'Report',
    reportHelp:'Sverinav will help you collect the right information and then guide you to the correct official recipient.',
    addPhoto:'Add photo (demo)', place:'Location or address', reportPlaceholder:'Describe the problem', preview:'Preview',
    noRealReport:'No real fault report is submitted yet.', earlyPrototype:'This is an early product prototype.',
    nearTitle:'Near me', nearHelp:'In the pilot, this will be retrieved from open and official data sources.',
    roadwork:'Roadworks', roadworkText:'Demo data: planned work in the nearby area.',
    consultation:'Public consultation', consultationText:'Demo data: a planning proposal is open for comments.',
    air:'Air quality', airText:'Official open environmental data will be shown here later.',
    demoLiveLater:'Demo — live source will be connected later', demo:'Demo',
    decisionsTitle:'Decisions',
    decisionsHelp:'Summaries must be source-based and clearly separate facts from political positions.',
    nationalDecision:'Decision in the Riksdag',
    nationalDecisionText:'A short, neutral summary will appear here with a link to the original document.',
    nationalDecisionSource:'Demo — the Riksdag API is planned first',
    localDecision:'Local decision',
    localDecisionText:'Later, users will be able to see municipal decisions affecting the selected area.'
  },
  ar: {
    tagline:'المجتمع. ببساطة.', pilot:'تجريبي', language:'اللغة',
    eyebrow:'غوتنبرغ · نموذج أولي مبكر', heroTitle:'ما الذي تحتاج إلى مساعدة بشأنه؟',
    heroText:'اعثر على الطريق الصحيح في القطاع العام السويدي دون الحاجة أولاً إلى معرفة الجهة المسؤولة.',
    status:'خدمة مجتمعية مفتوحة · لا يتم إرسال أي بلاغات رسمية حقيقية بعد',
    responsibility:'من المسؤول؟', responsibilitySub:'صف المشكلة وسنساعدك في العثور على الجهة المسؤولة.',
    report:'الإبلاغ', reportSub:'مشكلات في الشوارع أو الإضاءة أو البيئة أو الأماكن العامة.',
    near:'بالقرب مني', nearSub:'خطط واضطرابات ومعلومات مجتمعية قريبة منك.',
    decisions:'القرارات', decisionsSub:'افهم القرارات وانتقل دائماً إلى المصدر الأصلي.',
    installTitle:'أضف Sverinav إلى الشاشة الرئيسية', installText:'يعمل كتطبيق مباشرة من المتصفح.', install:'تثبيت',
    navHome:'الرئيسية', navNear:'بالقرب', navReport:'إبلاغ', navDecisions:'القرارات', back:'→ الرئيسية',
    responsibilityTitle:'من المسؤول؟',
    responsibilityHelp:'صف المشكلة بكلمات بسيطة. في النسخة الفعلية يجب دائماً التحقق من الإجابة من مصدر رسمي.',
    issuePlaceholder:'مثال: توجد بركة مياه كبيرة على الطريق خارج المنزل...',
    findResponsible:'ابحث عن الجهة المسؤولة',
    actorDefault:'البلدية أو الجهة المسؤولة عن الطريق',
    reasonDefault:'يتطلب التقييم الفعلي التحقق من الموقع والجهة المسؤولة عبر مصدر رسمي.',
    actorHealth:'الإقليم / مقدم الرعاية الصحية', reasonHealth:'تكون الرعاية الصحية عادة من مسؤولية الإقليم.',
    actorRail:'Trafikverket أو مشغل القطار', reasonRail:'تعتمد المسؤولية على ما إذا كانت المشكلة تتعلق بالبنية التحتية أو خدمة النقل.',
    actorWaste:'البلدية / شركة النفايات البلدية', reasonWaste:'تُدار النفايات المنزلية عادة على مستوى البلدية.',
    actorRoad:'الجهة المسؤولة عن الطريق', reasonRoad:'ستستخدم النسخة التالية NVDB لتحديد ما إذا كان الطريق تابعاً للدولة أو البلدية أو جهة خاصة.',
    demoNotVerified:'تجريبي — لم يتم إجراء تحقق رسمي.',
    reportTitle:'الإبلاغ',
    reportHelp:'سيساعدك Sverinav في جمع المعلومات الصحيحة ثم إرشادك إلى الجهة الرسمية المناسبة.',
    addPhoto:'إضافة صورة (تجريبي)', place:'الموقع أو العنوان', reportPlaceholder:'صف المشكلة', preview:'معاينة',
    noRealReport:'لا يتم إرسال بلاغ حقيقي بعد.', earlyPrototype:'هذا نموذج أولي مبكر للمنتج.',
    nearTitle:'بالقرب مني', nearHelp:'في النسخة التجريبية ستُجلب هذه المعلومات من مصادر بيانات مفتوحة ورسمية.',
    roadwork:'أعمال طرق', roadworkText:'بيانات تجريبية: أعمال مخططة في المنطقة القريبة.',
    consultation:'مشاورة عامة', consultationText:'بيانات تجريبية: مقترح تخطيط مفتوح لإبداء الملاحظات.',
    air:'جودة الهواء', airText:'ستظهر هنا لاحقاً بيانات بيئية مفتوحة من مصدر رسمي.',
    demoLiveLater:'تجريبي — سيتم ربط مصدر مباشر لاحقاً', demo:'تجريبي',
    decisionsTitle:'القرارات',
    decisionsHelp:'يجب أن تستند الملخصات إلى المصادر وأن تفصل بوضوح بين الحقائق والمواقف السياسية.',
    nationalDecision:'قرار في البرلمان السويدي',
    nationalDecisionText:'سيظهر هنا ملخص قصير ومحايد مع رابط إلى الوثيقة الأصلية.',
    nationalDecisionSource:'تجريبي — سيتم البدء بواجهة Riksdagen',
    localDecision:'قرار محلي',
    localDecisionText:'سيتمكن المستخدم لاحقاً من رؤية قرارات البلدية التي تؤثر في المنطقة المختارة.'
  },
  so: {
    tagline:'Bulshada. Si fudud.', pilot:'TIJAABO', language:'Luqad',
    eyebrow:'Göteborg · nooc tijaabo hore', heroTitle:'Maxaad u baahan tahay in lagaa caawiyo?',
    heroText:'Hel jidka saxda ah ee adeegyada dadweynaha Sweden adigoon marka hore garanayn hay’adda masuulka ka ah.',
    status:'Adeeg bulsho oo furan · weli wax dacwad ama warbixin rasmi ah lama dirayo',
    responsibility:'Yaa mas’uul ka ah?', responsibilitySub:'Sharax dhibaatada, annaguna waxaan kaa caawinaynaa inaad hesho hay’adda saxda ah.',
    report:'Soo sheeg', reportSub:'Dhibaato waddo, nalal, deegaan ama goob dadweyne.',
    near:'Agteyda', nearSub:'Qorshayaal, carqalado iyo macluumaad bulsho oo kuu dhow.',
    decisions:'Go’aanno', decisionsSub:'Faham go’aannada oo mar walba u gudub isha asalka ah.',
    installTitle:'Ku dar Sverinav shaashadda guriga', installText:'Waxay u shaqaysaa sida app si toos ah browser-ka.', install:'Ku rakib',
    navHome:'Bogga hore', navNear:'Agteyda', navReport:'Soo sheeg', navDecisions:'Go’aanno', back:'← Bogga hore',
    responsibilityTitle:'Yaa mas’uul ka ah?',
    responsibilityHelp:'Dhibaatada ku sharax erayo caadi ah. Nooca dhabta ah jawaabta mar walba waa in lagu xaqiijiyaa il rasmi ah.',
    issuePlaceholder:'Tusaale: Waxaa waddada guriga hortiisa yaal biyo badan...',
    findResponsible:'Hel hay’adda mas’uulka ah',
    actorDefault:'Degmada ama maamulka waddada',
    reasonDefault:'Qiimeyn dhab ah waxay u baahan tahay in goobta iyo hay’adda mas’uulka ah laga hubiyo il rasmi ah.',
    actorHealth:'Gobolka / bixiyaha daryeelka caafimaadka', reasonHealth:'Daryeelka caafimaadku caadi ahaan waa mas’uuliyad gobol.',
    actorRail:'Trafikverket ama shirkadda tareenka', reasonRail:'Mas’uuliyaddu waxay ku xiran tahay in arrintu khusayso kaabayaasha ama adeegga gaadiidka.',
    actorWaste:'Degmada / shirkadda qashinka degmada', reasonWaste:'Qashinka guryaha badanaa waxaa maamula degmada.',
    actorRoad:'Maamulka waddada', reasonRoad:'Nooca xiga wuxuu adeegsan doonaa NVDB si loo ogaado in waddadu tahay dowladeed, degmo ama gaar loo leeyahay.',
    demoNotVerified:'TIJAABO — wax xaqiijin rasmi ah lama samayn.',
    reportTitle:'Soo sheeg',
    reportHelp:'Sverinav wuxuu kaa caawin doonaa ururinta xogta saxda ah kadibna wuxuu ku geyn doonaa hay’adda rasmiga ah ee ku habboon.',
    addPhoto:'Ku dar sawir (tijaabo)', place:'Goob ama cinwaan', reportPlaceholder:'Sharax dhibaatada', preview:'Horudhac',
    noRealReport:'Weli warbixin dhab ah lama dirayo.', earlyPrototype:'Kani waa nooc hore oo tijaabo ah.',
    nearTitle:'Agteyda', nearHelp:'Tijaabada, xogtan waxaa laga soo qaadi doonaa ilo furan oo rasmi ah.',
    roadwork:'Shaqo waddo', roadworkText:'Xog tijaabo ah: shaqo la qorsheeyay oo ka socota agagaarka.',
    consultation:'La-tashi dadweyne', consultationText:'Xog tijaabo ah: qorshe ayaa u furan fikrado iyo faallooyin.',
    air:'Tayada hawada', airText:'Xog deegaan oo furan oo rasmi ah ayaa halkan ka muuqan doonta mustaqbalka.',
    demoLiveLater:'Tijaabo — il toos ah ayaa lagu xiri doonaa dambe', demo:'Tijaabo',
    decisionsTitle:'Go’aanno',
    decisionsHelp:'Soo koobiddu waa inay ku salaysnaataa ilo oo ay si cad u kala saartaa xaqiiqooyinka iyo mowqifyada siyaasadeed.',
    nationalDecision:'Go’aan baarlamaanka Sweden',
    nationalDecisionText:'Halkan waxaa ka muuqan doona soo koobid gaaban oo dhexdhexaad ah iyo xiriir dukumentiga asalka ah.',
    nationalDecisionSource:'Tijaabo — Riksdagen API ayaa la qorsheeyay marka hore',
    localDecision:'Go’aan maxalli ah',
    localDecisionText:'Mustaqbalka isticmaaluhu wuxuu arki karaa go’aannada degmada ee saameeya aagga la doortay.'
  },
  fa: {
    tagline:'جامعه. ساده‌تر.', pilot:'آزمایشی', language:'زبان',
    eyebrow:'یوتبری · نمونه اولیه', heroTitle:'در چه موردی به کمک نیاز دارید؟',
    heroText:'بدون اینکه ابتدا ساختار سازمان‌های دولتی سوئد را بشناسید، مسیر درست را پیدا کنید.',
    status:'خدمت عمومی باز · هنوز هیچ درخواست رسمی واقعی ارسال نمی‌شود',
    responsibility:'چه کسی مسئول است؟', responsibilitySub:'مشکل را توضیح دهید تا به شما کمک کنیم نهاد مسئول را پیدا کنید.',
    report:'گزارش مشکل', reportSub:'مشکل در خیابان، روشنایی، محیط زیست یا فضای عمومی.',
    near:'اطراف من', nearSub:'طرح‌ها، اختلال‌ها و اطلاعات عمومی در نزدیکی شما.',
    decisions:'تصمیم‌ها', decisionsSub:'تصمیم‌ها را بهتر بفهمید و همیشه به منبع اصلی دسترسی داشته باشید.',
    installTitle:'Sverinav را به صفحه اصلی اضافه کنید', installText:'مستقیماً از مرورگر مانند یک اپ کار می‌کند.', install:'نصب',
    navHome:'خانه', navNear:'اطراف من', navReport:'گزارش', navDecisions:'تصمیم‌ها', back:'→ خانه',
    responsibilityTitle:'چه کسی مسئول است؟',
    responsibilityHelp:'مشکل را با زبان ساده توضیح دهید. در نسخه واقعی، پاسخ همیشه باید با منبع رسمی تأیید شود.',
    issuePlaceholder:'مثال: جلوی خانه روی جاده آب زیادی جمع شده است...',
    findResponsible:'پیدا کردن نهاد مسئول',
    actorDefault:'شهرداری یا مسئول نگهداری راه',
    reasonDefault:'برای ارزیابی واقعی باید مکان و نهاد مسئول با یک منبع رسمی بررسی شود.',
    actorHealth:'استان / ارائه‌دهنده خدمات درمانی', reasonHealth:'خدمات درمانی معمولاً در سطح منطقه‌ای اداره می‌شود.',
    actorRail:'Trafikverket یا شرکت بهره‌بردار قطار', reasonRail:'مسئولیت بستگی دارد به اینکه موضوع مربوط به زیرساخت باشد یا خود سرویس حمل‌ونقل.',
    actorWaste:'شهرداری / شرکت پسماند شهرداری', reasonWaste:'پسماند خانگی معمولاً در سطح شهرداری مدیریت می‌شود.',
    actorRoad:'مسئول نگهداری راه', reasonRoad:'نسخه بعدی از NVDB استفاده می‌کند تا مشخص شود راه دولتی، شهرداری یا خصوصی است.',
    demoNotVerified:'آزمایشی — هیچ بررسی رسمی انجام نشده است.',
    reportTitle:'گزارش مشکل',
    reportHelp:'Sverinav به شما کمک می‌کند اطلاعات لازم را جمع کنید و سپس به دریافت‌کننده رسمی درست هدایت شوید.',
    addPhoto:'افزودن عکس (آزمایشی)', place:'مکان یا نشانی', reportPlaceholder:'مشکل را توضیح دهید', preview:'پیش‌نمایش',
    noRealReport:'هنوز هیچ گزارش واقعی ارسال نمی‌شود.', earlyPrototype:'این یک نمونه اولیه محصول است.',
    nearTitle:'اطراف من', nearHelp:'در نسخه آزمایشی این اطلاعات از منابع داده باز و رسمی دریافت خواهد شد.',
    roadwork:'عملیات راه', roadworkText:'داده آزمایشی: عملیات برنامه‌ریزی‌شده در نزدیکی.',
    consultation:'مشورت عمومی', consultationText:'داده آزمایشی: یک پیشنهاد طرح برای دریافت نظرها باز است.',
    air:'کیفیت هوا', airText:'بعداً داده‌های محیط‌زیستی باز از منبع رسمی در اینجا نمایش داده می‌شود.',
    demoLiveLater:'آزمایشی — منبع زنده بعداً متصل می‌شود', demo:'آزمایشی',
    decisionsTitle:'تصمیم‌ها',
    decisionsHelp:'خلاصه‌ها باید مبتنی بر منبع باشند و واقعیت‌ها را به‌روشنی از مواضع سیاسی جدا کنند.',
    nationalDecision:'تصمیم در پارلمان سوئد',
    nationalDecisionText:'اینجا یک خلاصه کوتاه و بی‌طرفانه همراه با پیوند به سند اصلی نمایش داده خواهد شد.',
    nationalDecisionSource:'آزمایشی — ابتدا Riksdagen API برنامه‌ریزی شده است',
    localDecision:'تصمیم محلی',
    localDecisionText:'بعداً کاربر می‌تواند تصمیم‌های شهرداری را که بر منطقه انتخاب‌شده اثر می‌گذارند ببیند.'
  },
  fi: {
    tagline:'Yhteiskunta. Helpommin.', pilot:'PILOTTI', language:'Kieli',
    eyebrow:'Göteborg · varhainen prototyyppi', heroTitle:'Missä tarvitset apua?',
    heroText:'Löydä oikea reitti Ruotsin julkisissa palveluissa ilman että sinun täytyy ensin tuntea vastuussa oleva organisaatio.',
    status:'Avoin yhteiskuntapalvelu · oikeita viranomaisasioita ei vielä lähetetä',
    responsibility:'Kuka vastaa?', responsibilitySub:'Kuvaile ongelma, niin autamme löytämään oikean tahon.',
    report:'Ilmoita ongelmasta', reportSub:'Katuun, valaistukseen, ympäristöön tai julkiseen tilaan liittyvä ongelma.',
    near:'Lähellä minua', nearSub:'Suunnitelmat, häiriöt ja yhteiskuntatieto lähelläsi.',
    decisions:'Päätökset', decisionsSub:'Ymmärrä päätökset ja siirry aina alkuperäiseen lähteeseen.',
    installTitle:'Lisää Sverinav aloitusnäyttöön', installText:'Toimii sovelluksen tavoin suoraan selaimessa.', install:'Asenna',
    navHome:'Etusivu', navNear:'Lähellä', navReport:'Ilmoita', navDecisions:'Päätökset', back:'← Etusivu',
    responsibilityTitle:'Kuka vastaa?',
    responsibilityHelp:'Kuvaile ongelma tavallisilla sanoilla. Oikeassa versiossa vastaus tarkistetaan aina virallisesta lähteestä.',
    issuePlaceholder:'Esimerkki: Taloni edessä tiellä on suuri vesilammikko...',
    findResponsible:'Etsi vastuullinen taho',
    actorDefault:'Kunta tai tienpitäjä',
    reasonDefault:'Todellinen arvio edellyttää sijainnin ja vastuullisen tahon tarkistamista virallisesta lähteestä.',
    actorHealth:'Alue / terveydenhuollon palveluntuottaja', reasonHealth:'Terveydenhuolto on yleensä alueellinen vastuu.',
    actorRail:'Trafikverket tai junaliikenteen harjoittaja', reasonRail:'Vastuu riippuu siitä, koskeeko asia infrastruktuuria vai liikennepalvelua.',
    actorWaste:'Kunta / kunnallinen jäteyhtiö', reasonWaste:'Kotitalousjätteestä vastaa yleensä kunta.',
    actorRoad:'Tienpitäjä', reasonRoad:'Seuraava versio käyttää NVDB:tä selvittämään, onko tie valtion, kunnan vai yksityinen.',
    demoNotVerified:'DEMO — viranomaislähdettä ei ole tarkistettu.',
    reportTitle:'Ilmoita ongelmasta',
    reportHelp:'Sverinav auttaa kokoamaan oikeat tiedot ja ohjaa sen jälkeen oikealle viralliselle vastaanottajalle.',
    addPhoto:'Lisää kuva (demo)', place:'Paikka tai osoite', reportPlaceholder:'Kuvaile ongelma', preview:'Esikatselu',
    noRealReport:'Oikeaa vikailmoitusta ei vielä lähetetä.', earlyPrototype:'Tämä on varhainen tuoteprototyyppi.',
    nearTitle:'Lähellä minua', nearHelp:'Pilotissa tiedot haetaan avoimista ja virallisista tietolähteistä.',
    roadwork:'Tietyö', roadworkText:'Demodata: lähialueelle suunniteltu työ.',
    consultation:'Kuuleminen', consultationText:'Demodata: kaavaehdotus on avoinna kommenteille.',
    air:'Ilmanlaatu', airText:'Virallista avointa ympäristödataa näytetään tässä myöhemmin.',
    demoLiveLater:'Demo — reaaliaikainen lähde liitetään myöhemmin', demo:'Demo',
    decisionsTitle:'Päätökset',
    decisionsHelp:'Yhteenvetojen tulee perustua lähteisiin ja erottaa tosiasiat selvästi poliittisista kannoista.',
    nationalDecision:'Valtiopäivien päätös',
    nationalDecisionText:'Tähän tulee lyhyt ja neutraali yhteenveto sekä linkki alkuperäiseen asiakirjaan.',
    nationalDecisionSource:'Demo — Riksdagen API liitetään ensin',
    localDecision:'Paikallinen päätös',
    localDecisionText:'Myöhemmin käyttäjä voi nähdä valittua aluetta koskevia kunnallisia päätöksiä.'
  }
};

function detectInitialLanguage() {
  const saved = localStorage.getItem('sverinav-language');
  if (supportedLanguages.includes(saved)) return saved;
  const browser = (navigator.language || 'sv').toLowerCase().split('-')[0];
  return supportedLanguages.includes(browser) ? browser : 'sv';
}

let currentLanguage = detectInitialLanguage();

function t(key) {
  return messages[currentLanguage][key] || messages.sv[key] || key;
}

function applyLanguage(language) {
  currentLanguage = supportedLanguages.includes(language) ? language : 'sv';
  localStorage.setItem('sverinav-language', currentLanguage);
  languageSelect.value = currentLanguage;

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = rtlLanguages.has(currentLanguage) ? 'rtl' : 'ltr';

  document.getElementById('tagline').textContent = t('tagline');
  document.getElementById('pilotLabel').textContent = t('pilot');
  document.getElementById('languageLabel').textContent = t('language');
  document.getElementById('navHome').textContent = t('navHome');
  document.getElementById('navNear').textContent = t('navNear');
  document.getElementById('navReport').textContent = t('navReport');
  document.getElementById('navDecisions').textContent = t('navDecisions');
  document.getElementById('bottomNav').setAttribute('aria-label', t('language') === 'Språk' ? 'Huvudmeny' : 'Navigation');

  render(currentScreen, false);
}

function setNav(name) {
  document.querySelectorAll('.bottom-nav button').forEach(button => {
    button.classList.toggle('active', button.dataset.screen === name);
  });
}

function home() {
  view.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${t('eyebrow')}</p>
      <h1>${t('heroTitle')}</h1>
      <p>${t('heroText')}</p>
    </section>

    <section class="quick-status">
      <span class="status-dot"></span>
      <span>${t('status')}</span>
    </section>

    <section class="grid">
      <button class="card primary" data-screen="ansvar">
        <span class="icon">→</span>
        <strong>${t('responsibility')}</strong>
        <small>${t('responsibilitySub')}</small>
      </button>
      <button class="card" data-screen="rapportera">
        <span class="icon">!</span>
        <strong>${t('report')}</strong>
        <small>${t('reportSub')}</small>
      </button>
      <button class="card" data-screen="nara">
        <span class="icon">◎</span>
        <strong>${t('near')}</strong>
        <small>${t('nearSub')}</small>
      </button>
      <button class="card" data-screen="beslut">
        <span class="icon">§</span>
        <strong>${t('decisions')}</strong>
        <small>${t('decisionsSub')}</small>
      </button>
    </section>

    <section class="install-card" id="installCard">
      <div>
        <strong>${t('installTitle')}</strong>
        <p>${t('installText')}</p>
      </div>
      <button id="installButton" class="install-btn" ${deferredPrompt ? '' : 'hidden'}>${t('install')}</button>
    </section>
  `;
}

function shell(title, subtitle, body) {
  view.innerHTML = `<section class="screen">
    <button class="back" data-screen="home">${t('back')}</button>
    <h2>${title}</h2>
    <p class="muted">${subtitle}</p>
    ${body}
  </section>`;
}

function responsibilityScreen() {
  shell(
    t('responsibilityTitle'),
    t('responsibilityHelp'),
    `<textarea id="issue" class="textarea" placeholder="${t('issuePlaceholder')}"></textarea>
     <button id="findOwner" class="action">${t('findResponsible')}</button>
     <div id="ownerResult"></div>`
  );

  document.getElementById('findOwner').onclick = () => {
    const text = document.getElementById('issue').value.toLowerCase();
    let actor = t('actorDefault');
    let reason = t('reasonDefault');

    const healthWords = ['vård', 'sjukhus', 'vårdcentral', 'health', 'hospital', 'clinic', 'صحة', 'مستشفى', 'caafimaad', 'isbitaal', 'سلامت', 'بیمارستان', 'terveys', 'sairaala'];
    const railWords = ['tåg', 'järnväg', 'train', 'rail', 'قطار', 'tareen', 'راه‌آهن', 'juna', 'rautatie'];
    const wasteWords = ['sopor', 'avfall', 'waste', 'trash', 'نفايات', 'qashin', 'زباله', 'jäte'];
    const roadWords = ['väg', 'hål', 'gata', 'road', 'street', 'pothole', 'طريق', 'شارع', 'waddo', 'جاده', 'خیابان', 'tie', 'katu'];

    if (healthWords.some(word => text.includes(word))) {
      actor = t('actorHealth');
      reason = t('reasonHealth');
    } else if (railWords.some(word => text.includes(word))) {
      actor = t('actorRail');
      reason = t('reasonRail');
    } else if (wasteWords.some(word => text.includes(word))) {
      actor = t('actorWaste');
      reason = t('reasonWaste');
    } else if (roadWords.some(word => text.includes(word))) {
      actor = t('actorRoad');
      reason = t('reasonRoad');
    }

    document.getElementById('ownerResult').innerHTML =
      `<div class="result"><strong>${actor}</strong><p>${reason}</p><div class="source">${t('demoNotVerified')}</div></div>`;
  };
}

function reportScreen() {
  shell(
    t('reportTitle'),
    t('reportHelp'),
    `<label class="file-label" for="photo">${t('addPhoto')}</label>
     <input id="photo" type="file" accept="image/*">
     <input class="input" placeholder="${t('place')}">
     <textarea class="textarea" placeholder="${t('reportPlaceholder')}"></textarea>
     <button class="action">${t('preview')}</button>
     <div class="result"><strong>${t('noRealReport')}</strong><p>${t('earlyPrototype')}</p></div>`
  );
}

function nearbyItems() {
  return [
    { title:t('roadwork'), text:t('roadworkText'), source:t('demoLiveLater') },
    { title:t('consultation'), text:t('consultationText'), source:t('demoLiveLater') },
    { title:t('air'), text:t('airText'), source:t('demo') }
  ];
}

function decisionItems() {
  return [
    { title:t('nationalDecision'), text:t('nationalDecisionText'), source:t('nationalDecisionSource') },
    { title:t('localDecision'), text:t('localDecisionText'), source:t('demo') }
  ];
}

function listScreen(title, subtitle, items) {
  shell(
    title,
    subtitle,
    `<div class="list">${items.map(item =>
      `<div class="item"><strong>${item.title}</strong><small>${item.text}</small><div class="source">${item.source}</div></div>`
    ).join('')}</div>`
  );
}

function render(screen, updateState = true) {
  if (updateState) currentScreen = screen;
  setNav(screen);

  if (screen === 'home') return home();
  if (screen === 'ansvar') return responsibilityScreen();
  if (screen === 'rapportera') return reportScreen();
  if (screen === 'nara') return listScreen(t('nearTitle'), t('nearHelp'), nearbyItems());
  if (screen === 'beslut') return listScreen(t('decisionsTitle'), t('decisionsHelp'), decisionItems());
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  if (currentScreen === 'home') render('home', false);
});

document.addEventListener('click', async event => {
  if (event.target.id === 'installButton' && deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    render('home', false);
    return;
  }

  const target = event.target.closest('[data-screen]');
  if (target) render(target.dataset.screen);
});

languageSelect.addEventListener('change', event => {
  applyLanguage(event.target.value);
});

applyLanguage(currentLanguage);
