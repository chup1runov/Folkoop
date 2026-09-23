import {fetchBounded as fetchWithRetry} from './http.mjs';
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
