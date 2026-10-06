/* Isolated integration candidate. NEVER edits apps/web or the production _site. */
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, realpathSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const baseline = Object.freeze({
  'network-client.js': '5053218d14b37450711a75484e71c55d06285e09',
  'network-ui.js': '39c39696971fe9aa93fd3378acd59d9ea3dcc0e8',
  'folkoop.html': 'f47aef1333012b109f7863731ef21e49d3a29945'
});
export function replaceOnce(source, anchor, replacement) {
  if (source.split(anchor).length !== 2) throw new Error('R1 integration anchor changed: ' + anchor.slice(0, 60));
  return source.replace(anchor, replacement);
}
export function verifySource(name, text) {
  const bytes = Buffer.from(text), sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (sha !== baseline[name]) throw new Error('R1 baseline changed; review integration: ' + name);
}
export function patchClient(source) {
  verifySource('network-client.js', source);
  source = replaceOnce(source, "auth=true,token}={})", "auth=true,token,resource=false}={})");
  source = replaceOnce(source, 'const version=epoch,controller=', 'const version=epoch,authVersion=authAttempt,controller=');
  if(source.split("if(version!==epoch)throw fail('STALE');").length!==3)throw new Error('R1 response guard anchors changed');
  source=source.replaceAll("if(version!==epoch)throw fail('STALE');","if(version!==epoch||(auth&&authVersion!==authAttempt))throw fail('STALE');");
  // Do not let an old delayed error body clear a newer session.
  source = replaceOnce(source, "    if(response.status===401)", "    if(version!==epoch||(auth&&authVersion!==authAttempt))throw fail('STALE');\n    if(resource&&detail?.code==='40001')throw fail('RESOURCE_CONFLICT');\n    if(resource&&['PGRST202','PGRST205','42P01'].includes(detail?.code))throw fail('RESOURCE_SCHEMA_UNAVAILABLE');\n    if(resource&&detail?.code==='22023')throw fail('INVALID_INPUT');\n    if(response.status===401)");
  source = replaceOnce(source, ' return Object.freeze({\n  enabled:', ` return Object.freeze({
  resourcePlanning:value?.resourcePlanningEnabled===true?globalThis.FolkoopResourceTransport.create({request,context:()=>({userId:user()?.id||null,epoch:String(epoch)+':'+String(authAttempt)}),onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);}}):null,
  enabled:`);
  return source;
}
export function patchUI(source) {
  verifySource('network-ui.js', source);
  // Hooks sit inside the reviewed lexical scope, not an event carrying private data.
  source = replaceOnce(source, 'const coopProfile=id=>', 'let resourcePlanningContext=null,resourcePlanningDomain=null;\nconst coopProfile=id=>');
  source = replaceOnce(source, '  if(myNextTask)html+=', `  if(['project','resource'].includes(coop.kind)&&(member||owner||guestDemo)){
   resourcePlanningContext={coop,owner,member:!!member,readOnly:guestDemo,user:u,language:lang(),busy};
   html+='<section data-resource-planning-panel></section>';
  }
  if(myNextTask)html+=`);
  source = replaceOnce(source, 'function render(){', 'function render(){\n resourcePlanningContext=null;');
  source = replaceOnce(source, ' syncBadges();\n queueMicrotask', ` if(!resourcePlanningDomain)resourcePlanningDomain=globalThis.FolkoopResourceForms.create({api:api?.resourcePlanning});
 resourcePlanningDomain.mount(host.querySelector('[data-resource-planning-panel]'),resourcePlanningContext);
 syncBadges();
 queueMicrotask`);
  return source;
}
export function patchHTML(source) {
  verifySource('folkoop.html', source);
  return replaceOnce(source, '<script defer src="./network-config.js">',
    '<script defer src="./resource-planning-core.js"></script><script defer src="./resource-planning-lifecycle.js"></script><script defer src="./resource-planning-transport.js"></script><script defer src="./resource-planning-copy.js"></script><script defer src="./resource-planning-forms.js"></script><link rel="stylesheet" href="./resource-planning-forms.css"><script defer src="./network-config.js">');
}
export function stage(root = process.cwd()) {
  const source = join(root, 'apps/web'), built = join(root, '_site');
  const output = join(root, '_qa/R1/Folkoop');
  // Fixed test-only destination; reject symlinks that could redirect writes to _site.
  for (const path of ['_qa', '_qa/R1', '_qa/R1/Folkoop']) {
    const p = join(root, path);
    if (existsSync(p) && realpathSync(p) !== resolve(p)) throw new Error('R1 destination must not be a symlink');
  }
  mkdirSync(output, {recursive: true}); cpSync(built, output, {recursive: true});
  for (const name of ['resource-planning-core.js','resource-planning-lifecycle.js','resource-planning-transport.js','resource-planning-copy.js','resource-planning-forms.js','resource-planning-forms.css']) cpSync(join(source,name),join(output,name));
  for (const [name, patch] of [['network-client.js',patchClient],['network-ui.js',patchUI],['folkoop.html',patchHTML]]) writeFileSync(join(output,name),patch(readFileSync(join(source,name),'utf8')));
  return output;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(stage());
