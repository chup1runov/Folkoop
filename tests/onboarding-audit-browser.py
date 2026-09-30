"""Independent onboarding regressions, with screenshots retained even on failure.

No account, database or provider configuration is changed. Browser emulation is
not a claim of real-device iOS/Safari acceptance or character-art acceptance.
"""
import asyncio
import json
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE = os.getenv('BASE_URL', 'http://127.0.0.1:4173/Folkoop/')
ENGINE = os.getenv('BROWSER_ENGINE', 'chromium').lower()
OUT = Path(os.getenv('QA_OUTPUT', 'qa-output'))
OUT.mkdir(parents=True, exist_ok=True)

async def launch_browser(pw):
 if ENGINE=='chromium':
  return await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'), args=['--no-sandbox'])
 if ENGINE=='webkit':
  return await pw.webkit.launch()
 raise AssertionError(f'Unsupported BROWSER_ENGINE={ENGINE}')
GEOMETRY = """() => {
 const box = s => {const e=document.querySelector(s);if(!e)return null;
  const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
 const overlap=(a,b)=>a&&b ? Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)) : 0;
 const actor=box('#folkoopGuideActor'),card=box('.onboarding-card');
 const target=box('.tutorial-target')||actor;
 const contained=r=>r&&card&&r.x>=card.x-.5&&r.y>=card.y-.5&&r.x+r.w<=card.x+card.w+.5&&r.y+r.h<=card.y+card.h+.5;
 const heading=box('#onboardingTitle'),next=box('[data-onboarding="next"]'),back=box('[data-onboarding="back"]'),skip=box('[data-onboarding="skip"]'),copy=box('#onboardingBody');
 const button=document.querySelector('[data-onboarding="next"]');
 const hit=next&&document.elementFromPoint(next.x+next.w/2,next.y+next.h/2);
 return {title:document.querySelector('#onboardingTitle').textContent,actor,card,target,
  actorOverlap:overlap(actor,card),targetOverlap:overlap(target,card),
  controlsVisible:[heading,next,back,skip].every(contained)&&!!hit&&button.contains(hit),
  copyHeight:copy?.h||0,copyScrollTop:document.querySelector('#onboardingBody').scrollTop,
  animation:getComputedStyle(document.querySelector('#folkoopGuideActor>img')).animationName,
  focusInTour:!!document.activeElement.closest('.onboarding-card'),
  outside:[actor,card].some(r=>!r||r.x<-.5||r.y<-.5||r.x+r.w>innerWidth+.5||r.y+r.h>innerHeight+.5)};
}"""

async def main():
 failures, records, passed = [], [], []
 async with async_playwright() as pw:
  browser = await launch_browser(pw)
  for width,height in [(390,844),(1366,900),(320,568),(844,390)]:
   context = await browser.new_context(viewport={'width':width,'height':height}, locale='ru-RU', service_workers='block', reduced_motion='reduce')
   async def local_only(route):
    if route.request.url.startswith(BASE): await route.continue_()
    else: await route.abort()
   await context.route('**/*',local_only)
   page = await context.new_page()
   errors = []
   page.on('pageerror',lambda error:errors.append(str(error)))
   await page.goto(BASE+'?intro=1')
   await expect(page.locator('#folkoopGuideLanguageGate')).to_be_visible()
   await page.locator('[data-folkoop-guide-lang]').first.focus()
   await page.keyboard.press('Shift+Tab')
   if not await page.evaluate("!!document.activeElement.closest('#folkoopGuideLanguageGate')"):
    failures.append(f'{width}: language gate leaks keyboard focus')
   await page.screenshot(path=str(OUT/f'audit-language-{width}.png'))
   await page.click('[data-folkoop-guide-lang="ru"]')
   await expect(page.locator('#onboarding')).to_be_visible()
   await page.wait_for_timeout(220)
   for index in range(8):
    record = await page.evaluate(GEOMETRY)
    record.update(width=width,height=height,step=index+1)
    records.append(record)
    if record['outside']: failures.append(f'{width} step {index+1}: actor/card outside viewport')
    if record['animation']!='none': failures.append(f'{width} step {index+1}: reduced motion ignored')
    if record['targetOverlap']>4: failures.append(f'{width} step {index+1}: highlighted target covered by explanation')
    if record['actorOverlap']>4: failures.append(f'{width} step {index+1}: character covered by explanation')
    if not record['controlsVisible']: failures.append(f'{width} step {index+1}: title or buttons clipped before clicking/scrolling')
    if record['copyHeight']<18: failures.append(f'{width} step {index+1}: explanation viewport too short to read')
    if record['copyScrollTop']>1: failures.append(f'{width} step {index+1}: new explanation did not start at the top')
    if index==0:
     await page.locator('[data-onboarding="skip"]').focus()
     await page.keyboard.press('Shift+Tab')
     if not await page.evaluate("!!document.activeElement.closest('.onboarding-card')"):
      failures.append(f'{width}: tour leaks keyboard focus')
    if index in (0,2,6,7) or record['targetOverlap']>4 or record['actorOverlap']>4 or not record['controlsVisible']:
     await page.screenshot(path=str(OUT/f'audit-tour-{width}-{index+1}.png'))
    await page.locator('#onboardingBody').evaluate('e=>e.scrollTop=e.scrollHeight')
    await page.click('[data-onboarding="next"]')
    await page.wait_for_timeout(220)
   await expect(page.locator('#onboarding')).to_be_hidden()
   await page.emulate_media(reduced_motion='no-preference')
   await page.evaluate("""() => {
    const guide=FolkoopGuide;
    guide.teleportTo(document.querySelector('.brand'));
    guide.home({instant:true});
   }""")
   await page.wait_for_timeout(250)
   opacity = await page.locator('#folkoopGuideActor').evaluate('e=>Number(getComputedStyle(e).opacity)')
   if opacity<.99: failures.append(f'{width}: interrupted teleport leaves helper invisible')
   if errors: failures.extend(f'{width}: page error {e}' for e in errors)
   await context.close()
  await browser.close()
 if not failures:
  passed=['Keyboard focus stays in the language gate and tour', 'Reduced motion disables character animation', 'All 8 value-tour targets and the character remain unobscured at four viewport sizes', 'Headings and navigation buttons stay visible without scrolling the card', 'Scrollable explanations reset to their beginning on every step', 'An interrupted teleport leaves the helper visible', 'No page errors in tested guest flows']
 result={'passed':passed,'failures':failures,'geometry':records,'limits':[('WebKit engine on Linux; real iOS Safari and physical devices not tested' if ENGINE=='webkit' else 'Chromium emulation only; real iOS Safari and physical devices not tested'),'No signed-in/account mutation in this audit','Geometry and CSS state do not prove authentic pointing or sitting artwork']}
 (OUT/'onboarding-audit-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 print('ENGINE '+ENGINE)
 for item in passed: print('PASS '+item)
 assert not failures, '\n'.join(failures)

asyncio.run(main())
