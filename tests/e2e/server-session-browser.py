"""Local BFF + SQLite, synthetic Auth upstream; no real accounts or provider calls."""
import asyncio,shutil
from playwright.async_api import async_playwright,expect
BASE='http://localhost:4490/'
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in [1366,390]:
   ctx=await browser.new_context(viewport={'width':width,'height':844},service_workers='block')
   await ctx.add_init_script("sessionStorage.setItem('folkoop-entry-mode-v1','account');localStorage.setItem('folkoop-language','en');localStorage.setItem('folkoop-language-choice-v1','done');")
   # Synthetic provider redirects back to loopback; production config still requires HTTPS.
   async def google_callback(route):
    await route.fulfill(status=302,headers={'Location':BASE+'auth-callback.html#access_token=synthetic-access-token-long&refresh_token=synthetic-refresh&expires_in=3600&provider_token=discard-provider'})
   await ctx.route('https://abcdefghijklmnopqrst.supabase.co/auth/v1/authorize?**',google_callback)
   page=await ctx.new_page()
   diagnostics=[]
   ctx.on('response',lambda response: diagnostics.append({'path':'session','status':response.status}) if '/api/network/session' in response.url else None)
   page.on('crash',lambda _: diagnostics.append({'page':'crashed'}))
   page.on('pageerror',lambda error: diagnostics.append({'pageerror':str(error)}))
   await page.goto(BASE+'?intro=0#/me')
   await page.wait_for_function('!!globalThis.FolkoopNetwork')
   await page.locator('[name="policyAccepted"]').check()
   async with page.expect_popup() as popup_info:
    await page.locator('[data-auth="google"]').click()
   popup=await popup_info.value
   try:
    await expect(page.locator('#netProfile input[name="name"]')).to_have_value('Synthetic session person')
   except Exception:
    print('Synthetic OAuth diagnostics:',diagnostics,flush=True)
    try: print('Synthetic UI:',await page.locator('#networkPanel').inner_text(timeout=1000),flush=True)
    except Exception: print('Synthetic UI unavailable',flush=True)
    raise
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
