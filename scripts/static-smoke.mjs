import {readFile,access} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {releaseVersion} from './release-version.mjs';
const read=f=>readFile(f,'utf8');
const html=await read('index.html'),app=await read('app.js'),sw=await read('sw.js');
const manifest=JSON.parse(await read('manifest.webmanifest')),pkg=JSON.parse(await read('package.json'));
const stamped=releaseVersion(app,pkg.version);
assert.equal(stamped.match(/const APP_VERSION = '([^']+)'/)[1],pkg.version,'Built UI/package mismatch');
assert.equal(sw.match(/const VERSION='([^']+)'/)[1],pkg.version,'SW/package version mismatch');
for(const match of html.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g))await access(match[1]);
assert(html.includes('href="./compact.css"'),'Compact stylesheet missing');
for(const icon of manifest.icons)await access(icon.src);
for(const size of [180,192,512]){
 const png=await readFile(`icon-${size}.png`);
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
 let offset=8;const data=[];
 while(offset+12<=png.length){const n=png.readUInt32BE(offset),name=png.toString('ascii',offset+4,offset+8);if(name==='IDAT')data.push(png.subarray(offset+8,offset+8+n));offset+=n+12;}
 assert(inflateSync(Buffer.concat(data)).length>size*size,'PNG image stream invalid');
}
const ctx=vm.createContext({console});vm.runInContext(await read('today.js'),ctx);
for(const [copy,keys] of [[ctx.SverinavToday.COPY,ctx.SverinavToday.KEYS],[ctx.SverinavToday.COMPACT_COPY,ctx.SverinavToday.COMPACT_KEYS]]){
 assert.equal(Object.keys(copy).length,11);
 for(const [lang,values] of Object.entries(copy))assert.equal(values.length,keys.length,`Missing translation: ${lang}`);
}
for(const f of ['docs/IDAG_AND_AUDIT.md','docs/COMPACT_V012.md','docs/PILOT_GUIDE.md','.github/ISSUE_TEMPLATE/pilot-feedback.md'])await access(f);
console.log('Static checks passed: linked assets, release version, decoded PNGs, eleven Compact translations and documentation.');
