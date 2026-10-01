'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const [dirArg, outputArg, ...extensions] = process.argv.slice(2);
if (!dirArg || !outputArg || !extensions.length) {
  console.error('Usage: node tools/write-checksums.cjs <dir> <output> <.ext> [<.ext> ...]');
  process.exit(2);
}

const dir = path.resolve(dirArg);
const output = path.resolve(outputArg);
const allowed = new Set(extensions.map(value => String(value).toLowerCase()));

const files = fs.readdirSync(dir, { withFileTypes: true })
  .filter(entry => entry.isFile() && allowed.has(path.extname(entry.name).toLowerCase()))
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b));

if (!files.length) {
  console.error('No build artifacts matched the requested extensions.');
  process.exit(1);
}

const lines = files.map(name => {
  const bytes = fs.readFileSync(path.join(dir, name));
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  return `${digest}  ${name}`;
});

fs.writeFileSync(output, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote SHA256 for ${files.length} artifact(s) to ${path.basename(output)}`);
