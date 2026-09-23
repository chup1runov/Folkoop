import {mkdir,copyFile,cp,rm,writeFile,readFile} from 'node:fs/promises';
import {releaseVersion} from './release-version.mjs';
const files=['index.html','styles.css','compact.css','about-project.css','civic-core.js','daily-data.js','today.js','riksdagen.js','nvdb.js','goteborg-plans.js','app.js','about-project.js','manifest.webmanifest','sw.js','icon.svg','icon-180.png','icon-192.png','icon-512.png'];
const pkg=JSON.parse(await readFile('package.json','utf8'));
const app=releaseVersion(await readFile('app.js','utf8'),pkg.version);
await rm('_site',{recursive:true,force:true});await mkdir('_site',{recursive:true});
for(const file of files)await copyFile(file,'_site/'+file);
await writeFile('_site/app.js',app);
try{await cp('data','_site/data',{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile('_site/.nojekyll','');
console.log(`Prepared v${pkg.version}: exact static files and deterministic version stamp; no private archives.`);
