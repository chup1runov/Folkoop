import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';

const legacy=[
  'ksy'+'usha','kse'+'nia','kse'+'niia',
  '\u043a\u0441\u044e'+'\u0448\u0430',
  '\u043a\u0441\u0435'+'\u043d\u0438\u044f'
];
const roots=['README.md','package.json','.github','docs','scripts','tests','supabase',
 'folkoop.js','folkoop.css','folkoop.html','mura-guide.js','mura-guide.css','sw.js'];
const textExt=new Set(['.md','.txt','.json','.js','.mjs','.cjs','.html','.css','.yml','.yaml','.sql','.py','.sh']);

async function walk(entry){
 try{
  const s=await stat(entry);
  if(s.isFile())return [entry];
  const items=await readdir(entry,{withFileTypes:true});
  const out=[];
  for(const item of items){
   if(item.name==='node_modules'||item.name==='.git')continue;
   out.push(...await walk(path.join(entry,item.name)));
  }
  return out;
 }catch{return [];}
}

test('Mura is the sole current character name and filename prefix',async()=>{
 const offenders=[];
 for(const file of (await Promise.all(roots.map(walk))).flat()){
  const lower=file.toLowerCase();
  for(const word of legacy)if(lower.includes(word))offenders.push(file+': legacy path');
  const ext=path.extname(file);
  if(ext&&!textExt.has(ext))continue;
  const content=(await readFile(file,'utf8')).toLowerCase();
  for(const word of legacy)if(content.includes(word))offenders.push(file+': legacy text');
 }
 assert.deepEqual(offenders,[]);
});
