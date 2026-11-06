"""Local BFF + SQLite, synthetic Auth upstream; no real accounts or provider calls."""
import asyncio,shutil
from playwright.async_api import async_playwright,expect
BASE='http://localhost:4490/'
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'))
  for width in [1366,390]:
   ctx=await browser.new_context(viewport={'width':width,'height':844},service_workers='block')
   await ctx.add_init_script("sessionStorage.setItem('folkoop-entry-mode-v1','account');localStorage.setItem('folkoop-language','en');localStorage.setItem('folkoop-language-choice-v1','done');")
   page=await ctx.new_page();await page.goto(BASE+'?intro=0#/me')
   await page.wait_for_function('!!globalThis.FolkoopNetwork')
   await page.evaluate("async()=>{const c=FolkoopNetwork.client(FolkoopNetworkConfig);await c.completeOAuth('synthetic-access-token-long',3600,'',{termsAccepted:true,privacyAcknowledged:true},'synthetic-refresh');}")
   cookies=await ctx.cookies();cookie=next(c for c in cookies if c['name']=='__Host-folkoop-session')
   assert cookie['httpOnly'] and cookie['secure'] and cookie['sameSite']=='Strict'
   assert '__Host-folkoop-session' not in await page.evaluate('document.cookie')
   await page.reload();await expect(page.locator('#netProfile input[name="name"]')).to_have_value('Synthetic session person')
   assert 'synthetic-refresh' not in await page.evaluate('JSON.stringify(localStorage)+JSON.stringify(sessionStorage)')
   await page.evaluate("async()=>{const c=FolkoopNetwork.client(FolkoopNetworkConfig);await c.restore();await c.logout();}")
   await page.reload();await expect(page.locator('#netLogin')).to_be_visible()
   print(f'PASS server cookie restore/logout/browser storage at {width}px')
   await ctx.close()
  await browser.close()
asyncio.run(main())
