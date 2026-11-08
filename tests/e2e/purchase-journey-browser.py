"""Mura purchase overview, read-only, desktop/mobile."""
import asyncio,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4507/');OUT=Path(os.getenv('QA_OUTPUT','/tmp/folkoop-purchase-journey'));OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if os.getenv('BROWSER_ENGINE')=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium'))
  for width in [390,1366]:
   c=await browser.new_context(viewport={'width':width,'height':844},service_workers='block',locale='ru-RU')
   await c.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');")
   await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(BASE) else r.abort())
   p=await c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   await p.goto(BASE);await p.locator('[data-entry="guest"]').click();await p.get_by_role('button',name='Осмотреться самому',exact=True).click()
   await p.goto(BASE+'#/settings');await p.locator('#appearanceTheme').select_option('dark')
   await p.locator('#mobilePrimaryNav [href="#/together"]').click();await p.locator('[data-coop="open"][data-id="00000000-0000-4000-8000-000000000302"]').click()
   journey=p.locator('[data-purchase-journey]');await expect(journey).to_be_visible();await expect(journey.locator('[aria-current="step"]')).to_have_text('3Согласие')
   await expect(journey).to_contain_text('Место выдачи ещё не согласовано')
   assert '1 окт. 2026' not in await journey.inner_text()
   contrast=await p.locator('.coop-summary-stats').evaluate(r"""el=>{
    const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
    const luminance=s=>rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    return [...el.querySelectorAll('strong,small')].map(n=>{const a=luminance(getComputedStyle(n).color),b=luminance(getComputedStyle(n.parentElement).backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)});
   }""")
   assert contrast and min(contrast)>=4.5,contrast
   print('PASS dark stat contrast',min(contrast))
   await journey.locator('[data-purchase-jump]').click();await expect(p.locator('[data-coop-section="purchase-progress"]')).to_have_attribute('open','')
   assert await p.locator('#networkPanel form:visible').count()==0
   await journey.scroll_into_view_if_needed();await p.screenshot(path=str(OUT/f'purchase-{width}.png'))
   assert await p.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors,errors
   print('PASS purchase route, disclosure, no demo writes, viewport',width);await c.close()
  await browser.close()
asyncio.run(main())
