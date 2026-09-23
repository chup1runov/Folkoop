/* Compact editorial information for the existing Om route. No requests, tracking or message submission. */
(() => {
  'use strict';
  const AUTHOR = Object.freeze({name:'Pavel Chuprunov',handle:'chup1runov'});
  const IDEA_YEAR = 2021;
  const REPOSITORY_CREATED = '2026-09-21';
  const CONTACT = Object.freeze({email:'mailto:chup1runov@gmail.com',telegram:'https://t.me/chup1runov'});
  const BIO_SOURCE = 'https://www.mittskifte.org/petitions/infor-tjansten-nattstopp-i-goteborg-for-okad-trygghet-i-kollektivtrafiken';
  const FAQ_SOURCES = Object.freeze({
    2:['Sveriges riksdag','https://www.riksdagen.se/sv/sa-fungerar-riksdagen/riksdagens-uppgifter/beslutar-om-lagar/'],
    3:['Göteborgs Stad','https://goteborg.se/planochbyggprojekt']
  });
  const COPY = globalThis.SverinavAboutCopy;
  if (!COPY) throw new Error('Missing project translations');
  function element(tag, text, className) {
    const n=document.createElement(tag);
    if(text!==undefined)n.textContent=text;
    if(className)n.className=className;
    return n;
  }
  function link(text,href,className){
    const a=element('a',text,className);a.href=href;
    if(href.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}
    return a;
  }
  function disclosure(title,body){
    const d=element('details',undefined,'project-disclosure');d.append(element('summary',title));
    const answer=element('div',undefined,'project-answer');
    answer.append(typeof body==='string'?element('p',body):body);d.append(answer);return d;
  }
  function mount(root=document.getElementById('view')){
    const stack=root?.querySelector('.about-stack');
    if(!stack||stack.dataset.projectEnhanced||!stack.querySelector('#pilotFeedbackForm'))return;
    const lang=document.documentElement.lang||'sv',locale=COPY[lang]?lang:'en',L=COPY[locale];
    const intro=root.querySelector('.screen > p.muted');if(intro){intro.textContent=L.intro;intro.lang=locale;}
    if(locale==='ru'){
      const notice=stack.querySelector('.about-card--notice p');
      if(notice)notice.textContent='Sverinav не является государственным или муниципальным органом и не представляет Göteborgs Stad, Trafikverket или Riksdagen. Приложение помогает подготовиться, но официальное обращение ты отправляешь в сервисе соответствующего органа.';
    }
    const author=element('section',undefined,'about-card project-author');author.id='projectAuthor';author.lang=locale;
    author.append(element('h2',L.by));
    const name=element('strong',AUTHOR.name,'project-author-name');name.dir='ltr';
    author.append(name,element('p',L.role+' · @'+AUTHOR.handle));
    const bio=element('p',L.bio,'project-bio');bio.id='projectBio';
    author.append(bio,link('MittSkifte ↗',BIO_SOURCE,'project-history-link'));
    const contacts=element('div',undefined,'project-contact-actions');
    const mail=link('chup1runov@gmail.com',CONTACT.email,'project-contact-button');mail.id='contactAuthor';mail.dir='ltr';
    const telegram=link('Telegram · @chup1runov ↗',CONTACT.telegram,'project-contact-button secondary');telegram.id='contactTelegram';telegram.dir='ltr';
    for(const a of [mail,telegram])a.setAttribute('aria-describedby','projectContactNote');
    contacts.append(mail,telegram);
    const note=element('p',L.contactNote,'project-contact-note');note.id='projectContactNote';
    author.append(contacts,note);
    const story=element('section',undefined,'about-card project-story');story.lang=locale;
    story.append(element('h2',L.why),element('p',L.purpose));
    const historyBody=element('div');historyBody.append(element('p',L.dateNote));
    const repo=element('p',L.created+': ');
    const time=element('time',new Intl.DateTimeFormat(locale,{dateStyle:'long',timeZone:'Europe/Stockholm'}).format(new Date(REPOSITORY_CREATED+'T12:00:00Z')));time.dateTime=REPOSITORY_CREATED;repo.append(time);
    historyBody.append(repo);
    const history=disclosure(L.history,historyBody);history.id='projectHistory';history.dataset.ideaYear=String(IDEA_YEAR);story.append(history);
    const faq=element('section',undefined,'project-faq');faq.id='projectFaq';faq.lang=locale;faq.append(element('h2',L.faq));
    L.questions.forEach(([q,a],i)=>{
      const d=disclosure(q,a);
      if(FAQ_SOURCES[i])d.querySelector('.project-answer').append(link(FAQ_SOURCES[i][0]+' ↗',FAQ_SOURCES[i][1],'project-history-link'));
      faq.append(d);
    });
    const supplementary=[...stack.children].filter(n=>n.matches('section.about-card')&&!n.matches('.about-card--notice,.about-meta,.feedback-card'));
    for(const section of supplementary){
      const h=section.querySelector('h3');if(!h)continue;
      const d=disclosure(h.textContent,element('div'));d.classList.add('project-existing');
      const answer=d.querySelector('.project-answer');answer.replaceChildren();
      [...section.childNodes].filter(n=>n!==h).forEach(n=>answer.append(n));section.replaceWith(d);
    }
    // Remove only the repository promotion. Official data-source links and existing feedback remain.
    stack.querySelector('.about-meta a')?.remove();
    const notice=stack.querySelector('.about-card--notice');if(notice)notice.after(author,story,faq);else stack.prepend(author,story,faq);
    stack.dataset.projectEnhanced='true';
  }
  globalThis.SverinavProjectAbout={COPY,AUTHOR,IDEA_YEAR,REPOSITORY_CREATED,CONTACT,BIO_SOURCE,mount};
  if(typeof document==='undefined')return;
  const root=document.getElementById('view');
  if(root){mount(root);new MutationObserver(()=>mount(root)).observe(root,{childList:true});}
})();
