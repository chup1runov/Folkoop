"""FOLKOOP v0.22 first-run onboarding and responsive menu contract."""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Sverinav/')
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
  await expect(page.locator('#onboardingTitle')).to_have_text('Профиль')
  await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 11')
  passed.append('First run starts with Profile and shows explicit step progress')

  expected=['Профиль','Главная','Сообщения','Люди','Сообщества','Вместе','Проекты']
  for idx,title in enumerate(expected):
   await expect(page.locator('#onboardingTitle')).to_have_text(title)
   if idx<len(expected)-1: await page.click('[data-onboarding=next]')
  # Continue through City, Center, Settings, About.
  for title in ['Город','Центр','Настройки','О нас']:
   await page.click('[data-onboarding=next]')
   await expect(page.locator('#onboardingTitle')).to_have_text(title)
  await expect(page.locator('[data-onboarding=next]')).to_have_text('Начать пользоваться FOLKOOP')
  await page.click('[data-onboarding=next]')
  await expect(page.locator('#onboarding')).to_be_hidden()
  assert await page.evaluate("localStorage.getItem('folkoop-onboarding-v1')")=='done'
  passed.append('Eleven Next steps finish and remember onboarding locally')

  # Full menu order is preserved on mobile behind the menu button.
  await page.click('#mobileMenuToggle')
  assert 'menu-open' in (await page.locator('body').get_attribute('class') or '')
  labels=await page.locator('#nav a span').all_text_contents()
  assert labels[:11]==['Профиль','Главная','Сообщения','Люди','Сообщества','Вместе','Проекты','Город','Центр','Настройки','О нас'],labels
  await page.click('#nav a[href="#/settings"]')
  assert 'menu-open' not in (await page.locator('body').get_attribute('class') or '')
  await expect(page.locator('#workspace')).to_contain_text('Повторить инструкцию')
  passed.append('Mobile drawer exposes the requested ordered navigation and closes after selection')

  # Settings can replay onboarding.
  await page.click('[data-action=tutorial]')
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Профиль')
  await page.click('[data-onboarding=skip]')
  await expect(page.locator('#onboarding')).to_be_hidden()
  passed.append('Settings can replay or skip the introduction')

  assert errors==[],errors
  await page.screenshot(path=str(OUT/'folkoop-v022-mobile-menu.png'),full_page=True)
  await context.close();await browser.close()

 OUT.joinpath('onboarding-results.json').write_text(json.dumps({'passed':passed,'limits':['Chromium emulation; not real iOS Safari','Detailed onboarding copy is SV/EN/RU; other shell locales use English fallback']},ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
