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
 await expect(page.locator('#mobilePrimaryNav a')).to_have_count(6)
 await expect(page.locator('.sidebar')).to_be_hidden()
 assert await page.locator('#mobilePrimaryNav a[href="#/center"]').count()==0
 await expect(page.locator('#mobileContextDock [data-subsection^="home-"]')).to_have_count(0)
 await expect(page.locator('.mura-home')).to_be_visible()

 await page.click('#mobilePrimaryNav a[href="#/projects"]')
 await expect(page.locator('#mobileContextDock [data-subsection^="projects-"]')).to_have_count(3)
 await page.click('#mobileContextDock [data-subsection="projects-tasks"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Подтвердить место для обмена')

 await page.click('#mobilePrimaryNav a[href="#/messages"]')
 await expect(page.locator('#mobileContextDock [data-subsection^="messages-"]')).to_have_count(3)
 await page.click('#mobileContextDock [data-subsection="messages-direct"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Личная переписка')
 await page.click('#mobileContextDock [data-subsection="messages-groups"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Групповой чат')
 assert await page.locator('#mobileContextDock [data-subsection="messages-invites"]').count()==0

 await page.click('#mobilePrimaryNav a[href="#/city"]')
 await expect(page.locator('#mobileContextDock a')).to_have_count(2)
 await expect(page.locator('#mobileContextDock a[href="#/city"]')).to_have_count(1)
 await expect(page.locator('#mobileContextDock a[href="#/center"]')).to_have_count(1)
 await page.screenshot(path=str(OUT/f'navigation-ia-{ENGINE}-{width}x{height}-city.png'),full_page=True)
 await page.click('#mobilePrimaryNav a[href="#/projects"]')
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
  await audit(browser,1366,900)
  await browser.close()
 print('PASS one six-item bottom navigation is shared by mobile and desktop')
 print('PASS Mura Home stays immersive while Projects and Messages second-level tabs control real content')
 print('PASS Mura City omits the future Center route and prototype/demo chrome')

asyncio.run(main())
