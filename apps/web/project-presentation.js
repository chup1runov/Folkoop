/* Progressive layout of the existing, authorised project DOM.
   Owns no participant data, requests or mutations. Existing nodes/forms/handlers
   are moved, never cloned. Without this module the original view still works. */
(() => {
'use strict';
const copy={
 sv:['Till projektet','Översikt','Lär känna personen'], en:['Back to project','Overview','Meet this person'],
 ru:['Вернуться к проекту','Обзор','Узнать о человеке'], es:['Volver al proyecto','Resumen','Conocer a esta persona'],
 uk:['Повернутися до проєкту','Огляд','Дізнатися про людину'], fi:['Takaisin projektiin','Yleiskuva','Tutustu ihmiseen'],
 bs:['Nazad na projekt','Pregled','Upoznaj osobu'], ar:['العودة إلى المشروع','نظرة عامة','تعرّف إلى الشخص'],
 fa:['بازگشت به پروژه','نمای کلی','آشنایی با این شخص'], so:['Ku noqo mashruuca','Dulmar','Baro qofkan'],
 ku:['Vegere projeyê','Dîtina giştî','Vî kesî nas bike']
};
const text=(language,index)=>(copy[language]||copy.en)[index];
const direct=(root,selector)=>Array.from(root.children).find(node=>node.matches(selector));
function enhanceProject(root,{route,guestDemo=false}={}){
 if(!root||root.hidden||!['projects','together'].includes(route)||root.querySelector('.project-workspace'))return false;
 const summary=direct(root,'.coop-summary');
 const sections=Array.from(root.children).filter(node=>node.matches('details[data-coop-section]'));
 const tasks=sections.find(node=>node.dataset.coopSection==='tasks');
 const people=sections.find(node=>node.dataset.coopSection==='members');
 // A list, a purchase, a non-member or a partial response is not a project workspace.
 if(!summary||!tasks||!people)return false;
 const title=summary.querySelector('h2');
 if(!title)return false;
 const doc=root.ownerDocument;
 const make=(tag,cls)=>{const node=doc.createElement(tag);node.className=cls;return node;};
 const workspace=make('section','project-workspace');
 workspace.setAttribute('aria-labelledby','projectPresentationTitle');
 title.id='projectPresentationTitle';
 const top=make('div','project-presentation-top');
 const context=make('aside','project-presentation-context');
 const next=direct(root,'.coop-next-step');
 const chatButton=root.querySelector('[data-coop="openLinkedChat"]');
 const chatAction=chatButton?.parentElement;
 root.insertBefore(workspace,summary);
 workspace.append(top);
 top.append(summary);
 if(next)context.append(next);
 if(chatAction?.parentElement===root){
  chatAction.classList.add('project-work-chat-action');
  context.append(chatAction);
 }
 if(context.childElementCount)top.append(context);
 else top.classList.add('project-presentation-top-single');
 const navigation=make('nav','project-section-navigation');
 navigation.setAttribute('aria-label',title.textContent||'');
 const overview=make('button','project-section-link');
 overview.type='button';overview.textContent=text(root.lang||doc.documentElement.lang,1);
 overview.dataset.projectJump='overview';
 navigation.append(overview);
 summary.id='project-section-overview';
 summary.tabIndex=-1;
 workspace.append(navigation);
 const body=make('div','project-presentation-body');
 workspace.append(body);
 const primary=make('div','project-presentation-work');
 const secondary=make('div','project-presentation-people');
 body.append(primary,secondary);
 primary.append(tasks);
 secondary.append(people);
 // Preserve native disclosure state. Opening a section is an explicit action.
 const more=make('div','project-presentation-more');
 workspace.append(more);
 const ordered=[tasks,people,...sections.filter(node=>node!==tasks&&node!==people)];
 for(const section of ordered){
  const key=section.dataset.coopSection;
  if(section!==tasks&&section!==people)more.append(section);
  section.id='project-section-'+key;
  if(section.hidden)continue;
  const heading=section.querySelector(':scope > summary > span');
  if(!heading)continue;
  const jump=make('button','project-section-link');
  jump.type='button';jump.dataset.projectJump=key;jump.textContent=heading.textContent;
  navigation.append(jump);
 }
 workspace.addEventListener('click',event=>{
  const button=event.target.closest('button[data-project-jump]');
  if(!button||!workspace.contains(button))return;
  const key=button.dataset.projectJump;
  const target=key==='overview'?summary:ordered.find(node=>node.dataset.coopSection===key);
  if(!target||target.hidden)return;
  if(target.tagName==='DETAILS')target.open=true;
  const focusTarget=target.tagName==='DETAILS'?target.querySelector(':scope > summary'):target;
  focusTarget?.focus({preventScroll:true});
  focusTarget?.scrollIntoView({block:'start',behavior:'instant'});
 });
 workspace.dataset.projectPresentationReady='true';
 return true;
}
function renderCurrent(event){
 const root=document.getElementById('networkPanel');
 if(!root)return;
 const detail=event?.detail||{};
 if(detail.route==='people'){
  const selected=root.querySelector('[data-person-focused="true"]');
  if(selected){
   selected.focus({preventScroll:true});
   selected.scrollIntoView({block:'center',behavior:'instant'});
  }
  return;
 }
 enhanceProject(root,{route:detail.route||location.hash.slice(2)||'home',guestDemo:detail.guestDemo??root.classList.contains('guest-demo')});
}
globalThis.FolkoopProjectPresentation=Object.freeze({enhanceProject,text});
if(typeof document!=='undefined'&&typeof window!=='undefined'){
 window.addEventListener('folkoop:network-rendered',renderCurrent);
 renderCurrent();
}
})();
