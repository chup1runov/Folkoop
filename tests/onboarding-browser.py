"""FOLKOOP v0.27 language-first onboarding and physical Ksyusha presence."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)

async def local_only_factory(context):
 async def local_only(route):
  if route.request.url.startswith(BASE): await route.continue_()
  else: await route.abort()
 await context.route('**/*',local_only)

async def mobile_flow(browser,passed):
 context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
 await local_only_factory(context)
 page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto(BASE+'?intro=1')

 await expect(page.locator('#ksyushaLanguageGate')).to_be_visible()
 await expect(page.locator('#onboarding')).to_be_hidden()
 await expect(page.locator('#ksyushaLanguageTitle')).to_have_text('Hej! · Hi! · Привет!')
 await expect(page.locator('.ksyusha-language-character img')).to_be_visible()
 assert await page.locator('[data-ksyusha-lang]').count()==11
 passed.append('First contact is Ksyusha plus language selection before the site tour')

 await page.click('[data-ksyusha-lang="ru"]')
 await expect(page.locator('#ksyushaLanguageGate')).to_be_hidden()
 await expect(page.locator('#onboarding')).to_be_visible()
 await expect(page.locator('#onboardingTitle')).to_have_text('Добро пожаловать в FOLKOOP')
 await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 14')
 await expect(page.locator('#ksyushaActor')).to_be_visible()
 assert await page.evaluate("localStorage.getItem('folkoop-language-choice-v1')")=='done'
 passed.append('Chosen language is applied before Ksyusha starts explaining FOLKOOP')

 titles=[
  'Добро пожаловать в FOLKOOP','Профиль','Главная','Четыре быстрых действия',
  'Сообщения','Люди','Сообщества','Вместе','Проекты','Город','Центр',
  'Настройки','О нас','Ксюша · помощник FOLKOOP'
 ]
 first_box=await page.locator('#ksyushaActor').bounding_box()
 for idx,title in enumerate(titles):
  await expect(page.locator('#onboardingTitle')).to_have_text(title)
  await expect(page.locator('#onboardingSpotlight')).to_be_visible()
  box=await page.locator('#ksyushaActor').bounding_box()
  assert box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=390 and box['y']+box['height']<=844,box
  if title=='Четыре быстрых действия':
   await expect(page.locator('#ksyushaActor')).to_have_class(r'.*is-perched.*')
  if idx<len(titles)-1:
   await page.click('[data-onboarding=next]')
   await page.wait_for_timeout(420)

 moved_box=await page.locator('#ksyushaActor').bounding_box()
 assert first_box and moved_box and (abs(first_box['x']-moved_box['x'])>8 or abs(first_box['y']-moved_box['y'])>8)
 await expect(page.locator('[data-onboarding=next]')).to_have_text('Начать пользоваться FOLKOOP')
 await page.click('[data-onboarding=next]')
 await expect(page.locator('#onboarding')).to_be_hidden()
 assert await page.evaluate("localStorage.getItem('folkoop-onboarding-v3')")=='done'
 passed.append('Ksyusha physically relocates through the 14-step tour and can perch on highlighted UI')

 await expect(page.locator('#ksyushaActor')).to_be_visible()
 await page.click('#ksyushaActor')
 await expect(page.locator('#folkoopHelperPanel')).to_be_visible()
 await expect(page.locator('#folkoopHelperTitle')).to_have_text('Ксюша')
 await expect(page.locator('#folkoopHelperPanel')).to_contain_text('Показать всю инструкцию ещё раз')
 passed.append('After onboarding the physical Ksyusha remains as the lightweight contextual helper')

 await page.click('[data-helper=close]')
 await page.click('#mobileMenuToggle')
 labels=await page.locator('#nav a span').all_text_contents()
 assert labels[:11]==['Профиль','Главная','Сообщения','Люди','Сообщества','Вместе','Проекты','Город','Центр','Настройки','О нас'],labels
 await page.click('#nav a[href="#/settings"]')
 await page.click('[data-action=tutorial]')
 await expect(page.locator('#ksyushaLanguageGate')).to_be_visible()
 passed.append('Replay from Settings restarts from language, preserving the language-first contract')
 await page.keyboard.press('Escape')
 await page.screenshot(path=str(OUT/'folkoop-v027-language-ksyusha-mobile.png'),full_page=True)
 assert errors==[],errors
 await context.close()

async def desktop_flow(browser,passed):
 context=await browser.new_context(service_workers='block',locale='en-US',viewport={'width':1366,'height':900})
 await local_only_factory(context)
 page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto(BASE+'?intro=1')
 await expect(page.locator('#ksyushaLanguageGate')).to_be_visible()
 card=await page.locator('.ksyusha-language-card').bounding_box()
 assert card and card['width']>700 and card['height']<900,card
 await page.click('[data-ksyusha-lang="en"]')
 await expect(page.locator('#onboarding')).to_be_visible()
 await page.click('[data-onboarding=next]')
 await page.wait_for_timeout(420)
 actor=await page.locator('#ksyushaActor').bounding_box()
 assert actor and actor['x']>=0 and actor['x']+actor['width']<=1366 and actor['y']>=0 and actor['y']+actor['height']<=900,actor
 await expect(page.locator('#onboardingSpotlight')).to_be_visible()
 assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 passed.append('Desktop language gate, spotlight and animated Ksyusha stay inside the viewport')
 await page.click('[data-onboarding=skip]')
 assert errors==[],errors
 await context.close()

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  await mobile_flow(browser,passed)
  await desktop_flow(browser,passed)
  await browser.close()
 OUT.joinpath('onboarding-results.json').write_text(json.dumps({'passed':passed,'limits':['Chromium emulation; not real iOS Safari','Detailed tour/helper copy remains SV/EN/RU with existing fallback for other shell locales','Ksyusha motion is local CSS/JS using canonical Mura Character Pack WebP assets; no AI service is called']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
