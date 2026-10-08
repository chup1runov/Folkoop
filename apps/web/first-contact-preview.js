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
 LANGS,modes,copy,render
});
})();