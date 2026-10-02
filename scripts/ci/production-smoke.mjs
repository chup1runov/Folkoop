import assert from 'node:assert/strict';

const base=(process.env.FOLKOOP_PRODUCTION_URL||'https://chup1runov.github.io/Folkoop/').replace(/\/?$/,'/');
const expected=process.env.FOLKOOP_EXPECTED_VERSION;
if(!/^\d+\.\d+\.\d+$/.test(expected||''))throw new Error('FOLKOOP_EXPECTED_VERSION is required');

async function text(path){
 const url=new URL(path,base);url.searchParams.set('__folkoop_release_probe',Date.now().toString());
 const response=await fetch(url,{headers:{'cache-control':'no-cache','pragma':'no-cache'},redirect:'error'});
 assert.equal(response.status,200,path+': HTTP '+response.status);
 return response.text();
}
const [sw,html,guide,css,register]=await Promise.all([
 text('sw.js'),text(''),text('folkoop-guide.js'),text('folkoop-guide.css'),text('sw-register.js')
]);
assert.equal(sw.match(/const VERSION='([^']+)'/)?.[1],expected,'production SW version mismatch');
assert.match(html,/folkoop-guide\.js/,'production shell missing guide runtime');
assert.match(html,/sw-register\.js/,'production shell missing update-aware SW runtime');
assert.match(guide,/folkoop-guide-confident\.webp/,'production guide is not the canonical WEBP runtime');
for(const asset of ['folkoop-guide-wink.webp','folkoop-guide-inspect.webp','folkoop-guide-searching.webp','folkoop-guide-lean-in.webp','folkoop-guide-idea.webp'])assert.match(guide,new RegExp(asset.replace('.','\\.')),'production guide WEBP pose set incomplete: '+asset);
assert.match(guide,/'point-left':'\.\/folkoop-guide-inspect\.webp'/,'production point-left alias is not using the canonical WEBP identity');
assert.match(guide,/'point-right':'\.\/folkoop-guide-inspect\.webp'/,'production point-right alias is not using the canonical WEBP identity');
assert.match(guide,/'point-up':'\.\/folkoop-guide-idea\.webp'/,'production point-up alias is not using the canonical WEBP identity');
assert.match(guide,/'point-down':'\.\/folkoop-guide-lean-in\.webp'/,'production point-down alias is not using the canonical WEBP identity');
assert.match(guide,/'sit-edge':'\.\/folkoop-guide-confident\.webp'/,'production sit-edge alias is not using the canonical WEBP identity');
assert.doesNotMatch(guide,/folkoop-guide-(?:point-left|point-right|point-up|point-down|sit-edge)\.png/,'production guide references deleted legacy PNG identity');
assert.match(css,/\.folkoop-guide-actor\.is-tour::before\{display:none\}/,'production still contains old Mura bubble behavior');
assert.match(register,/updateViaCache:'none'/,'production SW registration may reuse stale HTTP cache');
assert.match(register,/SKIP_WAITING/,'production SW registration cannot activate a waiting release');
console.log('Production smoke passed: FOLKOOP '+expected+' at '+base);
