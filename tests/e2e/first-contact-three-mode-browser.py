"""Opt-in ?firstContact=three UI test (not human comprehension evidence)."""
import asyncio, json, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
LANGS=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']
RTL={'ar','fa'}

async def start(browser,language='sv',preview=True,width=390,height=844):
 context=await browser.new_context(viewport={'width':width,'height':height},locale='en-US',service_workers='block')
 async def local_only(route):
  if route.request.url.startswith(BASE): await route.continue_()
  else: await route.abort()
 await context.route('**/*',local_only)
 await context.add_init_script("""(() => {
  Object.defineProperty(navigator,'webdriver',{get:()=>false});
  localStorage.clear();sessionStorage.clear();
 })()""")
 page=await context.new_page()
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 await page.goto(BASE+('?firstContact=three' if preview else ''))
 await expect(page.locator('#folkoopEntryGate')).to_be_visible()
 await page.locator(f'[data-entry-language="{language}"]').click()
 await expect(page.locator('#language')).to_have_value(language)
 return context,page,errors

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])

  context,page,errors=await start(browser)
  await expect(page.locator('#folkoopEntryGate')).to_have_attribute('data-entry-variant','three')
  for lang in LANGS:
   await page.locator(f'[data-entry-language="{lang}"]').click()
   await expect(page.locator('#language')).to_have_value(lang)
   await expect(page.locator('#folkoopEntryGate')).to_have_attribute('dir','rtl' if lang in RTL else 'ltr')
   await expect(page.locator('.entry-three-card')).to_have_count(3)
   await expect(page.locator('[data-entry-intent]')).to_have_count(4)
   await expect(page.locator('[data-entry="email"]')).to_be_hidden()
   await expect(page.locator('[data-entry="guest"]')).to_be_visible()
   assert await page.locator('#entryGateTitle').inner_text()
   for idx in range(3):
    assert (await page.locator('.entry-three-card h2').nth(idx).inner_text()).strip(),(lang,idx)
   box=await page.evaluate("""() => {
    const c=document.querySelector('.entry-welcome-card');
    const e=document.querySelector('#folkoopEntryGate');
    return {width:innerWidth,card:c.getBoundingClientRect().width,
      overflow:e.scrollWidth>e.clientWidth+1,
      pageOverflow:document.documentElement.scrollWidth>innerWidth+1,
      buttonHeights:[...e.querySelectorAll('[data-entry-intent]')]
       .map(x=>x.getBoundingClientRect().height)};
   }""")
   assert not box['overflow'] and not box['pageOverflow'],(lang,box)
   assert box['card']<=box['width']+1,(lang,box)
   assert min(box['buttonHeights'])>=44,(lang,box)
  assert not errors,errors
  await context.close()
  print('PASS all eleven locale variants retain 3 route cards, 4 intent actions, direction and 44px targets')

  # Desktop is a three-column screen; narrow mobile must remain vertically scrollable.
  for width,height,lang in [(320,568,'ar'),(844,390,'fa'),(1366,900,'ru')]:
   ctx,p,errs=await start(browser,lang,width=width,height=height)
   mode=await p.locator('#entryThreeModes').evaluate('e=>getComputedStyle(e).gridTemplateColumns')
   assert await p.evaluate("document.documentElement.scrollWidth<=innerWidth"),(width,lang)
   await expect(p.locator('.entry-three-card')).to_have_count(3)
   await p.screenshot(path=str(OUT/f'first-contact-three-{width}x{height}-{lang}.png'))
   assert not errs,errs
   await ctx.close()
  print('PASS desktop, narrow mobile and short landscape opt-in preview has no horizontal overflow')

  # The default production gate must remain Mura-first and display no new cards.
  ctx,p,errs=await start(browser,'sv',preview=False)
  await expect(p.locator('#folkoopEntryGate')).to_have_attribute('data-entry-variant','default')
  await expect(p.locator('#entryThreeModes')).to_be_hidden()
  await expect(p.locator('[data-entry-intent]')).to_have_count(0)
  await expect(p.locator('[data-entry="guest"]')).to_be_visible()
  assert not errs,errs
  await ctx.close()
  print('PASS normal first-contact UX is unaffected unless the explicit query parameter is supplied')

  for intent,hash_route in [('browse','#/center'),('need','#/together'),('offer','#/together'),('project','#/projects')]:
   ctx,p,errs=await start(browser,'en')
   await p.locator(f'[data-entry-intent="{intent}"]').click()
   await expect(p.locator('#folkoopEntryGate')).to_be_hidden()
   await expect(p).to_have_url(BASE+'?firstContact=three'+hash_route)
   assert await p.evaluate("localStorage.getItem('folkoop-workspace-v1')") is None
   assert await p.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')")=='local'
   # Deliberate Need/Offer/Project opens only a local private draft form.
   if intent!='browse':
    await expect(p.locator('#draftForm')).to_be_visible()
   assert not errs,(intent,errs)
   await ctx.close()
  print('PASS all intent routes work without silently publishing or registering an account')

  ctx,p,errs=await start(browser,'ru')
  await p.locator('[data-entry="guest"]').click()
  await expect(p.locator('#folkoopEntryGate')).to_be_hidden()
  assert await p.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')")=='guest'
  assert not errs,errs
  await ctx.close()
  print('PASS Mura remains a secondary read-only learning route with no sign-up gate')
  await browser.close()

asyncio.run(main())
