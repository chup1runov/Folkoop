import { readFile } from 'node:fs/promises';

function assert(condition, message) { if (!condition) throw new Error(message); }
function pngSize(buffer) {
  assert(buffer.length >= 24, 'PNG is too small');
  assert(buffer.subarray(1,4).toString('ascii') === 'PNG', 'Invalid PNG signature');
  return { width:buffer.readUInt32BE(16), height:buffer.readUInt32BE(20) };
}

const [html,css,app,sw,manifestText,riksdagenLoader,plansLoader,icon180,icon192,icon512]=await Promise.all([
  readFile('index.html','utf8'),readFile('styles.css','utf8'),readFile('app.js','utf8'),
  readFile('sw.js','utf8'),readFile('manifest.webmanifest','utf8'),
  readFile('riksdagen.js','utf8'),readFile('goteborg-plans.js','utf8'),
  readFile('icon-180.png'),readFile('icon-192.png'),readFile('icon-512.png')
]);
const manifest=JSON.parse(manifestText);

assert(/class="skip-link"/.test(html),'Skip link missing');
assert(/<main id="view" tabindex="-1">/.test(html),'Main focus target missing');
assert(html.includes('./icon-180.png'),'Apple touch icon is not the iPhone-sized PNG');
assert(css.includes('a:focus-visible'),'Link focus-visible style missing');
assert(app.includes("aria-current', 'page'"),'Active navigation aria-current missing');
assert(app.includes("event.key === 'Tab'"),'Language dialog focus trap missing');
assert(app.includes('function isIOSDevice()'),'iOS detection missing');
assert(app.includes('data-ios-install="true"'),'iOS Add-to-Home-Screen guidance missing');
assert(app.includes('function sourceFreshnessMarkup('),'Source freshness UI missing');
assert(app.includes("maxAgeHours = 36"),'Daily source freshness threshold missing');
assert(app.includes("{ live:true }"),'Live-source checked-now status missing');
assert(app.includes("window.navigator.standalone === true"),'iOS standalone detection missing');

for(const code of ['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']) {
  assert(app.includes("'"+code+"'") || app.includes(code+':'),'Language missing: '+code);
}
for(const route of ['rapportera','nara','beslut','om']) assert(app.includes("screen === '"+route+"'"),'Screen route missing: '+route);
assert(html.includes('id="aboutButton"'),'About button missing');
assert(app.includes("const APP_VERSION = '0.10.0'"),'Pilot version constant missing');
assert(app.includes('function aboutScreen()'),'About screen missing');
assert(app.includes('navigator.share'),'Web Share pilot feedback missing');
assert(app.includes('pilot-feedback.md'),'Technical feedback route missing');

assert(sw.includes("url.origin !== self.location.origin"),'Cross-origin SW bypass missing');
assert(sw.includes("request.mode === 'navigate'"),'Navigation strategy missing');
assert(sw.includes("url.pathname.includes(DATA_PATH)"),'JSON data strategy missing');
assert(riksdagenLoader.includes("payload?.error"),'Riksdagen loader must reject offline error payloads');
assert(plansLoader.includes("payload?.error"),'Göteborg plans loader must reject offline error payloads');
assert(!sw.includes("return caches.match(new URL('', BASE).href)"),'Unsafe universal app-shell fallback remains');

const icons=manifest.icons||[];
assert(icons.some(i=>i.src==='./icon-192.png'&&i.sizes==='192x192'),'192px manifest icon missing');
assert(icons.some(i=>i.src==='./icon-512.png'&&i.sizes==='512x512'),'512px manifest icon missing');
assert(icons.some(i=>i.src==='./icon-512.png'&&/maskable/.test(i.purpose||'')),'Maskable icon missing');

const s180=pngSize(icon180), s192=pngSize(icon192), s512=pngSize(icon512);
assert(s180.width===180&&s180.height===180,'icon-180 dimensions wrong');
assert(s192.width===192&&s192.height===192,'icon-192 dimensions wrong');
assert(s512.width===512&&s512.height===512,'icon-512 dimensions wrong');

console.log('Static pilot smoke OK: PWA, a11y, routes, languages and service-worker contracts verified.');
