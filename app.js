const view = document.getElementById('view');
let deferredPrompt;

const demoNearby = [
  {title:'Vägarbete', text:'Demodata: planerat arbete i närområdet.', source:'Demo — livekälla kopplas in senare'},
  {title:'Samråd', text:'Demodata: ett planförslag är öppet för synpunkter.', source:'Demo — livekälla kopplas in senare'},
  {title:'Luftkvalitet', text:'Här ska senare visas öppen miljödata från officiell källa.', source:'Demo'}
];

const demoDecisions = [
  {title:'Beslut i riksdagen', text:'Här kommer en kort och neutral sammanfattning med länk till originaldokumentet.', source:'Demo — Riksdagens API planeras först'},
  {title:'Lokalt beslut', text:'Här kan användaren senare se kommunala beslut som berör det valda området.', source:'Demo'}
];

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  const button = document.getElementById('installButton');
  if (button) button.hidden = false;
});

document.addEventListener('click', async (event) => {
  if (event.target.id === 'installButton' && deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    event.target.hidden = true;
    return;
  }

  const target = event.target.closest('[data-screen]');
  if (target) render(target.dataset.screen);
});

function setNav(name){
  document.querySelectorAll('.bottom-nav button').forEach(button => {
    button.classList.toggle('active', button.dataset.screen === name);
  });
}

function home(){ location.reload(); }

function shell(title, subtitle, body){
  view.innerHTML = `<section class="screen">
    <button class="back" data-screen="home">← Hem</button>
    <h2>${title}</h2>
    <p class="muted">${subtitle}</p>
    ${body}
  </section>`;
}

function ansvar(){
  shell(
    'Vem ansvarar?',
    'Beskriv problemet med vanliga ord. I en riktig version ska svaret alltid verifieras mot officiell källa.',
    `<textarea id="issue" class="textarea" placeholder="Exempel: Det är en stor vattenpöl på vägen utanför huset..."></textarea>
     <button id="findOwner" class="action">Hitta ansvarig</button>
     <div id="ownerResult"></div>`
  );

  document.getElementById('findOwner').onclick = () => {
    const text = document.getElementById('issue').value.toLowerCase();
    let actor = 'Kommunen eller väghållaren';
    let reason = 'För en riktig bedömning behöver plats och ansvarig aktör kontrolleras mot officiell källa.';

    if (text.includes('vård') || text.includes('sjukhus') || text.includes('vårdcentral')) {
      actor = 'Regionen / vårdgivaren';
      reason = 'Hälso- och sjukvård ligger normalt på regional nivå.';
    } else if (text.includes('tåg') || text.includes('järnväg')) {
      actor = 'Trafikverket eller trafikoperatören';
      reason = 'Ansvar beror på om frågan gäller infrastrukturen eller själva trafiktjänsten.';
    } else if (text.includes('sopor') || text.includes('avfall')) {
      actor = 'Kommunen / kommunalt avfallsbolag';
      reason = 'Hushållsavfall hanteras normalt kommunalt.';
    } else if (text.includes('väg') || text.includes('hål') || text.includes('gata')) {
      actor = 'Väghållaren';
      reason = 'Nästa version ska använda NVDB för att avgöra om vägen är statlig, kommunal eller enskild.';
    }

    document.getElementById('ownerResult').innerHTML =
      `<div class="result"><strong>${actor}</strong><p>${reason}</p><div class="source">DEMO — ingen myndighetskontroll har gjorts.</div></div>`;
  };
}

function rapportera(){
  shell(
    'Rapportera',
    'Sverinav ska hjälpa dig samla rätt information och sedan leda dig till rätt officiell mottagare.',
    `<label class="file-label" for="photo">Lägg till foto (demo)</label>
     <input id="photo" type="file" accept="image/*">
     <input class="input" placeholder="Plats eller adress">
     <textarea class="textarea" placeholder="Beskriv problemet"></textarea>
     <button class="action">Förhandsgranska</button>
     <div class="result"><strong>Ingen riktig felanmälan skickas ännu.</strong><p>Det här är en tidig produktprototyp.</p></div>`
  );
}

function listScreen(title, subtitle, items){
  shell(
    title,
    subtitle,
    `<div class="list">${items.map(item =>
      `<div class="item"><strong>${item.title}</strong><small>${item.text}</small><div class="source">${item.source}</div></div>`
    ).join('')}</div>`
  );
}

function render(screen){
  setNav(screen);
  if (screen === 'home') return home();
  if (screen === 'ansvar') return ansvar();
  if (screen === 'rapportera') return rapportera();
  if (screen === 'nara') return listScreen('Nära mig','I piloten ska detta hämtas från öppna och officiella datakällor.', demoNearby);
  if (screen === 'beslut') return listScreen('Beslut','Sammanfattningar ska vara källbelagda och tydligt skilja fakta från politiska ståndpunkter.', demoDecisions);
}
