"""Browser gate for ?first-contact=three-paths; not evidence of human comprehension."""
import asyncio
import os
import re
import shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()
OUT=Path(os.getenv('QA_OUTPUT','qa-output'))
OUT.mkdir(parents=True,exist_ok=True)
LANGS=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']
RTL={'ar','fa'}
VIEWPORTS=[(390,844),(320,568),(1280,800)]

async def launch(pw):
 if ENGINE=='webkit':
  return await pw.webkit.launch()
 if ENGINE=='chromium':
  return await pw.chromium.launch(
   executable_path=shutil.which('chromium') or shutil.which('google-chrome'),
   args=['--no-sandbox'])
 raise AssertionError('Unsupported browser engine: '+ENGINE)

async def local_only(route):
 if route.request.url.startswith(BASE):await route.continue_()
 else:await route.abort()

async def main():
 async with async_playwright() as pw:
  browser=await launch(pw)
  for width,height in VIEWPORTS:
   context=await browser.new_context(viewport={'width':width,'height':height},service_workers='block')
   await context.route('**/*',local_only)
   page=await context.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   try:
    await page.goto(BASE+'?first-contact=three-paths',wait_until='load')
    await expect(page.locator('#folkoopEntryGate')).to_be_visible()
    await expect(page.locator('#entryThreePaths')).to_be_visible()
    await expect(page.locator('#folkoopEntryGate [data-entry="email"]')).to_be_hidden()
    for lang in LANGS:
     await page.locator(f'[data-entry-language="{lang}"]').click()
     await expect(page.locator('html')).to_have_attribute('lang',lang)
     await expect(page.locator('#entryThreePaths')).to_be_visible()
     await expect(page.locator('#folkoopEntryGate')).to_have_attribute(
      'dir','rtl' if lang in RTL else 'ltr')
     await expect(page.locator('.entry-three-card')).to_have_count(3)
     assert await page.locator('[data-entry-path]').count()==4,lang
     headline=await page.evaluate('(l)=>FolkoopFirstContactPreview.copy[l].title',lang)
     await expect(page.locator('#entryGateTitle')).to_have_text(headline)
     geometry=await page.evaluate("""() => {
      const card=document.querySelector('.entry-welcome-card');
      const gate=document.querySelector('#folkoopEntryGate');
      const r=card.getBoundingClientRect();
      return [r.left,r.right,Math.max(card.scrollWidth-card.clientWidth,
                                    gate.scrollWidth-gate.clientWidth)];
     }""")
     assert geometry[0]>=-1 and geometry[1]<=width+1,(width,lang,geometry)
     assert geometry[2]<=1,(width,lang,'horizontal overflow',geometry)
    if width==390:
     for lang in ['sv','ar','fa','ku']:
      await page.locator(f'[data-entry-language="{lang}"]').click()
      await page.locator('#entryGateTitle').scroll_into_view_if_needed()
      await page.screenshot(path=str(OUT/f'first-contact-three-paths-{ENGINE}-{lang}.png'))
    assert not errors,(width,errors)
   finally:
    await context.close()

  for action,target in [('center','center'),('need','together'),('offer','together'),('projects','projects')]:
   context=await browser.new_context(viewport={'width':390,'height':844},service_workers='block')
   await context.route('**/*',local_only)
   page=await context.new_page()
   unsafe=[]
   page.on('request',lambda req:unsafe.append(req.method+' '+req.url)
           if req.method not in ['GET','HEAD'] else None)
   try:
    await page.goto(BASE+'?first-contact=three-paths')
    await expect(page.locator('#folkoopEntryGate')).to_be_visible()
    await page.locator('[data-entry-language="en"]').click()
    await expect(page.locator('#entryThreePaths')).to_be_visible()
    await page.locator(f'[data-entry-path="{action}"]').click()
    await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
    await expect(page).to_have_url(re.compile(r'#/'+target+r'$'))
    await expect(page.locator('#onboarding')).to_be_hidden()
    await expect(page.locator('#netLogin')).to_be_hidden()
    assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')")=='guest',action
    if action in ['need','offer','projects']:
     await expect(page.locator('#networkPanel')).to_be_visible()
    if action in ['need','offer']:
     await expect(page.locator('#networkPanel .coop-summary')).to_be_visible()
     await expect(page.locator('#networkPanel .coop-summary .badge').first).to_have_text(
      'Need' if action=='need' else 'Offer')
    if action=='center':
     await expect(page.locator('#workspace')).to_contain_text('Center')
    await page.reload()
    await expect(page.locator('#onboarding')).to_be_hidden()
    await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
    assert not unsafe,(action,'unexpected write request',unsafe)
   finally:
    await context.close()

  context=await browser.new_context(viewport={'width':390,'height':844},service_workers='block')
  await context.route('**/*',local_only)
  page=await context.new_page()
  try:
   await page.goto(BASE+'?first-contact=three-paths')
   await expect(page.locator('#folkoopEntryGate')).to_be_visible()
   await page.locator('[data-entry="guest"]').click()
   await expect(page.locator('#onboarding')).to_be_visible()
   await expect(page.locator('#netLogin')).to_be_hidden()
  finally:
   await context.close()
  await browser.close()
 print('PASS three equal paths, 11 languages, RTL and 3 viewports ('+ENGINE+')')
 print('PASS read-only browse actions, no registration or mutation ('+ENGINE+')')
 print('PASS traditional Mura guided tour remains the optional path ('+ENGINE+')')

asyncio.run(main())
