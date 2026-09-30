"""FOLKOOP v0.35 first-entry + read-only guest preview browser contract.
No live accounts and no external API requests.
"""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
  context=await browser.new_context(viewport={'width':390,'height':844},locale='ru-RU',service_workers='block')
  await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.clear();sessionStorage.clear();")
  external=[]
  async def route(request):
   if request.request.url.startswith(BASE):
    await request.continue_()
   else:
    external.append(request.request.url)
    await request.abort()
  await context.route('**/*',route)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE)

  await expect(page.locator('#folkoopGuideLanguageGate')).to_be_visible()
  await page.click('[data-folkoop-guide-lang="ru"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await expect(page.locator('#entryGateTitle')).to_have_text('Как хочешь войти?')
  await expect(page.locator('[data-entry="email"]')).to_have_text('Войти по почте')
  await expect(page.locator('[data-entry="guest"]')).to_have_text('Посмотреть как гость')
  await page.screenshot(path=str(OUT/'folkoop-v035-entry-choice-mobile.png'),full_page=True)
  passed.append('First visit is language -> account choice, not language -> long tutorial/form')

  await page.click('[data-entry="guest"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Принеси реальную потребность, навык, ресурс или идею')
  await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 8')
  passed.append('Guest first session receives the short value-first product tour')
  await page.click('[data-onboarding="skip"]')
  await expect(page.locator('#networkPanel')).to_be_visible()
  await expect(page.locator('#demoBanner')).to_contain_text('Гостевой обзор')
  await expect(page.locator('.home-daily-focus')).to_contain_text('Сегодня')
  await expect(page.locator('#networkPanel')).to_contain_text('Купить сухие дрова вместе')
  assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='guest'")
  assert not [u for u in external if 'supabase.co' in u],external
  await page.screenshot(path=str(OUT/'folkoop-v035-guest-home-mobile.png'),full_page=True)
  passed.append('Guest sees the real Home renderer with local sample data and makes no Supabase request')

  await page.click('#mobileMenuToggle')
  await page.click('#nav a[href="#/people"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Anna')
  await expect(page.locator('#networkPanel')).to_contain_text('Omar')
  await expect(page.locator('#demoBanner')).to_be_visible()
  passed.append('Guest can browse real People UI using clearly synthetic demo profiles')

  for route_name,expected in [('communities','Соседи Olofstorp'),('messages','Ремонтное кафе'),('together','Купить сухие дрова вместе')]:
   await page.click('#mobileMenuToggle')
   await page.click(f'#nav a[href="#/{route_name}"]')
   await expect(page.locator('#networkPanel')).to_contain_text(expected)
   await expect(page.locator('#demoBanner')).to_be_visible()
  passed.append('Guest can browse Communities, Messages and Cooperation through the real navigation')

  await page.click('#mobileMenuToggle')
  await page.click('#nav a[href="#/projects"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Ремонтное кафе по соседству')
  await page.click('[data-coop="open"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Подтвердить помещение')
  assert await page.locator('#networkPanel form:visible').count()==0
  assert await page.locator('#workspace').is_hidden()
  assert await page.locator('[data-coop="delete"]:visible').count()==0
  assert await page.locator('[data-coop="deleteTask"]:visible').count()==0
  await page.screenshot(path=str(OUT/'folkoop-v035-guest-project-mobile.png'),full_page=True)
  passed.append('Guest project view shows process/state without duplicate local workspace or mutation clutter')

  await page.click('#mobileMenuToggle')
  await page.click('#nav a[href="#/home"]')
  await page.click('[data-home="createCoop"][data-kind="project"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await expect(page.locator('#entryGateNote')).to_contain_text('создавать')
  passed.append('A real mutation attempt opens the account choice instead of changing demo state')

  await page.click('[data-entry="email"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
  await expect(page.locator('#netLogin')).to_be_visible()
  assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='account'")
  passed.append('Guest can switch directly to the real email sign-in flow')

  assert not errors,errors
  await context.close();await browser.close()

 OUT.joinpath('guest-demo-results.json').write_text(json.dumps({
  'passed':passed,
  'limits':['Demo data are local samples, never evidence of real participants or activity','Guest cannot mutate network state']
 },ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
