import {mkdir,copyFile,cp,rm,writeFile,readFile} from 'node:fs/promises';
import {releaseVersion} from './release-version.mjs';
import {BUILD_FILES} from './public-assets.mjs';
// Deploy only allowlisted public application files, never SQL/tests/private archives.
const APP_ROOT='apps/web';
const rootFiles=new Set(['LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md']);
const source=file=>rootFiles.has(file)?file:`${APP_ROOT}/${file}`;
const files=BUILD_FILES;
const pkg=JSON.parse(await readFile('package.json','utf8'));
const app=releaseVersion(await readFile(source('app.js'),'utf8'),pkg.version);
await rm('_site',{recursive:true,force:true});await mkdir('_site',{recursive:true});
for(const file of files)await copyFile(source(file),'_site/'+file);
await writeFile('_site/app.js',app);
await copyFile(source('folkoop.html'),'_site/index.html');
const city=await readFile(source('city-source.html'),'utf8');
if(!city.includes('</body>'))throw new Error('City source missing closing body');
await writeFile('_site/city.html',city.replace('</body>','<script src="./folkoop-city.js"></script>\n</body>'));
try{await cp('data','_site/data',{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile('_site/.nojekyll','');
console.log(`Prepared FOLKOOP v${pkg.version}: preserved City; network activation remains explicit.`);
