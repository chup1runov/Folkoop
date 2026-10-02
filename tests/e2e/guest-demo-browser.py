"""FOLKOOP Mura visit + read-only guided-space browser contract.
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

  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  assert await page.locator('[data-entry-language]').count()==11
  await page.click('[data-entry-language="ru"]')
  await expect(page.locator('#entryGateTitle')).to_have_text('Привет! Я Мура')
  await expect(page.locator('#entryGateBody')).to_contain_text('Заходи ко мне в гости')
  await expect(page.locator('[data-entry="email"]')).to_have_text('Войти / зарегистрироваться')
  await expect(page.locator('[data-entry="guest"]')).to_have_text('Зайти к Муре в гости')
  await page.screenshot(path=str(OUT/'folkoop-v037-entry-choice-mobile.png'),full_page=True)
  passed.append('First visit is one Mura welcome with language and visit/account choice')

  await page.click('[data-entry="guest"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Привет, я Мура')
  await expect(page.locator('#onboardingBody')).to_contain_text('помощница FOLKOOP')
  await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 8')
  passed.append('Visiting Mura always launches the guided value-first tour')
  await page.click('[data-onboarding="skip"]')
  await expect(page.locator('#networkPanel')).to_be_visible()
  await page.evaluate("localStorage.setItem('folkoop-onboarding-v3','done');window.dispatchEvent(new CustomEvent('folkoop:open-entry'))")
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await page.click('[data-entry="guest"]')
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Привет, я Мура')
  await page.click('[data-onboarding="skip"]')
  await expect(page.locator('#networkPanel')).to_be_visible()
  passed.append('Explicit visit to Mura restarts her tour even when onboarding was completed before')
  await expect(page.locator('.home-daily-focus')).to_contain_text('Сегодня')
  await expect(page.locator('.home-subtitle')).to_contain_text('до того, как появился групповой чат')
  assert await page.locator('.guest-demo-banner').count()==0
  await expect(page.locator('#networkPanel')).to_contain_text('Купить сухие дрова вместе')
  assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='guest'")
  assert not [u for u in external if 'supabase.co' in u],external
  await page.screenshot(path=str(OUT/'folkoop-v035-guest-home-mobile.png'),full_page=True)
  passed.append('Mura visit uses the real Home renderer with local learning data and no Supabase request')
  assert await page.locator('#mobilePrimaryNav a').count()==6
  await page.click('#mobileContextDock [data-mobile-action="demo"]')
  await expect(page.locator('.mobile-demo-popover')).to_be_visible()
  await expect(page.locator('.mobile-demo-popover')).to_contain_text('учебное пространство')
  await page.click('#mobileContextDock [data-mobile-action="demo"]')
  passed.append('Mura visit context is available without a DEMO label')

  await page.click('#mobilePrimaryNav [data-mobile-nav="together"]')
  await page.click('#mobileContextDock [data-mobile-subnav="people"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Anna')
  await expect(page.locator('#networkPanel')).to_contain_text('Omar')
  assert await page.locator('.guest-demo-banner').count()==0
  passed.append('Mura visit can browse the real People UI without persistent DEMO chrome')

  for route_name,expected in [('communities','Соседи Olofstorp'),('messages','Обмен растениями'),('together','Купить сухие дрова вместе')]:
   if route_name=='together':
    await page.click('#mobilePrimaryNav [data-mobile-nav="together"]')
   elif route_name in ('communities',):
    await page.click('#mobilePrimaryNav [data-mobile-nav="together"]')
    await page.click(f'#mobileContextDock [data-mobile-subnav="{route_name}"]')
   else:
    await page.click(f'#mobilePrimaryNav [data-mobile-nav="{route_name}"]')
   await expect(page.locator('#networkPanel')).to_contain_text(expected)
   assert await page.locator('.guest-demo-banner').count()==0
   passed.append('Guest can browse Communities, Messages and Cooperation through the real navigation')
  await page.click('#mobilePrimaryNav [data-mobile-nav="city"]')
  await expect(page.locator('#mobileContextDock [data-mobile-subnav="center"]')).to_be_visible()
  await page.click('#mobileContextDock [data-mobile-subnav="center"]')
  await expect(page.locator('#workspace')).to_contain_text('Центр')
  passed.append('City opens a compact second row with Center inside the local context')

  await page.click('#mobilePrimaryNav [data-mobile-nav="me"]')
  await expect(page.locator('#mobileContextDock [data-mobile-subnav="settings"]')).to_be_visible()
  await expect(page.locator('#mobileContextDock [data-mobile-action="language"]')).to_be_visible()
  passed.append('Profile opens a second row for profile settings, About and language')


  await page.click('#mobilePrimaryNav [data-mobile-nav="projects"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Обмен растениями и семенами по соседству')
  await page.click('[data-coop="open"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Подтвердить место для обмена')
  await expect(page.locator('.coop-summary-stats')).to_be_visible()
  tasks=page.locator('[data-coop-section="tasks"]')
  members=page.locator('[data-coop-section="members"]')
  activity=page.locator('[data-coop-section="activity"]')
  assert await tasks.get_attribute('open') is None
  assert await members.get_attribute('open') is None
  assert await activity.get_attribute('open') is None
  await tasks.locator('summary').click()
  await expect(tasks).to_contain_text('Подтвердить место для обмена')
  await members.locator('summary').click()
  await expect(members).to_contain_text('Anna')
  passed.append('Project starts with summary/next step and keeps tasks, participants and activity collapsible')
  assert await page.locator('#networkPanel form:visible').count()==0
  assert await page.locator('#workspace').is_hidden()
  assert await page.locator('[data-coop="delete"]:visible').count()==0
  assert await page.locator('[data-coop="deleteTask"]:visible').count()==0
  await page.screenshot(path=str(OUT/'folkoop-v035-guest-project-mobile.png'),full_page=True)
  passed.append('Guest project view shows process/state without duplicate local workspace or mutation clutter')

  await page.click('#mobilePrimaryNav [data-mobile-nav="home"]')
  await page.click('[data-home="createCoop"][data-kind="project"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await expect(page.locator('#entryGateNote')).to_contain_text('учебное пространство')
  passed.append('A real mutation attempt opens the account choice instead of changing demo state')

  await page.click('[data-entry="email"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
  await expect(page.locator('#netLogin')).to_be_visible()
  assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='account'")
  passed.append('Guest can switch directly to the real email sign-in flow')


  # Regression: a returning browser may already have completed onboarding, but an explicit
  # invitation to visit Mura must still launch the full tour.
  await context.close()
  context=await browser.new_context(viewport={'width':390,'height':844},locale='ru-RU',service_workers='block')
  await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('folkoop-language','ru');localStorage.setItem('folkoop-language-choice-v1','done');localStorage.setItem('folkoop-onboarding-v3','done');sessionStorage.clear();")
  await context.route('**/*',route)
  page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(BASE)
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await page.click('[data-entry="guest"]')
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 8')
  passed.append('Explicit visit to Mura restarts the tour even when onboarding was completed before')

  # Regression: an explicit visit to Mura must start the tour even when this
  # browser has completed onboarding before.
  await page.evaluate("localStorage.setItem('folkoop-onboarding-v3','done');sessionStorage.removeItem('folkoop-entry-mode-v1')")
  await page.reload()
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await page.click('[data-entry="guest"]')
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 8')
  passed.append('Explicitly visiting Mura always starts her tour even after onboarding was completed earlier')
  await page.click('[data-onboarding="skip"]')

  assert not errors,errors
  await context.close();await browser.close()

 OUT.joinpath('guest-demo-results.json').write_text(json.dumps({
  'passed':passed,
  'limits':['Mura learning data are local examples, never evidence of real participants or activity','A visitor cannot mutate network state']
 },ensure_ascii=False,indent=2))
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
