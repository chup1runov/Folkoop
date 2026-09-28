import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const assets=[
 'ksyusha-please.webp','ksyusha-confident.webp','ksyusha-inspect.webp',
 'ksyusha-idea.webp','ksyusha-searching.webp','ksyusha-lean-in.webp','ksyusha-wink.webp'
];

function vp8x(buffer){
 assert.equal(buffer.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(buffer.subarray(8,12).toString('ascii'),'WEBP');
 assert.equal(buffer.subarray(12,16).toString('ascii'),'VP8X');
 return {flags:buffer[20],width:1+buffer.readUIntLE(24,3),height:1+buffer.readUIntLE(27,3)};
}

for(const asset of assets)test(`Mura pose ${asset} is canonical 192x208 alpha WebP`,async()=>{
 const file=await readFile(asset),meta=vp8x(file);
 assert.equal(meta.width,192);
 assert.equal(meta.height,208);
 assert(meta.flags&0x10,'VP8X alpha flag missing');
 assert(file.length>7000&&file.length<20000,'unexpected pose payload size');
});
