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

   await p.locator('[data-subsection="city-decisions"]').click()
   # Async source cards were missing from the previous theme test. Use an isolated record.
   await f.locator('#decisionList').evaluate("""el=>{el.innerHTML='<div class=city-source-bridge><a class="item decision-live-link"><span class=item-icon>i</span><span class=item-content><strong>Official decision fixture</strong><span class=decision-meta>Source and date</span></span></a></div>'}""")
   assert not await f.locator('#decisionList').evaluate(CONTRAST)
   await p.goto(BASE+'#/center');await expect(p.locator('.center-home-hero')).to_be_visible()
   assert not await p.locator('.center-home-hero').evaluate(CONTRAST)
   assert (await p.locator('.center-home-hero').bounding_box())['height']<450
   await p.goto(BASE+'#/together');assert not await p.locator('.together-action-grid').evaluate(CONTRAST)
   await p.locator('#folkoopGuideActor').click();await p.locator('#folkoopHelperTour').click()
   await expect(p.locator('#onboardingBody')).to_be_visible()
   assert len(await p.locator('#onboardingBody').inner_text())<180
   await p.locator('[data-onboarding="next"]').click()
   await expect(p.locator('#muraTogetherStories button').first).to_contain_text('Что тебе нужно?')
   await p.screenshot(path=str(OUT/f'dialogue-{width}.png'))
   await p.locator('[data-mura-together="purchase"]').click()
   await expect(p.locator('[data-purchase-journey]')).to_be_visible()
   # Open the actual finale through its event-backed button in an isolated fixture.
   await p.evaluate("()=>{const b=document.createElement('button');b.dataset.muraFinale='';b.id='qaFinale';document.body.append(b)}")
   await p.locator('#qaFinale').evaluate('el=>el.click()');await expect(p.locator('.mura-tour-finale')).to_be_visible()
   assert not await p.locator('.mura-tour-finale').evaluate(CONTRAST)
   await p.screenshot(path=str(OUT/f'finale-{width}.png'))
   assert not errors,errors
   await ctx.close();print('PASS async card contrast, center compactness, dialogue choice, finale',width)
  await browser.close()
asyncio.run(main())
