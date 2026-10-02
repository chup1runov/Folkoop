import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const assets=[
 'folkoop-guide-please.webp','folkoop-guide-confident.webp','folkoop-guide-inspect.webp',
 'folkoop-guide-idea.webp','folkoop-guide-searching.webp','folkoop-guide-lean-in.webp','folkoop-guide-wink.webp'
];

function vp8x(buffer){
 assert.equal(buffer.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(buffer.subarray(8,12).toString('ascii'),'WEBP');
 assert.equal(buffer.subarray(12,16).toString('ascii'),'VP8X');
 return {flags:buffer[20],width:1+buffer.readUIntLE(24,3),height:1+buffer.readUIntLE(27,3)};
}

for(const asset of assets)test(`FOLKOOP guide pose ${asset} is canonical 192x208 alpha WebP`,async()=>{
 const file=await readFile('apps/web/'+asset),meta=vp8x(file);
 assert.equal(meta.width,192);
 assert.equal(meta.height,208);
 assert(meta.flags&0x10,'VP8X alpha flag missing');
 assert(file.length>7000&&file.length<20000,'unexpected pose payload size');
});

test('runtime guide states use one Mura identity with authored pose artwork',async()=>{
 const runtime=await readFile('apps/web/folkoop-guide.js','utf8');
 assert.match(runtime,/const CANONICAL_MURA='\.\/folkoop-guide-confident\.webp'/);
 const expected=[
  "welcome:'./folkoop-guide-wink.webp'",
  "idle:CANONICAL_MURA",
  "confident:'./folkoop-guide-confident.webp'",
  "inspect:'./folkoop-guide-inspect.webp'",
  "searching:'./folkoop-guide-searching.webp'",
  "'lean-in':'./folkoop-guide-lean-in.webp'",
  "idea:'./folkoop-guide-idea.webp'",
  "'point-left':'./folkoop-guide-inspect.webp'",
  "'point-right':'./folkoop-guide-inspect.webp'",
  "'point-up':'./folkoop-guide-idea.webp'",
  "'point-down':'./folkoop-guide-lean-in.webp'"
 ];
 for(const entry of expected)assert(runtime.includes(entry),entry);
 assert(!/welcome:CANONICAL_MURA[\s\S]*'point-left':CANONICAL_MURA/.test(runtime),'tour states collapsed back to one praying pose');
});



test('tour never mixes the legacy alternate Mura PNG character set into runtime',async()=>{
 const runtime=await readFile('apps/web/folkoop-guide.js','utf8');
 for(const asset of ['folkoop-guide-point-left.png','folkoop-guide-point-right.png','folkoop-guide-point-up.png','folkoop-guide-point-down.png','folkoop-guide-sit-edge.png'])assert(!runtime.includes(asset),asset);
 for(const asset of ['folkoop-guide-confident.webp','folkoop-guide-inspect.webp','folkoop-guide-idea.webp','folkoop-guide-searching.webp','folkoop-guide-lean-in.webp','folkoop-guide-wink.webp'])assert(runtime.includes(asset),asset);
});
