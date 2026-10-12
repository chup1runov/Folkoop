"""Opt-in C guest-first navigation: real browser checks, not human comprehension."""
import asyncio
import json
import os
import re
import shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()
OUT=Path(os.getenv('QA_OUTPUT','qa-output'))/'first-contact-guest'
OUT.mkdir(parents=True,exist_ok=True)
LANGS=['sv','en','ar','so','fa','fi','bs','ku','es','ru','uk']
RTL={'ar','fa'}

async def launch(pw):
 if ENGINE=='webkit':return await pw.webkit.launch()
 if ENGINE=='chromium':return await pw.chromium.launch(
  executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 raise ValueError('Unknown browser engine '+ENGINE)

async def context_for(browser,viewport):
 context=await browser.new_context(viewport=viewport,service_workers='block',
                                   locale='en-US',reduced_motion='reduce')
 writes=[]
 async def restrict(route):
  url=route.request.url
  if route.request.method not in ('GET','HEAD'):
   writes.append(route.request.method+' '+url);await route.abort();return
  if url.startswith(BASE):await route.continue_()
  else:await route.abort()
 await context.route('**/*',restrict)
 return context,writes

async def intro(browser,width,height):
 context,writes=await context_for(browser,{'width':width,'height':height})
 page=await context.new_page()
 errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 try:
  await page.goto(BASE+'?first-contact=guest-guide')
  gate=page.locator('#folkoopEntryGate')
  await expect(gate).to_be_visible()
  await expect(gate).to_have_attribute('aria-modal','true')
  await expect(page.locator('#entryThreePaths')).to_be_hidden()
  await expect(page.locator('#entryLanguageChoices')).to_be_hidden()
  await expect(page.locator('#entryGuestLanguage')).to_be_visible()
  await expect(page.locator('[data-entry="email"]')).to_be_hidden()
  await expect(page.locator('[data-entry="guest"]')).to_be_visible()
  await expect(page.locator('[data-entry="paths"]')).to_be_visible()
  await expect(page.locator('[data-entry="paths"]')).to_have_attribute('aria-expanded','false')
  geometry=await page.evaluate("""() => {
   const pane=document.querySelector('.entry-welcome-card');
   const screenBottom=Math.min(innerHeight,pane.getBoundingClientRect().bottom);
   const found=(name)=>{
    const e=document.querySelector('[data-entry="'+name+'"]');
    const r=e.getBoundingClientRect();
    return {top:r.top,bottom:r.bottom,fullyVisible:r.top>=0&&r.bottom<=screenBottom+1};
   };
   return {guest:found('guest'),paths:found('paths'),
           paneScrollTop:pane.scrollTop,documentWidth:document.documentElement.scrollWidth,
           windowWidth:innerWidth,hasGlobalOverflow:document.documentElement.scrollWidth>innerWidth+1};
  }""")
  assert geometry['guest']['fullyVisible'],('GUEST_BELOW_FIRST_FOLD',width,height,geometry)
  assert geometry['paths']['fullyVisible'],('ALTERNATIVE_BELOW_FIRST_FOLD',width,height,geometry)
  assert not geometry['hasGlobalOverflow'],('GLOBAL_OVERFLOW',width,height,geometry)
  for lang in LANGS:
   await page.select_option('#entryGuestLanguage',lang)
   await expect(page.locator('html')).to_have_attribute('lang',lang)
   expected=await page.evaluate('(l)=>FolkoopFirstContactPreview.guestCopy[l].title',lang)
   await expect(page.locator('#entryGateTitle')).to_have_text(expected)
   await expect(gate).to_have_attribute('dir','rtl' if lang in RTL else 'ltr')
   assert await page.locator('#entryThreePaths').is_hidden()
  await page.select_option('#entryGuestLanguage','en')
  await page.screenshot(path=str(OUT/f'c-guest-intro-{width}-{ENGINE}.png'))
  await page.click('[data-entry="paths"]')
  await expect(page.locator('#entryThreePaths')).to_be_visible()
  await expect(page.locator('.entry-three-card')).to_have_count(3)
  await expect(page.locator('[data-entry-path]')).to_have_count(4)
  await expect(page.locator('[data-entry="paths"]')).to_have_attribute('aria-expanded','true')
  await expect(page.locator('#entryThreePaths')).to_be_focused()
  await expect(page.locator('.entry-guest-demo')).to_contain_text('examples')
  await page.screenshot(path=str(OUT/f'c-guest-choices-{width}-{ENGINE}.png'))
  await page.select_option('#entryGuestLanguage','ru')
  await expect(page.locator('.entry-three-card')).to_have_count(3)
  await expect(page.locator('#entryThreePaths')).to_be_visible()
  await page.click('[data-entry="paths"]')
  await expect(page.locator('#entryThreePaths')).to_be_hidden()
  await expect(page.locator('[data-entry="paths"]')).to_have_attribute('aria-expanded','false')
  await expect(page.locator('[data-entry="paths"]')).to_be_focused()
  assert not errors,(width,height,errors)
  assert not writes,(width,height,writes)
  print('PASS C first-fold tour/actions, 11 locales and on-demand three modes '+str(width)+'x'+str(height)+' '+ENGINE)
 finally:
  await context.close()

async def action(browser,action,target):
 context,writes=await context_for(browser,{'width':390,'height':844})
 page=await context.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  await page.goto(BASE+'?first-contact=guest-guide')
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  if action=='tour':
   await page.click('[data-entry="guest"]')
   await expect(page.locator('#onboarding')).to_be_visible()
   await expect(page.locator('#netLogin')).to_be_hidden()
   await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
  else:
   await page.click('[data-entry="paths"]')
   await expect(page.locator('#entryThreePaths')).to_be_visible()
   await page.click(f'[data-entry-path="{action}"]')
   await expect(page).to_have_url(re.compile(r'#/'+target+r'$'))
   await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
   await expect(page.locator('#onboarding')).to_be_hidden()
   await expect(page.locator('#netLogin')).to_be_hidden()
   assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')")=='guest'
   await page.reload()
   await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
   await expect(page.locator('#onboarding')).to_be_hidden()
  assert not errors,(action,errors)
  assert not writes,(action,writes)
  print('PASS C route '+action+' '+ENGINE)
 finally:
  await context.close()

async def main():
 async with async_playwright() as pw:
  browser=await launch(pw)
  try:
   for width,height in [(320,568),(390,844),(1280,800)]:
    await intro(browser,width,height)
   for choice,target in [('tour','me'),('center','center'),
                         ('need','together'),('offer','together'),('projects','projects')]:
    await action(browser,choice,target)
  finally:
   await browser.close()
  print('PASS C opt-in guest-first flow: engineering only, no participants ('+ENGINE+')')

asyncio.run(main())
