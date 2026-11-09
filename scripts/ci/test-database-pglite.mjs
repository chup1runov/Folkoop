// Disposable in-memory PostgreSQL only. No database URL or hosted credentials.
// PGlite supplements, not replaces, the PostgreSQL/Docker CI and concurrency tests.
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.env.PGLITE_MODULE_DIR;
if(!root)throw Error('Set PGLITE_MODULE_DIR to the verified @electric-sql/pglite package directory');
const meta=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
if(meta.name!=='@electric-sql/pglite'||meta.version!=='0.5.16')throw Error('Expected pinned @electric-sql/pglite 0.5.16');
const {PGlite}=await import(pathToFileURL(resolve(root,'dist/index.js')));
const {pgcrypto}=await import(pathToFileURL(resolve(root,'dist/contrib/pgcrypto.js')));
const db=new PGlite({extensions:{pgcrypto}});
let migrations=0,tests=0;
async function run(file){
 const sql=(await readFile(file,'utf8')).replace(/^\\set ON_ERROR_STOP (?:on|1)\s*$/gm,'');
 const vars=new Map();
 const substitute=text=>text.replace(/:'([a-zA-Z_][a-zA-Z_0-9]*)'/g,(_,key)=>{if(!vars.has(key))throw Error('Unknown psql variable '+key);const value=vars.get(key);return value===null?'NULL':"'"+String(value).replaceAll("'","''")+"'";});
 try{
  const chunks=sql.split(/\\(gset|gexec)[ \t]*(?:\r?\n|$)/);
  for(let i=0;i<chunks.length;i+=2){
   if(/^\\/m.test(chunks[i]))throw Error('Unsupported psql meta-command');
   const result=await db.exec(substitute(chunks[i]));
   if(chunks[i+1]==='gset'){const rows=result.at(-1)?.rows;if(rows?.length!==1)throw Error('gset requires exactly one row');for(const [key,value] of Object.entries(rows[0]))vars.set(key,value);}
   if(chunks[i+1]==='gexec')for(const row of result.at(-1)?.rows||[])for(const value of Object.values(row))if(value!==null)await db.exec(String(value));
  }
 }catch(e){throw Error(file+': '+e.message,{cause:e});}
}
try{
 await run('supabase/tests/network-bootstrap.sql');
 for(const file of (await readdir('supabase/migrations')).filter(x=>x.endsWith('.sql')).sort()){
  await run('supabase/migrations/'+file);await run('supabase/tests/data-api-assert-after-migration.sql');migrations++;
 }
 const requested=process.argv.slice(2);
 for(const file of (await readdir('supabase/tests')).filter(x=>/^network-.*\.sql$/.test(x)&&x!=='network-bootstrap.sql'&&(!requested.length||requested.includes(x))).sort()){
  await run('supabase/tests/'+file);tests++;console.log('PASS',file);
 }
 console.log(JSON.stringify({engine:'PGlite '+meta.version,migrations,tests,result:'passed',limits:['In-memory single connection, not concurrent sessions','Synthetic auth bootstrap, not hosted Supabase auth']}));
}catch(e){console.error(e.message);process.exitCode=1;}finally{await db.close();}
