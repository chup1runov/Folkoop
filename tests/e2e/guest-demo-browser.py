"""FOLKOOP Mura visit + read-only guided-space browser contract.
No live accounts and no external API requests.
"""
import asyncio,json,os,shutil
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)
BANNED_MURA=('пилот','демо','учебн','регистрац','войти','электронная почта','e-mail','сервер','прототип','не зашифрован','не подключено')

async def assert_mura_immersed(page,scope='body'):
 text=(await page.locator(scope).inner_text()).lower()
 for banned in BANNED_MURA:
  assert banned not in text,(banned,text[:800])
 assert await page.locator('#folkoopEntryGate:visible').count()==0
 assert await page.locator('#netLogin:visible').count()==0

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
  await expect(page.locator('#entryGateBody')).to_contain_text('покажу свой FOLKOOP изнутри')
  await expect(page.locator('[data-entry="email"]')).to_be_hidden()
  await expect(page.locator('[data-entry="guest"]')).to_have_text('Зайти в аккаунт Муры')
  await page.screenshot(path=str(OUT/'folkoop-v037-entry-choice-mobile.png'),full_page=True)
  passed.append('First visit leads into Mura without surfacing registration')

  await page.click('[data-entry="guest"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_hidden()
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Добро пожаловать ко мне')
  await expect(page.locator('#onboardingBody')).to_contain_text('это мой FOLKOOP')
  await expect(page.locator('#onboardingProgress')).to_contain_text('1 / 8')
  passed.append('Visiting Mura launches an in-character walk through her own account')
  await page.click('[data-onboarding="skip"]')
  await expect(page.locator('#networkPanel')).to_be_visible()
  await page.evaluate("localStorage.setItem('folkoop-onboarding-v3','done');window.dispatchEvent(new CustomEvent('folkoop:open-entry'))")
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await page.click('[data-entry="guest"]')
  await expect(page.locator('#onboarding')).to_be_visible()
  await expect(page.locator('#onboardingTitle')).to_have_text('Добро пожаловать ко мне')
  await page.click('[data-onboarding="skip"]')
  await expect(page.locator('#networkPanel')).to_be_visible()
  passed.append('Explicit visit to Mura restarts her tour even when onboarding was completed before')
  await expect(page.locator('.mura-home')).to_be_visible()
  await expect(page.locator('.mura-hero')).to_contain_text('FOLKOOP МУРЫ')
  await expect(page.locator('.mura-hero')).to_contain_text('Живая жизнь внутри FOLKOOP')
  await expect(page.locator('.mura-story-grid')).to_contain_text('Обмен растениями и семенами по соседству')
  await expect(page.locator('.mura-conversation-list')).to_contain_text('Omar')
  await expect(page.locator('.mura-note-grid')).to_contain_text('Одолжить дрель на вечер')
  assert await page.locator('.guest-demo-banner').count()==0
  await expect(page.locator('#networkPanel')).to_contain_text('Купить сухие дрова вместе')
  visible_guest_text=(await page.locator('body').inner_text()).lower()
  assert 'demo' not in visible_guest_text and 'демо' not in visible_guest_text
  assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='guest'")
  assert await page.locator('.pilot:visible').count()==0
  await expect(page.locator('#locationLabel')).to_have_text('Göteborg')
  assert await page.locator('#netLogin').count()==0
  body_text=await page.locator('body').inner_text()
  assert 'ПЕРВАЯ РАБОЧАЯ ВЕРСИЯ' not in body_text
  assert 'Выполняется…' not in body_text
  await assert_mura_immersed(page)
  assert not [u for u in external if 'supabase.co' in u],external
  await page.screenshot(path=str(OUT/'folkoop-v035-guest-home-mobile.png'),full_page=True)
  passed.append('Mura Home is a lived-in account surface with no signup, pilot or technical chrome')
  assert await page.locator('#mobilePrimaryNav a').count()==6
  await page.click('#mobileContextDock [data-mobile-action="demo"]')
  await expect(page.locator('.mobile-demo-popover')).to_be_visible()
  await expect(page.locator('.mobile-demo-popover')).to_contain_text('Ты внутри моего FOLKOOP')
  await expect(page.locator('[data-mobile-action="exitmura"]')).to_have_text('Выйти из аккаунта Муры')
  assert await page.locator('[data-mobile-action="signin"]').count()==0
  await page.click('#mobileContextDock [data-mobile-action="demo"]')
  passed.append('Mura visit context has an explicit exit and no registration CTA inside the account')

  await page.click('#mobilePrimaryNav [data-mobile-nav="together"]')
  await page.click('#mobileContextDock [data-mobile-subnav="people"]')
  await expect(page.locator('#networkPanel')).to_contain_text('Anna')
  await expect(page.locator('#networkPanel')).to_contain_text('Omar')
  assert await page.locator('.guest-demo-banner').count()==0
  await expect(page.locator('#networkPanel')).to_contain_text('Johan')
  await expect(page.locator('#networkPanel')).to_contain_text('связывает дело, место или разговор')
  await assert_mura_immersed(page,'#networkPanel')
  passed.append('Mura People shows relationships rather than a generic directory')

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
   await assert_mura_immersed(page,'#networkPanel')
   passed.append('Mura can browse Communities, Messages and Cooperation without product-meta chrome')

  await page.click('#mobilePrimaryNav [data-mobile-nav="messages"]')
  assert await page.locator('#netLogin').count()==0
  await expect(page.locator('#networkPanel')).to_contain_text('Omar')
  direct=page.locator('article.card').filter(has_text='Omar')
  await expect(direct).to_be_visible()
  await direct.locator('[data-net="openChat"]').click()
  await expect(page.locator('#networkPanel')).to_contain_text('Могу помочь забрать дрова')
  await assert_mura_immersed(page,'#networkPanel')
  assert 'без сквозного шифрования' not in (await page.locator('#networkPanel').inner_text()).lower()
  passed.append('Mura Messages opens an existing conversation with no login/server/security boilerplate')

  await page.click('#mobilePrimaryNav [data-mobile-nav="city"]')
  await expect(page.locator('#cityWorkspace')).to_be_visible()
  assert 'Укажи свой город' not in await page.locator('body').inner_text()
  assert await page.locator('#mobileContextDock [data-mobile-subnav="center"]').count()==0
  frame=page.frame_locator('#cityFrame')
  await expect(frame.locator('body')).not_to_contain_text('ДЕМО')
  await expect(frame.locator('body')).not_to_contain_text('ПИЛОТ')
  await expect(frame.locator('body')).not_to_contain_text('прототип')
  await assert_mura_immersed(page)
  passed.append('Mura City opens Göteborg official-source tools without Center or prototype/demo chrome')

  await page.click('#mobilePrimaryNav [data-mobile-nav="me"]')
  await expect(page.locator('.demo-profile-card')).to_contain_text('Мура')
  await expect(page.locator('.demo-profile-card')).to_contain_text('Göteborg')
  await expect(page.locator('.mura-drafts')).to_contain_text('Одолжить дрель на вечер')
  await expect(page.locator('.mura-drafts')).to_contain_text('Могу проверить резюме')
  assert await page.locator('#netLogin').count()==0
  assert await page.locator('#mobileContextDock [data-mobile-subnav="settings"]').count()==0
  assert await page.locator('#mobileContextDock [data-mobile-subnav="about"]').count()==0
  await expect(page.locator('#mobileContextDock [data-mobile-action="language"]')).to_be_visible()
  await expect(page.locator('.mura-drafts')).to_contain_text('Попробовать ежемесячный обмен навыками')
  await assert_mura_immersed(page,'#networkPanel')
  passed.append('Mura Profile is a personal life map with drafts, Göteborg and no Settings/About detour')


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
  await assert_mura_immersed(page,'#networkPanel')
  passed.append('Mura project view shows people, tasks, activity and chat without mutation or technical clutter')

  await page.click('#mobilePrimaryNav [data-mobile-nav="home"]')
  await expect(page.locator('.mura-home')).to_be_visible()
  assert await page.locator('[data-home="createCoop"]').count()==0
  assert await page.locator('[data-demo="register"]').count()==0
  assert await page.locator('#folkoopEntryGate').is_hidden()
  passed.append('Mura Home stays exploratory and does not surface registration or mutation CTAs')

  await page.click('#mobilePrimaryNav [data-mobile-nav="me"]')
  await expect(page.locator('[data-net="logout"]')).to_have_text('Выйти из аккаунта Муры')
  await page.click('[data-net="logout"]')
  await expect(page.locator('#folkoopEntryGate')).to_be_visible()
  await expect(page.locator('[data-entry="email"]')).to_be_visible()
  await expect(page.locator('[data-entry="email"]')).to_have_text('Войти / зарегистрироваться')
  await expect(page.locator('#entryGateTitle')).to_have_text('Хочешь такой FOLKOOP для себя?')
  passed.append('Registration appears only after the visitor explicitly leaves Mura')

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
