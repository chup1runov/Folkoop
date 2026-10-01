/* Packaging/consistency checks, not certification of legal enforceability. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,rm,writeFile,copyFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {BUILD_FILES} from '../../scripts/build/public-assets.mjs';
const root=process.cwd();
const license=(await readFile('LICENSE','utf8')).replace(/\s+/g,' ');
const pkg=JSON.parse(await readFile('package.json','utf8'));
const licensing=(await readFile('LICENSING.md','utf8')).replace(/\s+/g,' ');
test('rights: operative notice and package metadata agree',()=>{
 assert(license.includes('Version 1.1 — 29 September 2026'));
 assert(!license.includes('DRAFT FOR'));
 assert(license.includes('All rights reserved'));
 assert(license.includes('not an open-source or free-software'));
 assert.equal(pkg.license,'SEE LICENSE IN LICENSE');
 assert.equal(pkg.private,true);
 assert(licensing.includes('Rights notice v1.1, 29 September 2026'));
 assert(licensing.includes('parts of one project identity'));
 assert(licensing.includes('do not create separate licences'));
});
test('rights: GitHub and mandatory-law boundaries override approval',()=>{
 for(const marker of ['boundaries in section 5 prevail','Nothing in this notice withdraws','conditions on owner approval','including authorised forking','GitHub permissions and statutory rights do','does not rewrite Git history']){
  assert(license.includes(marker),marker);
 }
});
test('rights: resident use and independent rights are preserved',()=>{
 for(const marker of ['without a fee to FOLKOOP','installed-PWA offline','retain their own rights','third-party','No automatic conversion','prior express written','non-commercial'])assert(license.includes(marker),marker);
});
test('rights: built artifact ships exact notices without changing application code',async()=>{
 const files=[...BUILD_FILES];
 for(const name of ['LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md'])assert(files.includes(name));
 const tmp=await mkdtemp(path.join(os.tmpdir(),'folkoop-rights-'));
 try{
  await mkdir(path.join(tmp,'scripts','build'),{recursive:true});
  await mkdir(path.join(tmp,'apps','web'),{recursive:true});
  await copyFile(path.join(root,'scripts/build/build-site.mjs'),path.join(tmp,'scripts/build/build-site.mjs'));
  await copyFile(path.join(root,'scripts/build/release-version.mjs'),path.join(tmp,'scripts/build/release-version.mjs'));
  await copyFile(path.join(root,'scripts/build/public-assets.mjs'),path.join(tmp,'scripts/build/public-assets.mjs'));
  await writeFile(path.join(tmp,'package.json'),JSON.stringify(pkg));
  for(const name of files){
   const appSource=!['LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md'].includes(name);
   const from=appSource?path.join(root,'apps','web',name):path.join(root,name);
   const to=appSource?path.join(tmp,'apps','web',name):path.join(tmp,name);
   await copyFile(from,to);
  }
  const run=spawnSync(process.execPath,['scripts/build/build-site.mjs'],{cwd:tmp,encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  for(const name of files){
   if(name==='app.js')continue;
   assert.deepEqual(await readFile(path.join(tmp,'_site',name)),await readFile(['LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md'].includes(name)?path.join(root,name):path.join(root,'apps','web',name)),name);
  }
  const sourceApp=await readFile(path.join(root,'apps','web','app.js'),'utf8');
  const expected=sourceApp.replace(/const APP_VERSION = '[^']+';/,`const APP_VERSION = '${pkg.version}';`);
  assert.equal(await readFile(path.join(tmp,'_site/app.js'),'utf8'),expected);
 }finally{await rm(tmp,{recursive:true,force:true});}
});
