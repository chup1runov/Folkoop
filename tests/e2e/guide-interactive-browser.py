"""Interactive tour acceptance in real engines, including RTL; no external writes."""
import asyncio, os, json
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4186/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'))

async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 results=[]
 async with async_playwright() as pw:
  browser=await getattr(pw,ENGINE).launch()
  try:
   for lang in ['ru','ar','fa']:
    for width,height in [(320,568),(390,844),(844,390),(1366,900)]:
     context=await browser.new_context(viewport={'width':width,'height':height},service_workers='block',reduced_motion='reduce')
     writes=[]
     async def restrict(route):
      if route.request.method not in ('GET','HEAD'):
       writes.append(route.request.method);await route.abort()
      elif route.request.url.startswith(BASE):await route.continue_()
      else:await route.abort()
     await context.route('**/*',restrict)
     page=await context.new_page();errors=[]
     page.on('pageerror',lambda error:errors.append(str(error)))
     await page.goto(BASE+'?first-contact=guest-guide')
     await page.select_option('#entryGuestLanguage',lang)
     await page.click('[data-entry="guest"]')
     await expect(page.locator('#onboarding')).to_be_visible()
     await expect(page.locator('html')).to_have_attribute('dir','ltr' if lang=='ru' else 'rtl')
     # Jumping directly into the chat must resolve the same project's objects.
     await page.click('#onboardingProgress')
     await page.select_option('#onboardingChapter','2')
     await expect(page.locator('.chat-messages')).to_be_attached()
     await expect(page.locator('[data-coop="openNotify"]')).to_have_attribute('data-id','00000000-0000-4000-8000-000000000301')
     for step in range(5):
      await page.click('#onboardingProgress')
      await page.select_option('#onboardingChapter',str(step))
      await page.wait_for_timeout(220)
      geometry=await page.evaluate('''() => {
       const inside=e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;};
       return {overflow:document.documentElement.scrollWidth>innerWidth+1,
        card:inside(document.querySelector('.onboarding-card')),
        controls:[...document.querySelectorAll('[data-onboarding]')].every(inside)};
      }''')
      assert geometry=={'overflow':False,'card':True,'controls':True},(lang,width,step,geometry)
      if step in (1,3):
       await expect(page.locator('.coop-summary')).to_be_attached()
       await expect(page.locator('[data-coop="openLinkedChat"]')).to_have_attribute('data-id','00000000-0000-4000-8000-000000000201')
      if step==1:
       await expect(page.locator('[data-onboarding="next"]')).to_be_hidden()
       await page.locator('[data-coop="openLinkedChat"]').focus()
       await page.keyboard.press('Enter')
       await expect(page.locator('#onboardingChapter')).to_have_value('2')
      if step==2:
       await expect(page.locator('.chat-messages > article')).to_have_count(4)
       await expect(page.locator('#netMessage')).to_have_count(0)
      if step==3:
       await expect(page.locator('.coop-next-step')).to_be_attached()
      await page.screenshot(path=str(OUT/f'story-{ENGINE}-{lang}-{width}-{step}.png'))
     await page.locator('[data-onboarding="skip"]').focus()
     await page.keyboard.press('Shift+Tab')
     await expect(page.locator('[data-onboarding="next"]')).to_be_focused()
     await page.keyboard.press('Tab')
     await expect(page.locator('[data-onboarding="skip"]')).to_be_focused()
     await page.screenshot(path=str(OUT/f'guide-{ENGINE}-{lang}-{width}.png'))
     await page.click('[data-onboarding="next"]')
     await expect(page.locator('#onboarding')).to_be_hidden()
     await expect(page.locator('.mura-home')).to_be_visible()
     await page.wait_for_function('() => scrollY<2')
     await page.click('#folkoopGuideActor')
     await page.click('[data-helper="tour"]')
     await expect(page.locator('#onboardingChapter')).to_have_value('0')
     await page.click('#onboardingProgress')
     await page.select_option('#onboardingChapter','2')
     await page.click('[data-onboarding="back"]')
     await expect(page.locator('#onboardingChapter')).to_have_value('1')
     await expect(page.locator('[data-coop="openLinkedChat"]')).to_have_attribute('data-id','00000000-0000-4000-8000-000000000201')
     await page.click('[data-onboarding="skip"]')
     await expect(page.locator('.mura-home')).to_be_visible()
     await page.wait_for_function('() => scrollY<2')
     await expect(page.locator('#netLogin')).to_be_hidden()
     assert not errors,(lang,width,errors)
     assert not writes,(lang,width,writes)
     results.append({'language':lang,'width':width,'height':height,'status':'PASS'})
     print('PASS',ENGINE,lang,width,height,flush=True)
     await context.close()
  finally:await browser.close()
 (OUT/'guide-interactive-results.json').write_text(json.dumps({'engine':ENGINE,'cases':results,'limits':['Emulation, not physical iPhone/VoiceOver','Technical RTL checks, not native-language approval']},indent=2))

asyncio.run(main())
