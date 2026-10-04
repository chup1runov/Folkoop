import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {allowsOriginReference,originProvenanceDocuments} from '../support/origin-provenance-policy.mjs';

const forbidden=[
  {name:'legacy civic brand', pattern:new RegExp('sveri'+'nav','i')},
  {name:'legacy physical-space brand', pattern:new RegExp('folk'+'uno','i')},
];
const textExt=new Set(['.md','.txt','.json','.js','.mjs','.cjs','.html','.css','.yml','.yaml','.sql','.py','.sh']);
const skipDirs=new Set(['.git','node_modules','_site','qa-output','archive']);

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
    if(normalized.startsWith('docs/history/')||normalized.startsWith('docs/proposals/')||/^docs\/CHAT_HANDOFF_[^/]+\.md$/.test(normalized))continue;
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
        const match=line.match(rule.pattern);
        if(match && !allowsOriginReference(normalized,match[0]))offenders.push(normalized+':'+(index+1)+' ['+rule.name+'] '+line.trim().slice(0,180));
      }
    });
  }
  assert.deepEqual(offenders,[], 'Legacy project names remain outside approved provenance content:\n'+offenders.join('\n'));
});

test('origin attribution exceptions cover only the approved provenance documents',async()=>{
  assert.deepEqual(originProvenanceDocuments,[
    'AGENTS.md',
    'docs/FOUNDATION_CHARTER.md',
    'docs/UNIFICATION.md',
    'docs/NO_LOSS_REQUIREMENTS_REGISTER.md',
    'docs/NO_LOSS_REQUIREMENTS_REGISTER.json',
    'docs/architecture/adr/ADR-002-four-origin-foundation.md'
  ]);
  assert.equal(Object.isFrozen(originProvenanceDocuments),true);
  for(const file of originProvenanceDocuments){
    assert(['.md','.json'].includes(path.extname(file)),file);
    assert.equal((await stat(file)).isFile(),true);
    for(const rule of forbidden)assert.equal(allowsOriginReference(file,rule.pattern.source),true);
    assert.equal(allowsOriginReference(file,['SD','CF'].join('')),false);
  }
});

test('origin attribution cannot exempt runtime, arbitrary docs or lookalike paths',()=>{
  const forbiddenPaths=[
    'apps/web/app.js','apps/web/folkoop.html','package.json','README.md',
    'docs/README.md','docs/another.md','docs/FOUNDATION_CHARTER.md.js',
    'docs/nested/FOUNDATION_CHARTER.md','docs/NO_LOSS_REQUIREMENTS_REGISTER.md.js',
    'docs/nested/NO_LOSS_REQUIREMENTS_REGISTER.json','./AGENTS.md','AGENTS.md/extra'
  ];
  for(const file of forbiddenPaths){
    for(const rule of forbidden)assert.equal(allowsOriginReference(file,rule.pattern.source),false,file);
  }
  assert.equal(allowsOriginReference(null,'name'),false);
  assert.equal(allowsOriginReference('AGENTS.md',null),false);
});
