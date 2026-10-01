import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {extname,relative} from 'node:path';

const forbidden=[
  ['Sver','inav'].join(''),
  ['FOLK','UNO'].join(''),
  ['SD','CF'].join('')
];
const skipDirs=new Set(['.git','node_modules','_site','qa-output','archive']);
const textExt=new Set(['.md','.txt','.json','.js','.mjs','.cjs','.ts','.tsx','.html','.css','.yml','.yaml','.sql','.toml','.xml','.webmanifest','']);

async function walk(dir='.'){
  const out=[];
  for(const ent of await readdir(dir,{withFileTypes:true})){
    if(ent.isDirectory()&&skipDirs.has(ent.name)) continue;
    const path=dir==='.'?ent.name:dir+'/'+ent.name;
    if(ent.isDirectory()) out.push(...await walk(path));
    else out.push(path);
  }
  return out;
}

test('current tree exposes only the FOLKOOP project identity',async()=>{
  const violations=[];
  for(const path of await walk('.')){
    const name=relative('.',path);
    if(name.startsWith('docs/history/')||/^docs\/CHAT_HANDOFF_[^/]+\.md$/.test(name)) continue;
    for(const word of forbidden) if(name.toLowerCase().includes(word.toLowerCase())) violations.push(`path: ${name}`);
    if(!textExt.has(extname(path)) && !['LICENSE','README','CONTRIBUTING'].includes(name)) continue;
    let text;
    try{text=await readFile(path,'utf8');}catch{continue;}
    for(const word of forbidden){
      const re=new RegExp(word,'i');
      if(re.test(text)) violations.push(`content: ${name} -> ${word}`);
    }
  }
  assert.deepEqual(violations,[]);
});
