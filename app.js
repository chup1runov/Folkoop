const view = document.getElementById('view');
const languageButton = document.getElementById('languageButton');
const languageCode = document.getElementById('languageCode');
const languageSheet = document.getElementById('languageSheet');
const languageOptions = document.getElementById('languageOptions');
const closeLanguageButton = document.getElementById('closeLanguageButton');
const languageBackdrop = document.getElementById('languageBackdrop');
let deferredPrompt;
let currentScreen = 'home';

const supportedLanguages = ['sv', 'en', 'ar', 'so', 'fa', 'fi', 'bs', 'ku', 'es', 'ru', 'uk'];
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
  },
  bs: {
    tagline:'Društvo. Jednostavnije.', pilot:'PILOT', language:'Jezik',
    eyebrow:'Göteborg · rani prototip', heroTitle:'Kako vam možemo pomoći?',
    heroText:'Pronađite pravi put kroz švedske javne službe bez potrebe da unaprijed znate koja je institucija nadležna.',
    status:'Otvorena društvena usluga · stvarni službeni predmeti se još ne šalju',
    responsibility:'Ko je nadležan?', responsibilitySub:'Opišite problem i pomoći ćemo vam da pronađete nadležnu instituciju.',
    report:'Prijavi problem', reportSub:'Problem s ulicom, rasvjetom, okolišem ili javnim prostorom.',
    near:'U blizini', nearSub:'Planovi, smetnje i društvene informacije u vašoj blizini.',
    decisions:'Odluke', decisionsSub:'Razumijte odluke i uvijek otvorite izvorni službeni izvor.',
    installTitle:'Dodajte Sverinav na početni ekran', installText:'Radi kao aplikacija direktno iz preglednika.', install:'Instaliraj',
    navHome:'Početna', navNear:'U blizini', navReport:'Prijavi', navDecisions:'Odluke', back:'← Početna',
    responsibilityTitle:'Ko je nadležan?',
    responsibilityHelp:'Opišite problem običnim riječima. U stvarnoj verziji odgovor će se uvijek provjeravati prema službenom izvoru.',
    issuePlaceholder:'Primjer: Na cesti ispred kuće nalazi se velika lokva vode...',
    findResponsible:'Pronađi nadležnu instituciju',
    actorDefault:'Općina/grad ili upravitelj ceste',
    reasonDefault:'Za stvarnu procjenu potrebno je provjeriti lokaciju i nadležnu instituciju prema službenom izvoru.',
    actorHealth:'Regija / pružatelj zdravstvene zaštite', reasonHealth:'Zdravstvena zaštita je u pravilu regionalna odgovornost.',
    actorRail:'Trafikverket ili željeznički prijevoznik', reasonRail:'Nadležnost ovisi o tome odnosi li se problem na infrastrukturu ili uslugu prijevoza.',
    actorWaste:'Općina/grad ili komunalno poduzeće za otpad', reasonWaste:'Kućni otpad u pravilu je odgovornost općine/grada.',
    actorRoad:'Upravitelj ceste', reasonRoad:'Sljedeća verzija koristit će NVDB kako bi utvrdila je li cesta državna, općinska ili privatna.',
    demoNotVerified:'DEMO — nije izvršena službena provjera.',
    reportTitle:'Prijavi problem',
    reportHelp:'Sverinav će vam pomoći prikupiti potrebne podatke i zatim vas usmjeriti pravom službenom primatelju.',
    addPhoto:'Dodaj fotografiju (demo)', place:'Lokacija ili adresa', reportPlaceholder:'Opišite problem', preview:'Pregled',
    noRealReport:'Stvarna prijava još se ne šalje.', earlyPrototype:'Ovo je rani prototip proizvoda.',
    nearTitle:'U blizini', nearHelp:'U pilot-verziji podaci će se preuzimati iz otvorenih i službenih izvora.',
    roadwork:'Radovi na cesti', roadworkText:'Demo podaci: planirani radovi u blizini.',
    consultation:'Javno savjetovanje', consultationText:'Demo podaci: planski prijedlog otvoren je za komentare.',
    air:'Kvaliteta zraka', airText:'Ovdje će se kasnije prikazivati službeni otvoreni podaci o okolišu.',
    demoLiveLater:'Demo — izvor uživo bit će povezan kasnije', demo:'Demo',
    decisionsTitle:'Odluke',
    decisionsHelp:'Sažeci trebaju imati izvore i jasno odvajati činjenice od političkih stavova.',
    nationalDecision:'Odluka u Riksdagu',
    nationalDecisionText:'Ovdje će biti kratak i neutralan sažetak s poveznicom na izvorni dokument.',
    nationalDecisionSource:'Demo — prvo je planiran Riksdagen API',
    localDecision:'Lokalna odluka',
    localDecisionText:'Kasnije će korisnik moći vidjeti odluke općine/grada koje se odnose na odabrano područje.'
  },
  ku: {
    tagline:'Civak. Hêsantir.', pilot:'PÎLOT', language:'Ziman',
    eyebrow:'Göteborg · prototîpa destpêkê', heroTitle:'Hûn di çi mijarê de alîkariyê dixwazin?',
    heroText:'Bê ku pêşî hûn sazûmana berpirsiyar nas bikin, di xizmetên giştî yên Swêdê de rêya rast bibînin.',
    status:'Xizmeta civakî ya vekirî · hêj daxwazên fermî yên rast nayên şandin',
    responsibility:'Kî berpirsiyar e?', responsibilitySub:'Pirsgirêkê rave bikin, em ê alîkariya we bikin ku saziya berpirsiyar bibînin.',
    report:'Raport bike', reportSub:'Pirsgirêka rê, ronahî, jîngeh an cihê giştî.',
    near:'Li nêzî min', nearSub:'Plan, asteng û agahiyên civakî yên li nêzî we.',
    decisions:'Biryar', decisionsSub:'Biryarên giştî fam bikin û her dem biçin çavkaniya orîjînal.',
    installTitle:'Sverinav li ekrana destpêkê zêde bikin', installText:'Rasterast ji gerokê wekî sepan dixebite.', install:'Saz bike',
    navHome:'Destpêk', navNear:'Nêzî', navReport:'Raport', navDecisions:'Biryar', back:'← Destpêk',
    responsibilityTitle:'Kî berpirsiyar e?',
    responsibilityHelp:'Pirsgirêkê bi peyvên hêsan rave bikin. Di guhertoya rast de divê bersiv her dem bi çavkaniyek fermî were piştrastkirin.',
    issuePlaceholder:'Mînak: Li ser rêya li ber malê gelek av kom bûye...',
    findResponsible:'Saziya berpirsiyar bibîne',
    actorDefault:'Şaredarî an berpirsiyarê rê',
    reasonDefault:'Ji bo nirxandineke rast, divê cih û saziya berpirsiyar bi çavkaniyek fermî bêne kontrolkirin.',
    actorHealth:'Herêm / peydakirê xizmeta tenduristiyê', reasonHealth:'Xizmeta tenduristiyê bi gelemperî berpirsiyariya herêmî ye.',
    actorRail:'Trafikverket an operatorê trênê', reasonRail:'Berpirsiyarî girêdayî ye ku pirsgirêk derbarê binesaziyê ye an xizmeta veguhestinê.',
    actorWaste:'Şaredarî / pargîdaniya çopê ya şaredariyê', reasonWaste:'Çopa malan bi gelemperî ji aliyê şaredariyê ve tê birêvebirin.',
    actorRoad:'Berpirsiyarê rê', reasonRoad:'Guhertoya din dê NVDB bikar bîne da ku diyar bike rê dewletî, şaredarî an taybet e.',
    demoNotVerified:'DEMO — kontrola fermî nehatiye kirin.',
    reportTitle:'Raport bike',
    reportHelp:'Sverinav dê alîkariya we bike ku agahiyên rast berhev bikin û paşê we ber bi wergirê fermî yê rast ve bibe.',
    addPhoto:'Wêne zêde bike (demo)', place:'Cih an navnîşan', reportPlaceholder:'Pirsgirêkê rave bikin', preview:'Pêşdîtin',
    noRealReport:'Hêj raporteke rast nayê şandin.', earlyPrototype:'Ev prototîpeke destpêkê ya hilberê ye.',
    nearTitle:'Li nêzî min', nearHelp:'Di pîlotê de ev agahî dê ji çavkaniyên vekirî û fermî werin girtin.',
    roadwork:'Karê rê', roadworkText:'Daneyên demo: karê plansazkirî li nêzî.',
    consultation:'Şêwirmendiya giştî', consultationText:'Daneyên demo: pêşniyarek planê ji bo nerînan vekirî ye.',
    air:'Kalîteya hewayê', airText:'Daneyên vekirî yên jîngehê ji çavkaniya fermî dê paşê li vir xuya bibin.',
    demoLiveLater:'Demo — çavkaniya zindî paşê tê girêdan', demo:'Demo',
    decisionsTitle:'Biryar',
    decisionsHelp:'Kurte divê li ser çavkaniyan bin û rastiyan ji helwestên siyasî bi eşkere veqetînin.',
    nationalDecision:'Biryar li Riksdagê',
    nationalDecisionText:'Li vir kurteyek kurt û bêalî bi girêdana belgeya orîjînal dê xuya bibe.',
    nationalDecisionSource:'Demo — Riksdagen API pêşî tê plansazkirin',
    localDecision:'Biryarê herêmî',
    localDecisionText:'Paşê bikarhêner dikare biryarên şaredariyê yên ku bandorê li herêma hilbijartî dikin bibîne.'
  },
  es: {
    tagline:'La sociedad. Más fácil.', pilot:'PILOTO', language:'Idioma',
    eyebrow:'Gotemburgo · prototipo inicial', heroTitle:'¿En qué necesitas ayuda?',
    heroText:'Encuentra el camino correcto por los servicios públicos de Suecia sin tener que saber de antemano qué organismo es responsable.',
    status:'Servicio cívico abierto · todavía no se envían trámites oficiales reales',
    responsibility:'¿Quién es responsable?', responsibilitySub:'Describe el problema y te ayudaremos a encontrar el organismo adecuado.',
    report:'Reportar', reportSub:'Problemas con calles, iluminación, medioambiente o espacios públicos.',
    near:'Cerca de mí', nearSub:'Planes, incidencias e información pública cerca de ti.',
    decisions:'Decisiones', decisionsSub:'Comprende las decisiones públicas y accede siempre a la fuente original.',
    installTitle:'Añade Sverinav a la pantalla de inicio', installText:'Funciona como una app directamente desde el navegador.', install:'Instalar',
    navHome:'Inicio', navNear:'Cerca', navReport:'Reportar', navDecisions:'Decisiones', back:'← Inicio',
    responsibilityTitle:'¿Quién es responsable?',
    responsibilityHelp:'Describe el problema con palabras normales. En la versión real, la respuesta deberá verificarse siempre con una fuente oficial.',
    issuePlaceholder:'Ejemplo: Hay una gran acumulación de agua en la carretera frente a mi casa...',
    findResponsible:'Buscar organismo responsable',
    actorDefault:'El municipio o la autoridad responsable de la vía',
    reasonDefault:'Para una evaluación real hay que comprobar la ubicación y el organismo responsable con una fuente oficial.',
    actorHealth:'La región / proveedor sanitario', reasonHealth:'La atención sanitaria suele ser una responsabilidad regional.',
    actorRail:'Trafikverket o el operador ferroviario', reasonRail:'La responsabilidad depende de si el problema afecta a la infraestructura o al servicio de transporte.',
    actorWaste:'El municipio / empresa municipal de residuos', reasonWaste:'Los residuos domésticos suelen gestionarse a nivel municipal.',
    actorRoad:'La autoridad responsable de la vía', reasonRoad:'La próxima versión utilizará NVDB para determinar si la vía es estatal, municipal o privada.',
    demoNotVerified:'DEMO — no se ha realizado ninguna comprobación oficial.',
    reportTitle:'Reportar',
    reportHelp:'Sverinav te ayudará a reunir la información correcta y después te dirigirá al destinatario oficial adecuado.',
    addPhoto:'Añadir foto (demo)', place:'Lugar o dirección', reportPlaceholder:'Describe el problema', preview:'Vista previa',
    noRealReport:'Todavía no se envía ningún reporte real.', earlyPrototype:'Este es un prototipo inicial del producto.',
    nearTitle:'Cerca de mí', nearHelp:'En el piloto, esta información se obtendrá de fuentes de datos abiertas y oficiales.',
    roadwork:'Obras viales', roadworkText:'Datos de demostración: obras previstas en la zona.',
    consultation:'Consulta pública', consultationText:'Datos de demostración: una propuesta de planificación está abierta a comentarios.',
    air:'Calidad del aire', airText:'Más adelante se mostrarán aquí datos ambientales abiertos de una fuente oficial.',
    demoLiveLater:'Demo — la fuente en vivo se conectará más adelante', demo:'Demo',
    decisionsTitle:'Decisiones',
    decisionsHelp:'Los resúmenes deben basarse en fuentes y separar claramente los hechos de las posiciones políticas.',
    nationalDecision:'Decisión del Riksdag',
    nationalDecisionText:'Aquí aparecerá un resumen breve y neutral con un enlace al documento original.',
    nationalDecisionSource:'Demo — primero se conectará la API del Riksdag',
    localDecision:'Decisión local',
    localDecisionText:'Más adelante se podrán ver las decisiones municipales que afectan a la zona seleccionada.'
  },
  ru: {
    tagline:'Общество. Проще.', pilot:'ПИЛОТ', language:'Язык',
    eyebrow:'Гётеборг · ранний прототип', heroTitle:'С чем вам нужна помощь?',
    heroText:'Найдите нужный путь в системе государственных и муниципальных услуг Швеции, не разбираясь заранее, кто именно отвечает за вопрос.',
    status:'Открытый общественный сервис · реальные обращения пока не отправляются',
    responsibility:'Кто отвечает?', responsibilitySub:'Опишите проблему, и мы поможем найти ответственную организацию.',
    report:'Сообщить о проблеме', reportSub:'Проблемы с дорогами, освещением, окружающей средой или общественными местами.',
    near:'Рядом со мной', nearSub:'Планы, нарушения и общественная информация поблизости.',
    decisions:'Решения', decisionsSub:'Понимайте решения и всегда переходите к первоисточнику.',
    installTitle:'Добавить Sverinav на главный экран', installText:'Работает как приложение прямо из браузера.', install:'Установить',
    navHome:'Главная', navNear:'Рядом', navReport:'Сообщить', navDecisions:'Решения', back:'← Главная',
    responsibilityTitle:'Кто отвечает?',
    responsibilityHelp:'Опишите проблему обычными словами. В реальной версии ответ всегда должен проверяться по официальному источнику.',
    issuePlaceholder:'Например: на дороге перед домом образовалась большая лужа...',
    findResponsible:'Найти ответственную организацию',
    actorDefault:'Муниципалитет или организация, отвечающая за дорогу',
    reasonDefault:'Для реального ответа нужно проверить местоположение и ответственную организацию по официальному источнику.',
    actorHealth:'Регион / поставщик медицинских услуг', reasonHealth:'Здравоохранение в Швеции обычно относится к ответственности региона.',
    actorRail:'Trafikverket или железнодорожный оператор', reasonRail:'Ответственность зависит от того, относится ли вопрос к инфраструктуре или к транспортной услуге.',
    actorWaste:'Муниципалитет / муниципальная компания по отходам', reasonWaste:'Бытовые отходы обычно относятся к ответственности муниципалитета.',
    actorRoad:'Организация, отвечающая за дорогу', reasonRoad:'Следующая версия будет использовать NVDB, чтобы определить, является дорога государственной, муниципальной или частной.',
    demoNotVerified:'ДЕМО — официальная проверка не выполнялась.',
    reportTitle:'Сообщить о проблеме',
    reportHelp:'Sverinav поможет собрать нужную информацию, а затем направит к правильному официальному получателю.',
    addPhoto:'Добавить фото (демо)', place:'Место или адрес', reportPlaceholder:'Опишите проблему', preview:'Предпросмотр',
    noRealReport:'Реальное сообщение пока не отправляется.', earlyPrototype:'Это ранний прототип продукта.',
    nearTitle:'Рядом со мной', nearHelp:'В пилотной версии эти данные будут поступать из открытых официальных источников.',
    roadwork:'Дорожные работы', roadworkText:'Демо-данные: поблизости запланированы дорожные работы.',
    consultation:'Общественное обсуждение', consultationText:'Демо-данные: предложение по планированию открыто для комментариев.',
    air:'Качество воздуха', airText:'Позже здесь будут отображаться открытые экологические данные из официального источника.',
    demoLiveLater:'Демо — живой источник будет подключён позже', demo:'Демо',
    decisionsTitle:'Решения',
    decisionsHelp:'Краткие объяснения должны опираться на источники и чётко отделять факты от политических позиций.',
    nationalDecision:'Решение Риксдага',
    nationalDecisionText:'Здесь появится краткое нейтральное объяснение со ссылкой на оригинальный документ.',
    nationalDecisionSource:'Демо — первым планируется API Риксдага',
    localDecision:'Местное решение',
    localDecisionText:'Позже пользователь сможет видеть муниципальные решения, которые затрагивают выбранную территорию.'
  },
  uk: {
    tagline:'Суспільство. Простіше.', pilot:'ПІЛОТ', language:'Мова',
    eyebrow:'Гетеборг · ранній прототип', heroTitle:'З чим вам потрібна допомога?',
    heroText:'Знайдіть правильний шлях у системі державних і муніципальних послуг Швеції, не з’ясовуючи заздалегідь, яка саме установа відповідає за питання.',
    status:'Відкритий суспільний сервіс · реальні офіційні звернення поки не надсилаються',
    responsibility:'Хто відповідає?', responsibilitySub:'Опишіть проблему, і ми допоможемо знайти відповідальну установу.',
    report:'Повідомити про проблему', reportSub:'Проблеми з дорогами, освітленням, довкіллям або громадськими місцями.',
    near:'Поруч зі мною', nearSub:'Плани, порушення та суспільна інформація поблизу.',
    decisions:'Рішення', decisionsSub:'Розумійте рішення та завжди переходьте до першоджерела.',
    installTitle:'Додати Sverinav на головний екран', installText:'Працює як застосунок безпосередньо з браузера.', install:'Встановити',
    navHome:'Головна', navNear:'Поруч', navReport:'Повідомити', navDecisions:'Рішення', back:'← Головна',
    responsibilityTitle:'Хто відповідає?',
    responsibilityHelp:'Опишіть проблему звичайними словами. У реальній версії відповідь завжди має перевірятися за офіційним джерелом.',
    issuePlaceholder:'Наприклад: на дорозі перед будинком утворилася велика калюжа...',
    findResponsible:'Знайти відповідальну установу',
    actorDefault:'Муніципалітет або організація, відповідальна за дорогу',
    reasonDefault:'Для реальної оцінки потрібно перевірити місце та відповідальну установу за офіційним джерелом.',
    actorHealth:'Регіон / надавач медичних послуг', reasonHealth:'Охорона здоров’я у Швеції зазвичай є відповідальністю регіону.',
    actorRail:'Trafikverket або залізничний оператор', reasonRail:'Відповідальність залежить від того, чи стосується питання інфраструктури або транспортної послуги.',
    actorWaste:'Муніципалітет / муніципальна компанія з відходів', reasonWaste:'Побутові відходи зазвичай належать до відповідальності муніципалітету.',
    actorRoad:'Організація, відповідальна за дорогу', reasonRoad:'Наступна версія використовуватиме NVDB, щоб визначити, чи є дорога державною, муніципальною або приватною.',
    demoNotVerified:'ДЕМО — офіційна перевірка не виконувалася.',
    reportTitle:'Повідомити про проблему',
    reportHelp:'Sverinav допоможе зібрати потрібну інформацію, а потім спрямує до правильного офіційного отримувача.',
    addPhoto:'Додати фото (демо)', place:'Місце або адреса', reportPlaceholder:'Опишіть проблему', preview:'Попередній перегляд',
    noRealReport:'Реальне повідомлення поки не надсилається.', earlyPrototype:'Це ранній прототип продукту.',
    nearTitle:'Поруч зі мною', nearHelp:'У пілотній версії ці дані надходитимуть із відкритих офіційних джерел.',
    roadwork:'Дорожні роботи', roadworkText:'Демо-дані: поблизу заплановані дорожні роботи.',
    consultation:'Громадське обговорення', consultationText:'Демо-дані: пропозиція щодо планування відкрита для коментарів.',
    air:'Якість повітря', airText:'Пізніше тут відображатимуться відкриті екологічні дані з офіційного джерела.',
    demoLiveLater:'Демо — живе джерело буде підключено пізніше', demo:'Демо',
    decisionsTitle:'Рішення',
    decisionsHelp:'Короткі пояснення мають спиратися на джерела та чітко відокремлювати факти від політичних позицій.',
    nationalDecision:'Рішення Риксдагу',
    nationalDecisionText:'Тут з’явиться коротке нейтральне пояснення з посиланням на оригінальний документ.',
    nationalDecisionSource:'Демо — першим планується API Риксдагу',
    localDecision:'Місцеве рішення',
    localDecisionText:'Пізніше користувач зможе бачити муніципальні рішення, що стосуються вибраної території.'
  }
};

const roadMessages = {
  sv: {
    verify:'Kontrollera väghållare vid min position',
    privacy:'Positionen används bara för denna kontroll och sparas inte.',
    locating:'Hämtar position…',
    checking:'Kontrollerar NVDB…',
    state:'Statlig väg', municipal:'Kommunal väg', private:'Enskild väg',
    responsible:'Ansvarig väghållare',
    source:'Trafikverket / NVDB NetInfo',
    sourceLink:'Om väghållaransvar',
    mapLink:'Kontrollera på NVDB-kartan',
    reportLink:'Öppna officiell felanmälan',
    verified:'Kontrollerat mot aktuell NVDB-data',
    distance:'Avstånd till väg', accuracy:'Platsnoggrannhet',
    ambiguous:'Flera vägar med olika väghållare ligger mycket nära punkten. Resultatet bör kontrolleras på NVDB-kartan.',
    inaccurate:'Din platsnoggrannhet är låg. Kontrollera resultatet på kartan innan du skickar en felanmälan.',
    noRoad:'Ingen säker väg hittades nära din position. Flytta närmare vägen och försök igen.',
    denied:'Sverinav fick inte tillgång till din position.',
    unavailable:'Positionen kunde inte bestämmas.',
    serviceError:'NVDB kunde inte kontrolleras just nu. Försök igen senare.',
    stateExplain:'Trafikverket ansvarar för den här statliga vägsträckan.',
    municipalExplain:'Kommunen ansvarar för den här vägsträckan.',
    privateExplain:'Enskilda vägar förvaltas normalt av en vägförening, samfällighetsförening eller enskild fastighetsägare.'
  },
  en: {
    verify:'Check road owner at my location',
    privacy:'Your location is used only for this check and is not stored.',
    locating:'Getting location…', checking:'Checking NVDB…',
    state:'State road', municipal:'Municipal road', private:'Private road',
    responsible:'Responsible road authority', source:'Trafikverket / NVDB NetInfo',
    sourceLink:'About road responsibility', mapLink:'Check on the NVDB map', reportLink:'Open official fault report',
    verified:'Checked against current NVDB data', distance:'Distance to road', accuracy:'Location accuracy',
    ambiguous:'Roads with different owners are very close to this point. Verify the result on the NVDB map.',
    inaccurate:'Your location accuracy is low. Verify the result on the map before reporting.',
    noRoad:'No reliable road match was found nearby. Move closer to the road and try again.',
    denied:'Sverinav was not allowed to access your location.', unavailable:'Your location could not be determined.',
    serviceError:'NVDB could not be checked right now. Try again later.',
    stateExplain:'Trafikverket is responsible for this state road section.',
    municipalExplain:'The municipality is responsible for this road section.',
    privateExplain:'Private roads are normally managed by a road association, joint property association or private property owner.'
  },
  ar:{verify:'تحقق من مسؤول الطريق في موقعي',privacy:'يُستخدم موقعك لهذا التحقق فقط ولا يتم حفظه.',locating:'جارٍ تحديد الموقع…',checking:'جارٍ التحقق من NVDB…',state:'طريق حكومي',municipal:'طريق بلدي',private:'طريق خاص',responsible:'الجهة المسؤولة عن الطريق',source:'Trafikverket / NVDB NetInfo',sourceLink:'حول مسؤولية الطرق',mapLink:'تحقق على خريطة NVDB',reportLink:'افتح البلاغ الرسمي',verified:'تم التحقق من بيانات NVDB الحالية',distance:'المسافة إلى الطريق',accuracy:'دقة الموقع',ambiguous:'توجد طرق بجهات مسؤولة مختلفة قريبة جدًا من هذه النقطة. تحقق من النتيجة على خريطة NVDB.',inaccurate:'دقة موقعك منخفضة. تحقق من النتيجة على الخريطة قبل الإبلاغ.',noRoad:'لم يتم العثور على طريق موثوق قريب. اقترب من الطريق وحاول مجددًا.',denied:'لم يُسمح لـ Sverinav بالوصول إلى موقعك.',unavailable:'تعذر تحديد موقعك.',serviceError:'تعذر التحقق من NVDB الآن. حاول لاحقًا.',stateExplain:'Trafikverket مسؤول عن هذا الجزء من الطريق الحكومي.',municipalExplain:'البلدية مسؤولة عن هذا الجزء من الطريق.',privateExplain:'تُدار الطرق الخاصة عادةً بواسطة جمعية طرق أو جمعية ملكية مشتركة أو مالك عقار خاص.'},
  so:{verify:'Hubi cidda waddada ka masuulka ah meesha aan joogo',privacy:'Goobtaada waxaa loo adeegsadaa kaliya hubintan mana la kaydiyo.',locating:'Goobta ayaa la helayaa…',checking:'NVDB ayaa la hubinayaa…',state:'Waddo qaran',municipal:'Waddo degmo',private:'Waddo gaar loo leeyahay',responsible:'Masuulka waddada',source:'Trafikverket / NVDB NetInfo',sourceLink:'Masuuliyadda waddooyinka',mapLink:'Ka hubi khariidadda NVDB',reportLink:'Fur warbixinta rasmiga ah',verified:'Waxaa lagu hubiyey xogta NVDB ee hadda',distance:'Masaafada waddada',accuracy:'Saxnaanta goobta',ambiguous:'Waddooyin ay masuuliyiin kala duwan leeyihiin ayaa aad ugu dhow goobtan. Ka hubi khariidadda NVDB.',inaccurate:'Saxnaanta goobtaadu way hooseysaa. Ka hubi khariidadda ka hor intaadan warbixin dirin.',noRoad:'Waddo la hubo lagama helin meel dhow. U dhowow waddada oo mar kale isku day.',denied:'Sverinav looma oggolaan goobtaada.',unavailable:'Goobtaada lama go’aamin karin.',serviceError:'NVDB hadda lama hubin karo. Mar dambe isku day.',stateExplain:'Trafikverket ayaa masuul ka ah qaybtan waddada qaranka.',municipalExplain:'Degmada ayaa masuul ka ah qaybtan waddada.',privateExplain:'Waddooyinka gaarka ah badanaa waxaa maamula urur waddo, samfällighet ama milkiile gaar ah.'},
  fa:{verify:'مسئول راه را در موقعیت من بررسی کن',privacy:'موقعیت شما فقط برای این بررسی استفاده می‌شود و ذخیره نمی‌شود.',locating:'در حال دریافت موقعیت…',checking:'در حال بررسی NVDB…',state:'راه دولتی',municipal:'راه شهرداری',private:'راه خصوصی',responsible:'مسئول نگهداری راه',source:'Trafikverket / NVDB NetInfo',sourceLink:'درباره مسئولیت راه',mapLink:'بررسی در نقشه NVDB',reportLink:'باز کردن گزارش رسمی',verified:'با داده‌های فعلی NVDB بررسی شد',distance:'فاصله تا راه',accuracy:'دقت موقعیت',ambiguous:'چند راه با مسئولان متفاوت بسیار نزدیک این نقطه هستند. نتیجه را در نقشه NVDB بررسی کنید.',inaccurate:'دقت موقعیت پایین است. پیش از گزارش، نتیجه را در نقشه بررسی کنید.',noRoad:'راه مطمئنی در نزدیکی پیدا نشد. به راه نزدیک‌تر شوید و دوباره امتحان کنید.',denied:'اجازه دسترسی به موقعیت به Sverinav داده نشد.',unavailable:'موقعیت قابل تعیین نبود.',serviceError:'NVDB فعلاً قابل بررسی نیست. بعداً دوباره تلاش کنید.',stateExplain:'Trafikverket مسئول این بخش از راه دولتی است.',municipalExplain:'شهرداری مسئول این بخش از راه است.',privateExplain:'راه‌های خصوصی معمولاً توسط انجمن راه، samfällighet یا مالک خصوصی اداره می‌شوند.'},
  fi:{verify:'Tarkista tienpitäjä sijainnistani',privacy:'Sijaintia käytetään vain tähän tarkistukseen eikä sitä tallenneta.',locating:'Haetaan sijaintia…',checking:'Tarkistetaan NVDB:tä…',state:'Valtion tie',municipal:'Kunnallinen tie',private:'Yksityistie',responsible:'Tienpitäjä',source:'Trafikverket / NVDB NetInfo',sourceLink:'Tienpitovastuusta',mapLink:'Tarkista NVDB-kartalta',reportLink:'Avaa virallinen vikailmoitus',verified:'Tarkistettu ajantasaisesta NVDB-datasta',distance:'Etäisyys tiehen',accuracy:'Sijainnin tarkkuus',ambiguous:'Pisteen lähellä on eri tienpitäjien teitä. Tarkista tulos NVDB-kartalta.',inaccurate:'Sijainnin tarkkuus on heikko. Tarkista tulos kartalta ennen ilmoitusta.',noRoad:'Läheltä ei löytynyt varmaa tieosuutta. Siirry lähemmäs tietä ja yritä uudelleen.',denied:'Sverinav ei saanut käyttää sijaintiasi.',unavailable:'Sijaintia ei voitu määrittää.',serviceError:'NVDB:tä ei voitu tarkistaa juuri nyt. Yritä myöhemmin.',stateExplain:'Trafikverket vastaa tästä valtion tieosuudesta.',municipalExplain:'Kunta vastaa tästä tieosuudesta.',privateExplain:'Yksityisteitä hallinnoi yleensä tiekunta, yhteisomistusalue tai yksityinen maanomistaja.'},
  bs:{verify:'Provjeri upravljača ceste na mojoj lokaciji',privacy:'Lokacija se koristi samo za ovu provjeru i ne čuva se.',locating:'Dohvaćam lokaciju…',checking:'Provjeravam NVDB…',state:'Državna cesta',municipal:'Općinska cesta',private:'Privatna cesta',responsible:'Odgovorni upravljač ceste',source:'Trafikverket / NVDB NetInfo',sourceLink:'O odgovornosti za ceste',mapLink:'Provjeri na NVDB karti',reportLink:'Otvori službenu prijavu',verified:'Provjereno prema aktualnim NVDB podacima',distance:'Udaljenost do ceste',accuracy:'Preciznost lokacije',ambiguous:'Vrlo blizu ove tačke nalaze se ceste s različitim upravljačima. Provjeri rezultat na NVDB karti.',inaccurate:'Preciznost lokacije je niska. Provjeri rezultat na karti prije prijave.',noRoad:'U blizini nije pronađena pouzdana cesta. Priđi bliže cesti i pokušaj ponovno.',denied:'Sverinav nije dobio pristup tvojoj lokaciji.',unavailable:'Lokacija se nije mogla odrediti.',serviceError:'NVDB se trenutno ne može provjeriti. Pokušaj kasnije.',stateExplain:'Trafikverket je odgovoran za ovu državnu dionicu.',municipalExplain:'Općina je odgovorna za ovu dionicu.',privateExplain:'Privatnim cestama obično upravlja cestovna udruga, zajednica ili privatni vlasnik.'},
  ku:{verify:'Berpirsiyarê rê li cihê min kontrol bike',privacy:'Cihê te tenê ji bo vê kontrolê tê bikaranîn û nayê hilanîn.',locating:'Cih tê dîtin…',checking:'NVDB tê kontrolkirin…',state:'Rêya dewletê',municipal:'Rêya şaredariyê',private:'Rêya taybet',responsible:'Berpirsiyarê rê',source:'Trafikverket / NVDB NetInfo',sourceLink:'Derbarê berpirsiyariya rêyan',mapLink:'Li nexşeya NVDB kontrol bike',reportLink:'Rapora fermî veke',verified:'Bi daneyên nû yên NVDB hate kontrolkirin',distance:'Dûrbûna ji rê',accuracy:'Rastiya cihê',ambiguous:'Li nêzî vê xalê rêyên bi berpirsiyarên cuda hene. Encamê li nexşeya NVDB kontrol bike.',inaccurate:'Rastiya cihê kêm e. Berî raporkirinê encamê li nexşeyê kontrol bike.',noRoad:'Rêyek ewle li nêzî nehat dîtin. Nêzî rê bibe û dîsa biceribîne.',denied:'Destûra gihîştina cihê ji Sverinav re nehat dayîn.',unavailable:'Cih nehat diyarkirin.',serviceError:'NVDB niha nayê kontrolkirin. Paşê dîsa biceribîne.',stateExplain:'Trafikverket ji vê beşa rêya dewletê berpirsiyar e.',municipalExplain:'Şaredarî ji vê beşa rêyê berpirsiyar e.',privateExplain:'Rêyên taybet bi gelemperî ji aliyê komeleya rê, samfällighet an xwediyê taybet ve têne rêvebirin.'},
  es:{verify:'Comprobar responsable de la vía en mi ubicación',privacy:'Tu ubicación se usa solo para esta comprobación y no se guarda.',locating:'Obteniendo ubicación…',checking:'Consultando NVDB…',state:'Carretera estatal',municipal:'Vía municipal',private:'Vía privada',responsible:'Responsable de la vía',source:'Trafikverket / NVDB NetInfo',sourceLink:'Sobre la responsabilidad vial',mapLink:'Comprobar en el mapa NVDB',reportLink:'Abrir aviso oficial',verified:'Comprobado con datos actuales de NVDB',distance:'Distancia a la vía',accuracy:'Precisión de ubicación',ambiguous:'Hay vías con responsables distintos muy cerca de este punto. Comprueba el resultado en el mapa NVDB.',inaccurate:'La precisión de tu ubicación es baja. Comprueba el resultado en el mapa antes de informar.',noRoad:'No se encontró una vía fiable cerca. Acércate a la vía e inténtalo de nuevo.',denied:'Sverinav no obtuvo permiso para acceder a tu ubicación.',unavailable:'No se pudo determinar tu ubicación.',serviceError:'No se puede consultar NVDB ahora. Inténtalo más tarde.',stateExplain:'Trafikverket es responsable de este tramo estatal.',municipalExplain:'El municipio es responsable de este tramo.',privateExplain:'Las vías privadas normalmente son gestionadas por una asociación vial, una comunidad de propietarios o un propietario privado.'},
  ru:{verify:'Проверить ответственного за дорогу по моей позиции',privacy:'Позиция используется только для этой проверки и не сохраняется.',locating:'Определяю позицию…',checking:'Проверяю NVDB…',state:'Государственная дорога',municipal:'Муниципальная дорога',private:'Частная дорога',responsible:'Ответственный за дорогу',source:'Trafikverket / NVDB NetInfo',sourceLink:'Об ответственности за дороги',mapLink:'Проверить на карте NVDB',reportLink:'Открыть официальную форму',verified:'Проверено по актуальным данным NVDB',distance:'Расстояние до дороги',accuracy:'Точность позиции',ambiguous:'Рядом с этой точкой проходят дороги с разными ответственными. Проверь результат на карте NVDB.',inaccurate:'Точность позиции низкая. Перед отправкой обращения проверь результат на карте.',noRoad:'Надёжно определить ближайшую дорогу не удалось. Подойди ближе к дороге и попробуй снова.',denied:'Sverinav не получил доступ к позиции.',unavailable:'Не удалось определить позицию.',serviceError:'Сейчас не удалось проверить NVDB. Попробуй позже.',stateExplain:'За этот участок государственной дороги отвечает Trafikverket.',municipalExplain:'За этот участок дороги отвечает муниципалитет.',privateExplain:'Частными дорогами обычно управляет дорожное объединение, samfällighetsförening или частный собственник.'},
  uk:{verify:'Перевірити відповідального за дорогу за моєю позицією',privacy:'Позиція використовується лише для цієї перевірки й не зберігається.',locating:'Визначаю позицію…',checking:'Перевіряю NVDB…',state:'Державна дорога',municipal:'Муніципальна дорога',private:'Приватна дорога',responsible:'Відповідальний за дорогу',source:'Trafikverket / NVDB NetInfo',sourceLink:'Про відповідальність за дороги',mapLink:'Перевірити на карті NVDB',reportLink:'Відкрити офіційну форму',verified:'Перевірено за актуальними даними NVDB',distance:'Відстань до дороги',accuracy:'Точність позиції',ambiguous:'Поруч із цією точкою проходять дороги з різними відповідальними. Перевірте результат на карті NVDB.',inaccurate:'Точність позиції низька. Перед надсиланням звернення перевірте результат на карті.',noRoad:'Не вдалося надійно визначити найближчу дорогу. Підійдіть ближче до дороги та спробуйте знову.',denied:'Sverinav не отримав доступ до позиції.',unavailable:'Не вдалося визначити позицію.',serviceError:'Зараз не вдалося перевірити NVDB. Спробуйте пізніше.',stateExplain:'За цю ділянку державної дороги відповідає Trafikverket.',municipalExplain:'За цю ділянку дороги відповідає муніципалітет.',privateExplain:'Приватними дорогами зазвичай керує дорожнє об’єднання, samfällighetsförening або приватний власник.'}
};

function rt(key) {
  return roadMessages[currentLanguage]?.[key] || roadMessages.en[key] || roadMessages.sv[key] || key;
}

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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  })[character]);
}

function safeRiksdagenUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'data.riksdagen.se' ? url.href : null;
  } catch {
    return null;
  }
}

function formatDecisionDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);

  try {
    return new Intl.DateTimeFormat(currentLanguage || 'sv', {
      year:'numeric',
      month:'short',
      day:'numeric'
    }).format(date);
  } catch {
    return escapeHtml(value);
  }
}

function icon(name) {
  const paths = {
    route: '<path d="M5 18c0-3 2-5 5-5h4c3 0 5-2 5-5"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/>',
    camera: '<path d="M4 7h4l2-2h4l2 2h4v12H4z"/><circle cx="12" cy="13" r="3"/>',
    pin: '<path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/>',
    road: '<path d="M8 3 6 21M16 3l2 18M12 3v4M12 11v4M12 19v2"/>',
    air: '<path d="M4 8h10a3 3 0 1 0-3-3M4 12h14a3 3 0 1 1-3 3M4 16h6"/>',
    consult: '<path d="M5 4h14v13H9l-4 3z"/><path d="M8 8h8M8 12h6"/>',
    file: '<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/>',
    database: '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>'
  };
  return `<svg class="svg-icon" aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.file}</svg>`;
}

const languageNames = {
  sv:'Svenska', en:'English', ar:'العربية', so:'Soomaali', fa:'فارسی', fi:'Suomi',
  bs:'Bosanski / Hrvatski / Srpski', ku:'Kurdî (Kurmancî)', es:'Español', ru:'Русский', uk:'Українська'
};

const languageCodes = {sv:'SV',en:'EN',ar:'AR',so:'SO',fa:'FA',fi:'FI',bs:'BHS',ku:'KU',es:'ES',ru:'RU',uk:'UK'};

function screenFromHash() {
  const value = location.hash.replace(/^#\/?/, '');
  return ['ansvar','rapportera','nara','beslut'].includes(value) ? value : 'home';
}

function applyLanguage(language) {
  currentLanguage = supportedLanguages.includes(language) ? language : 'sv';
  localStorage.setItem('sverinav-language', currentLanguage);

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = rtlLanguages.has(currentLanguage) ? 'rtl' : 'ltr';

  document.getElementById('tagline').textContent = t('tagline');
  document.getElementById('navHome').textContent = t('navHome');
  document.getElementById('navNear').textContent = t('navNear');
  document.getElementById('navReport').textContent = t('navReport');
  document.getElementById('navDecisions').textContent = t('navDecisions');
  document.getElementById('languageSheetTitle').textContent = t('language');
  document.getElementById('bottomNav').setAttribute('aria-label', currentLanguage === 'sv' ? 'Huvudmeny' : 'Navigation');
  languageCode.textContent = languageCodes[currentLanguage] || currentLanguage.toUpperCase();

  renderLanguageOptions();
  render(currentScreen, false);
}

function renderLanguageOptions() {
  languageOptions.innerHTML = supportedLanguages.map(code =>
    `<button type="button" class="language-option" data-language="${code}" aria-pressed="${code === currentLanguage}">
      ${languageNames[code]}
    </button>`
  ).join('');
}

function openLanguageSheet() {
  languageSheet.hidden = false;
  languageButton.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    const selected = languageOptions.querySelector('[aria-pressed="true"]');
    (selected || closeLanguageButton).focus();
  });
}

function closeLanguageSheet() {
  if (languageSheet.hidden) return;
  languageSheet.hidden = true;
  languageButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  languageButton.focus();
}

function setNav(name) {
  const navName = name === 'ansvar' ? 'home' : name;
  document.querySelectorAll('.bottom-nav button').forEach(button => {
    button.classList.toggle('active', button.dataset.screen === navName);
  });
}

function resolveText(text) {
  const value = text.toLowerCase();
  let actor = t('actorDefault');
  let reason = t('reasonDefault');
  let category = 'other';

  const healthWords = ['vård', 'sjukhus', 'vårdcentral', 'health', 'hospital', 'clinic', 'صحة', 'مستشفى', 'caafimaad', 'isbitaal', 'سلامت', 'بیمارستان', 'terveys', 'sairaala', 'zdravlje', 'bolnica', 'tenduristî', 'nexweşxane', 'salud', 'hospital', 'здоровье', 'больница', 'здоров’я', 'лікарня'];
  const railWords = ['tåg', 'järnväg', 'train', 'rail', 'قطار', 'tareen', 'راه‌آهن', 'juna', 'rautatie', 'vlak', 'željeznica', 'trên', 'tren', 'ferrocarril', 'поезд', 'железная дорога', 'поїзд', 'залізниця'];
  const wasteWords = ['sopor', 'avfall', 'waste', 'trash', 'نفايات', 'qashin', 'زباله', 'jäte', 'otpad', 'smeti', 'çop', 'basura', 'residuos', 'мусор', 'отходы', 'сміття', 'відходи'];
  const roadWords = ['väg', 'hål', 'gata', 'road', 'street', 'pothole', 'طريق', 'شارع', 'waddo', 'جاده', 'خیابان', 'tie', 'katu', 'cesta', 'ulica', 'rê', 'calle', 'carretera', 'дорога', 'улица', 'яма', 'вулиця'];

  if (healthWords.some(word => value.includes(word))) {
    actor = t('actorHealth');
    reason = t('reasonHealth');
    category = 'health';
  } else if (railWords.some(word => value.includes(word))) {
    actor = t('actorRail');
    reason = t('reasonRail');
    category = 'rail';
  } else if (wasteWords.some(word => value.includes(word))) {
    actor = t('actorWaste');
    reason = t('reasonWaste');
    category = 'waste';
  } else if (roadWords.some(word => value.includes(word))) {
    actor = t('actorRoad');
    reason = t('reasonRoad');
    category = 'road';
  }

  return { actor, reason, category };
}

function roadResolverActionMarkup() {
  if (!navigator.geolocation || !window.SverinavNVDB) return '';
  return `<div class="road-live-actions">
    <button class="action secondary" type="button" data-road-resolve>
      ${icon('pin')}<span>${rt('verify')}</span>
    </button>
    <p class="road-privacy">${rt('privacy')}</p>
    <div data-road-live aria-live="polite"></div>
  </div>`;
}

function resultMarkup(text) {
  const { actor, reason, category } = resolveText(text);

  if (category === 'road') {
    return `<div class="result">
      <strong>${actor}</strong>
      <p>${reason}</p>
      ${roadResolverActionMarkup()}
      <div class="source">${icon('database')}<span>Trafikverket / NVDB</span></div>
    </div>`;
  }

  return `<div class="result">
    <strong>${actor}</strong>
    <p>${reason}</p>
    <div class="source">${icon('database')}<span>${t('demoNotVerified')}</span></div>
  </div>`;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 30000
    });
  });
}

function holderTypeLabel(type) {
  if (type === 'statlig') return rt('state');
  if (type === 'kommunal') return rt('municipal');
  return rt('private');
}

function holderExplanation(type) {
  if (type === 'statlig') return rt('stateExplain');
  if (type === 'kommunal') return rt('municipalExplain');
  return rt('privateExplain');
}

function officialReportUrl(result) {
  if (result.holderType === 'statlig') {
    return 'https://www.trafikverket.se/e-tjanster/anmal-icke-akuta-fel-pa-vag/';
  }

  if (
    result.holderType === 'kommunal' &&
    /göteborg/i.test(result.holderName || '')
  ) {
    return 'https://goteborg.se/wps/portal?uri=gbglnk%3Agbg.page.20120828-110230';
  }

  return null;
}

function roadLiveResultMarkup(result) {
  const actor = result.holderName ||
    (result.holderType === 'statlig' ? 'Trafikverket' : holderTypeLabel(result.holderType));
  const reportUrl = officialReportUrl(result);
  const accuracy = Number.isFinite(result.accuracyMeters) ? Math.round(result.accuracyMeters) : null;
  const distance = Math.max(0, Math.round(result.distanceMeters || 0));
  const lowAccuracy = accuracy !== null && accuracy > 80;

  return `<div class="road-live-result">
    <div class="road-holder-header">
      <span class="item-icon">${icon('road')}</span>
      <div class="road-holder-copy">
        <small>${rt('responsible')}</small>
        <strong>${escapeHtml(actor)}</strong>
        <span class="road-holder-type">${holderTypeLabel(result.holderType)}</span>
      </div>
    </div>
    <p>${holderExplanation(result.holderType)}</p>
    <div class="road-meta">
      <span>${rt('distance')}: ~${distance} m</span>
      ${accuracy !== null ? `<span>${rt('accuracy')}: ±${accuracy} m</span>` : ''}
    </div>
    ${result.ambiguous ? `<div class="road-warning">${rt('ambiguous')}</div>` : ''}
    ${lowAccuracy ? `<div class="road-warning">${rt('inaccurate')}</div>` : ''}
    <div class="live-badge"><span class="live-dot"></span>${rt('verified')}</div>
    <div class="road-links">
      ${reportUrl ? `<a class="road-link" href="${escapeHtml(reportUrl)}" target="_blank" rel="noopener noreferrer">${rt('reportLink')} ↗</a>` : ''}
      <a class="road-link" href="${escapeHtml(result.sourceUrl)}" target="_blank" rel="noopener noreferrer">${rt('sourceLink')} ↗</a>
      <a class="road-link" href="${escapeHtml(result.mapUrl)}" target="_blank" rel="noopener noreferrer">${rt('mapLink')} ↗</a>
    </div>
  </div>`;
}

function geolocationErrorMessage(error) {
  if (error?.code === 1) return rt('denied');
  if (error?.code === 2 || error?.code === 3) return rt('unavailable');
  return rt('serviceError');
}

async function resolveRoadFromPosition(container, button) {
  if (!container || !button || !window.SverinavNVDB) return;

  const original = button.innerHTML;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.innerHTML = `${icon('pin')}<span>${rt('locating')}</span>`;

  try {
    const position = await getCurrentPosition();
    button.innerHTML = `${icon('database')}<span>${rt('checking')}</span>`;

    const result = await window.SverinavNVDB.resolveRoadHolder(
      position.coords.latitude,
      position.coords.longitude,
      { accuracyMeters: position.coords.accuracy }
    );

    container.innerHTML = roadLiveResultMarkup(result);
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.innerHTML = original;
  } catch (error) {
    const message = error?.code === 'NO_NEARBY_ROAD'
      ? rt('noRoad')
      : geolocationErrorMessage(error);

    container.innerHTML = `<div class="road-warning">${escapeHtml(message)}</div>`;
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.innerHTML = original;
  }
}

function bindRoadResolver(container) {
  const button = container?.querySelector('[data-road-resolve]');
  const liveRegion = container?.querySelector('[data-road-live]');
  if (!button || !liveRegion) return;

  button.addEventListener('click', () => {
    resolveRoadFromPosition(liveRegion, button);
  });
}

function home() {
  view.innerHTML = `
    <div class="home">
      <section class="hero">
        <div class="home-meta">
          <span class="location-chip">${icon('pin')} Göteborg</span>
          <span class="beta-badge">${t('pilot')}</span>
        </div>
        <h1>${t('heroTitle')}</h1>
        <p>${t('heroText')}</p>

        <div class="resolver-panel">
          <label class="field-label" for="homeIssue">${t('reportPlaceholder')}</label>
          <textarea id="homeIssue" class="textarea" placeholder="${t('issuePlaceholder')}"></textarea>
          <button id="homeFindOwner" class="action" type="button">
            ${icon('route')}<span>${t('findResponsible')}</span>
          </button>
          <div id="homeOwnerResult"></div>
        </div>
      </section>

      <section class="quick-status">
        <span class="status-dot"></span>
        <span>${t('status')}</span>
      </section>

      <section class="section-block">
        <button class="primary-action-card" data-screen="rapportera">
          <span class="card-icon">${icon('camera')}</span>
          <span class="card-copy">
            <strong>${t('report')}</strong>
            <small>${t('reportSub')}</small>
          </span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h2>${t('nearTitle')}</h2>
          <button class="text-button" type="button" data-screen="nara">${t('navNear')} →</button>
        </div>
        <div class="preview-grid">
          ${previewCard('road', t('roadwork'), t('roadworkText'), t('demoLiveLater'))}
          ${previewCard('consult', t('consultation'), t('consultationText'), t('demoLiveLater'))}
          ${previewCard('air', t('air'), t('airText'), t('demo'))}
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h2>${t('decisionsTitle')}</h2>
          <button class="text-button" type="button" data-screen="beslut">${t('navDecisions')} →</button>
        </div>
        <div class="preview-card">
          <span class="item-icon">${icon('file')}</span>
          <div>
            <strong>${t('nationalDecision')}</strong>
            <p>${t('nationalDecisionText')}</p>
            <div class="source">${icon('database')}<span>${t('nationalDecisionSource')}</span></div>
          </div>
        </div>
      </section>

      ${deferredPrompt ? `
        <section class="install-card" id="installCard">
          <div>
            <strong>${t('installTitle')}</strong>
            <p>${t('installText')}</p>
          </div>
          <button id="installButton" class="install-btn" type="button">${t('install')}</button>
        </section>` : ''}

      <p class="product-note">Sverinav · Göteborg · ${t('earlyPrototype')}</p>
    </div>
  `;

  document.getElementById('homeFindOwner').onclick = () => {
    const text = document.getElementById('homeIssue').value;
    const container = document.getElementById('homeOwnerResult');
    container.innerHTML = resultMarkup(text);
    bindRoadResolver(container);
  };
}

function previewCard(iconName, title, text, source) {
  return `<article class="preview-card">
    <span class="item-icon">${icon(iconName)}</span>
    <div>
      <strong>${title}</strong>
      <p>${text}</p>
      <div class="source">${icon('database')}<span>${source}</span></div>
    </div>
  </article>`;
}

function shell(title, subtitle, body) {
  view.innerHTML = `<section class="screen">
    <button class="back" data-screen="home" type="button">${t('back')}</button>
    <h2>${title}</h2>
    <p class="muted">${subtitle}</p>
    ${body}
  </section>`;
}

function responsibilityScreen() {
  shell(
    t('responsibilityTitle'),
    t('responsibilityHelp'),
    `<div class="form-stack">
      <div class="field-group">
        <label class="field-label" for="issue">${t('reportPlaceholder')}</label>
        <textarea id="issue" class="textarea" placeholder="${t('issuePlaceholder')}"></textarea>
      </div>
      <div class="action-row">
        <button id="findOwner" class="action" type="button">${icon('route')}<span>${t('findResponsible')}</span></button>
      </div>
      <div id="ownerResult"></div>
    </div>`
  );

  document.getElementById('findOwner').onclick = () => {
    const text = document.getElementById('issue').value;
    const container = document.getElementById('ownerResult');
    container.innerHTML = resultMarkup(text);
    bindRoadResolver(container);
  };
}

function reportScreen() {
  shell(
    t('reportTitle'),
    t('reportHelp'),
    `<div class="form-stack">
      <div class="field-group">
        <span class="field-label">${t('addPhoto')}</span>
        <label class="file-label" for="photo">${icon('camera')}<span>${t('addPhoto')}</span></label>
        <input id="photo" type="file" accept="image/*">
      </div>
      <div class="field-group">
        <label class="field-label" for="reportPlace">${t('place')}</label>
        <input id="reportPlace" class="input" placeholder="${t('place')}">
      </div>
      <div class="field-group">
        <label class="field-label" for="reportDescription">${t('reportPlaceholder')}</label>
        <textarea id="reportDescription" class="textarea" placeholder="${t('reportPlaceholder')}"></textarea>
      </div>
      <button class="action" type="button">${t('preview')}</button>
      <div class="result"><strong>${t('noRealReport')}</strong><p>${t('earlyPrototype')}</p></div>
    </div>`
  );
}

function nearbyItems() {
  return [
    { icon:'road', title:t('roadwork'), text:t('roadworkText'), source:t('demoLiveLater') },
    { icon:'consult', title:t('consultation'), text:t('consultationText'), source:t('demoLiveLater') },
    { icon:'air', title:t('air'), text:t('airText'), source:t('demo') }
  ];
}

function decisionItems() {
  return [
    { icon:'file', title:t('nationalDecision'), text:t('nationalDecisionText'), source:t('nationalDecisionSource') },
    { icon:'file', title:t('localDecision'), text:t('localDecisionText'), source:t('demo') }
  ];
}

function decisionLoadingMarkup() {
  return `
    <article class="item loading-card" aria-hidden="true">
      <span class="item-icon">${icon('file')}</span>
      <div class="item-content">
        <div class="loading-line medium"></div>
        <div class="loading-line"></div>
        <div class="loading-line short"></div>
      </div>
    </article>
    <article class="item loading-card" aria-hidden="true">
      <span class="item-icon">${icon('file')}</span>
      <div class="item-content">
        <div class="loading-line"></div>
        <div class="loading-line medium"></div>
        <div class="loading-line short"></div>
      </div>
    </article>`;
}

function liveDecisionMarkup(item) {
  const href = safeRiksdagenUrl(item.sourceUrl);
  if (!href) return '';

  const meta = [
    item.documentType,
    item.reference,
    item.responsibleActor,
    formatDecisionDate(item.decisionDate || item.publishedDate)
  ].filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join('');

  return `<a class="item decision-live-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
    <span class="item-icon">${icon('file')}</span>
    <span class="item-content">
      <strong>${escapeHtml(item.title)}</strong>
      <span class="decision-meta">${meta}</span>
      <span class="live-badge"><span class="live-dot"></span>Sveriges riksdag ↗</span>
    </span>
  </a>`;
}

async function hydrateDecisionScreen(container) {
  if (!container || !window.SverinavRiksdagen) return;

  try {
    const payload = await window.SverinavRiksdagen.loadLatestDecisions();
    if (!container.isConnected || currentScreen !== 'beslut') return;

    const markup = payload.items.map(liveDecisionMarkup).filter(Boolean).join('');
    if (!markup) throw new Error('No renderable Riksdagen items');
    container.innerHTML = markup;
  } catch (error) {
    if (!container.isConnected || currentScreen !== 'beslut') return;
    console.warn('Riksdagen decision feed unavailable; showing demo fallback.', error);
    container.innerHTML = demoListMarkup(decisionItems());
  }
}

function demoListMarkup(items) {
  return items.map(item =>
    `<article class="item">
      <span class="item-icon">${icon(item.icon)}</span>
      <div class="item-content">
        <strong>${item.title}</strong>
        <small>${item.text}</small>
        <div class="source">${icon('database')}<span>${item.source}</span></div>
      </div>
    </article>`
  ).join('');
}

function decisionScreen() {
  shell(
    t('decisionsTitle'),
    t('decisionsHelp'),
    `<div class="list" id="decisionList">${decisionLoadingMarkup()}</div>`
  );
  hydrateDecisionScreen(document.getElementById('decisionList'));
}

function listScreen(title, subtitle, items) {
  shell(
    title,
    subtitle,
    `<div class="list">${demoListMarkup(items)}</div>`
  );
}

function render(screen, updateState = true) {
  if (updateState) currentScreen = screen;
  setNav(screen);

  if (screen === 'home') return home();
  if (screen === 'ansvar') return responsibilityScreen();
  if (screen === 'rapportera') return reportScreen();
  if (screen === 'nara') return listScreen(t('nearTitle'), t('nearHelp'), nearbyItems());
  if (screen === 'beslut') return decisionScreen();
}

function navigate(screen) {
  const hash = screen === 'home' ? '' : `#${screen}`;
  if (location.hash === hash) {
    currentScreen = screen;
    render(screen);
    return;
  }
  location.hash = hash;
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  if (currentScreen === 'home') render('home', false);
});

window.addEventListener('hashchange', () => {
  currentScreen = screenFromHash();
  render(currentScreen);
});

document.addEventListener('click', async event => {
  if (event.target.closest('#languageButton')) {
    openLanguageSheet();
    return;
  }

  if (event.target.closest('#closeLanguageButton') || event.target.closest('#languageBackdrop')) {
    closeLanguageSheet();
    return;
  }

  const languageChoice = event.target.closest('[data-language]');
  if (languageChoice) {
    applyLanguage(languageChoice.dataset.language);
    closeLanguageSheet();
    return;
  }

  if (event.target.closest('#installButton') && deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    render('home', false);
    return;
  }

  const target = event.target.closest('[data-screen]');
  if (target) {
    event.preventDefault();
    navigate(target.dataset.screen);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !languageSheet.hidden) closeLanguageSheet();
});

currentScreen = screenFromHash();
applyLanguage(currentLanguage);
