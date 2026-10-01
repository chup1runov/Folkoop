'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const roots = ['src', 'tools', 'test'];
const files = [];

function walk(relative) {
  const full = path.join(root, relative);
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) walk(child);
    else if (/\.(?:cjs|js)$/.test(entry.name)) files.push(child);
  }
}

for (const relative of roots) walk(relative);
files.sort();

let failed = 0;
for (const relative of files) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, relative)], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed += 1;
    process.stderr.write(`Syntax check failed: ${relative}\n${result.stderr || result.stdout || ''}\n`);
  }
}

if (failed) {
  process.stderr.write(`${failed} JavaScript file(s) failed syntax validation.\n`);
  process.exit(1);
}

process.stdout.write(`Syntax OK: ${files.length} JavaScript file(s).\n`);
