// Same production recipe on Pages hosts. Never publish a shell without its feeds.
import {spawnSync} from 'node:child_process';
import {requireDatabaseCheck} from '../ci/require-database-check.mjs';
await requireDatabaseCheck();
for(const script of ['scripts/sources/fetch-riksdagen.mjs','scripts/sources/fetch-goteborg-open-plans.mjs','scripts/build/build-site.mjs','scripts/ci/audit-built-assets.mjs']){
 const result=spawnSync(process.execPath,[script],{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
