'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const forbidden = [
  'Ksy'+'usha','Kse'+'nia','Kse'+'niia',
  '\u041a\u0441\u044e'+'\u0448\u0430',
  '\u041a\u0441\u0435'+'\u043d\u0438\u044f',
  'ksy'+'usha','kse'+'nia','kse'+'niia'
];
const roots = ['README.md','AGENTS.md','package.json','.github','assets','docs','src','test','tools'];
const textExt = new Set(['.md','.txt','.json','.js','.cjs','.mjs','.html','.css','.yml','.yaml','.sql','.ps1','.sh']);

function filesAt(entry) {
  if (!fs.existsSync(entry)) return [];
  const stat=fs.statSync(entry);
  if (stat.isFile()) return [entry];
  return fs.readdirSync(entry,{withFileTypes:true}).flatMap(item=>{
    if (item.name==='node_modules'||item.name==='.git') return [];
    return filesAt(path.join(entry,item.name));
  });
}

test('Mura is the only current character name in tracked text surfaces',()=>{
  const offenders=[];
  for (const file of roots.flatMap(filesAt)) {
    const ext=path.extname(file);
    if (ext && !textExt.has(ext)) continue;
    const content=fs.readFileSync(file,'utf8');
    for (const word of forbidden) if (content.includes(word)) offenders.push(`${file}: legacy character alias`);
  }
  assert.deepEqual(offenders,[]);
});
