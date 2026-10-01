import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const assets=[
 'folkoop-guide-confident.webp','folkoop-guide-inspect.webp',
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

const pngAssets=['folkoop-guide-point-left.png','folkoop-guide-point-right.png','folkoop-guide-point-up.png','folkoop-guide-point-down.png','folkoop-guide-sit-edge.png'];
function pngMeta(buffer){
 assert.equal(buffer.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(buffer.subarray(12,16).toString('ascii'),'IHDR');
 return {width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20),bitDepth:buffer[24],colorType:buffer[25]};
}
for(const asset of pngAssets)test(`FOLKOOP guide v0.29 pose ${asset} is canonical 192x208 RGBA PNG`,async()=>{
 const file=await readFile('apps/web/'+asset),meta=pngMeta(file);
 assert.deepEqual(meta,{width:192,height:208,bitDepth:8,colorType:6});
 assert(file.length>20_000&&file.length<50_000,'unexpected pose payload size');
});


test('runtime guide states resolve to one canonical Mura artwork',async()=>{
 const runtime=await readFile('apps/web/folkoop-guide.js','utf8');
 assert.match(runtime,/const CANONICAL_MURA='\\.\\/folkoop-guide-confident\\.webp'/);
 const expected=["welcome:CANONICAL_MURA","idle:CANONICAL_MURA","idea:CANONICAL_MURA","wink:CANONICAL_MURA","'point-left':CANONICAL_MURA","'point-right':CANONICAL_MURA","'point-up':CANONICAL_MURA","'point-down':CANONICAL_MURA","'sit-edge':CANONICAL_MURA"];
 for(const entry of expected)assert(runtime.includes(entry),entry);
});
