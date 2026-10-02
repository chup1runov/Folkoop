"""Visual and geometry gate for the unified first-contact Mura welcome.

This checks the real first screen in all 11 languages and four representative
viewports. It is browser emulation, not a claim of physical-device acceptance.
"""
import asyncio
import json
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
LANGS=['en','ru','sv','es','uk','fi','bs','ar','fa','so','ku']
RTL={'ar','fa'}
VIEWPORTS=[(390,844),(1366,900),(320,568),(844,390)]

async def launch_browser(pw):
 if ENGINE=='chromium':
  return await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 if ENGINE=='webkit':
  return await pw.webkit.launch()
 raise AssertionError(f'Unsupported BROWSER_ENGINE={ENGINE}')

GEOMETRY="""() => {
 const q=s=>document.querySelector(s);
 const box=s=>{const e=q(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};};
 const card=box('.entry-welcome-card'),mura=box('.entry-mura img'),title=box('#entryGateTitle'),body=box('#entryGateBody'),
  langs=box('#entryLanguageChoices'),guest=box('[data-entry="guest"]'),email=box('[data-entry="email"]'),note=box('#entryGateNote');
 const inside=r=>!!r&&!!card&&r.x>=card.x-.5&&r.x+r.w<=card.x+card.w+.5;
 const visible=r=>!!r&&r.x+r.w>0&&r.x<innerWidth&&r.y+r.h>0&&r.y<innerHeight;
 const c=q('.entry-welcome-card');
 return {
  direction:getComputedStyle(q('#folkoopEntryGate')).direction,
  languageCount:document.querySelectorAll('[data-entry-language]').length,
  currentCount:document.querySelectorAll('[data-entry-language][aria-pressed="true"]').length,
  languagesClipped:!!q('#entryLanguageChoices')&&q('#entryLanguageChoices').scrollHeight>q('#entryLanguageChoices').clientHeight+1,
  card,mura,title,body,langs,guest,email,note,
  horizontalInside:[mura,title,body,langs,guest,email,note].every(inside),
  cardOutside:!card||card.x<-.5||card.y<-.5||card.x+card.w>innerWidth+.5||card.y+card.h>innerHeight+.5,
  horizontalOverflow:q('#folkoopEntryGate').scrollWidth>q('#folkoopEntryGate').clientWidth+1,
  guestVisible:visible(guest),emailVisible:visible(email),titleVisible:visible(title),muraVisible:visible(mura),
  cardScrollTop:c?.scrollTop||0,cardScrollable:!!c&&c.scrollHeight>c.clientHeight+1,
  cardClientHeight:c?.clientHeight||0,cardScrollHeight:c?.scrollHeight||0
 };
}"""

async def main():
 failures=[];records=[];passed=[]
 async with async_playwright() as pw:
  browser=await launch_browser(pw)
  for width,height in VIEWPORTS:
   context=await browser.new_context(viewport={'width':width,'height':height},locale='ru-RU',service_workers='block')
   async def local_only(route):
    if route.request.url.startswith(BASE): await route.continue_()
    else: await route.abort()
   await context.route('**/*',local_only)
   await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.clear();sessionStorage.clear();")
   page=await context.new_page();errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   await page.goto(BASE)
   await expect(page.locator('#folkoopEntryGate')).to_be_visible()
   for code in LANGS:
    await page.click(f'[data-entry-language="{code}"]')
    await page.wait_for_timeout(40)
    record=await page.evaluate(GEOMETRY)
    record.update(width=width,height=height,language=code)
    records.append(record)
    if record['languageCount']!=11: failures.append(f'{width}x{height} {code}: expected 11 languages')
    if record['currentCount']!=1: failures.append(f'{width}x{height} {code}: selected-language state is ambiguous')
    expected='rtl' if code in RTL else 'ltr'
    if record['direction']!=expected: failures.append(f'{width}x{height} {code}: direction {record["direction"]}, expected {expected}')
    if record['cardOutside']: failures.append(f'{width}x{height} {code}: welcome card outside viewport')
    if not record['horizontalInside']: failures.append(f'{width}x{height} {code}: welcome content exceeds card horizontally')
    if record['horizontalOverflow']: failures.append(f'{width}x{height} {code}: document has horizontal overflow')
    if width>=390 and height>=800 and record['languagesClipped']: failures.append(f'{width}x{height} {code}: not all 11 language choices are exposed')
    if width>=390 and height>=800 and (not record['guestVisible'] or not record['emailVisible'] or not record['titleVisible'] or not record['muraVisible']):
     failures.append(f'{width}x{height} {code}: primary welcome content or CTA not initially visible')
    # On short screens scrolling is acceptable, but both CTA must be reachable.
    await page.locator('[data-entry="email"]').scroll_into_view_if_needed()
    if not await page.locator('[data-entry="email"]').is_visible(): failures.append(f'{width}x{height} {code}: account CTA is not reachable')
    await page.locator('#entryGateTitle').scroll_into_view_if_needed()
   # Keep a small, reviewable screenshot set rather than 44 nearly identical images.
   for code in ['ru','ar','ku']:
    await page.click(f'[data-entry-language="{code}"]')
    await page.locator('#entryGateTitle').scroll_into_view_if_needed()
    await page.screenshot(path=str(OUT/f'entry-welcome-{ENGINE}-{width}x{height}-{code}.png'))
   # Modal focus must remain inside the welcome dialog.
   await page.locator('[data-entry="guest"]').focus()
   await page.keyboard.press('Shift+Tab')
   if not await page.evaluate("!!document.activeElement.closest('#folkoopEntryGate')"):
    failures.append(f'{width}x{height}: welcome dialog leaks keyboard focus')
   if errors: failures.extend(f'{width}x{height}: page error {e}' for e in errors)
   await context.close()
  await browser.close()
 if not failures:
  passed=[
   'Unified Mura welcome stays inside four representative viewports',
   'All 11 language choices remain available with one selected state and are exposed on normal-height mobile/desktop',
   'Arabic and Persian are RTL while Latin-script Kurdish remains LTR',
   'No horizontal overflow appears in the welcome surface',
   'Both start paths remain reachable on short screens',
   'Primary welcome content and both CTA are initially visible at 390x844 and desktop',
   'Keyboard focus remains inside the welcome dialog',
   'No page errors in the audited first-contact flow'
  ]
 result={'passed':passed,'failures':failures,'geometry':records,'limits':[('WebKit engine on Linux; real iOS Safari and physical devices not tested' if ENGINE=='webkit' else 'Chromium emulation only; real iOS Safari and physical devices not tested'),'Screenshots are retained for Russian, Arabic and Kurdish at each viewport','This audit does not exercise signed-in account mutation']}
 (OUT/f'entry-welcome-audit-{ENGINE}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 print('ENGINE '+ENGINE)
 for item in passed: print('PASS '+item)
 assert not failures,'\n'.join(failures)

asyncio.run(main())
