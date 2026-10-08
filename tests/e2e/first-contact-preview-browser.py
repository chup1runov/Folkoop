"""Opt-in three-way first-contact preview at ?first-contact=three-paths.

Tests the actual FOLKOOP built app, not a static mock or a participant study.
No email/account creation, server mutation or synthetic research responses.
"""
import asyncio, json, os, shutil, re
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
  return await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 raise AssertionError('Unsupported BROWSER_ENGINE='+ENGINE)

async def main():
 failures=[]
 async with async_playwright() as pw:
  browser=await launch(pw)
  for width,height in VIEWPORTS:
   context=await browser.new_context(viewport={'width':width,'height':height},service_workers='block')
   async def local_only(route):
    if route.request.url.startswith(BASE): await route.continue_()
    else: await route.abort()
   await context.route('**/*',local_only)
   page=await context.new_page()
   errors=[]
   page.on('pageerror',lambda e: errors.append(str(e)))
   try:
    await page.goto(BASE+'?first-contact=three-paths',wait_until='load')
    await expect(page.locator('#folkoopEntryGate')).to_be_visible()
    await expect(page.locator('#entryThreePaths')).to_be_visible()
    await expect(page.locator('#folkoopEntryGate [data-entry="email"]')).to_be_hidden()
    for code in LANGS:
     await page.locator(f'[data-entry-language="{code}"]').click()
     await expect(page.locator('html')).to_have_attribute('lang',code)
     await expect(page.locator('#entryThreePaths')).to_be_visible()
     await expect(page.locator('#folkoopEntryGate')).to_have_attribute('dir','rtl' if code in RTL else 'ltr')
     await expect(page.locator('.entry-three-card')).to_have_count(3)
     assert await page.locator('[data-entry-path]').count()==4,(code,'must have browsing, need, offer and organizing')
     expected=await page.evaluate('(l)=>FolkoopFirstContactPreview.copy[l].title',code)
     await expect(page.locator('#entryGateTitle')).to_have_text(expected)
     bounds=await page.evaluate("""() => {
      const card=document.querySelector('.entry-welcome-card'),r=card.getBoundingClientRect();
      const horizontal=document.documentElement.scrollWidth-document.documentElement.clientWidth;
      return {x:r.x,right:r.right,width:innerWidth,scrollWidth:horizontal,
       cardScroll:card.scrollHeight>card.clientHeight+1};
     }""")
     assert bounds['x']>=-1 and bounds['right']<=width+1,(width,code,bounds)
     assert bounds['scrollWidth']<=1,(width,code,'horizontal overflow',bounds)
    if width==390:
     for code in ['sv','ar','fa','ku']:
      await page.locator(f'[data-entry-language="{code}"]').click()
      await page.locator('#entryGateTitle').scroll_into_view_if_needed()
      await page.screenshot(path=str(OUT/f'first-contact-three-paths-{ENGINE}-{width}-{code}.png'))
    assert not errors,(width,errors)
   finally:
    await context.close()

  # Real entry actions, each in a clean guest session.
  for action,target in [('center','center'),('need','together'),('offer','together'),('projects','projects')]:
   context=await browser.new_context(viewport={'width':390,'height':844},service_workers='block')
   async def local_only(route):
    if route.request.url.startswith(BASE):await route.continue_()
    else:await route.abort()
   await context.route('**/*',local_only)
   await context.add_init_script("""localStorage.setItem('folkoop-language','en');localStorage.setItem('folkoop-language-choice-v1','done');""")
   page=await context.new_page()
   unsafe=[]
   page.on('request',lambda req:unsafe.append(req.method+' '+req.url) if req.method not in ['GET','HEAD'] else None)
   try:
    await page.goto(BASE+'?first-contact=three-paths')
    await expect(page.locator('#folkoopEntryGate')).to_be_visible()
    await page.locator(f'[data-entry-path="{action}"]').click()
    await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
    await expect(page).to_have_url(re.compile(r'#/'+target+r'
    await expect(page.locator('#onboarding')).to_be_hidden()
    await expect(page.locator('#netLogin')).to_be_hidden()
    if action!='center':await expect(page.locator('body')).to_have_class(re.compile('.*guest-preview-open.*'))
    assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')")=='guest'
    if action in ['need','offer']:
     await expect(page.locator('#networkPanel')).to_be_visible()
     selected=page.locator(f'[data-together-kind="{action}"]')
     if await selected.count():
      await expect(selected).to_have_class(re.compile('.*active.*'))
    if action=='center':
     await expect(page.locator('#workspace')).to_contain_text('Center')
    await page.reload()
    await expect(page.locator('#onboarding')).to_be_hidden()
    await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
    assert not unsafe,(action,'guest preview triggered a write',unsafe)
   finally:
    await context.close()

  context=await browser.new_context(viewport={'width':390,'height':844},service_workers='block')
  await context.route('**/*',local_only)
  page=await context.new_page()
  try:
   await page.goto(BASE+'?first-contact=three-paths')
   await expect(page.locator('#folkoopEntryGate')).to_be_visible()
   await page.locator('#folkoopEntryGate [data-entry="guest"]').click()
   await expect(page.locator('#onboarding')).to_be_visible()
   await expect(page.locator('#netLogin')).to_be_hidden()
  finally:
   await context.close()
  await browser.close()
 print('PASS opt-in entry layout across 11 languages, 3 viewports and RTL ('+ENGINE+')')
 print('PASS guest browse actions center / need / offer / projects, no signup or writes ('+ENGINE+')')
 print('PASS normal Mura guided tour remains the secondary route ('+ENGINE+')')

asyncio.run(main())
))
    await expect(page.locator('#onboarding')).to_be_hidden()
    await expect(page.locator('#netLogin')).to_be_hidden()
    await expect(page.locator('body')).to_have_class(__import__('re').compile('.*guest-preview-open.*'))
    if action in ['need','offer']:
     await expect(page.locator('#networkPanel')).to_be_visible()
     selected=page.locator(f'[data-together-kind="{action}"]')
     if await selected.count():
      await expect(selected).to_have_class(__import__('re').compile('.*active.*'))
    if action=='center':
     await expect(page.locator('#workspace')).to_contain_text('Center')
    await page.reload()
    await expect(page.locator('#onboarding')).to_be_hidden()
    await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
    assert not unsafe,(action,'guest preview triggered a write',unsafe)
   finally:
    await context.close()

  context=await browser.new_context(viewport={'width':390,'height':844},service_workers='block')
  await context.route('**/*',local_only)
  page=await context.new_page()
  try:
   await page.goto(BASE+'?first-contact=three-paths')
   await expect(page.locator('#folkoopEntryGate')).to_be_visible()
   await page.locator('#folkoopEntryGate [data-entry="guest"]').click()
   await expect(page.locator('#onboarding')).to_be_visible()
   await expect(page.locator('#netLogin')).to_be_hidden()
  finally:
   await context.close()
  await browser.close()
 print('PASS opt-in entry layout across 11 languages, 3 viewports and RTL ('+ENGINE+')')
 print('PASS guest browse actions center / need / offer / projects, no signup or writes ('+ENGINE+')')
 print('PASS normal Mura guided tour remains the secondary route ('+ENGINE+')')

asyncio.run(main())
