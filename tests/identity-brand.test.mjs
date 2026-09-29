import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';

const forbidden=[
  {name:'legacy civic brand', pattern:/sverinav/i},
  {name:'legacy physical-space brand', pattern:/folkuno/i},
  {name:'legacy guide/project brand', pattern:/\bmura\b/i}
];
const textExt=new Set(['.md','.txt','.json','.js','.mjs','.cjs','.html','.css','.yml','.yaml','.sql','.py','.sh']);
const skipDirs=new Set(['.git','node_modules','_site','qa-output']);

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

test('FOLKOOP is the only current project brand',async()=>{
  const offenders=[];
  for(const file of await walk('.')){
    const normalized=file.replaceAll('\\','/');
    for(const rule of forbidden){
      if(rule.pattern.test(normalized))offenders.push(normalized+' [path: '+rule.name+']');
      rule.pattern.lastIndex=0;
    }
    const ext=path.extname(file).toLowerCase();
    if(ext&&!textExt.has(ext))continue;
    let content;
    try{content=await readFile(file,'utf8');}catch{continue;}
    const lines=content.split(/\r?\n/);
    lines.forEach((line,index)=>{
      for(const rule of forbidden){
        rule.pattern.lastIndex=0;
        if(rule.pattern.test(line))offenders.push(normalized+':'+(index+1)+' ['+rule.name+'] '+line.trim().slice(0,180));
      }
    });
  }
  assert.deepEqual(offenders,[], 'Legacy project names remain in the current tree:\n'+offenders.join('\n'));
});
