const {chromium}=require('playwright');
const fs=require('node:fs');
const BASE=process.env.BASE_URL||'http://127.0.0.1:4186/';
const OUT=process.env.QA_OUTPUT||'/tmp';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});const cases=[];
 try{for(const width of [320,390,1366]){
 const ctx=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}); const errors=[],writes=[];
 await ctx.route('**/*',route=>{const r=route.request();if(!['GET','HEAD'].includes(r.method())){writes.push(r.method());return route.abort();}return r.url().startsWith(BASE)?route.continue():route.abort();});
 await ctx.addInitScript(()=>{localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');sessionStorage.setItem('folkoop-entry-mode-v1','guest');});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(BASE+'?intro=0#/projects');
 await page.locator('[data-coop="open"][data-id="00000000-0000-4000-8000-000000000320"]').click();
 await page.locator('#workshopTitle').waitFor();
 const story=page.locator('.workshop-story'); if(await story.locator('li').count()!==8)throw Error('Missing story');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+width);
 await page.screenshot({path:OUT+'/fk-workshop-'+width+'.png',fullPage:true});
 await story.locator('[data-id="00000000-0000-4000-8000-000000000322"]').click();
 await page.getByRole('heading',{name:'Дрель Anna',exact:true}).waitFor();
 await page.locator('[data-coop="back"]').click();
 await page.goto(BASE+'?intro=0#/projects');
 await page.locator('[data-coop="open"][data-id="00000000-0000-4000-8000-000000000320"]').click();
 await page.locator('.workshop-story [data-home="openCommunity"]').click();
 await page.waitForFunction(()=>location.hash==='#/communities');
 if(await page.locator('#netLogin:visible').count())throw Error('Login inside demo');
 if(errors.length||writes.length)throw Error(JSON.stringify({errors,writes}));
 cases.push({width,storySteps:8,resourceLink:true,communityLink:true,writes,errors,overflow:false});await ctx.close();
 }}finally{await browser.close();}
 fs.writeFileSync(OUT+'/fk-demo-t02-browser.json',JSON.stringify({cases,limits:['Desktop Chromium with mobile viewport emulation; not physical-device or full-language acceptance.']},null,2));console.log(JSON.stringify(cases));
})().catch(e=>{console.error(e);process.exit(1)});
