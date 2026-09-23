"""Editorial #om checks. Inspect contacts without sending a message or opening external apps."""
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
  await expect(page.locator('#projectBio')).to_contain_text('MittSkifte')
  await expect(page.locator('#projectFaq > details')).to_have_count(11)
  await expect(page.locator('#contactAuthor')).to_have_attribute('href','mailto:chup1runov@gmail.com')
  await expect(page.locator('#contactTelegram')).to_have_attribute('href','https://t.me/chup1runov')
  await expect(page.locator('#projectContactNote')).to_be_visible()
  assert await page.locator('.about-meta a').count()==0
  assert external==[], 'About must not make third-party requests'
  passed.append('Direct Om renders approved email/Telegram and sourced bio, with no external requests or repository promotion')
  await page.locator('#projectHistory > summary').click()
  await expect(page.locator('#projectHistory')).to_have_attribute('data-idea-year','2021')
  await expect(page.locator('#projectHistory')).to_contain_text('2021')
  await expect(page.locator('#projectHistory')).to_contain_text('Enligt')
  await expect(page.locator('#projectHistory time')).to_have_attribute('datetime','2026-09-21')
  first=page.locator('#projectFaq > details').first
  await first.locator('summary').focus();await page.keyboard.press('Space')
  await expect(first).to_have_attribute('open','')
  await expect(first.locator('.project-answer')).to_be_visible()
  await page.keyboard.press('Space');await expect(first).not_to_have_attribute('open','')
  passed.append('Attributed idea year and verified repository date remain distinct; FAQ works by keyboard')
  await page.locator('#projectFaq > details').nth(7).locator('summary').click()
  await expect(page.locator('#projectFaq > details').nth(7)).to_contain_text('finns inte ännu')
  await page.locator('#projectFaq > details').nth(2).locator('summary').click()
  await expect(page.locator('#projectFaq > details').nth(2).locator('a')).to_have_attribute('href','https://www.riksdagen.se/sv/sa-fungerar-riksdagen/riksdagens-uppgifter/beslutar-om-lagar/')
  await page.locator('#projectFaq > details').nth(3).locator('summary').click()
  await expect(page.locator('#projectFaq > details').nth(3).locator('a')).to_have_attribute('href','https://goteborg.se/planochbyggprojekt')
  passed.append('Civic-task plans are not described as shipped; participation and Riksdag answers link to official sources')
  await page.evaluate('SverinavProjectAbout.mount();SverinavProjectAbout.mount()')
  await expect(page.locator('#projectAuthor')).to_have_count(1)
  await page.fill('#pilotFeedbackTask','Test draft, never send')
  await page.fill('#pilotFeedbackNotes','Local test only')
  for lang in ['sv','en','ru','uk','fi','es','ar','fa','so','bs','ku']:
   await page.click('#languageButton');await page.click('[data-language="'+lang+'"]')
   await expect(page.locator('#projectAuthor')).to_have_attribute('lang',lang)
   await expect(page.locator('#projectFaq > details')).to_have_count(11)
   await expect(page.locator('#pilotFeedbackTask')).to_have_value('Test draft, never send')
   await expect(page.locator('#contactAuthor')).to_have_attribute('href','mailto:chup1runov@gmail.com')
   for width in [320,390]:
    await page.set_viewport_size({'width':width,'height':844})
    assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'overflow {lang} {width}'
   if lang in ['sv','ru','ar']:
    await page.evaluate('window.scrollTo(0,0)')
    await page.screenshot(path=str(OUT/f'about-{lang}.png'),full_page=True)
  passed.append('All eleven languages/RTL preserve drafts and contacts without duplicate content or narrow-screen overflow')
  await page.click('#languageButton');await page.click('[data-language="sv"]')
  await page.evaluate("() => {navigator.clipboard.writeText=async()=>{throw new Error('denied')};document.execCommand=()=>false;}")
  await page.click('#copyPilotFeedback')
  await expect(page.locator('#pilotFeedbackStatus')).to_contain_text('inte')
  assert await page.locator('body > textarea').count()==0
  passed.append('Existing clipboard failure remains truthful and cleans up temporary nodes')
  await page.add_style_tag(content='.project-disclosure>summary,.project-answer p,.project-story>p{font-size:28px!important}')
  await page.set_viewport_size({'width':320,'height':844})
  await page.locator('#projectFaq > details').first.locator('summary').click()
  assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  await page.set_viewport_size({'width':1280,'height':900})
  assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  passed.append('Expanded answers reflow with enlarged text and desktop width')
  await page.locator('.bottom-nav [data-screen="beslut"]').click();await page.click('#aboutButton')
  await expect(page.locator('#projectAuthor')).to_have_count(1)
  await expect(page.locator('#pilotFeedbackTask')).to_have_value('Test draft, never send')
  assert await page.locator('.bottom-nav button').count()==4
  assert errors==[], '\n'.join(errors)
  passed.append('Four tabs and return navigation retain the draft without runtime errors')
  await ctx.close();await browser.close()
 OUT.joinpath('about-results.json').write_text(json.dumps({'passed':passed,'limitations':['Chromium, not physical iPhone/Safari/VoiceOver','Contact URLs inspected; no message sent','Translations need native-speaker review','Activities and rewards remain planned']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))
asyncio.run(main())
