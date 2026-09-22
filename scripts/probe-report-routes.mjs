const TARGETS = [
  {
    name:'Göteborgs Stad felanmälan',
    url:'https://goteborg.se/wps/portal/kontakta-oss/felanmalan-gator-torg-och-parker',
    required:[/Felanmälan\s*-\s*gator, torg och parker/i],
    finalPath:/\/kontakta-oss\/felanmalan-gator-torg-och-parker\/?$/i
  },
  {
    name:'Trafikverket drift och underhåll',
    url:'https://etjanster.trafikverket.se/anonyma-tjanster/kundfragor-trafikverket/vag/drift-underhall/',
    required:[],
    finalPath:/\/anonyma-tjanster\/kundfragor-trafikverket\/vag\/drift-underhall\/?$/i
  }
];

async function fetchWithRetry(url, attempts=3) {
  let lastError;
  for (let attempt=1; attempt<=attempts; attempt+=1) {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch(url,{
        headers:{
          accept:'text/html,application/xhtml+xml',
          'user-agent':'Sverinav-Report-Route-Test/0.7 (+https://github.com/chup1runov/Sverinav)'
        },
        redirect:'follow',
        signal:controller.signal
      });
      clearTimeout(timer);
      return response;
    } catch(error) {
      clearTimeout(timer);
      lastError=error;
      if (attempt<attempts) await new Promise(resolve=>setTimeout(resolve,attempt*750));
    }
  }
  throw lastError;
}

for (const target of TARGETS) {
  const response=await fetchWithRetry(target.url);
  if (!response.ok) throw new Error(`${target.name} returned ${response.status}`);

  const finalUrl=new URL(response.url);
  if (!target.finalPath.test(finalUrl.pathname)) {
    throw new Error(`${target.name} redirected to unexpected path: ${finalUrl.pathname}`);
  }

  const html=await response.text();
  if (html.length<500) throw new Error(`${target.name} returned an unexpectedly small HTML response`);

  for (const pattern of target.required) {
    if (!pattern.test(html)) {
      throw new Error(`${target.name} no longer matches expected server-rendered contract: ${pattern}`);
    }
  }

  console.log(`REPORT_ROUTE_OK ${target.name} ${response.url}`);
}
