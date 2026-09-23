"""Additional #om interactions. Never opens/submits a real public contact issue."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)
async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  ctx=await browser.new_context(viewport={'width':390,'height':844},locale='sv-SE',is_mobile=True,has_touch=True,service_workers='block')
  external=[]
  async def route(r):
   if r.request.url.startswith(BASE):await r.continue_()
   else:external.append(r.request.url);await r.abort()
  await ctx.route('**/*',route)
  page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE+'#om',timeout=15000)
  await expect(page.locator('#projectAuthor')).to_be_visible()
  await expect(page.locator('#projectAuthor')).to_contain_text('Pavel Chuprunov')
  await expect(page.locator('#projectFaq > details')).to_have_count(9)
  await expect(page.locator('#projectContactNote')).to_be_visible()
  await expect(page.locator('#projectContactNote')).to_contain_text('Offentlig')
  await expect(page.locator('#contactAuthor')).to_have_attribute('href','https://github.com/chup1runov/Sverinav/issues/new?template=contact-author.yml')
  assert external==[], 'About must not request weather, telemetry or profile images'
  passed.append('Direct #om renders attributed author, nine questions and a visible public-contact warning without remote requests')
  await page.locator('#projectHistory > summary').click()
  await expect(page.locator('#projectHistory time')).to_have_attribute('datetime','2026-09-21')
  await expect(page.locator('#projectHistory')).to_contain_text('inte ett påstående')
  first=page.locator('#projectFaq > details').first
  await first.locator('summary').focus();await page.keyboard.press('Space')
  await expect(first).to_have_attribute('open','')
  await expect(first.locator('.project-answer')).to_be_visible()
  await page.keyboard.press('Space');await expect(first).not_to_have_attribute('open','')
  passed.append('Creation date is explicitly a repository date and FAQ opens/closes with the keyboard')
  await page.evaluate('SverinavProjectAbout.mount();SverinavProjectAbout.mount()')
  await expect(page.locator('#projectAuthor')).to_have_count(1)
  await expect(page.locator('#projectFaq')).to_have_count(1)
  await page.fill('#pilotFeedbackTask','Test draft, never publish')
  await page.fill('#pilotFeedbackNotes','Local test only')
  for lang in ['sv','en','ru','uk','fi','es','ar','fa','so','bs','ku']:
   await page.click('#languageButton');await page.click('[data-language="'+lang+'"]')
   await expect(page.locator('#projectAuthor')).to_have_attribute('lang',lang)
   await expect(page.locator('#projectFaq > details')).to_have_count(9)
   await expect(page.locator('#pilotFeedbackTask')).to_have_value('Test draft, never publish')
   for width in [320,390]:
    await page.set_viewport_size({'width':width,'height':844})
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'overflow {lang} {width}'
   if lang in ['sv','ru','ar']:
    await page.evaluate('window.scrollTo(0,0)')
    await page.screenshot(path=str(OUT/f'about-{lang}.png'),full_page=True)
  passed.append('Eleven translations and RTL re-render once, retain the original feedback draft and fit 320/390px')
  await page.click('#languageButton');await page.click('[data-language="sv"]')
  await page.evaluate("() => {navigator.clipboard.writeText=async()=>{throw new Error('denied')};document.execCommand=()=>false;}")
  await page.click('#copyPilotFeedback')
  await expect(page.locator('#pilotFeedbackStatus')).to_contain_text('inte')
  assert await page.locator('body > textarea').count()==0
  passed.append('Original clipboard failure handling still works after About enhancement')
  await page.add_style_tag(content='.project-disclosure>summary,.project-answer p,.project-story>p{font-size:28px!important}')
  await page.set_viewport_size({'width':320,'height':844})
  await page.locator('#projectFaq > details').first.locator('summary').click()
  assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  await page.set_viewport_size({'width':1280,'height':900})
  assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  passed.append('Expanded FAQ tolerates enlarged text and desktop width without horizontal clipping')
  await page.goto(BASE+'#beslut');await page.click('#aboutButton')
  await expect(page.locator('#projectAuthor')).to_have_count(1)
  await expect(page.locator('#pilotFeedbackTask')).to_have_value('')
  assert await page.locator('.bottom-nav button').count()==4
  assert errors==[], '\n'.join(errors)
  passed.append('Existing navigation returns to one Om screen; four tabs retained and no browser runtime errors')
  await ctx.close();await browser.close()
 OUT.joinpath('about-results.json').write_text(json.dumps({'passed':passed,'limitations':['Chromium, not physical iPhone/Safari/VoiceOver','Contact link inspected; no issue submitted','Editorial translations require human review']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))
asyncio.run(main())
