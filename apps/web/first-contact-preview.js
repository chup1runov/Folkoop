/* Explicit opt-in first-contact trial. No signup, network mutation, or tracking. */
(() => {
'use strict';
const copy=Object.freeze({
 sv:{title:'Vad vill du göra?',intro:'Hitta människor, resurser och ett nästa steg. Du kan först utforska utan att registrera dig.'},
 en:{title:'What would you like to do?',intro:'Find people, resources and a next step. You can explore first without registering.'},
 ru:{title:'Что ты хочешь сделать?',intro:'Найди людей, ресурсы и следующий шаг. Сначала можно просто посмотреть без регистрации.'},
 es:{title:'¿Qué te gustaría hacer?',intro:'Encuentra personas, recursos y el siguiente paso. Puedes explorar primero sin registrarte.'},
 uk:{title:'Що хочеш зробити?',intro:'Знайди людей, ресурси та наступний крок. Спочатку можна просто подивитися без реєстрації.'},
 fi:{title:'Mitä haluaisit tehdä?',intro:'Löydä ihmisiä, resursseja ja seuraava askel. Voit tutustua ensin ilman rekisteröitymistä.'},
 bs:{title:'Šta želiš uraditi?',intro:'Pronađi ljude, resurse i sljedeći korak. Prvo možeš razgledati bez registracije.'},
 ar:{title:'ماذا تريد أن تفعل؟',intro:'اعثر على أشخاص وموارد وخطوة تالية. يمكنك الاستكشاف أولاً دون تسجيل.'},
 fa:{title:'می‌خواهی چه کاری انجام بدهی؟',intro:'آدم‌ها، منابع و گام بعدی را پیدا کن. می‌توانی ابتدا بدون ثبت‌نام بگردی.'},
 so:{title:'Maxaad rabtaa inaad samayso?',intro:'Hel dad, kheyraad iyo tallaabada xigta. Waxaad marka hore sahamin kartaa adigoon isdiiwaangelin.'},
 ku:{title:'Dixwazî çi bikî?',intro:'Mirov, çavkanî û gava paşîn bibîne. Dikare pêşî bê qeydkirinê bigerî.'}
});
// Opt-in variant C: explain the product before a voluntary read-only Mura tour.
// Locally authored working translations; native-speaker review remains a separate gate.
const guestCopy=Object.freeze({
 sv:{title:'Välkommen till FOLKOOP',intro:'Här kan du möta människor, hitta eller erbjuda hjälp och göra saker tillsammans.',guest:'Utforska med Mura',choose:'Välj en väg direkt',hide:'Dölj valen',language:'Språk',note:'Mura och hennes krets är ett påhittat exempel. Utforska utan att registrera dig.',demo:'Valen öppnar illustrativa exempel, inte riktiga förfrågningar.'},
 en:{title:'Welcome to FOLKOOP',intro:'Meet people, ask for or offer help, and do things together.',guest:'Explore with Mura',choose:'Choose a path instead',hide:'Hide the paths',language:'Language',note:'Mura and her circle are fictional examples. Explore without signing up.',demo:'These paths open examples, not real requests or projects.'},
 ru:{title:'Добро пожаловать в FOLKOOP',intro:'Здесь можно знакомиться, находить или предлагать помощь и делать что-то вместе.',guest:'Посмотреть с Мурой',choose:'Сразу выбрать направление',hide:'Скрыть направления',language:'Язык',note:'Мура и её окружение — вымышленный пример. Можно знакомиться без регистрации.',demo:'Направления открывают демонстрационные примеры, а не настоящие заявки.'},
 es:{title:'Bienvenido a FOLKOOP',intro:'Conoce gente, pide u ofrece ayuda y haz cosas en común.',guest:'Explorar con Mura',choose:'Elegir una opción directamente',hide:'Ocultar las opciones',language:'Idioma',note:'Mura y su círculo son ejemplos ficticios. Explora sin registrarte.',demo:'Estas opciones muestran ejemplos, no solicitudes reales.'},
 uk:{title:'Ласкаво просимо до FOLKOOP',intro:'Тут можна знайомитися, просити чи пропонувати допомогу та робити щось разом.',guest:'Подивитися з Мурою',choose:'Одразу обрати напрям',hide:'Сховати напрями',language:'Мова',note:'Мура та її оточення — вигаданий приклад. Можна знайомитися без реєстрації.',demo:'Напрями відкривають приклади, а не справжні запити.'},
 fi:{title:'Tervetuloa FOLKOOPiin',intro:'Tutustu ihmisiin, pyydä tai tarjoa apua ja tee asioita yhdessä.',guest:'Tutustu Muran kanssa',choose:'Valitse suoraan vaihtoehto',hide:'Piilota vaihtoehdot',language:'Kieli',note:'Mura ja hänen tuttavansa ovat kuvitteellisia esimerkkejä. Tutustu ilman rekisteröitymistä.',demo:'Nämä vaihtoehdot avaavat esimerkkejä, eivät oikeita pyyntöjä.'},
 bs:{title:'Dobro došli u FOLKOOP',intro:'Upoznajte ljude, zatražite ili ponudite pomoć i radite nešto zajedno.',guest:'Istraži s Murom',choose:'Odmah izaberi pravac',hide:'Sakrij opcije',language:'Jezik',note:'Mura i njeno okruženje su izmišljeni primjeri. Istražite bez registracije.',demo:'Ove opcije otvaraju primjere, ne stvarne zahtjeve.'},
 ar:{title:'مرحبًا بك في FOLKOOP',intro:'تعرّف على أشخاص، واطلب المساعدة أو قدّمها، وافعل أشياء مع الآخرين.',guest:'استكشف مع مورا',choose:'اختر مسارًا مباشرة',hide:'إخفاء المسارات',language:'اللغة',note:'مورا ومن حولها أمثلة خيالية. يمكنك الاستكشاف دون تسجيل.',demo:'هذه المسارات تعرض أمثلة وليست طلبات حقيقية.'},
 fa:{title:'به FOLKOOP خوش آمدید',intro:'با افراد آشنا شوید، کمک بخواهید یا پیشنهاد دهید و با هم کاری انجام دهید.',guest:'با مورا آشنا شوید',choose:'مستقیم یک مسیر انتخاب کنید',hide:'پنهان کردن مسیرها',language:'زبان',note:'مورا و اطرافیانش نمونه‌های خیالی هستند. بدون ثبت‌نام کاوش کنید.',demo:'این مسیرها نمونه هستند، نه درخواست‌های واقعی.'},
 so:{title:'Ku soo dhowow FOLKOOP',intro:'La kulan dad, codso ama bixi caawimo, oo wax wada qabsada.',guest:'La sahami Mura',choose:'Si toos ah jid u dooro',hide:'Qari waddooyinka',language:'Luqadda',note:'Mura iyo dadka ku hareeraysan waa tusaalooyin mala-awaal ah. Waad sahamin kartaa adigoon isdiiwaangelin.',demo:'Waddooyinkani waa tusaalooyin, ma aha codsiyo dhab ah.'},
 ku:{title:'Bi xêr hatî FOLKOOP',intro:'Mirovan nas bike, alîkariyê bixwaze an pêşkêş bike û tiştan bi hev re bike.',guest:'Bi Mura re bigere',choose:'Rasterast rêyekê hilbijêre',hide:'Rêyan veşêre',language:'Ziman',note:'Mura û derdora wê nimûneyên xeyalî ne. Bê qeydkirinê bigere.',demo:'Ev rê nimûne ne, ne daxwazên rastîn.'}
});
const LANGS=Object.freeze(['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']);
const modes=Object.freeze(['browse','solve','organize']);
function render(code,homeModes,escape,icon){
 if(!LANGS.includes(code))throw new Error('UNSUPPORTED_FIRST_CONTACT_LANGUAGE');
 const c=copy[code],m=homeModes?.[code];
 if(!m)throw new Error('MISSING_FIRST_CONTACT_MODES_'+code);
 const e=s=>escape(String(s??''));
 const glyph=k=>typeof icon==='function'?icon(k):'';
 return '<div class="entry-three-grid" role="group" aria-label="'+e(c.title)+'">'+
  '<article class="entry-three-card" data-entry-choice="browse" aria-labelledby="entryThreeBrowseTitle">'+
   '<div class="entry-three-heading">'+glyph('people')+'<h2 id="entryThreeBrowseTitle">'+e(m.browseTitle)+'</h2></div>'+
   '<p>'+e(m.browseText)+'</p>'+
   '<button class="button secondary" type="button" data-entry-path="center">'+e(m.browseAction)+'</button>'+
  '</article>'+
  '<article class="entry-three-card" data-entry-choice="solve" aria-labelledby="entryThreeSolveTitle">'+
   '<div class="entry-three-heading">'+glyph('together')+'<h2 id="entryThreeSolveTitle">'+e(m.solveTitle)+'</h2></div>'+
   '<p>'+e(m.solveText)+'</p>'+
   '<div class="entry-three-solve-actions">'+
    '<button class="button secondary" type="button" data-entry-path="need">'+e(m.needAction)+'</button>'+
    '<button class="button secondary" type="button" data-entry-path="offer">'+e(m.offerAction)+'</button>'+
   '</div>'+
  '</article>'+
  '<article class="entry-three-card" data-entry-choice="organize" aria-labelledby="entryThreeOrganizeTitle">'+
   '<div class="entry-three-heading">'+glyph('projects')+'<h2 id="entryThreeOrganizeTitle">'+e(m.organizeTitle)+'</h2></div>'+
   '<p>'+e(m.organizeText)+'</p>'+
   '<button class="button secondary" type="button" data-entry-path="projects">'+e(m.organizeAction)+'</button>'+
  '</article>'+
 '</div>';
}
globalThis.FolkoopFirstContactPreview=Object.freeze({
 LANGS,modes,copy,guestCopy,render
});
})();