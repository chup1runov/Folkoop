import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const box={};vm.runInNewContext(readFileSync('apps/web/resource-planning-copy.js','utf8'),box);
const copy=box.FolkoopResourceCopy,expected=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk'];
test('same eleven supported languages',()=>assert.deepEqual(Array.from(copy.languages).sort(),expected.slice().sort()));
for(const code of expected)test(`complete explicit ${code} copy`,()=>{const p=copy.get(code);assert.deepEqual(Object.keys(p).sort(),Object.keys(copy.get('en')).sort());assert.ok(Object.isFrozen(p));assert.ok(Object.values(p).every(v=>typeof v==='string'&&v.length>0));assert.ok(p.boundary&&p.audienceOwner&&p.conflict&&p.discard&&p.demo);});
test('unsupported locale falls back to English',()=>assert.equal(copy.get('xx'),copy.get('en')));
