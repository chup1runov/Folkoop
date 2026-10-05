import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const copyContext=vm.createContext({globalThis:{}});
copyContext.globalThis=copyContext;
vm.runInContext(await readFile('apps/web/folkoop-i18n-extra.js','utf8'),copyContext);
vm.runInContext(await readFile('apps/web/folkoop-copy.js','utf8'),copyContext);
const I=copyContext.FolkoopCopy;
const extra=copyContext.FolkoopExtraCopy.languages;

test('Online Center v0 copy exists in all eleven shell languages',()=>{
  const keys=[
    'centerOnlineTitle','centerOnlineText','centerOnlineStatus','centerMuraStatus',
    'centerPeopleTitle','centerPeopleText','centerCityTitle','centerCityText',
    'centerProjectTitle','centerProjectText','centerCommunityTitle','centerCommunityText',
    'centerHostTitle','centerHostText','centerLocalTitle','centerLocalText',
    'centerLocalExternal','centerLocalExternalNote','centerLocalIllustrative',
    'centerOtherCityTitle','centerOtherCityText','centerPhysicalTitle','centerPhysicalText'
  ];
  assert.equal(I.FULL.length,11);
  for(const lang of I.FULL){
    for(const key of keys){
      assert.equal(typeof I.COPY[lang][key],'string',lang+':'+key);
      assert(I.COPY[lang][key].trim().length>0,lang+':'+key);
    }
  }
});

test('Center runtime is connected navigation, not a hidden Mura route or simulated integration',async()=>{
  const source=await readFile('apps/web/folkoop.js','utf8');
  assert(source.includes("const GOTEBORG_FORUM_URL='https://t.me/+YlokNMBafp8wM2Vi'"));
  assert(source.includes('data-center-story="local"'));
  for(const route of ['people','communities','city'])assert(source.includes("routeCard('"+route+"'"),route);
  assert(source.includes('data-center-route="action"'));
  assert(source.includes("center:['center','people','communities']"));
  assert(source.includes("city:[]"));
  assert(source.includes("route==='projects'?'together'"));
  assert(source.includes("{id:'center',route:'center',target:'[data-center-story=\"local\"] h2'"));
  assert(!source.includes("['center','settings','about'].includes(current)"));
  assert(source.includes('target="_blank" rel="noopener noreferrer"'));
  assert(!/\bfetch\s*\(/.test(source));
});

test('Center source keeps the authored/local and external/no-sync concepts distinct',async()=>{
  const source=await readFile('apps/web/folkoop.js','utf8');
  for(const key of ['centerLocalIllustrative','centerLocalExternalNote','centerLocalExternal'])assert(source.includes(key),key);
  const copy=await readFile('apps/web/folkoop-copy.js','utf8');
  assert(copy.includes('no FOLKOOP account or data synchronization'));
  assert(copy.includes('Nothing is copied from the real forum'));
});

test('Mura acceptance contract allows only the authored Online Center story',async()=>{
  const contract=await readFile('docs/MURA_ACCEPTANCE_CONTRACT.md','utf8');
  assert(contract.includes('Center may appear in Mura only as the authored Online/Hybrid Center Göteborg story'));
  assert(contract.includes('must not imply a staffed Host, an open physical venue or live forum data synchronization'));
  assert(contract.includes('visible Center under the City context'));
  assert(contract.includes('hidden Settings/About'));
});


test('Center guidance no longer reverts to physical-only semantics in secondary surfaces',async()=>{
  for(const lang of ['es','uk','ar','so','fa','fi','bs','ku']){
    const x=extra[lang];
    assert.equal(x.tutorial.center,x.shell.centerOnlineText,lang+' tutorial');
    assert.equal(x.helper.tips.center,x.shell.centerOnlineText,lang+' helper');
    assert.equal(x.homeWelcome.placeText,x.shell.centerOnlineText,lang+' homeWelcome');
  }
  const shell=await readFile('apps/web/folkoop.js','utf8');
  assert(shell.includes('Center now connects community, people, City and projects as an online/hybrid route.'));
  assert(shell.includes('Центр теперь связывает сообщества, людей, Город и проекты как онлайн/гибридный маршрут.'));
  assert(shell.includes('Center kopplar nu samman gemenskaper, människor, Stad och projekt som en online/hybrid väg.'));
  assert(!shell.includes('Center is the future physical layer: meetings, learning, equipment and human help in real life.'));
  assert(!shell.includes('Центр — будущий физический слой: встречи, обучение, оборудование и помощь людей в реальном мире.'));
  assert(!shell.includes('Center är det framtida fysiska lagret: möten, lärande, utrustning och mänsklig hjälp i verkligheten.'));

  const welcome=await readFile('apps/web/home-welcome.js','utf8');
  assert(welcome.includes('Online Center connects local community, people, City and projects today'));
  assert(welcome.includes('Онлайн-Центр уже связывает локальное общение, людей, Город и проекты'));
  assert(welcome.includes('Online Center kopplar redan samman gemenskaper, människor, Stad och projekt'));
});
