"""Mura-first onboarding and contextual-guide browser contract."""
import asyncio,json,os,shutil,re
from pathlib import Path
from playwright.async_api import async_playwright,expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)

async def launch_browser(pw):
 if ENGINE=='chromium':
  return await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 if ENGINE=='webkit':
  return await pw.webkit.launch()
 raise AssertionError(f'Unsupported BROWSER_ENGINE={ENGINE}')

async def local_only_factory(context):
 async def local_only(route):
  if route.request.url.startswith(BASE): await route.continue_()
  else: await route.abort()
 await context.route('**/*',local_only)

async def mobile_flow(browser,passed):
 context=await browser.new_context(service_workers='block',locale='ru-RU',viewport={'width':390,'height':844})
 await local_only_factory(context)
 await context.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined});localStorage.clear();sessionStorage.clear()")
 page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto(BASE)

 await expect(page.locator('#folkoopEntryGate')).to_be_visible()
 await expect(page.locator('#entryGateTitle')).to_have_text('Привет! Я Мура')
 assert await page.locator('[data-entry-language]').count()==11
 await page.click('[data-entry-language="ru"]')
 await expect(page.locator('[data-entry="guest"]')).to_have_text('Зайти в аккаунт Муры')
 await expect(page.locator('[data-entry="email"]')).to_be_hidden()
 await page.click('[data-entry="guest"]')

 await expect(page.locator('#onboarding')).to_be_visible()
 titles=[
  'Добро пожаловать ко мне',
  'Что я храню здесь',
  'Что мне понадобилось',
  'Чем я могу помочь',
  'Идея, которая выросла',
  'Люди вокруг меня',
  'Где мы договариваемся',
  'Теперь исследуй сам'
 ]
 semantic={
  2:('together','Одолжить плиткорез на выходные'),
  3:('together','Могу помочь с фотографией'),
  4:('projects','Обмен растениями и семенами по соседству')
 }
 for idx,title in enumerate(titles):
  await expect(page.locator('#onboardingTitle')).to_have_text(title)
  await expect(page.locator('#onboardingProgress')).to_contain_text(f'{idx+1} / 8')
  await expect(page.locator('#onboardingSpotlight')).to_be_visible()
  await expect(page.locator('#folkoopGuideActor')).to_be_visible()
  if idx in semantic:
   route_name,visible_text=semantic[idx]
   assert page.url.endswith('#/'+route_name),(idx,page.url)
   await expect(page.locator('#networkPanel')).to_contain_text(visible_text)
   await page.click('[data-onboarding="next"]')
   await expect(page.locator('#muraPracticeXp')).to_have_text(f'{idx-1} / 3')
   assert 'XP' not in await page.locator('#onboarding').inner_text()
  await page.screenshot(path=str(OUT/f'folkoop-onboarding-step-{idx+1}.png'),full_page=True)
  if idx<len(titles)-1:
   await page.click('[data-onboarding="next"]')

 await expect(page.locator('[data-onboarding="next"]')).to_have_text('Осмотреться у Муры')
 await page.click('[data-onboarding="next"]')
 await expect(page.locator('#onboarding')).to_be_hidden()
 await expect(page).to_have_url(re.compile(r'#/home$'))
 assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='guest'")
 await expect(page.locator('.mura-home')).to_be_visible()
 await expect(page.locator('.mura-hero')).to_contain_text('Мура')
 await expect(page.locator('.mura-hero')).to_contain_text('Göteborg')
 assert await page.locator('#mobileContextDock [data-mobile-subnav="settings"]').count()==0
 assert await page.locator('#mobileContextDock [data-mobile-subnav="about"]').count()==0
 assert await page.locator('#mobileContextDock [data-mobile-subnav="center"]').count()==0
 passed.append('Mura tour ends inside her immersive account without exposing account/admin routes')

 await page.evaluate("document.querySelector('#folkoopGuideActor')?.removeAttribute('hidden')")
 await page.click('#folkoopGuideActor')
 await expect(page.locator('#folkoopHelperPanel')).to_be_visible()
 await expect(page.locator('#folkoopHelperTitle')).to_have_text('Мура')
 await expect(page.locator('#folkoopHelperPanel')).to_contain_text('моего аккаунта')
 await page.click('[data-helper="tour"]')
 await expect(page.locator('#onboardingTitle')).to_have_text('Добро пожаловать ко мне')
 await page.click('[data-onboarding="skip"]')
 await expect(page.locator('#onboarding')).to_be_hidden()
 await expect(page).to_have_url(re.compile(r'#/home$'))
 assert await page.evaluate("sessionStorage.getItem('folkoop-entry-mode-v1')==='guest'")
 passed.append('Replaying Mura tour returns to Mura rather than converting the visitor into an account flow')

 assert not errors,errors
 await context.close()

async def desktop_flow(browser,passed):
 context=await browser.new_context(service_workers='block',locale='en-US',viewport={'width':1366,'height':900})
 await local_only_factory(context)
 page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto(BASE+'?intro=1')
 await expect(page.locator('#onboarding')).to_be_visible()
 await expect(page.locator('#onboardingTitle')).to_have_text('Welcome to my place')
 await expect(page.locator('#folkoopGuideActor')).to_be_visible()
 await page.click('[data-onboarding="next"]')
 await expect(page.locator('#onboardingSpotlight')).to_be_visible()
 assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 await page.click('[data-onboarding="skip"]')
 assert not errors,errors
 passed.append('Desktop Mura walk-through remains usable without horizontal overflow')
 await context.close()

async def main():
 passed=[]
 async with async_playwright() as pw:
  browser=await launch_browser(pw)
  await mobile_flow(browser,passed)
  await desktop_flow(browser,passed)
  await browser.close()
 OUT.joinpath('onboarding-results.json').write_text(json.dumps({
  'passed':passed,
  'limits':[('WebKit engine on Linux; not real iOS Safari' if ENGINE=='webkit' else 'Chromium emulation; not real iOS Safari'),'Mura story data are fictional/local and do not claim real participants','No signed-in mutation is performed']
 },ensure_ascii=False,indent=2))
 print(f'ENGINE {ENGINE}')
 print('\n'.join('PASS '+x for x in passed))

asyncio.run(main())
