const {chromium}=require('playwright'),fs=require('node:fs'),fixture=require('./feature-copy-fixture.cjs');const BASE=process.env.BASE_URL||'http://127.0.0.1:4186/';
(async()=>{const browser=await chromium.launch(),results=[];try{for(const width of [320,390,1366]){
 const ctx=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}),errors=[],writes=[];await ctx.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){writes.push(r.request().method());return r.abort();}return r.request().url().startsWith(BASE)?r.continue():r.abort();});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(BASE+'feature-copy-component-test');await p.setContent('<!doctype html><html><head><link rel="stylesheet" href="'+BASE+'folkoop.css"></head><body><main></main></body></html>');
 for(const f of ['feature-copy','meetings','budget','room-requests','decisions','exchange'])await p.addScriptTag({url:BASE+'network-'+f+'.js'});
 for(const locale of ['ru','en','sv','uk','fi','bs','es','ar','fa','so','ku']){
  await p.evaluate(l=>{document.documentElement.lang=l;document.documentElement.dir=['ar','fa'].includes(l)?'rtl':'ltr';},locale);
  const parts=await p.evaluate(fixture);await p.locator('main').evaluate((el,html)=>el.innerHTML=html,Object.values(parts).join(''));
  await p.locator('details').evaluateAll(list=>list.forEach(x=>x.open=true));
  if(await p.locator('[data-action="confirm_return"] button').count()!==1)throw Error('Lost confirmation action '+locale);
  if(await p.locator('.resource-handoff').evaluate(el=>getComputedStyle(el).direction)!==(['ar','fa'].includes(locale)?'rtl':'ltr'))throw Error('Handoff direction '+locale);
  for(const selector of ['.decision-path','.project-progress','.resource-bookings','aside[lang]'])if(await p.locator(selector).first().getAttribute('lang')!==locale)throw Error('Wrong lang '+selector+locale);
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+width+' '+locale);
  if(/undefined|NaN/.test(await p.locator('body').innerText()))throw Error('Missing text '+locale);
 }
 if(errors.length||writes.length)throw Error(JSON.stringify({errors,writes}));results.push({width,locales:11,passed:true,errors,writes,scope:'synthetic components; no authenticated backend claim'});await ctx.close();
}}finally{await browser.close();}fs.writeFileSync('/tmp/fk-t11-feature-browser.json',JSON.stringify(results,null,2));console.log(results);})().catch(e=>{console.error(e);process.exit(1)});
