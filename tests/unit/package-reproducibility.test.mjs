import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const pkg=JSON.parse(await readFile('package.json','utf8'));
const lock=JSON.parse(await readFile('package-lock.json','utf8'));

test('npm metadata is dependency-free and lockfile matches package identity',()=>{
  assert.equal(pkg.name,'folkoop');
  assert.equal(pkg.private,true);
  assert.equal(pkg.dependencies,undefined);
  assert.equal(pkg.devDependencies,undefined);
  assert.equal(lock.lockfileVersion,3);
  assert.equal(lock.name,pkg.name);
  assert.equal(lock.version,pkg.version);
  assert.deepEqual(Object.keys(lock.packages),['']);
  assert.equal(lock.packages[''].name,pkg.name);
  assert.equal(lock.packages[''].version,pkg.version);
  assert.equal(lock.packages[''].license,pkg.license);
});

test('local start uses the repository Node dev server, not an external CLI',()=>{
  assert.equal(pkg.scripts.start,'node scripts/build/build-site.mjs && node scripts/build/dev-server.mjs');
});
