import {mkdir,copyFile,cp,rm,writeFile} from 'node:fs/promises';
const files=['index.html','styles.css','civic-core.js','daily-data.js','today.js','riksdagen.js','nvdb.js','goteborg-plans.js','app.js','manifest.webmanifest','sw.js','icon.svg','icon-180.png','icon-192.png','icon-512.png'];
await rm('_site',{recursive:true,force:true});await mkdir('_site',{recursive:true});
for(const file of files)await copyFile(file,'_site/'+file);
try{await cp('data','_site/data',{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile('_site/.nojekyll','');
console.log('Prepared exact static app, excluding source, tests, conversation archives and secrets.');
