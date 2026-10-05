"""Visual evidence for the Civic Teal theme draft."""
import asyncio, os, shutil
from pathlib import Path
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
OUT=Path(os.getenv('QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)

async def prepare(context):
 await context.add_init_script("""
 localStorage.setItem('folkoop-language','ru');
 localStorage.setItem('folkoop-language-choice-v1','done');
 localStorage.setItem('folkoop-onboarding-v3','done');
 sessionStorage.setItem('folkoop-entry-mode-v1','guest');
 """)
 page=await context.new_page()
 return page

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])

  mobile=await browser.new_context(viewport={'width':390,'height':844},locale='ru-RU',service_workers='block')
  page=await prepare(mobile)
  await page.goto(BASE+'#/home')
  await expect(page.locator('#mobilePrimaryNav')).to_be_visible()
  await expect(page.locator('#networkPanel')).to_be_visible()
  await page.screenshot(path=str(OUT/'theme-civic-teal-home-mobile-390x844.png'),full_page=True)
  await page.click('#mobilePrimaryNav a[href="#/together"]')
   await page.click('#mobileContextDock [data-mobile-subnav="projects-overview"]')
  await expect(page.locator('#mobileContextDock')).to_be_visible()
  await page.screenshot(path=str(OUT/'theme-civic-teal-projects-mobile-390x844.png'),full_page=True)
  await mobile.close()

  desktop=await browser.new_context(viewport={'width':1366,'height':900},locale='ru-RU',service_workers='block')
  page=await prepare(desktop)
  await page.goto(BASE+'#/home')
  await expect(page.locator('#mobilePrimaryNav')).to_be_visible()
  await page.screenshot(path=str(OUT/'theme-civic-teal-home-desktop-1366x900.png'),full_page=True)
  await page.click('#mobilePrimaryNav a[href="#/city"]')
  await expect(page.locator('#mobileContextDock')).to_be_visible()
  await page.screenshot(path=str(OUT/'theme-civic-teal-city-desktop-1366x900.png'),full_page=True)
  await desktop.close()

  await browser.close()
 print('PASS Civic Teal visual evidence retained for Home/Projects mobile and Home/City desktop')

asyncio.run(main())
