const {chromium}=require('playwright');
const fs=require('node:fs');
const BASE=process.env.BASE_URL||'http://127.0.0.1:4186/';
(async()=>{const browser=await chromium.launch();const results=[];try{for(const width of [320,390,1366]){
const ctx=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}),errors=[],writes=[];
await ctx.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){writes.push(r.request().method());return r.abort();}return r.request().url().startsWith(BASE)?r.continue():r.abort();});
const p=await ctx.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(BASE+'?demo=workshop');await p.locator('[data-entry="guest"]').click();
for(let i=1;i<=5;i++){await p.locator('[data-workshop="next"]').click();await p.waitForFunction(n=>document.querySelector('.workshop-story ol')?.start===n,i+1);}
const overview=p.locator('.contribution-overview');await overview.waitFor();
if(await overview.locator('.budget-need').count()!==4)throw Error('Needs mixed');
const values=await overview.locator('.budget-need').first().locator('dd').allTextContents();
if(JSON.stringify(values)!==JSON.stringify(['12 шт.','12 шт.','4 шт.','8 шт.','0 шт.','4 шт.']))throw Error('Wrong partial receipt '+JSON.stringify(values));
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow');
if(!(await overview.textContent()).includes('Проверить получение'))throw Error('Missing next action');
// Same renderer as the real project: network failure must not produce zeros.
await p.evaluate(()=>{const panel=document.querySelector('.contribution-overview');panel.outerHTML=FolkoopBudget.renderOverview({coop:{owner_id:'qa'},snapshot:{error:true},name:()=> 'QA'});});
if(await p.locator('.contribution-overview .budget-metrics').count())throw Error('False zero on error');
await p.locator('.contribution-overview [role="status"]').waitFor();
if(errors.length||writes.length)throw Error(JSON.stringify({errors,writes}));results.push({width,passed:true,errors,writes});await ctx.close();
}}finally{await browser.close();}fs.writeFileSync('/tmp/fk-t04-browser.json',JSON.stringify(results,null,2));console.log(results);})().catch(e=>{console.error(e);process.exit(1)});
