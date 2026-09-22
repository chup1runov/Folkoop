const TARGETS = [
  {
    name:'Göteborgs Stad felanmälan',
    url:'https://goteborg.se/wps/portal?uri=gbglnk%3Agbg.page.20120828-110230',
    required:[/Felanmälan\s*-\s*gator, torg och parker/i]
  },
  {
    name:'Trafikverket drift och underhåll',
    url:'https://etjanster.trafikverket.se/anonyma-tjanster/kundfragor-trafikverket/vag/drift-underhall/',
    required:[/Drift och underhåll/i,/Frågor och felanmälan/i,/WGS84/i]
  }
];

async function fetchWithRetry(url, attempts=3) {
  let lastError;
  for (let attempt=1; attempt<=attempts; attempt+=1) {
    try {
      return await fetch(url,{
        headers:{
          accept:'text/html,application/xhtml+xml',
          'user-agent':'Sverinav-Report-Route-Test/0.7 (+https://github.com/chup1runov/Sverinav)'
        },
        redirect:'follow'
      });
    } catch(error) {
      lastError=error;
      if (attempt<attempts) await new Promise(resolve=>setTimeout(resolve,attempt*750));
    }
  }
  throw lastError;
}

for (const target of TARGETS) {
  const response=await fetchWithRetry(target.url);
  if (!response.ok) throw new Error(`${target.name} returned ${response.status}`);
  const html=await response.text();
  for (const pattern of target.required) {
    if (!pattern.test(html)) throw new Error(`${target.name} no longer matches expected report-service contract: ${pattern}`);
  }
  console.log(`REPORT_ROUTE_OK ${target.name} ${response.url}`);
}
