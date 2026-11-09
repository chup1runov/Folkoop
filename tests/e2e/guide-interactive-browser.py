
# Locale fixtures exercise translated entry/story content; user language selection
# moved to Settings and is exercised by navigation-settings-browser.py.
async def set_fixture_language(page, code):
 await page.evaluate("""code=>{const gate=document.querySelector('#folkoopEntryGate'),opened=gate&&!gate.hidden,exited=opened&&!gate.querySelector('[data-entry=\"email\"]').hidden;const select=document.querySelector('#language');select.value=code;select.dispatchEvent(new Event('change',{bubbles:true}));if(opened)window.dispatchEvent(new CustomEvent('folkoop:open-entry',{detail:{source:exited?'guest-exit':'fixture'}}));}""", code)

"""Interactive tour acceptance in real engines, including RTL; no external writes."""
import asyncio, os, json, shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4186/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'))

async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 results=[]
 async with async_playwright() as pw:
  browser=await pw.webkit.launch() if ENGINE=='webkit' else await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
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
     await set_fixture_language(page, lang)
     await page.click('[data-entry="guest"]')
     await expect(page.locator('#onboarding')).to_be_visible()
     await expect(page.locator('html')).to_have_attribute('dir','ltr' if lang=='ru' else 'rtl')
     # The accepted tour has five chapters, with Messages at index 4.
     await page.click('#onboardingProgress')
     await page.select_option('#onboardingChapter','4')
     await expect(page.locator('.chat-messages')).to_be_attached()
     await expect(page.locator('[data-coop="openNotify"]')).to_have_attribute('data-id','00000000-0000-4000-8000-000000000301')
     groups=[('profile',4),('together',5),('center',3),('city',3),('message',3)]
     for step,(kind,count) in enumerate(groups):
      await page.click('#onboardingProgress')
      await page.select_option('#onboardingChapter',str(step))
      await expect(page.locator('[data-mura-'+kind+']')).to_have_count(count)
      await page.wait_for_timeout(220)
      geometry=await page.evaluate("() => {\n       const inside=e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;};\n       return {overflow:document.documentElement.scrollWidth>innerWidth+1,\n        card:inside(document.querySelector('.onboarding-card')),\n        controls:[...document.querySelectorAll('[data-onboarding]')].every(inside)};\n      }")
      assert geometry=={'overflow':False,'card':True,'controls':True},(lang,width,step,geometry)
      if step==4:
       await expect(page.locator('.chat-messages > article')).to_have_count(4)
       await expect(page.locator('#netMessage')).to_have_count(0)
      await page.screenshot(path=str(OUT/f'story-{ENGINE}-{lang}-{width}-{step}.png'))
     await page.locator('#globalSearchButton').focus()
     await expect(page.locator('#globalSearchButton')).to_be_focused()
     await expect(page.locator('.onboarding-card')).to_have_attribute('aria-modal','false')
     await page.click('[data-onboarding="next"]')
     await expect(page.locator('#onboarding')).to_be_hidden()
     await expect(page.locator('#muraTourFinale')).to_be_visible()
     await expect(page.locator('#muraTourFinale [data-tour-map-story]')).to_have_count(18)
     await page.click('[data-mura-stay]')
     await expect(page.locator('#muraTourFinale')).to_be_hidden()
     await expect(page.locator('.chat-messages')).to_be_visible()
     await expect(page.locator('#netLogin')).to_be_hidden()
     # Explicit replay remains available after completion.
     await page.click('#folkoopGuideActor')
     await page.click('[data-helper="tour"]')
     await expect(page.locator('#onboarding')).to_be_visible()
     await page.click('#onboardingProgress')
     await page.select_option('#onboardingChapter','2')
     await page.click('[data-onboarding="back"]')
     await expect(page.locator('#onboardingChapter')).to_have_value('1')
     await page.click('[data-onboarding="skip"]')
     await expect(page.locator('#onboarding')).to_be_hidden()
     await expect(page.locator('#netLogin')).to_be_hidden()
     assert not errors,(lang,width,errors)
     assert not writes,(lang,width,writes)
     results.append({'language':lang,'width':width,'height':height,'status':'PASS'})
     print('PASS',ENGINE,lang,width,height,flush=True)
     await context.close()
  finally:await browser.close()
 (OUT/'guide-interactive-results.json').write_text(json.dumps({'engine':ENGINE,'cases':results,'limits':['Emulation, not physical iPhone/VoiceOver','Technical RTL checks, not native-language approval']},indent=2))

asyncio.run(main())
