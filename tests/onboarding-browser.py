"""FOLKOOP v0.26 spotlight onboarding and local Ksyusha helper."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
  async def local_only(route):
   if route.request.url.startswith(BASE): await route.continue_()
   else: await route.abort()
  await context.route('**/*',local_only)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))

  await page.goto(BASE+'?intro=1')
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Добро пожаловать в FOLKOOP')
  await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 15')
  await expect(page.locator('#onboardingSpotlight')).to_be_visible()
  rect=await page.locator('#onboardingSpotlight').bounding_box()
  assert rect and rect['width']>20 and rect['height']>20,rect
  passed.append('First run opens a real spotlight tour with explicit 15-step progress')

  titles=[
   'Добро пожаловать в FOLKOOP','Профиль','Главная','Четыре быстрых действия',
   'Сообщения','Люди','Сообщества','Вместе','Проекты','Город','Центр',
   'Настройки','Язык','О нас','Ксюша · помощник FOLKOOP'
  ]
  for idx,title in enumerate(titles):
   await expect(page.locator('#onboardingTitle')).to_have_text(title)
   await expect(page.locator('#onboardingSpotlight')).to_be_visible()
   if idx<len(titles)-1:
    await page.click('[data-onboarding=next]')
  await expect(page.locator('[data-onboarding=next]')).to_have_text('Начать пользоваться FOLKOOP')
  await page.click('[data-onboarding=next]')
  await expect(page.locator('#onboarding')).to_be_hidden()
  assert await page.evaluate("localStorage.getItem('folkoop-onboarding-v2')")=='done'
  passed.append('Tour explains all main sections, quick actions, language and helper, then remembers v2 locally')

  # Ksyusha remains available after onboarding and is local/contextual.
  await expect(page.locator('#folkoopHelperButton')).to_be_visible()
  await page.click('#folkoopHelperButton')
  await expect(page.locator('#folkoopHelperPanel')).to_be_visible()
  await expect(page.locator('#folkoopHelperTitle')).to_have_text('Ксюша')
  await expect(page.locator('#folkoopHelperBody')).to_contain_text('Главная')
  await expect(page.locator('#folkoopHelperPanel')).to_contain_text('Показать всю инструкцию ещё раз')
  passed.append('Ksyusha stays as a lightweight contextual helper with a replay-tour action')

  # Mobile navigation order is preserved.
  await page.click('[data-helper=close]')
  await page.click('#mobileMenuToggle')
  assert 'menu-open' in (await page.locator('body').get_attribute('class') or '')
  labels=await page.locator('#nav a span').all_text_contents()
  assert labels[:11]==['Профиль','Главная','Сообщения','Люди','Сообщества','Вместе','Проекты','Город','Центр','Настройки','О нас'],labels
  await page.click('#nav a[href="#/settings"]')
  assert 'menu-open' not in (await page.locator('body').get_attribute('class') or '')
  await expect(page.locator('#workspace')).to_contain_text('Повторить инструкцию')
  passed.append('Mobile drawer keeps the requested navigation order and closes after selection')

  # Settings can replay onboarding.
  await page.click('[data-action=tutorial]')
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Добро пожаловать в FOLKOOP')
  await page.click('[data-onboarding=skip]')
  await expect(page.locator('#onboarding')).to_be_hidden()
  passed.append('Settings can replay or skip the spotlight introduction')

  assert errors==[],errors
  await page.screenshot(path=str(OUT/'folkoop-v026-onboarding-mobile.png'),full_page=True)
  await context.close();await browser.close()

 OUT.joinpath('onboarding-results.json').write_text(json.dumps({'passed':passed,'limits':['Chromium emulation; not real iOS Safari','Detailed tour/helper copy is SV/EN/RU; other shell locales use English fallback','Ksyusha is local/rule-based; no AI service is called']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
