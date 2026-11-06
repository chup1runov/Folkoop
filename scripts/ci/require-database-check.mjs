// Cloudflare Git builds are outside GitHub's deploy dependency graph.
// Fail closed unless this exact main commit has a successful SQL workflow run.
export async function requireDatabaseCheck(env=process.env,{fetch:send=fetch,sleep=ms=>new Promise(r=>setTimeout(r,ms)),attempts=24}={}){
 if(env.CF_PAGES!=='1')return;
 const sha=env.CF_PAGES_COMMIT_SHA;
 if(!/^[a-f0-9]{40}$/.test(sha||''))throw new Error('Cloudflare commit SHA missing; refusing release');
 const endpoint='https://api.github.com/repos/chup1runov/Folkoop/actions/workflows/network.yml/runs?head_sha='+sha+'&per_page=100';
 for(let i=0;i<attempts;i++){
  const response=await send(endpoint,{headers:{Accept:'application/vnd.github+json','User-Agent':'folkoop-build-check'},signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('Cannot verify SQL check; refusing release ('+response.status+')');
  const runs=(await response.json()).workflow_runs;
  if(!Array.isArray(runs))throw new Error('Invalid SQL check response');
  const exact=runs.filter(r=>r.head_sha===sha&&r.path==='.github/workflows/network.yml'&&r.event==='push'&&r.head_branch==='main').sort((a,b)=>b.id-a.id);
  if(exact[0]?.status==='completed'){
   if(exact[0].conclusion==='success')return;
   throw new Error('SQL check did not pass for this commit; refusing release');
  }
  if(i+1<attempts)await sleep(15000);
 }
 throw new Error('SQL check not completed for this commit; retry build after it passes');
}
