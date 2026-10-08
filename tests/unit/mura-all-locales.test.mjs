import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {FOLKOOP_LANGUAGES} from '../../scripts/i18n/schema.mjs';

const ctx=vm.createContext({console});
vm.runInContext(await readFile('apps/web/folkoop-i18n-extra.js','utf8'),ctx);
const registry=ctx.FolkoopExtraCopy;
const extra=FOLKOOP_LANGUAGES.filter(l=>!['en','sv','ru'].includes(l));
const steps=['welcome','home','together','projects','people','city','center','quick'];
const guestSections={
 base:['profile','listed','groups','desc','directory','own','out','by','empty'],
 chat:['messagesTitle','messagesDesc','conversation','direct','groupChat','membersList','notEncrypted','you','noPeople'],
 coop:['togetherTitle','projectsTitle','networkDesc','projectDesc','localBelow','memberOnly'],
 offer:['offerHelp','notOrder'],
 activity:['activity','notifications','workChat','linkedChat','managedChat','unread','noActivity','recentActivity','openActivity'],
 home:['demoBadge','demoText','demoExit']
};
const muraHomeKeys=[
 'eyebrow','lead','active','people','unread','drafts','today','continue',
 'storyEyebrow','storyTitle','storyText','peopleEyebrow','peopleTitle',
 'seePeople','chatEyebrow','chatTitle','allMessages','sparkEyebrow',
 'sparkTitle','sparkText','draftEyebrow','draftTitle','openProfile',
 'cityTitle','cityText','cityCta','neighbourhood','roamTitle','roamText',
 'openStory','next','myPart','resourceSpark','communitySpark',
 'languageSpark','openConversation','participant','outcomeEyebrow',
 'outcomeTitle','outcomeText','result'
];

test('Mura has a distinct authored eight-step story in every extra language',()=>{
 for(const lang of extra){
  const n=registry.muraNarrative[lang],pack=registry.languages[lang];
  assert(n,lang+' Mura narrative');
  assert.deepEqual(Object.keys(n.tutorial).sort(),steps.slice().sort());
  assert.deepEqual(Object.keys(n.titles).sort(),steps.slice().sort());
  for(const step of steps){
   assert(n.tutorial[step].trim().length>32,lang+' narrative missing '+step);
   assert(n.titles[step].trim().length>5,lang+' title missing '+step);
  }
  assert.notEqual(n.tutorial.projects,pack.tutorial.projects,
    lang+' Mura photography offer replaced by generic Projects description');
  assert.notEqual(n.tutorial.city,pack.tutorial.city,
    lang+' Mura people step replaced by generic City route description');
  assert.notEqual(n.tutorial.people,pack.tutorial.people,
    lang+' plant-exchange chapter replaced by generic People route copy');
 }
});

test('Mura guest overrides are explicit, story-led and complete in all extra languages',()=>{
 for(const lang of extra){
  const guest=registry.muraGuest[lang];
  assert(guest,lang+' guest story missing');
  for(const [section,keys] of Object.entries(guestSections)){
   for(const key of keys){
    assert.equal(typeof guest[section]?.[key],'string',lang+' '+section+'.'+key);
    if(!['notEncrypted','localBelow','managedChat'].includes(key))
     assert(guest[section][key].trim().length>0,lang+' '+section+'.'+key);
   }
  }
  assert(guest.coop.networkDesc.includes(registry.muraNarrative[lang].tutorial.together),
    lang+' cooperation must describe Mura actual personal Need');
  assert(guest.coop.projectDesc.includes(registry.muraNarrative[lang].tutorial.people),
    lang+' Projects must include Mura plant exchange');
  assert(!/\bpilot network objects\b/i.test(guest.coop.networkDesc),
    lang+' should not claim illustrative projects are live pilot accounts');
 }
});

test('Mura Home and helper preserve the personal story in all extra languages',()=>{
 for(const lang of extra){
  const home=registry.muraHome[lang],help=registry.muraHelper[lang];
  assert(home&&help,lang+' Home/helper localization missing');
  for(const key of muraHomeKeys)
   assert.equal(typeof home[key],'string',lang+' Home missing '+key);
  assert(home.lead===registry.muraNarrative[lang].tutorial.welcome);
  assert(home.storyText===registry.muraNarrative[lang].tutorial.people);
  assert(home.cityText===registry.muraNarrative[lang].center.body);
  assert(help.tips.home===registry.muraNarrative[lang].tutorial.home);
  assert(help.tips.projects===registry.muraNarrative[lang].tutorial.people);
 }
});

test('PWA release changes when locale assets change so installed users can upgrade',async()=>{
 const [sw,pkg,lock]=await Promise.all([
  readFile('apps/web/sw.js','utf8'),
  readFile('package.json','utf8'),readFile('package-lock.json','utf8')
 ]);
 const version=JSON.parse(pkg).version;
 assert.equal(version,JSON.parse(lock).version);
 assert.equal(version,JSON.parse(lock).packages[''].version);
 assert(sw.includes("const VERSION='"+version+"'"));
 assert.notEqual(version,'0.40.4','the pre-localization PWA cache version cannot remain active');
});
