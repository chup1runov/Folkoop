import {access,readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';

const ROOT='_site';
const HTML=['index.html','city.html','auth-callback.html'];

function localAssetRefs(html){
  const refs=[];
  for(const match of html.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)){
    refs.push(match[1]);
  }
  return refs;
}

async function exists(path){
  try{await access(path);return true;}catch{return false;}
}

const missing=[];

for(const file of HTML){
  const path=join(ROOT,file);
  if(!await exists(path)){missing.push(file);continue;}
  const html=await readFile(path,'utf8');
  for(const ref of localAssetRefs(html)){
    if(!await exists(join(ROOT,ref))) missing.push(`${file} -> ${ref}`);
  }
}

// Keep service-worker precache honest. Parsing the static array is deliberate:
// this is an artifact-closure check, not execution of service-worker code.
const sw=await readFile(join(ROOT,'sw.js'),'utf8');
const m=sw.match(/const CORE_PATHS=\[(.*?)\];/s);
if(!m) throw new Error('CORE_PATHS not found in built service worker');
for(const q of m[1].matchAll(/'([^']*)'/g)){
  const ref=q[1]||'index.html';
  if(!await exists(join(ROOT,ref))) missing.push(`sw CORE_PATHS -> ${ref}`);
}

const secretFindings=[];
const textExtensions=/\.(?:html?|js|mjs|json|css|webmanifest|txt|md)$/i;
async function walk(dir){
  const out=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory())out.push(...await walk(path));
    else out.push(path);
  }
  return out;
}
const secretPatterns=[
  ['Supabase secret key',/sb_secret_[A-Za-z0-9_-]+/],
  ['JWT-like credential',/eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/],
  ['service_role marker',/\bservice_role\b/i],
  ['client_secret assignment',/\bclient_secret\s*[:=]/i]
];
for(const path of await walk(ROOT)){
  if(!textExtensions.test(path))continue;
  const body=await readFile(path,'utf8');
  for(const [label,pattern] of secretPatterns){
    if(pattern.test(body))secretFindings.push(`${path}: ${label}`);
  }
}

if(missing.length){
  console.error('Built artifact contains missing local assets:');
  for(const item of [...new Set(missing)]) console.error('- '+item);
  process.exitCode=1;
}else{
  console.log('Built asset closure OK: HTML references and service-worker core assets exist.');
}
if(secretFindings.length){
  console.error('Built artifact contains forbidden secret-like material:');
  for(const item of [...new Set(secretFindings)]) console.error('- '+item);
  process.exitCode=1;
}else{
  console.log('Built public artifact secret-pattern audit OK.');
}
