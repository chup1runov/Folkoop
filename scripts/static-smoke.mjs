import {readFile,access,readdir} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const read=f=>readFile(f,'utf8');
const html=await read('index.html'),app=await read('app.js'),sw=await read('sw.js');
const manifest=JSON.parse(await read('manifest.webmanifest')),pkg=JSON.parse(await read('package.json'));
assert.equal(app.match(/const APP_VERSION = '([^']+)'/)[1],pkg.version,'UI/package version mismatch');
assert.equal(sw.match(/const VERSION='([^']+)'/)[1],pkg.version,'SW/package version mismatch');
for(const match of html.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g))await access(match[1]);
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
assert.equal(Object.keys(ctx.SverinavToday.COPY).length,11);
for(const [lang,values] of Object.entries(ctx.SverinavToday.COPY))assert.equal(values.length,ctx.SverinavToday.KEYS.length,`Missing Idag translation: ${lang}`);
for(const f of ['docs/IDAG_AND_AUDIT.md','docs/PILOT_GUIDE.md','.github/ISSUE_TEMPLATE/pilot-feedback.md'])await access(f);
console.log('Static checks passed: linked assets, versions, decoded PNG streams, eleven Idag translations and audit documentation.');
