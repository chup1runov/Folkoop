import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';

const legacy=[
  'ksy'+'usha','kse'+'nia','kse'+'niia',
  '\u043a\u0441\u044e'+'\u0448\u0430',
  '\u043a\u0441\u0435'+'\u043d\u0438\u044f'
];
const textExt=new Set(['.md','.txt','.json','.js','.mjs','.cjs','.html','.css','.yml','.yaml','.sql','.py','.sh']);
const skipDirs=new Set(['.git','node_modules','_site','qa-output','archive']);

async function walk(entry){
 const s=await stat(entry);
 if(s.isFile())return [entry];
 const items=await readdir(entry,{withFileTypes:true}),out=[];
 for(const item of items){
  if(item.isDirectory()&&skipDirs.has(item.name))continue;
  out.push(...await walk(path.join(entry,item.name)));
 }
 return out;
}

test('Mura is the canonical current guide identity without personal-name leakage',async()=>{
 const offenders=[];
 for(const file of await walk('.')){
  const normalized=file.replaceAll('\\','/').toLowerCase();
  if(normalized.startsWith('docs/history/folkoop-guide/')||normalized.startsWith('docs/history/mura/'))continue;
  for(const word of legacy)if(normalized.includes(word))offenders.push(normalized+': legacy path');
  const ext=path.extname(file).toLowerCase();
  if(ext&&!textExt.has(ext))continue;
  const content=(await readFile(file,'utf8')).toLowerCase();
  for(const word of legacy)if(content.includes(word))offenders.push(normalized+': legacy text');
 }
 assert.deepEqual([...new Set(offenders)].sort(),[]);
 const runtime=(await readFile('apps/web/folkoop.js','utf8'))+(await readFile('apps/web/folkoop-i18n-extra.js','utf8'));
 assert.match(runtime,/\bMura\b/);
});
