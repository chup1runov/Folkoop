"""Read-only, cross-section account search; no remote requests or real accounts."""
import asyncio, os
from playwright.async_api import async_playwright, expect

BASE=os.getenv('BASE_URL','http://127.0.0.1:4186/')
ENGINE=os.getenv('BROWSER_ENGINE','chromium')

async def main():
 async with async_playwright() as pw:
  browser=await getattr(pw,ENGINE).launch()
  for width,height in [(390,844),(1366,900)]:
   context=await browser.new_context(viewport={'width':width,'height':height},service_workers='block')
   await context.add_init_script("""localStorage.setItem('folkoop-language','ru');
    localStorage.setItem('folkoop-language-choice-v1','done');
    localStorage.setItem('folkoop-onboarding-v3','done');
    sessionStorage.setItem('folkoop-entry-mode-v1','guest');
    localStorage.setItem('folkoop-workspace-v1',JSON.stringify({version:1,profile:{},drafts:[{id:'private-test',kind:'need',title:'VISITOR_PRIVATE_SENTINEL',body:'Never inside Mura'}]}));""")
   writes=[];errors=[]
   async def restrict(route):
    if route.request.method not in ('GET','HEAD'):
     writes.append(route.request.url);await route.abort()
    elif route.request.url.startswith(BASE):await route.continue_()
    else:await route.abort()
   await context.route('**/*',restrict)
   page=await context.new_page()
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(BASE+'#/home')
   async def search(term):
    await page.click('#globalSearchButton')
    await expect(page.locator('#accountSearchInput')).to_be_focused()
    await page.fill('#accountSearchInput',term)
   await search('подтвердить место')
   await expect(page.locator('#accountSearchResults button')).to_have_count(1)
   await page.click('#accountSearchResults button')
   await expect(page).to_have_url(BASE+'#/projects')
   await expect(page.locator('.coop-task-row.account-search-match')).to_be_visible()
   # Search all conversations even while viewing a particular project.
   await search('этикетки')
   await expect(page.locator('#accountSearchResults button')).to_have_count(1)
   await page.click('#accountSearchResults button')
   await expect(page).to_have_url(BASE+'#/messages')
   await expect(page.locator('.account-search-match')).to_contain_text('этикетки')
   await search('Omar')
   await expect(page.locator('#accountSearchResults')).to_contain_text('Omar')
   await page.keyboard.press('Escape')
   await expect(page.locator('#accountSearch')).to_have_count(0)
   await expect(page.locator('#globalSearchButton')).to_be_focused()
   await search('дрель')
   await expect(page.locator('#accountSearchResults')).to_contain_text('Одолжить дрель')
   await page.click('#accountSearchResults button')
   await expect(page).to_have_url(BASE+'#/me')
   await expect(page.locator('.account-search-match')).to_contain_text('Одолжить дрель')
   await search('VISITOR_PRIVATE_SENTINEL')
   await expect(page.locator('#accountSearchStatus')).to_have_text('Ничего не найдено')
   await page.keyboard.press('Escape')
   await search('<img src=x onerror=alert(1)>')
   await expect(page.locator('#accountSearchStatus')).to_have_text('Ничего не найдено')
   await expect(page.locator('#accountSearchResults img')).to_have_count(0)
   await page.keyboard.press('Escape')
   assert not writes,writes
   assert not errors,errors
   await context.close()
   print('PASS account search, destinations, Escape and no writes',ENGINE,width)
  await browser.close()

asyncio.run(main())
