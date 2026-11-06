// Local workflow metadata only. No application imports, network or subprocesses.
import {readFile, writeFile, realpath, readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, relative, dirname, isAbsolute, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const digest = text => createHash('sha256').update(text).digest('hex');
const required = (condition, message) => { if (!condition) throw new Error(message); };
const nonempty = x => typeof x === 'string' && x.trim().length > 0;
const date = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && new Date(x).toISOString().slice(0,10) === x;
const unique = (items, label) => {
  required(Array.isArray(items), `${label}: expected array`);
  const ids = items.map(x => x.id);
  required(ids.every(nonempty) && new Set(ids).size === ids.length, `${label}: missing/duplicate ID`);
  return new Set(ids);
};
export function validateState(s) {
  required(s.schema_version === 1 && /^FK-[A-Z0-9-]+$/.test(s.id), 'state identity/schema');
  required(date(s.updated) && nonempty(s.spec) && nonempty(s.next_action), 'state date/spec/next_action');
  required(['plan_review','implementation','verification','independent_review','finalizing','complete','blocked'].includes(s.phase), 'state phase');
  required(s.authorization?.status === 'accepted' && date(s.authorization.date) && nonempty(s.authorization.scope), 'authorization');
  required(Array.isArray(s.open_questions), 'open_questions');
  const reqs = unique(s.requirements, 'requirements');
  unique(s.tasks, 'tasks');
  const evidence = unique(s.evidence, 'evidence');
  required(reqs.size > 0 && s.tasks.length > 0, 'empty task/requirements');
  const checks = new Set();
  for (const r of s.requirements) {
    required(r.id.startsWith(s.id + '-R') && Array.isArray(r.checks) && r.checks.length > 0, 'requirement ID/checks');
    for (const c of r.checks) { required(/^C\d{2,}$/.test(c), 'check ID'); checks.add(c); }
  }
  for (const e of s.evidence) {
    required(e.id.startsWith(s.id + '-E') && nonempty(e.path), 'evidence ID/path');
    required(['deterministic','agent-review','owner-decision','historical'].includes(e.kind), 'evidence kind');
    required(['passed','failed','limited','not-run'].includes(e.result), 'evidence result');
    required(Array.isArray(e.checks) && e.checks.every(c => checks.has(c)), 'unknown evidence check');
  }
  for (const t of s.tasks) {
    required(t.id.startsWith(s.id + '-T') && ['pending','in_progress','done','blocked'].includes(t.status), 'task ID/status');
    required(Array.isArray(t.requirements) && t.requirements.length > 0 && t.requirements.every(id => reqs.has(id)), 'unknown task requirement');
    required(Array.isArray(t.evidence) && t.evidence.every(id => evidence.has(id)), 'unknown task evidence');
    if (t.status === 'done') required(t.evidence.length > 0, 'done task without evidence');
  }
  if (s.phase === 'complete') {
    required(s.tasks.every(t => t.status === 'done'), 'complete with unfinished tasks');
    for (const r of s.requirements) {
      const linkedTasks = s.tasks.filter(t => t.requirements.includes(r.id));
      required(linkedTasks.length > 0, `requirement without task: ${r.id}`);
      for (const c of r.checks) required(linkedTasks.some(t => t.evidence.some(id =>
        s.evidence.some(e => e.id === id && e.result === 'passed' && e.checks.includes(c))
      )), `complete without passed linked ${c} for ${r.id}`);
    }
  }
  return {requirements: reqs.size, tasks: s.tasks.length, evidence: evidence.size, checks: checks.size};
}

export async function validateSources(registry, read) {
  required(registry.schema_version === 1 && nonempty(registry.scope), 'registry schema/scope');
  unique(registry.sources, 'sources');
  const stale = [];
  for (const s of registry.sources) {
    required(nonempty(s.path) && nonempty(s.status) && nonempty(s.checked_scope) && date(s.checked_at), `source metadata: ${s.id}`);
    required(/^[a-f0-9]{64}$/.test(s.sha256), `source fingerprint: ${s.id}`);
    if (digest(await read(s.path)) !== s.sha256) stale.push(s.id);
  }
  required(stale.length === 0, `stale sources; re-read and reassess before refreshing: ${stale.join(', ')}`);
  return registry.sources.length;
}

export function appendJournalEntry(log, entry, knownSources) {
  required(/^FK-[A-Z0-9-]+$/.test(entry.id) && date(entry.date), 'journal ID/date');
  required(nonempty(entry.title) && !/[\r\n]/.test(entry.title) && nonempty(entry.body), 'journal title/body');
  required(!/<!--\s*\/?workflow-entry:/.test(entry.title + entry.body), 'embedded journal marker');
  required(Array.isArray(entry.sources) && entry.sources.length > 0 && entry.sources.every(id => knownSources.has(id)), 'unknown journal source');
  const start = `<!-- workflow-entry:${entry.id} -->`;
  const end = `<!-- /workflow-entry:${entry.id} -->`;
  const block = `${start}\n## [${entry.date}] ${entry.id} | ${entry.title}\n\n${entry.body.trim()}\n\nИсточники реестра: ${entry.sources.join(', ')}.\n${end}`;
  const pos = log.indexOf(start);
  if (pos >= 0) {
    required(log.indexOf(start, pos + start.length) === -1, 'duplicate journal marker');
    const endAt = log.indexOf(end, pos);
    required(endAt >= 0 && log.slice(pos, endAt + end.length) === block, 'same journal ID with different content; append a superseding entry');
    return {text: log, changed: false};
  }
  return {text: log + (log.endsWith('\n\n') ? '' : log.endsWith('\n') ? '\n' : '\n\n') + block + '\n', changed: true};
}

export async function inside(root, name) {
  required(nonempty(name) && !isAbsolute(name), 'repository-relative path required');
  const target = resolve(root, name), rel = relative(root, target);
  required(rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel), 'path escapes repository');
  const actual = await realpath(target), actualRel = relative(await realpath(root), actual);
  required(actualRel !== '..' && !actualRel.startsWith('..' + sep) && !isAbsolute(actualRel), 'symlink escapes repository');
  return target;
}

async function markdownFiles(root, dir) {
  const out = [];
  for (const item of await readdir(resolve(root, dir), {withFileTypes:true})) {
    if (item.isDirectory()) out.push(...await markdownFiles(root, dir + '/' + item.name));
    else if (item.name.endsWith('.md')) out.push(dir + '/' + item.name);
  }
  return out;
}
export async function check(root, statePath) {
  const s = JSON.parse(await readFile(await inside(root, statePath), 'utf8'));
  const counts = validateState(s);
  await inside(root, s.spec);
  const spec = await readFile(resolve(root, s.spec), 'utf8');
  for (const x of [...s.requirements, ...s.tasks]) required(spec.includes(x.id), `ID absent from spec: ${x.id}`);
  for (const e of s.evidence) await inside(root, e.path);
  const registry = JSON.parse(await readFile(resolve(root, 'docs/wiki/sources.json'), 'utf8'));
  const sources = await validateSources(registry, async p => readFile(await inside(root, p)));
  let localLinks = 0;
  const pages = ['AGENTS.md', ...await markdownFiles(root,'docs/wiki'), ...await markdownFiles(root,'docs/workflow')];
  for (const page of pages) {
    const text = await readFile(await inside(root, page), 'utf8');
    for (const match of text.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      let link = match[1].trim().replace(/^<|>$/g,'');
      if (/^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith('#')) continue;
      link = decodeURIComponent(link.split('#')[0]);
      if (!link) continue;
      await inside(root, relative(root, resolve(root, dirname(page), link)));
      localLinks++;
    }
  }
  return {...counts, sources, markdownPages:pages.length, localLinks, limits:'Structure and local file targets only; not semantic truth, anchors, external URLs or application readiness.'};
}

async function main() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const [action, path, ...extra] = process.argv.slice(2);
  required(extra.length === 0 && nonempty(path), 'Usage: workflow.mjs check <task.state.json> | record <entry.json>');
  if (action === 'check') {
    console.log(JSON.stringify({result:'passed', ...await check(root,path)},null,2));
  } else if (action === 'record') {
    const registry = JSON.parse(await readFile(resolve(root, 'docs/wiki/sources.json'),'utf8'));
    const entry = JSON.parse(await readFile(await inside(root,path),'utf8'));
    const target = await inside(root,'docs/wiki/log.md');
    const result = appendJournalEntry(await readFile(target,'utf8'), entry, new Set(registry.sources.map(s=>s.id)));
    if (result.changed) await writeFile(target,result.text);
    console.log(JSON.stringify({result:result.changed ? 'appended' : 'unchanged',id:entry.id}));
  } else throw new Error('Unknown action; nothing written');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}
