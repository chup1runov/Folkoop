const view = document.getElementById('view');

const demoNearby = [
  {title:'Vägarbete', text:'Demodata: planerat arbete i närområdet.', source:'Exempel — ingen livekälla'},
  {title:'Samråd', text:'Demodata: ett planförslag är öppet för synpunkter.', source:'Exempel — ingen livekälla'},
  {title:'Luftkvalitet', text:'Demodata: här kan senare visas öppen miljödata.', source:'Exempel — ingen livekälla'}
];

const demoDecisions = [
  {title:'Kommunalt beslut', text:'Kort, neutral sammanfattning ska visas här med länk till originalhandlingen.', source:'Exempel — ingen livekälla'},
  {title:'Regionalt beslut', text:'Användaren ska kunna se vem som beslutade, när och vad som faktiskt ändras.', source:'Exempel — ingen livekälla'}
];

function setNav(name){
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
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
  shell('Vem ansvarar?', 'Beskriv problemet med vanliga ord. I en riktig version ska svaret alltid kunna verifieras mot en officiell källa.', `
    <textarea id="issue" class="textarea" placeholder="Exempel: Det är en stor vattenpöl på vägen utanför huset..."></textarea>
    <button id="findOwner" class="action">Hitta ansvarig</button>
    <div id="ownerResult"></div>
  `);
  document.getElementById('findOwner').onclick = () => {
    const t = document.getElementById('issue').value.toLowerCase();
    let actor = 'Kommunen eller väghållaren';
    let reason = 'För en riktig bedömning behöver plats och vägägare kontrolleras.';
    if(t.includes('vård') || t.includes('sjukhus') || t.includes('vårdcentral')) {
      actor = 'Regionen / vårdgivaren';
      reason = 'Hälso- och sjukvård ligger normalt på regional nivå.';
    } else if(t.includes('tåg') || t.includes('järnväg')) {
      actor = 'Trafikverket eller trafikoperatören';
      reason = 'Ansvar beror på om frågan gäller infrastrukturen eller själva trafiken.';
    } else if(t.includes('sopor') || t.includes('avfall')) {
      actor = 'Kommunen / kommunalt avfallsbolag';
      reason = 'Hushållsavfall hanteras normalt kommunalt.';
    }
    document.getElementById('ownerResult').innerHTML = `<div class="result"><strong>${actor}</strong><p>${reason}</p><div class="source">DEMO — ingen myndighetskontroll har gjorts.</div></div>`;
  };
}

function rapportera(){
  shell('Rapportera', 'En framtida version ska hjälpa dig skicka samma information till rätt officiell mottagare.', `
    <label class="file-label" for="photo">Lägg till foto (demo)</label>
    <input id="photo" type="file" accept="image/*">
    <input class="input" placeholder="Plats eller adress">
    <textarea class="textarea" placeholder="Beskriv problemet"></textarea>
    <button class="action">Förhandsgranska</button>
    <div class="result"><strong>Ingen riktig felanmälan skickas.</strong><p>Detta är endast ett UI-koncept.</p></div>
  `);
}

function listScreen(title, subtitle, items){
  shell(title, subtitle, `<div class="list">${items.map(x=>`<div class="item"><strong>${x.title}</strong><small>${x.text}</small><div class="source">${x.source}</div></div>`).join('')}</div>`);
}

function render(screen){
  setNav(screen);
  if(screen === 'home') return home();
  if(screen === 'ansvar') return ansvar();
  if(screen === 'rapportera') return rapportera();
  if(screen === 'nara') return listScreen('Nära mig','I piloten ska detta hämtas från öppna och officiella datakällor.', demoNearby);
  if(screen === 'beslut') return listScreen('Beslut','Sammanfattningar ska vara källbelagda och tydligt skilja fakta från politiska ståndpunkter.', demoDecisions);
}

document.addEventListener('click', e => {
  const target = e.target.closest('[data-screen]');
  if(target) render(target.dataset.screen);
});
