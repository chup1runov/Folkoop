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
   await p.wait_for_timeout(500)
   async def fitted():
    await p.wait_for_function("()=>{const f=document.querySelector('#cityFrame'),d=f.contentDocument;return Math.abs(f.getBoundingClientRect().height-d.querySelector('.app-shell').getBoundingClientRect().height)<3&&d.documentElement.scrollHeight<=f.clientHeight+2}")
   await fitted()
   before=await p.locator('#cityFrame').evaluate('e=>e.clientHeight')
   await f.locator('.compact-services > summary').click();await fitted()
   after=await p.locator('#cityFrame').evaluate('e=>e.clientHeight');assert after>before,(before,after)
   await p.evaluate('scrollTo(0,0)');box=await p.locator('#cityFrame').bounding_box();await p.mouse.move(box['x']+80,box['y']+100);await p.mouse.wheel(0,500);await p.wait_for_timeout(200)
   assert await p.evaluate('scrollY')>0
   assert await f.locator('html').evaluate('()=>scrollY')==0
   await f.locator('.compact-services > summary').click();await fitted()
   assert await p.locator('#cityFrame').evaluate('e=>e.clientHeight')<after
   for tab in ['city-services','city-reports','city-decisions','city-overview']:
    loc=p.locator('[data-subsection="'+tab+'"]')
    if await loc.count():await loc.click();await p.wait_for_timeout(150);await fitted()
    contrast=await f.locator('body').evaluate(CONTRAST)
    assert not contrast,(tab,contrast[:12])
   assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert await f.locator('html').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
   assert await p.locator('body').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(0, 0, 0)'
   await p.locator('[data-subsection="city-overview"]').click()
   await p.wait_for_timeout(150)
   contrast=await f.locator('body').evaluate(CONTRAST)
   assert not contrast,contrast[:12]
   outer=await p.locator('body').evaluate(CONTRAST)
   assert not outer,outer[:12]
   await p.screenshot(path=str(OUT/f'city-dark-{width}.png'),full_page=True)
   await p.goto(BASE+'#/settings');await p.locator('#appearanceTheme').select_option('light');await p.goto(BASE+'#/city');await expect(f.locator('html')).to_have_attribute('data-theme','light');await fitted()
   assert not errors,errors
   await ctx.close();print('PASS shared theme, resize growth/shrink, outer wheel scroll, routes, no overflow',width)
  await browser.close()
asyncio.run(main())
