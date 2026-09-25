/* Public Home orientation. No account, synthetic activity, storage or API calls. */
(() => {
 'use strict';
 const copy = {
  en: {
   title:'Your starting point', intro:'People, everyday help, shared projects and your city — not only shopping.',
   personal:'Your actions', personalText:'Sign in to see your messages, invitations, assigned tasks and purchase confirmations. No personal activity is shown while signed out.', personalAction:'Open Profile / sign in',
   drafts:'Start privately', draftsText:'Describe a need or an idea first. A local draft is not published and is not sent to another person.', draftAction:'Draft a project',
   social:'Find people and communities', socialText:'Discoverable profiles and communities are in separate sections. Network participation is currently limited to the pilot.', people:'People', communities:'Communities',
   place:'City and Center', placeText:'Choose your city in Profile. Local civic tools currently cover Göteborg. Center is the planned offline meeting-and-help layer, not a confirmed open venue.', city:'City', center:'Center',
   note:'The personal dashboard appears after sign-in. Private drafts stay separate. No payments or guaranteed savings.'
  },
  ru: {
   title:'С чего начать', intro:'Люди, взаимопомощь, общие проекты и твой город — не только покупки.',
   personal:'Твои действия', personalText:'После входа здесь появятся твои сообщения, приглашения, задачи и подтверждения закупок. Без входа личная активность не показана.', personalAction:'Открыть профиль / войти',
   drafts:'Начать с личного черновика', draftsText:'Сначала опиши потребность или идею для себя. Локальный черновик не публикуется и не отправляется другим людям.', draftAction:'Набросать проект',
   social:'Найти людей и сообщества', socialText:'Каталог видимых профилей и сообщества находятся в отдельных разделах. Сетевое участие пока ограничено пилотом.', people:'Люди', communities:'Сообщества',
   place:'Город и Центр', placeText:'Укажи свой город в Профиле. Местные гражданские инструменты пока подключены для Göteborg. Центр — планируемый офлайн-слой встреч и помощи, а не уже открытое помещение.', city:'Город', center:'Центр',
   note:'Персональная главная появляется после входа. Личные черновики остаются отдельно. Платежей и гарантии экономии нет.'
  },
  sv: {
   title:'Var vill du börja?', intro:'Människor, vardagshjälp, gemensamma projekt och din stad — inte bara inköp.',
   personal:'Dina nästa steg', personalText:'Logga in för att se dina meddelanden, inbjudningar, tilldelade uppgifter och köpbekräftelser. Ingen personlig aktivitet visas när du är utloggad.', personalAction:'Öppna Profil / logga in',
   drafts:'Börja med ett privat utkast', draftsText:'Beskriv först ett behov eller en idé för dig själv. Ett lokalt utkast publiceras inte och skickas inte till någon annan.', draftAction:'Skissa på ett projekt',
   social:'Hitta människor och gemenskaper', socialText:'Synliga profiler och gemenskaper finns i separata delar. Nätverksdeltagandet är tills vidare begränsat till piloten.', people:'Människor', communities:'Gemenskaper',
   place:'Stad och Center', placeText:'Välj din stad i Profil. Lokala samhällsverktyg är nu anslutna för Göteborg. Center är det planerade fysiska lagret för möten och hjälp, inte en redan öppen lokal.', city:'Stad', center:'Center',
   note:'Den personliga startsidan visas efter inloggning. Privata utkast förblir separata. Inga betalningar eller garanterade besparingar.'
  }
 };
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function markup(language='en') {
  const text=Object.hasOwn(copy,language)?copy[language]:copy.en;
  const link=(route,label)=>`<a class="button secondary" href="#/${route}">${escape(label)}</a>`;
  const card=(title,body,actions)=>`<article class="card home-attention-card"><h3>${escape(title)}</h3><p>${escape(body)}</p><div class="actions">${actions}</div></article>`;
  return `<h2 id="homeWelcomeTitle">${escape(text.title)}</h2><p>${escape(text.intro)}</p><div class="home-attention-grid">${card(text.personal,text.personalText,link('me',text.personalAction))}${card(text.drafts,text.draftsText,`<button class="button secondary" type="button" data-create="project">${escape(text.draftAction)}</button>`)}${card(text.social,text.socialText,link('people',text.people)+link('communities',text.communities))}${card(text.place,text.placeText,link('city',text.city)+link('center',text.center))}</div><p class="meta">${escape(text.note)}</p>`;
 }
 globalThis.FolkoopHomeWelcome=Object.freeze({markup});
 if(typeof document==='undefined')return;
 const root=document.getElementById('workspace');
 if(!root)return;
 function attach(){
  // The network renderer exclusively controls whether the local workspace is visible.
  // Never unhide it or read/change authentication, read markers or personal state.
  if(globalThis.FolkoopCore?.route(location.hash)!=='home'||root.querySelector('[data-home-welcome]'))return;
  const hero=root.querySelector('.hero');
  if(!hero)return;
  const section=document.createElement('section');
  section.className='home-section';section.dataset.homeWelcome='';
  section.setAttribute('aria-labelledby','homeWelcomeTitle');
  section.innerHTML=markup(document.documentElement.lang);
  hero.after(section);
 }
 // Shell re-renders after navigation and language changes. Insertion is idempotent.
 new MutationObserver(attach).observe(root,{childList:true});
 attach();
})();
