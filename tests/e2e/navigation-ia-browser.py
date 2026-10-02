"""Unified two-line navigation and subsection behavior."""
import asyncio, os, shutil
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4173/Folkoop/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium').lower()

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
 await expect(page.locator('#mobileContextDock [data-subsection^="home-"]')).to_have_count(4)

 await page.click('#mobileContextDock [data-subsection="home-attention"]')
 await expect(page.locator('.home-dashboard')).to_have_attribute('data-home-view','home-attention')

 await page.click('#mobilePrimaryNav a[href="#/projects"]')
 await expect(page.locator('#mobileContextDock [data-subsection^="projects-"]')).to_have_count(4)
 await page.click('#mobileContextDock [data-subsection="projects-tasks"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Подтвердить место для обмена')

 await page.click('#mobilePrimaryNav a[href="#/messages"]')
 await expect(page.locator('#mobileContextDock [data-subsection^="messages-"]')).to_have_count(4)
 await page.click('#mobileContextDock [data-subsection="messages-direct"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Личный разговор')
 await page.click('#mobileContextDock [data-subsection="messages-groups"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Создать групповой разговор')
 await page.click('#mobileContextDock [data-subsection="messages-invites"]')
 await expect(page.locator('#networkPanel')).to_contain_text('Приглашения')

 await page.click('#mobilePrimaryNav a[href="#/city"]')
 await expect(page.locator('#mobileContextDock a')).to_have_count(2)
 assert await page.locator('a[href="#/center"]').count()==1
 await expect(page.locator('#mobileContextDock a[href="#/center"]')).to_be_visible()
 await context.close()

async def main():
 async with async_playwright() as pw:
  browser=await launch(pw)
  await audit(browser,390,844)
  await audit(browser,1366,900)
  await browser.close()
 print('PASS one six-item bottom navigation is shared by mobile and desktop')
 print('PASS Home, Projects and Messages second-level tabs control real content')
 print('PASS Center is reachable only through City -> Center')

asyncio.run(main())
