import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('installable manifest ships correctly sized FOLKOOP raster icons',async()=>{
 const m=JSON.parse(await readFile('manifest.webmanifest','utf8'));
 for(const size of [192,512]){
  const i=m.icons.find(x=>x.sizes===`${size}x${size}`);assert(i);
  const png=await readFile(i.src);
  assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
 }
});
