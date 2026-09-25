import {mkdir,copyFile,cp,rm,writeFile,readFile} from 'node:fs/promises';
import {releaseVersion} from './release-version.mjs';
// Deploy only allowlisted public application files, never SQL/tests/private archives.
const files=['city-source.html','folkoop.html','styles.css','compact.css','about-project.css','civic-core.js','daily-data.js','today.js','riksdagen.js','nvdb.js','goteborg-plans.js','app.js','about-copy.js','about-project.js','manifest.webmanifest','sw.js','icon.svg','icon-180.png','icon-192.png','icon-512.png','LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md','folkoop-core.js','folkoop-copy.js','folkoop.js','folkoop.css','folkoop-city.js','folkoop-mark.png','folkoop-icon-512.png','network-config.js','network-client.js','network-ui.js','home-welcome.js'];
const pkg=JSON.parse(await readFile('package.json','utf8'));
const app=releaseVersion(await readFile('app.js','utf8'),pkg.version);
await rm('_site',{recursive:true,force:true});await mkdir('_site',{recursive:true});
for(const file of files)await copyFile(file,'_site/'+file);
await writeFile('_site/app.js',app);
await copyFile('folkoop.html','_site/index.html');
const city=await readFile('city-source.html','utf8');
if(!city.includes('</body>'))throw new Error('City source missing closing body');
await writeFile('_site/city.html',city.replace('</body>','<script src="./folkoop-city.js"></script>\n</body>'));
try{await cp('data','_site/data',{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile('_site/.nojekyll','');
console.log(`Prepared FOLKOOP v${pkg.version}: preserved City; network activation remains explicit.`);
