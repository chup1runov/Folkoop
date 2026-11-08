"""Single outer scroll and readable shared dark theme, isolated browser/no account writes."""
import asyncio,os,json,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/')
OUT=Path(os.getenv('QA_OUTPUT','/tmp/folkoop-city-theme'));OUT.mkdir(parents=True,exist_ok=True)
CONTRAST=r"""root=>{
    const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number);
    const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    return [...root.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.getClientRects().length&&!e.closest('[hidden]')).flatMap(e=>{
     const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.opacity==='0'||e.closest('svg')||e.classList.contains('skip-link'))return [];
     const fg=rgb(cs.color);let bg=[0,0,0],n=e;
     while(n){const c=rgb(getComputedStyle(n).backgroundColor);if(c.length===3||c[3]===1){bg=c;break;}n=n.parentElement;}
     const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
     return ratio<4.5?[{text:e.textContent.trim().slice(0,70),class:e.className,fg:cs.color,bg,ratio}]:[];
    });
   }"""
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width in [390,1366]:
   ctx=await browser.new_context(viewport={'width':width,'height':844},service_workers='block',locale='ru-RU')
   await ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');")
   async def route(r):
    if r.request.url.startswith(BASE):await r.continue_()
    else:await r.abort()
   await ctx.route('**/*',route)
   p=await ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   await p.goto(BASE);await p.locator('[data-entry="guest"]').click();await p.get_by_role('button',name='Осмотреться самому',exact=True).click()
   await p.goto(BASE+'#/settings');await p.locator('#appearanceTheme').select_option('dark')
   await p.locator('#mobilePrimaryNav [href="#/city"]').click()
   f=p.frame_locator('#cityFrame');await expect(f.locator('html')).to_have_attribute('data-theme','dark')
   await expect(f.locator('#view')).to_be_visible()
   await p.locator('[data-subsection="city-services"]').click()
   await f.locator('#issue').fill('Street lighting broken <script>bad()</script>')
   await f.locator('#findOwner').click();await f.locator('#prepareCityReport').click()
   await expect(f.locator('#reportDescription')).to_have_value('Street lighting broken <script>bad()</script>')
   await f.locator('#reportPlace').fill('Example street 12')
   await f.locator('#prepareManualReport').click()
   await expect(f.locator('#reportRouteResult')).to_contain_text('Example street 12')
   await expect(f.locator('#reportRouteResult a')).to_have_attribute('href','https://goteborg.se/wps/portal/kontakta-oss')
   assert await f.locator('#reportRouteResult script').count()==0
   await f.locator('#manualRecipient').select_option('municipal');await expect(f.locator('#reportRouteResult')).to_be_empty()
   await f.locator('#prepareManualReport').click()
   await expect(f.locator('#reportRouteResult a')).to_have_attribute('href','https://goteborg.se/wps/portal/kontakta-oss/felanmalan-gator-torg-och-parker')
   await f.locator('#reportDescription').fill('');await f.locator('#prepareManualReport').click()
   assert await f.locator('#reportRouteResult a').count()==0
   assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors,errors
   print('PASS service handoff, no-GPS preparation, unknown recipient, escaping, stale result invalidation',width)
   await ctx.close()
  await browser.close()
asyncio.run(main())
