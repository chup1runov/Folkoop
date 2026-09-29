import {readdir,readFile} from 'node:fs/promises';
import {join,relative,extname} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const legacy=[['sver','inav'].join(''),['folk','uno'].join('')];
const skip=new Set(['.git','node_modules','_site','archive']);
const textExt=new Set(['.md','.txt','.js','.mjs','.cjs','.html','.css','.json','.yml','.yaml','.ts','.sql','.webmanifest']);

async function walk(dir){
  const out=[];
  for(const ent of await readdir(dir,{withFileTypes:true})){
    if(skip.has(ent.name))continue;
    const full=join(dir,ent.name);
    if(ent.isDirectory())out.push(...await walk(full));
    else if(textExt.has(extname(ent.name)) || ent.name==='LICENSE')out.push(full);
  }
  return out;
}

test('active FOLKOOP tree contains no superseded project brands',async()=>{
  const base=root.pathname;
  const files=await walk(base);
  const violations=[];
  for(const file of files){
    const rel=relative(base,file).replaceAll('\\','/');
    const lowPath=rel.toLowerCase();
    for(const word of legacy)if(lowPath.includes(word))violations.push(rel+' [path]');
    const content=(await readFile(file,'utf8')).toLowerCase();
    for(const word of legacy)if(content.includes(word))violations.push(rel+' [content]');
  }
  assert.deepEqual(violations,[]);
});
