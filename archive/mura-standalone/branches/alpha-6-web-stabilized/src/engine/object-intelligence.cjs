'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.json', '.csv', '.tsv', '.log', '.xml', '.yml', '.yaml', '.js', '.cjs', '.mjs', '.ts', '.css', '.html']);
const MAX_READ_BYTES = 512 * 1024;
const MAX_INDEX_CHARS = 80_000;

function tokenize(value) {
  return [...new Set(String(value || '')
    .toLocaleLowerCase('ru-RU')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(token => token.length >= 2)
    .slice(0, 600))];
}

function canReadTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath || '').toLowerCase());
}

function readLocalText(filePath, options = {}) {
  if (!filePath || !fs.existsSync(filePath)) throw new Error('Файл недоступен.');
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) throw new Error('Папки нельзя читать как документ.');
  if (!canReadTextFile(filePath)) throw new Error('Этот формат пока не поддерживает локальное чтение содержимого.');
  const limit = Math.min(Math.max(Number(options.maxBytes || MAX_READ_BYTES), 1), MAX_READ_BYTES);
  const bytes = Math.min(stat.size, limit);
  const fd = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    const read = fs.readSync(fd, buffer, 0, bytes, 0);
    const decoded = buffer.subarray(0, read).toString('utf8').replace(/\u0000/g, '');
    const characterTruncated = decoded.length > MAX_INDEX_CHARS;
    const text = decoded.slice(0, MAX_INDEX_CHARS);
    return {
      text,
      truncated: stat.size > read || characterTruncated,
      bytesRead: read,
      totalBytes: stat.size,
      digest: crypto.createHash('sha256').update(text).digest('hex')
    };
  } finally {
    fs.closeSync(fd);
  }
}

function buildSearchDocument(item) {
  const fields = [item.name, item.title, item.note, item.contentExcerpt, item.extension, item.kind, ...(item.tags || [])];
  return tokenize(fields.filter(Boolean).join(' '));
}

function scoreObject(item, query) {
  const q = tokenize(query);
  if (!q.length) return 0;
  const doc = buildSearchDocument(item);
  if (!doc.length) return 0;
  const set = new Set(doc);
  let hits = 0;
  for (const token of q) if (set.has(token)) hits += 1;
  const title = String(item.title || item.name || '').toLocaleLowerCase('ru-RU');
  const exactish = q.some(token => title.includes(token)) ? 0.35 : 0;
  return Math.min(1, hits / q.length + exactish);
}

function searchObjects(items, query, limit = 12) {
  return items
    .map(item => ({ item, score: scoreObject(item, query) }))
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(row => ({ ...row.item, matchScore: row.score }));
}

module.exports = {
  TEXT_EXTENSIONS,
  MAX_READ_BYTES,
  tokenize,
  canReadTextFile,
  readLocalText,
  buildSearchDocument,
  scoreObject,
  searchObjects
};
