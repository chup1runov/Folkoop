"""Unified two-line navigation and subsection behavior."""
import asyncio, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)

async def launch(pw):
 if ENGINE=='webkit': return await pw.webkit.launch()
 return await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])

async def audit(browser,width,height):
 context=await browser.new_context(viewport={'width':width,'height':height},locale='ru-RU',service_workers='block')
 await context.add_init_script("""
 localStorage.setItem('folkoop-language','ru');
 localStorage.setItem('folkoop-language-choice-v1','done');
 localStorage.setItem('folkoop-onboarding-v3','done');
 sessionStorage.setItem('folkoop-entry-mode-v1','guest');
 """)
 page=await context.new_page()
 await page.goto(BASE+'#/home')
 await expect(page.locator('#mobilePrimaryNav a')).to_have_count(5)
 assert await page.locator('#mobilePrimaryNav a').evaluate_all("els => els.map(el => el.dataset.mobileNav)")==['home','together','center','city','messages']
 for link in await page.locator('#mobilePrimaryNav a').all():
  await expect(link.locator('span:not(.net-count)')).to_be_visible()
 for link in await page.locator('#mobileContextDock > a').all():
  await expect(link.locator('svg')).to_be_visible()
  await expect(link.locator('span')).to_be_visible()
 await expect(page.locator('.sidebar')).to_be_hidden()
 await expect(page.locator('#mobilePrimaryNav a[href="#/center"]')).to_have_count(1)
 await expect(page.locator('#mobilePrimaryNav [data-mobile-nav="home"]')).to_have_attribute('aria-label','Профиль')
 await expect(page.locator('#mobileContextDock [data-subsection="home-overview"]')).to_have_attribute('aria-current','page')
 await expect(page.locator('#mobileContextDock [data-subsection="me"]')).to_contain_text('Профиль')
 await expect(page.locator('.mura-home')).to_be_visible()
 await page.click('[data-mobile-action="language"]')
 await expect(page.locator('[data-folkoop-guide-lang="sv"]')).to_contain_text('🇸🇪 Svenska')
 await expect(page.locator('[data-folkoop-guide-lang="ar"]')).to_contain_text('🇸🇦')
 await expect(page.locator('[data-folkoop-guide-lang="ku"]')).to_contain_text('☀️')
 assert await page.locator('[data-folkoop-guide-lang="ku"] strong').evaluate("el => getComputedStyle(el,'::before').backgroundImage")!='none'
 await page.click('[data-folkoop-guide-lang="ru"]')
 await expect(page.locator('#folkoopGuideLanguageGate')).to_be_hidden()
 await page.click('[data-mobile-action="demo"]')
 await expect(page.locator('.mobile-demo-popover [data-action="tutorial"]')).to_be_visible()
 await expect(page.locator('[data-mobile-action="exitmura"]')).to_be_visible()
 await page.click('[data-mobile-action="demo"]')
 if width<=760 or (width<=900 and height<=480):
  chrome=await page.evaluate("""() => {
   const primaryEl=document.querySelector('#mobilePrimaryNav');
   const dockEl=document.querySelector('#mobileContextDock');
   const primary=primaryEl.getBoundingClientRect();
   const dock=dockEl.getBoundingClientRect();
   const tracks=getComputedStyle(primaryEl).gridTemplateColumns.trim().split(/\\s+/).filter(Boolean).length;
   const primaryTargets=[...primaryEl.querySelectorAll('a')].map(x=>x.getBoundingClientRect().height);
   const contextTargets=[...dockEl.querySelectorAll('a,button')].filter(x=>x.getClientRects().length).map(x=>x.getBoundingClientRect().height);
   return {primary:primary.height,dock:dock.height,total:primary.height+dock.height,tracks,primaryTargets,contextTargets};
  }""")
  assert chrome['total']<=100,chrome
  assert chrome['tracks']==5,chrome
  assert min(chrome['primaryTargets'])>=44,chrome
  assert min(chrome['contextTargets'])>=44,chrome
 if height<=480:
  helper=await page.locator('#folkoopGuideActor').evaluate("""el => {
   const r=el.getBoundingClientRect(),dock=document.querySelector('#mobileContextDock').getBoundingClientRect();
   const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
   return {bottom:r.bottom,dockTop:dock.top,hitSelf:hit===el||el.contains(hit)};
  }""")
  assert helper['bottom']<=helper['dockTop'],helper
  assert helper['hitSelf'],helper
 await page.click('#mobileContextDock [data-subsection="me"]')
 await expect(page.locator('.demo-profile-card')).to_be_visible()
 await expect(page.locator('#mobilePrimaryNav [data-mobile-nav="home"]')).to_have_attribute('aria-current','page')
 await expect(page.locator('#mobileContextDock [data-subsection="me"]')).to_have_attribute('aria-current','page')
 await page.click('#mobileContextDock [data-subsection="home-overview"]')
 await expect(page.locator('.mura-home')).to_be_visible()
 await expect(page.locator('#mobileContextDock [data-subsection="home-overview"]')).to_have_attribute('aria-current','page')

 await page.click('#mobilePrimaryNav a[href="#/together"]')
 await expect(page.locator('#mobileContextDock [data-subsection^="projects-"]')).to_have_count(3)
 await page.click('#mobileContextDock [data-subsection="projects-overview"]')
 await expect(page.get_by_role('heading',name='Проекты Муры',exact=True)).to_have_count(1)
 await page.click('#mobileContextDock [data-subsection="projects-tasks"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Подтвердить место для обмена')

 try:
  await page.click('#mobilePrimaryNav a[href="#/messages"]',timeout=5000)
 except Exception:
  await page.screenshot(path=str(OUT/f'navigation-failure-{ENGINE}-{width}.png'))
  print(await page.locator('#mobilePrimaryNav').evaluate("el => ({rect:el.getBoundingClientRect().toJSON(),scrollX,scrollY,innerWidth,innerHeight,inert:el.inert,hit:document.elementFromPoint(innerWidth-35,innerHeight-25)?.outerHTML.slice(0,250)})"))
  raise
 await expect(page.locator('#mobileContextDock [data-subsection^="messages-"]')).to_have_count(3)
 await page.click('#mobileContextDock [data-subsection="messages-contacts"]')
 await expect(page.locator('#networkContactSearch')).to_be_visible()
 await page.fill('#networkContactSearch','Omar')
 await expect(page.locator('[data-contact-card]:visible')).to_have_count(1)
 await page.locator('[data-contact-card]:visible [data-net="openChat"]').click()
 await expect(page.locator('[data-net="backChats"]')).to_be_visible()
 await page.click('#mobileContextDock [data-subsection="messages-calls"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Звонки пока не подключены')
 await expect(page.locator('[data-net="backChats"]')).to_have_count(0)
 await expect(page.locator('#netMessage')).to_have_count(0)
 await page.click('#mobileContextDock [data-subsection="messages-chats"]')
 await page.click('#networkPanel [data-subsection="messages-direct"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Личная переписка')
 await page.click('#networkPanel [data-subsection="messages-groups"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Групповой чат')
 assert await page.locator('#mobileContextDock [data-subsection="messages-invites"]').count()==0

 await page.click('#mobilePrimaryNav a[href="#/city"]')
 await expect(page.locator('#mobilePrimaryNav [data-mobile-nav="city"]')).to_have_attribute('aria-current','page')
 await page.click('[data-subsection="city-services"]')
 await expect(page.locator('[data-subsection="city-services"]')).to_have_attribute('aria-current','page')
 await page.wait_for_function("() => document.querySelector('#cityFrame').contentWindow.location.hash === '#ansvar'")
 await page.click('[data-subsection="city-transport"]')
 await expect(page.locator('#cityWorkspace')).to_be_hidden()
 await expect(page.locator('.city-source-space a')).to_have_attribute('href','https://www.vasttrafik.se/reseplanering/')
 await page.click('[data-subsection="city-reports"]')
 await page.wait_for_function("() => document.querySelector('#cityFrame').contentWindow.location.hash === '#rapportera'")
 await page.click('[data-subsection="city-decisions"]')
 await page.wait_for_function("() => document.querySelector('#cityFrame').contentWindow.location.hash === '#beslut'")
 await page.screenshot(path=str(OUT/f'navigation-ia-{ENGINE}-{width}x{height}-city.png'),full_page=True)
 await page.click('#mobilePrimaryNav a[href="#/center"]')
 await expect(page.locator('#mobilePrimaryNav [data-mobile-nav="center"] img.primary-center-mark')).to_have_count(1)
 await expect(page.locator('#mobileContextDock a[href="#/people"]')).to_have_count(1)
 await expect(page.locator('#mobileContextDock a[href="#/communities"]')).to_have_count(1)
 await page.click('[data-subsection="center-map"]')
 await expect(page.locator('.city-source-space a')).to_have_attribute('href','https://www.goteborg.com/en/events')
 await page.click('[data-subsection="center-events"]')
 await expect(page.locator('.city-source-space h1')).to_have_text('Афиша')
 await page.click('[data-subsection="center"]')
 await expect(page.locator('.center-home')).to_be_visible()
 await page.screenshot(path=str(OUT/f'navigation-ia-{ENGINE}-{width}x{height}-center.png'),full_page=True)
 await page.click('#mobilePrimaryNav a[href="#/together"]')
 await page.click('#mobileContextDock [data-subsection="projects-overview"]')
 await expect(page.locator('.project-shortcuts')).to_be_visible()
 await page.locator('#networkProjectSearch').fill('no-project-matches-this-query')
 await expect(page.locator('#projectSearchEmpty')).to_be_visible()
 await expect(page.locator('[data-together-card]:visible')).to_have_count(0)
 await page.locator('#networkProjectSearch').fill('')
 assert await page.locator('[data-together-card]:visible').count()>0
 await page.click('#mobileContextDock [data-subsection="projects-tasks"]')
 await expect(page.locator('[data-project-view="tasks"]')).to_be_visible()
 await expect(page.locator('.task-column')).to_have_count(2)
 assert await page.locator('[data-project-search-card]').count()>0
 await page.locator('[data-project-search-card] [data-coop="open"]').first.click()
 await expect(page.locator('.coop-summary')).to_be_visible()
 await page.click('#mobileContextDock [data-subsection="projects-updates"]')
 await expect(page.locator('[data-project-view="updates"]')).to_be_visible()
 dates=await page.locator('.project-timeline time').evaluate_all('els => els.map(el => el.dateTime)')
 assert dates==sorted(dates,reverse=True),dates
 await page.locator('.project-timeline [data-coop="openNotify"]').first.click()
 await expect(page.locator('.coop-summary')).to_be_visible()
 await page.click('#mobileContextDock [data-subsection="projects-overview"]')
 await page.screenshot(path=str(OUT/f'navigation-ia-{ENGINE}-{width}x{height}-projects.png'),full_page=True)

 # The embedded City keeps its civic routes but must not present a second FOLKOOP shell.
 await page.goto(BASE+'city.html?embedded=1&mura=1')
 await expect(page.locator('html')).to_have_attribute('data-folkoop-embedded-city','1')
 await expect(page.locator('.topbar')).to_be_hidden()
 await expect(page.locator('.bottom-nav')).to_be_visible()
 await expect(page.locator('.bottom-nav button')).to_have_count(4)
 city_text=(await page.locator('body').inner_text()).lower()
 for banned in ['демо','пилот','прототип']:
  assert banned not in city_text,(banned,city_text[:500])
 teal=(await page.locator('html').evaluate("el => getComputedStyle(el).getPropertyValue('--teal').trim()")).lower()
 assert teal=='#176b6b', teal
 await page.screenshot(path=str(OUT/f'navigation-ia-{ENGINE}-{width}x{height}-city-embedded.png'),full_page=True)
 await context.close()

async def main():
 async with async_playwright() as pw:
  browser=await launch(pw)
  await audit(browser,390,844)
  await audit(browser,844,390)
  await audit(browser,1366,900)
  await browser.close()
 print('PASS five-space labelled navigation keeps stacked chrome within the viewport budget')
 print('PASS Mura Home stays immersive while Projects remain reachable under Together')
 print('PASS City and Center are distinct primary spaces without duplicating the underlying routes')

asyncio.run(main())
