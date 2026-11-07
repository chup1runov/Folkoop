"""Loopback BFF/SQLite with synthetic upstream; no email or real account data."""
import asyncio,json,os
from playwright.async_api import async_playwright,expect
BASE='http://localhost:4490/'
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'))
  for width in [1366,390]:
   ctx=await browser.new_context(viewport={'width':width,'height':844},service_workers='block')
   await ctx.add_init_script("sessionStorage.setItem('folkoop-entry-mode-v1','account');localStorage.setItem('folkoop-language','en');localStorage.setItem('folkoop-language-choice-v1','done');")
   async def local_only(r):
    if r.request.url.startswith(BASE):await r.continue_()
    else:await r.abort()
   await ctx.route('**/*',local_only)
   a=await ctx.new_page();await a.goto(BASE+'?intro=0#/me')
   await a.wait_for_function('!!globalThis.FolkoopNetwork')
   await a.evaluate("async()=>{const c=FolkoopNetwork.client(FolkoopNetworkConfig);await c.completeOAuth('synthetic-access-token-long',3600,'',{termsAccepted:true,privacyAcknowledged:true},'synthetic-refresh');const w=FolkoopCore.workspace(localStorage);w.remember(true);w.add({id:'local-test',kind:'project',title:'Keep local idea',body:'Only on this device',createdAt:1});}")
   await a.reload();await expect(a.locator('#netProfile input[name=name]')).to_have_value('Synthetic session person')
   before=await a.evaluate("localStorage.getItem('folkoop-workspace-v1')")
   b=await ctx.new_page();await b.goto(BASE+'?intro=0#/me');await expect(b.locator('#netProfile input[name=name]')).to_have_value('Synthetic session person')
   await b.fill('#netProfile input[name=about]','private unsaved') if await b.locator('#netProfile input[name=about]').count() else await b.fill('#netProfile textarea[name=about]','private unsaved')
   await b.click('#globalSearchButton');await expect(b.locator('dialog[open]')).to_be_visible()
   mura=await ctx.new_page();await mura.goto(BASE+'?intro=0#/me')
   await expect(mura.locator('#netProfile button')).to_be_enabled()
   await mura.evaluate("window.dispatchEvent(new CustomEvent('folkoop:guest-demo',{detail:{enabled:true,target:'home'}}))")
   await expect(mura.locator('#netProfile')).to_have_count(0)
   await expect(mura.locator('#networkPanel')).to_contain_text("MURA'S FOLKOOP")
   mura_before=await mura.locator('#networkPanel').inner_text()
   await a.locator('[data-net="logout"]').click()
   await expect(a.locator('#netLogin')).to_be_visible();await expect(b.locator('#netLogin')).to_be_visible()
   await expect(b.locator('dialog[open]')).to_have_count(0);await expect(b.locator('#netProfile')).to_have_count(0)
   assert 'private unsaved' not in await b.locator('body').inner_text()
   assert await b.evaluate("localStorage.getItem('folkoop-workspace-v1')")==before
   assert await mura.locator('#networkPanel').inner_text()==mura_before
   await b.screenshot(path=f'/tmp/folkoop-tab-exit-{width}.png')
   await b.reload();await expect(b.locator('#netLogin')).to_be_visible()
   print(f'PASS {width}px: two real local cookie tabs, logout without reload, search/private form cleared, local workspace preserved, server logout verified by reload')
   await mura.close()
   await a.evaluate("async()=>{const c=FolkoopNetwork.client(FolkoopNetworkConfig);await c.completeOAuth('synthetic-access-token-long',3600,'',{termsAccepted:true,privacyAcknowledged:true},'synthetic-refresh');}")
   async def short_session(r):
    if r.request.method=='GET':
     response=await r.fetch();data=await response.json();data['expiresAt']=await a.evaluate('Date.now()+2500');await r.fulfill(response=response,json=data)
    else:await r.continue_()
   await a.route('**/api/network/session',short_session)
   await a.reload();await expect(a.locator('#netProfile')).to_be_visible()
   await expect(a.locator('#netLogin')).to_be_visible(timeout=10000)
   await expect(a.locator('#netStatus')).to_contain_text('Sign in again.')
   await expect(a.locator('#netLogin button')).to_be_enabled()
   print(f'PASS {width}px: Mura unaffected, simulated expiry hides profile and shows enabled sign-in without reload')
   await ctx.close()
  await browser.close()
asyncio.run(main())
