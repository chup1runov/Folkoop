import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';

const textExt=new Set(['.md','.txt','.json','.js','.mjs','.cjs','.ts','.html','.css','.yml','.yaml','.sql','.py','.sh','.webmanifest']);
const skipDirs=new Set(['.git','node_modules','_site','qa-output']);
const historicalPrefixes=['archive/','docs/history/','docs/proposals/'];
const forbidden=[
  {label:'former civic product name',re:/\bSverinav\b/i},
  {label:'former community product name',re:/\bFOLKUNO\b/i},
  {label:'former guide/project name',re:/\bMura\b/i},
  {label:'former guide filename prefix',re:/(^|\/)mura-/i}
];

async function walk(entry){
 const s=await stat(entry);
 if(s.isFile())return [entry];
 const out=[];
 for(const item of await readdir(entry,{withFileTypes:true})){
  if(item.isDirectory()&&skipDirs.has(item.name))continue;
  out.push(...await walk(path.join(entry,item.name)));
 }
 return out;
}

test('active FOLKOOP tree contains no retired internal brands',async()=>{
 const offenders=[];
 for(const file of await walk('.')){
  const normalized=file.replaceAll('\\','/').replace(/^\.\//,'');
  if(historicalPrefixes.some(prefix=>normalized.startsWith(prefix)))continue;
  for(const item of forbidden)if(item.re.test(normalized))offenders.push(normalized+': '+item.label+' in path');
  const ext=path.extname(normalized).toLowerCase();
  if(ext&&!textExt.has(ext))continue;
  let content;
  try{content=await readFile(file,'utf8');}catch{continue;}
  for(const item of forbidden)if(item.re.test(content))offenders.push(normalized+': '+item.label+' in text');
 }
 assert.deepEqual([...new Set(offenders)].sort(),[]);
});
