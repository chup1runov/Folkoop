import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

const scope=vm.createContext({});
vm.runInContext(await readFile('apps/web/folkoop-i18n-extra.js','utf8'),scope);
vm.runInContext(await readFile('apps/web/folkoop-copy.js','utf8'),scope);
const copy=scope.FolkoopCopy.COPY;
const languages=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];

test('every localized hero has a real layout line break, not a printed escape',()=>{
 for(const lang of languages){
  const hero=copy[lang].hero;
  assert.equal(hero.split('\n').length,2,lang+' must have exactly two visible hero lines');
  assert(!hero.includes('\\n'),lang+' hero contains a literal backslash-n');
 }
});

// Versioned human-reviewed factual anchors. These checks catch regression to copy
// from the pre-network prototype. They do NOT claim literary/native-speaker QA.
const claims={
 en:{drafts:'never published automatically',local:'no messages are sent',encryption:'not end-to-end encrypted'},
 sv:{drafts:'publiceras aldrig automatiskt',local:'skickas inga meddelanden',encryption:'inte totalsträckskrypterade'},
 ru:{drafts:'никогда не публикуются автоматически',local:'сообщения не отправляются',encryption:'шифрования в этих чатах нет'},
 es:{drafts:'nunca se publican automáticamente',local:'modo local no se envían mensajes',encryption:'no tienen cifrado de extremo a extremo',optIn:'eligieron aparecer',payments:'fuera de FOLKOOP',project:'Proyecto de la red',authority:'organismo responsable'},
 uk:{drafts:'ніколи не публікуються автоматично',local:'локальному режимі повідомлення не надсилаються',encryption:'не мають наскрізного шифрування',optIn:'самі дозволили',payments:'поза FOLKOOP',project:'Мережевий Проєкт',authority:'відповідну установу'},
 fi:{drafts:'eikä niitä koskaan julkaista automaattisesti',local:'tilassa viestejä ei lähetetä',encryption:'ei ole päästä päähän -salausta',optIn:'itse sallineet',payments:'FOLKOOPin ulkopuolella',project:'Verkon Projekti',authority:'toimivaltaisen viranomaisen'},
 bs:{drafts:'nikada se ne objavljuju automatski',local:'poruke se ne šalju',encryption:'nemaju end-to-end enkripciju',optIn:'sami odlučili',payments:'izvan FOLKOOP-a',project:'Mrežni Projekat',authority:'nadležnom organu'},
 ar:{drafts:'لا تُنشر تلقائيًا أبدًا',local:'لا تُرسل أي رسائل',encryption:'ليست مشفّرة من طرف إلى طرف',optIn:'اختاروا إظهار ملفاتهم',payments:'خارج FOLKOOP',project:'لمشروع على الشبكة',authority:'الجهة المسؤولة'},
 fa:{drafts:'هرگز خودکار منتشر نمی‌شوند',local:'هیچ پیامی ارسال نمی‌شود',encryption:'رمزگذاری سرتاسری ندارند',optIn:'خودشان اجازه',payments:'خارج از FOLKOOP',project:'پروژهٔ شبکه‌ای',authority:'مرجع مسئول'},
 so:{drafts:'waligood looma daabaco',local:'wax farriimo ah lama diro',encryption:'ma laha sirgelin',optIn:'iyagu doortay',payments:'ka baxsan FOLKOOP',project:'Mashruuc shabakadeed',authority:'hay’adda mas’uulka ah'},
 ku:{drafts:'tu carî bixwe nayên weşandin',local:'tu peyam nayê şandin',encryption:'nayên parastin',optIn:'bi xwe hilbijartine',payments:'li derveyî wê',project:'Projeyek li ser torê',authority:'saziya berpirsiyar'}
};
test('all eleven locales preserve private drafts, no local sending, and no E2EE',()=>{
 for(const lang of languages){
  const p=copy[lang],q=claims[lang];
  assert(p.noDraftsText.includes(q.drafts),lang+' local drafts must never auto-publish');
  assert(p.messageText.includes(q.local),lang+' local mode must not imply message delivery');
  assert(p.messageText.includes(q.encryption),lang+' pilot messaging must not imply E2EE');
 }
});
test('eight extra locales accurately distinguish live pilot network from local-only prototype',()=>{
 for(const lang of ['es','uk','fi','bs','ar','fa','so','ku']){
  const p=copy[lang],q=claims[lang];
  assert(p.peopleText.includes(q.optIn),lang+' directory discoverability is opt-in');
  assert(p.togetherText.includes(q.payments),lang+' payment stays external');
  assert(p.projectsText.includes(q.project),lang+' network Project is implemented');
  assert(p.cityText.includes(q.authority),lang+' official request must remain external');
  assert(!/\bguide\b/i.test(scope.FolkoopExtraCopy.languages[lang].helper.open),lang+' helper action mixes in English');
  assert.equal(scope.FolkoopExtraCopy.languages[lang].tutorial.people,p.peopleText,lang+' public tutorial drift');
  assert.equal(scope.FolkoopExtraCopy.languages[lang].tutorial.projects,p.projectsText,lang+' public tutorial drift');
 }
});
test('Kurmancî Center statement explicitly denies an operating physical venue',()=>{
 const p=copy.ku.centerText;
 assert(p.includes('nehatiye vekirin'),'Kurmancî Center must say no physical site has opened');
 assert(p.includes('nadibêjin'),'Kurmancî Center must not imply confirmed venue/equipment/program');
 assert(!p.includes('em hê dibêjin ku'),'former missing negation must never reappear');
});
test('Somali profile label uses one localized term across network and shell',()=>{
 assert.equal(copy.so.me,copy.so.myTitle);
 assert.equal(copy.so.me,'Borofaayl');
 assert(scope.FolkoopExtraCopy.languages.so.network.base.profile.includes('Borofaayl'));
});
